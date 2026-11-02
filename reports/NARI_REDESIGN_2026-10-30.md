# 한나리 · 진 히로인 일러스트 재설계

사용자 요청: 나리를 토끼상·사슴상 느낌으로 고품질로 표현하되, 기존 짙은 보랏빛 머리와 분홍 브릿지의 투톤을 유지한다. 이후 다은과 서진의 새 이미지 및 인터넷 자료를 비교해 나리에게 어울리는 얼굴 방향을 선택하라는 요청을 반영했다.

## 조사와 디자인 판단

- [동물상별 메이크업 자료](https://www.yesstyle.com/blog/2025-08-13/makeup-based-on-your-animal-face-type/)는 사슴상에 길고 섬세한 얼굴과 긴 속눈썹, 토끼상에 둥근 눈과 부드러운 인상을 연결한다. 이런 분류는 엄격한 규칙이 아닌 미적 표현이다.
- [얼굴 유형에 관한 뷰티 기사](https://girlstyle.com/sg/article/130444/makeup-tiktok-kinds-of-pretty-trend)는 사슴상의 큰 눈과 토끼상의 둥근 눈을 설명하고, 유형의 정의가 느슨하다고 명시한다.
- [캐릭터 디자이너 인터뷰](https://automaton-media.com/en/interviews/persona-veterans-villioncode-is-a-piece-of-entertainment-but-it-also-has-the-potential-to-change-your-life-character-designer-ilya-kuvshinov-talks-dev-process/)는 눈과 머리카락 디테일이 인물의 성격과 식별에 쓰이는 방식을 설명한다.

다은의 둥근 볼과 친근한 햄스터상, 서진의 날카롭고 긴 여우상 눈매를 실제 이미지와 비교했다. **디자인 판단**으로 나리는 맑고 깊은 사슴상 눈과 섬세한 얼굴선에 토끼상의 부드러움을 더했다. 무대 밖의 조용한 모습과 무대 위의 보컬이라는 설정을 고려했다. 실제 토끼 귀나 사슴 뿔을 추가하지 않았다. 특정 실존 인물의 얼굴을 복제하지 않았다.

## 게임에 적용한 그림

[생성 프롬프트·참조·원본 경로](../docs/nari-redesign-v6.json). 내장 `image_gen`을 사용했다.

- [캠퍼스 기본복](../assets/heroines/nari-campus-v6.png)
- [후드](../assets/heroines/nari-hoodie-v6.png)
- [무대복](../assets/heroines/nari-stage-v6.png)
- [아이보리 가디건](../assets/heroines/nari-cardigan-v6.png)
- [슬레이트 재킷](../assets/heroines/nari-slate-jacket-v6.png)
- [차콜 뷔스티에](../assets/heroines/nari-pinafore-v6.png)
- [라벤더 니트](../assets/heroines/nari-lavender-knit-v6.png)
- [성탄 CG](../assets/campus-v2/nari-christmas-cg-v2.png)

검토된 기존 옷의 색과 디자인, 분홍 피크와 귀걸이를 유지했다. 스프라이트 7장은 1024×1536 RGBA이며 투명한 배경 모서리를 확인했다. 성탄 CG는 1672×941 RGB다. 의상별 별도 표정 이미지 세트는 아직 제작되지 않았다.

의상 키와 성탄 CG 키를 그대로 사용해 기존 선물 내역과 기억 해금 기록은 새로운 그림을 가리킨다. 새 그림을 사용하는 상태로 미리보기를 재생성했다. 인물 설정과 아트·의상 문서도 현 디자인에 맞췄다.

## 검증과 한계

`node --test tests/campus-v2-wardrobe.test.mjs tests/campus-v2.test.mjs tests/campus-v2-runtime.test.mjs tests/campus-v2-expansion.test.mjs tests/campus-v2-holidays.test.mjs`: 다섯 테스트 파일 모두 통과. 실제 런타임 44항목, 선물 구매·복구, 성탄 CG 표시 및 308일 진행을 포함한다. `git diff --check` 통과.

전체 자산 검사는 기존에 삭제된 `assets/campus-v2/karaoke-v1.png`와 `assets/campus-v2/radio-v1.png` 두 배경 때문에 실패한다. 나리의 새 그림은 별도로 존재·크기·투명도를 확인했다. Safari를 통한 추가 실제 화면 검수는 앱 접근 시간이 초과되어 완료하지 못했다. 모바일 및 모든 장면을 직접 검수한 것은 아니다.
