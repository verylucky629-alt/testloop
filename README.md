# 문제 트레이너 (munjeloop)

**웹앱:** https://verylucky629-alt.github.io/testloop/

자체 2차 임종평 문제은행 + 대경 임상의학종합평가 기출 + 스파르타 공부 타이머 웹앱. 자체 2차 8회(2023·2025학년도 각 4교시) 640문항, 대경 32교시(22‑1·22‑2·23‑1·23‑2·24‑1·25‑1 각 1~4교시, 26‑1 1~4교시, 26‑2 1~4교시) 2,560문항 — 모두 3,200문항.

- 문항: `data/exam{연도}_{교시}.json`(자체) · `data/dk{연도}{차}_{교시}.json`(대경). 32교시는 문항마다 `answer`(정답 번호)가 실려 있고, 모두 정답·복수 정답은 `answerAll`·`answers`, 채점 제외 문항은 `excluded`로 표시
- 그림: `assets/<exam_id>/qNNN_figK.webp` (2,042장, WebP q90)
- 원문 쪽: `pages/<exam_id>/pNNN.webp` (문항이 걸친 2,372쪽, 1.5배 렌더)
- 토픽 분류: `data/topics.json` — `tools/build_topics.py`가 문항 지문·선지 키워드로 과목·단원을 매긴다(3,200문항)
- 해설: 정답 엑셀의 해설·참고사항을 문항마다 `explanation`으로 넣었다(2,553문항). 결과 화면의 문제 카드에서 [해설 보기]로 펼친다
- 앱: `index.html` · `styles.css` · `app.js` (빌드 도구 없는 정적 SPA)
- PWA: `manifest.json` (홈 화면 추가 · standalone) · `sw.js` (Web Push 수신·알림 클릭 처리)

## 스파르타 타이머

- 25/30/50분 선택(기본 30분) · 시작·일시정지·이어서·리셋. 홈과 기타 탭에서 바로 조작.
- 종료 시 Web Audio 비프음 + 브라우저 알림 + 약점/핵심 1문제 팝업(정답이 입력된 기록이 있으면 오답·미응답·마킹 문항 우선, 없으면 `data/topics.json`의 법규·예방의학·내분비 등 핵심 문항).
- 설정에서 Push 서버 URL(Cloudflare Worker 등)과 VAPID 공개키를 넣고 [푸시 구독 준비]를 누르면 `PushSubscription`을 만들어 그 URL로 POST한다.
  - 앱이 보내는 본문: `{ "type": "subscribe", "subscription": { ... }, "tz": "Asia/Seoul" }`
  - Worker는 구독을 저장해 두었다가 원하는 시각에 같은 구독으로 `{ title, body, url }` JSON을 Web Push로 보내면 `sw.js`의 `push` 리스너가 알림을 띄운다.
  - iOS는 홈 화면에 추가한 뒤(iOS 16.4+)에만 웹 푸시를 받는다. Worker와 VAPID 키가 없어도 타이머·비프음·퀴즈 팝업은 그대로 동작한다.

풀이 기록은 브라우저 localStorage(`munjeloop:v1`)에 저장되고, GitHub Gist 또는 JSON 파일로 기기 간 동기화한다.
원본 PDF 파싱 결과는 `munjeloop_app/` 폴더 참고.
