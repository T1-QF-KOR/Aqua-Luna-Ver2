# 수련 Cubism 작업 파일

- `sulien-basic-rig.cmo3`: 현재 기본 리깅 작업본. 촘촘한 메쉬, 호흡 2개 키폼, 각도 X의 좌우 움직임 3개 키폼을 포함합니다.
- `sulien-reference-cubism.cmo3`: Cubism 5.3.04 FREE에서 저장한 편집 프로젝트. Cubism의 **파일 → 열기**에서 이 파일을 선택합니다.
- `sulien-reference-cubism.psd`: Cubism에서 가져오기가 확인된 PSD 원본.
- `sulien-original-reference.psd`: 초기 변환본. Cubism 가져오기 오류가 있으므로 사용하지 않습니다.

현재 프로젝트는 `assets/characters/accessory-free/casual.png`를 손실 없이 포장한 **단일 레이어 원화**입니다. 원본 PNG는 수정하지 않았습니다. 기본 리깅 작업본의 메쉬 및 두 파라미터 연결을 Cubism에서 확인하고 저장했습니다.

`Breath_Root → Body_Sway → Sulien_original_reference` 순서의 디포머 구조입니다. 호흡 1.0에 100.35%의 작은 확대를 적용했으며, 좌우 움직임은 각도 X에 연결되어 있습니다.

자연스러운 눈 깜빡임, 입 모양, 머리카락 움직임에는 눈·입·머리카락 등의 별도 레이어 및 가려진 부분의 원화 보완이 필요합니다. 텍스쳐 아틀라스/MOC3 내보내기와 게임 통합은 아직 수행하지 않았습니다.

파일 해시와 가져오기 검증 상태는 `source-manifest.json`에 기록되어 있습니다.
