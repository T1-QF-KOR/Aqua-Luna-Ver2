# 추가 이미지 제작 기록 · 2026-10-05

내장 image_gen 도구로 11장을 생성하고 프로젝트 assets에 복사했습니다. 원본 참조는 기존 수련 사복과 캐릭터 기준 이미지입니다. 캐릭터 PNG는 1024×1536이며 모서리 alpha=0을 확인했습니다. 배경 4장은 1672×941입니다. 기존 기본 캐릭터와 부두를 합치면 총 13장의 로컬 이미지입니다.

| 종류 | 프로젝트 파일 |
| --- | --- |
| 니트 / 코트 | assets/characters/knit.png, coat.png |
| 기본 사복 표정 | assets/characters/smile.png, thoughtful.png |
| 치마 / 검은 스타킹 / 살색 스타킹 | assets/characters/skirt.png, skirt-black.png, skirt-nude.png |
| 카페 / 연습실 / 공연장 / 옥상 | assets/environment/cafe.png, practice.png, concert.png, rooftop.png |

스타킹 두 변형은 skirt.png를 편집 대상으로 사용해 얼굴·포즈·치마·신발·구도를 유지했습니다. 살색 버전은 라이트 베이지 타이츠로 제작했습니다. 의상과 스타킹은 별도 구매 데이터이며, 렌더링은 검증된 조합의 완성 PNG를 선택합니다. 신체 부분에 CSS 색 필터를 입히는 방식이 아닙니다.

표정 세트는 현재 기본 후드 의상에 한정됩니다. 니트·코트·치마와 모든 표정의 조합은 아직 없습니다. 추가 의상 디자인과 배경 그림의 세부 소품은 생성된 게임용 해석이며, 원작 GDD의 새로운 공식 설정으로 취급하지 않습니다.

## 사용한 최종 프롬프트

## knit

Edit target: supplied Sulien character PNG. Identity preserve: exactly same 20-year-old Korean woman, delicate mature face, muted blue-gray eyes, dark teal almost black long low ponytail and wispy bangs, same detailed Korean anime illustration style. Keep identical camera crop (upper thighs to hair), body scale, pose, head placement, hands and headphones around neck. Single figure, transparent background, 1024x1536 portrait. No labels, no backdrop, no second figure. Change only clothing: replace charcoal hoodie with a modest loose ivory cable knit sweater, long sleeves, soft crew neckline, black relaxed slacks. Preserve neutral attentive expression. Natural ivory fabric, restrained cozy everyday style. Clean alpha edges.

## coat

Edit target: supplied Sulien character PNG. Identity preserve: exactly same 20-year-old Korean woman, delicate mature face, muted blue-gray eyes, dark teal almost black long low ponytail and wispy bangs, same detailed Korean anime illustration style. Keep identical camera crop (upper thighs to hair), body scale, pose, head placement, hands and headphones around neck. Single figure, transparent background, 1024x1536 portrait. No labels, no backdrop, no second figure. Change only clothing: tailored modest deep navy knee-length wool coat worn over charcoal turtleneck, soft light gray scarf tucked neatly into coat, black relaxed slacks. Preserve neutral attentive expression and exact identity. Same one hand resting on headphone at neck. Clean alpha edges. No hood.

## smile

Edit supplied Sulien PNG as a facial expression variant. Keep EXACT identity, outfit charcoal oversized hoodie, headphones, pose, camera, body/head placement, hair, hands, lighting and art style. Same 20-year-old woman. Transparent background, 1024x1536. Change ONLY facial expression, subtle believable mature anime expression. No text, no extra characters. Make a tiny warm closed-mouth smile, relaxed attentive blue-gray eyes, barely softened cheeks. Quiet sincere happiness, not exaggerated or childish.

## thoughtful

Edit supplied Sulien PNG as a facial expression variant. Keep EXACT identity, outfit charcoal oversized hoodie, headphones, pose, camera, body/head placement, hair, hands, lighting and art style. Same 20-year-old woman. Transparent background, 1024x1536. Change ONLY facial expression, subtle believable mature anime expression. No text, no extra characters. Make a thoughtful slightly concerned expression: eyebrows slightly drawn, eyes glancing a little downward, lips softly closed. Reserved and reflective, no tears, no exaggerated sadness.

