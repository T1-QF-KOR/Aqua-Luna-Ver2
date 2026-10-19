"""Fit generated equipment layers and export individual wearing variants.

Artwork is generated with image_gen. This tool only performs the layer
composition explicitly selected by the user; source PNGs remain untouched.
"""
import argparse
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SIZE = (1024, 1536)
RESAMPLE = Image.Resampling.LANCZOS

def read_json(path):
    return json.loads((ROOT / path).read_text())

def fit_layer(item, outfit, config):
    source = Image.open(ROOT / item['source']).convert('RGBA')
    alpha = source.getchannel('A')
    # Generators can leave almost transparent pixels far outside the object.
    # Fit the visible artwork, not that invisible padding.
    bounds = alpha.point(lambda value: 255 if value > 32 else 0).getbbox()
    if not bounds:
        raise ValueError('Empty equipment layer: ' + item['id'])
    source.putalpha(alpha.point(lambda value: 0 if value < 8 else value))
    cropped = source.crop(bounds)
    box = config['outfits'][outfit].get('boxes', {}).get(item['id'], item['box'])
    x, y, w, h = box
    layer = Image.new('RGBA', SIZE)
    layer.alpha_composite(cropped.resize((w, h), RESAMPLE), (x, y))
    # The shoulder bags sit behind the arm. The visible strap stays in front.
    if item['id'] in ('shoulder-bag', 'canvas-tote'):
        polygon = config['outfits'][outfit].get('bagArmOcclusion')
        if polygon:
            alpha = layer.getchannel('A')
            ImageDraw.Draw(alpha).polygon([tuple(p) for p in polygon], fill=0)
            layer.putalpha(alpha)
    path = ROOT / 'assets/accessories/fitted' / outfit / (item['id'] + '.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    layer.save(path, optimize=True)
    return layer

def compose(base, layers):
    result = base.copy()
    for layer in layers:
        result.alpha_composite(layer)
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--export', action='store_true')
    parser.add_argument('--preview-only', action='store_true')
    args = parser.parse_args()
    config = read_json('docs/appearance-layout.json')
    items = config['items']
    out_dir = ROOT / 'qa/appearance'
    out_dir.mkdir(parents=True, exist_ok=True)
    jobs = []
    available = [a for a in items if (ROOT / a['source']).exists()]
    for outfit in config['outfits']:
        base_path = ROOT / 'assets/characters/accessory-free' / (outfit + '.png')
        if not base_path.exists():
            continue
        base = Image.open(base_path).convert('RGBA')
        if base.size != SIZE:
            raise ValueError('Unexpected sprite size: ' + str(base_path))
        fitted = {a['id']: fit_layer(a, outfit, config) for a in available}
        if outfit in ('casual', 'knit', 'skirt', 'coat'):
            sheet = Image.new('RGB', (6 * 256, 4 * 414), '#1e2c38')
            draw = ImageDraw.Draw(sheet)
            for i, item in enumerate(available):
                tile = compose(base, [fitted[item['id']]])
                tile.thumbnail((256, 384), RESAMPLE)
                x, y = (i % 6) * 256, (i // 6) * 414
                sheet.paste(tile, (x, y), tile)
                draw.text((x+8, y+388), item['id'], fill='white')
            sheet.save(out_dir / (outfit + '-individual.jpg'), quality=94)
        if args.export:
            for expression in config['expressions']:
                stem = outfit + ('' if expression == 'neutral' else '-' + expression)
                path = ROOT / 'assets/characters/accessory-free' / (stem + '.png')
                if not path.exists():
                    raise FileNotFoundError(path)
                folder = ROOT / 'assets/characters/equipped' / outfit / expression
                folder.mkdir(parents=True, exist_ok=True)
                for item in available:
                    jobs.append((path, fitted[item['id']], folder / (item['id'] + '.webp')))
    def export(job):
        path, layer, target = job
        compose(Image.open(path).convert('RGBA'), [layer]).save(target, 'WEBP', quality=94, method=4)
        return {'path': str(target.relative_to(ROOT)), 'bytes': target.stat().st_size}
    if jobs:
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(export, jobs))
        (out_dir / 'exports.json').write_text(json.dumps(results, indent=2))
        print(json.dumps({'exports': len(results), 'bytes': sum(r['bytes'] for r in results)}))
    else:
        print(json.dumps({'outfits': len(config['outfits']), 'fittedItems': len(available)}))

if __name__ == '__main__':
    main()
