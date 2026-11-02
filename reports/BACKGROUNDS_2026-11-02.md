# 배경 리디자인 작업 기록

2026-11-02 · 내장 image_gen으로 생성 및 편집

캐릭터 일러스트와 어울리는 애니메이션풍으로 주요 장소의 조명, 색감과 질감을 정리했다. 기존 장소의 구도와 계절별 공간 연속성을 참고했으며, 방송실과 노래방은 누락된 기존 파일을 대신할 새 배경으로 제작했다. 방송실의 커튼과 연습실 악기 등 이야기 단서를 고려했다.

## 적용 파일

- [cafe](../assets/campus-v2/bg-v2/cafe.png)
- [campus-autumn](../assets/campus-v2/bg-v2/campus-autumn.png)
- [campus-spring](../assets/campus-v2/bg-v2/campus-spring.png)
- [campus-summer](../assets/campus-v2/bg-v2/campus-summer.png)
- [campus-winter](../assets/campus-v2/bg-v2/campus-winter.png)
- [classroom](../assets/campus-v2/bg-v2/classroom.png)
- [concert](../assets/campus-v2/bg-v2/concert.png)
- [dining](../assets/campus-v2/bg-v2/dining.png)
- [home](../assets/campus-v2/bg-v2/home.png)
- [homeNight](../assets/campus-v2/bg-v2/homeNight.png)
- [karaoke](../assets/campus-v2/bg-v2/karaoke.png)
- [library](../assets/campus-v2/bg-v2/library.png)
- [night](../assets/campus-v2/bg-v2/night.png)
- [practice](../assets/campus-v2/bg-v2/practice.png)
- [radio](../assets/campus-v2/bg-v2/radio.png)
- [river](../assets/campus-v2/bg-v2/river.png)
- [riverSnow](../assets/campus-v2/bg-v2/riverSnow.png)
- [rooftop](../assets/campus-v2/bg-v2/rooftop.png)
- [room](../assets/campus-v2/bg-v2/room.png)

생성 지시문과 참조 이미지, 출력 경로는 [배경 생성 기록](../docs/background-redesign-v2.json)에 정리했다. 생성된 배경은 대부분 1672×941이며 여름 캠퍼스는 1671×941이다.

## 확인

- 게임 자산 검사: 참조 자산 75개 통과.
- 런타임 및 가을·겨울·명절 검사: 테스트 파일 5개 모두 통과. 런타임 검사 44개에는 저장, 계절 전환과 308일 진행이 포함된다.
- Safari의 별도 미리보기에서 교실 선택 장면과 카페 첫 출근 장면을 확인했다. 카페에서 서진의 입화와 대사창이 배경 위에 표시되는 것을 확인했다.
- 전체 장면을 브라우저에서 일일이 플레이한 검사는 아니다.