## skirt

Create a full-body fashion variant of the reference Sulien, a 20-year-old adult Korean woman. Preserve exact mature face, blue-gray eyes, long dark teal low ponytail, wispy bangs, body proportions, black headphones and detailed anime style. One hand resting on headphone, other hanging naturally. Quiet neutral expression. Full body HEAD TO SHOES in a 1024x1536 portrait, straight-on eye-level, centered with margins. Outfit: modest ivory long-sleeved knit cardigan buttoned over crew-neck top, dark charcoal pleated knee-length skirt, bare lower legs, flat black penny loafers. Everyday tasteful autumn date clothing, no school uniform, no logos, no labels, no sexualized posing, no garters. Genuine transparent background. One figure only, consistent anatomy, natural stance.

## cafe

Create a polished Korean romance game background illustration, landscape 16:9, detailed soft anime painting, refined muted navy/teal shadows and warm amber lighting, believable contemporary Seoul. No people, no characters, no readable text, no UI, no collage. Wide eye-level scene with visual storytelling environment, room for character overlay on right and readable text panel left. Quiet independent cafe in Mangwon-dong at late afternoon. Warm wooden tables, two empty cups on a window-side table, small potted plants and books, soft pendant lamps, rain-speckled window looking onto a narrow brick neighborhood alley. Cozy contemplative date spot, attractive not cluttered. No brand names.

## practice

Create a polished Korean romance game background illustration, landscape 16:9, detailed soft anime painting, refined muted navy/teal shadows and warm amber lighting, believable contemporary Seoul. No people, no characters, no readable text, no UI, no collage. Wide eye-level scene with visual storytelling environment, room for character overlay on right and readable text panel left. Modest basement rehearsal studio of a small new talent agency in a renovated brick house. One mirrored wall, wooden floor, upright keyboard, a music stand with unreadable sheet music, a cheap microphone and small tracking camera near a folded green screen. Evening warm ceiling lamps, humble and lived-in, no large luxury studio.

## concert

Create a polished Korean romance game background illustration, landscape 16:9, detailed soft anime painting, refined muted navy/teal shadows and warm amber lighting, believable contemporary Seoul. No people, no characters, no readable text, no UI, no collage. Wide eye-level scene with visual storytelling environment, room for character overlay on right and readable text panel left. An intimate classical chamber music hall before performance. Viewed from the audience center seats, foreground dark burgundy seat backs, warm oak acoustic panels, a cello on its stand beside an empty chair and music stand under gentle golden spotlight, grand piano at left. Elegant quiet anticipation, no musician or crowd.

## rooftop

A high quality Korean romance game background, cinematic wide 16:9 anime painting with detailed believable materials. A humble rooftop of a two-story renovated brick house in Mangwon-dong Seoul at blue-hour sunset. A small folding table, two empty folding chairs, a few potted herbs and flowers, laundry drying rack at far side, low brick parapet, ordinary neighborhood roofs and distant Seoul skyline. Quiet intimate place to rest, pale lavender clouds and warm amber window lights, muted teal shadows. No people, no text, no UI, no collage, no futuristic architecture. Eye-level composition with open floor and uncluttered right side for character sprite.

## black

Use case: identity-preserve. Edit target: attached full-body adult 20-year-old Sulien skirt outfit sprite. Make a wardrobe variant for a gentle text dating simulation. Change ONLY her bare legs below the knee-length skirt to plain black semi-opaque tights, clearly dark charcoal black fabric. Keep the exact face, neutral expression, hair, pose, cardigan, skirt length, headphones, shoes, body proportions, framing and transparent background unchanged. Ordinary modest everyday fashion catalog illustration, nonsexual. Full head-to-toe 1024x1536. No background, no glow, no text, no collage. Preserve genuine alpha transparency.

## nude

Edit the attached adult woman's everyday fashion illustration for a clothing shop in a game. Give her plain light beige opaque tights beneath the existing knee-length pleated skirt. Keep her ivory cardigan, headphones, shoes, face, hair, expression, pose, skirt length and full-body framing identical. This is a simple modest winter outfit color variation. Preserve the transparent background. No text.
