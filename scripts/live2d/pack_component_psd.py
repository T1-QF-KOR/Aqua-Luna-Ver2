"""Pack generated RGBA component files into PSD without painting or masking pixels."""
from pathlib import Path
import struct
from PIL import Image


def be(fmt, *values):
    return struct.pack('>' + fmt, *values)


def pack_psd(layers, output):
    # Input order is bottom to top. Every texture retains its full canvas.
    width, height = layers[0][1].size
    assert all(im.mode == 'RGBA' and im.size == (width, height) for _, im, _ in layers)
    records, pixels = [], []
    merged = Image.new('RGBA', (width, height))
    for _, im, visible in layers:
        if visible:
            merged = Image.alpha_composite(merged, im)
    for name, im, visible in reversed(layers):
        channels = [ch.tobytes() for ch in im.split()]
        record = be('iiiiH', 0, 0, height, width, 4)
        for channel_id, channel in zip((0, 1, 2, -1), channels):
            record += be('hI', channel_id, len(channel) + 2)
            pixels.append(be('H', 0) + channel)
        pascal = name.encode('ascii')[:255]
        pascal = bytes([len(pascal)]) + pascal
        pascal += bytes((-len(pascal)) % 4)
        extra = be('II', 0, 0) + pascal
        record += b'8BIMnorm' + bytes([255, 0, 0 if visible else 2, 0])
        record += be('I', len(extra)) + extra
        records.append(record)
    layer_info = be('h', -len(layers)) + b''.join(records) + b''.join(pixels)
    layer_info += bytes(len(layer_info) % 2)
    layer_mask = be('I', len(layer_info)) + layer_info + be('I', 0)
    resolution = be('IHHIHH', 72 * 65536, 1, 1, 72 * 65536, 1, 1)
    resources = b'8BIM' + be('H', 1005) + b'\0\0' + be('I', len(resolution)) + resolution
    header = b'8BPS' + be('H', 1) + bytes(6) + be('HIIHH', 4, height, width, 8, 3)
    merged_channels = b''.join(ch.tobytes() for ch in merged.split())
    output.write_bytes(header + be('I', 0) + be('I', len(resources)) + resources
                       + be('I', len(layer_mask)) + layer_mask + be('H', 0) + merged_channels)
    return merged


if __name__ == '__main__':
    project = Path(__file__).resolve().parents[2]
    parts = project / 'assets/live2d/sulien/source/parts-v01'
    order = ['Hair_Back', 'Face_Base', 'Body_Base', 'Eye_ViewerLeft', 'Eye_ViewerRight', 'Brows', 'Mouth', 'Hair_Front']
    layers = [(name, Image.open(parts / f'{name}.png').convert('RGBA'), True) for name in order]
    layers.append(('_Reference_Original', Image.open(project / 'assets/characters/accessory-free/casual.png').convert('RGBA'), False))
    psd = parts / 'sulien-parts-v01.psd'
    preview = pack_psd(layers, psd)
    preview.save(parts / 'assembly-preview-unregistered.png')
    print(f'{psd}: {len(layers)} layers; {psd.stat().st_size} bytes')
