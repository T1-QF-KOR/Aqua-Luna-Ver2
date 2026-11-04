오디오 모의 테스트 통과; 실제 Windows 청취와 전체 배율·해상도 검사는 아직 미완료입니다.

node --test tests/campus-v2-audio.test.mjs tests/campus-v2-endings.test.mjs 통과. 오디오 테스트는 Audio 모의 객체로 곡 전환, 볼륨 적용, 음성 중 BGM 감쇄, 재생 실패 후 재시도를 검사한다. 소리 장치에서 실제 재생되는지와 Windows에서 볼륨 설정이 재시작 후 유지되는지는 이 검사로 증명되지 않는다.

1280×720 및 1920×1080과 Windows 125%·150% 배율 조합의 실기 검사는 아직 수행하지 않았다. Safari 화면과 배율 확대는 Windows DPI 실기를 대체하지 않는다. 이 항목의 스크린샷 없음. 추가 검증 진행 또는 Windows PC 실기 확인이 필요하다.
