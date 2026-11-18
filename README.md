# 문제 트레이너 (munjeloop)

**웹앱:** https://verylucky629-alt.github.io/testloop/

자체 2차 임종평 문제은행 + 스파르타 공부 타이머 웹앱. 2023학년도 · 2025학년도 각 4교시, 총 8회 640문항.

- 문항: `data/exam{연도}_{교시}.json` (지문·선지·그림 경로·원문 쪽)
- 그림: `assets/<exam_id>/qNNN_figK.webp` (301장, WebP q90)
- 원문 쪽: `pages/<exam_id>/pNNN.webp` (문항이 걸친 311쪽, 1.5배 렌더)
- 앱: `index.html` · `styles.css` · `app.js` (빌드 도구 없는 정적 SPA)
- PWA: `manifest.json` (홈 화면 추가 · standalone) · `sw.js` (Web Push 수신·알림 클릭 처리)

## 스파르타 타이머

- 25/30/50분 선택(기본 30분) · 시작·일시정지·이어서·리셋. 홈과 기타 탭에서 바로 조작.
- 종료 시 Web Audio 비프음 + 브라우저 알림 + 약점/핵심 1문제 팝업(정답이 입력된 기록이 있으면 오답·미응답·마킹 문항 우선, 없으면 `data/topics.json`의 법규·예방의학·내분비 등 핵심 문항).
- 설정에서 Push 서버 URL(Cloudflare Worker 등)과 VAPID 공개키를 넣으면 웹 푸시 구독을 준비한다. iOS는 홈 화면에 추가한 뒤(iOS 16.4+) 알림 수신.

풀이 기록은 브라우저 localStorage(`munjeloop:v1`)에 저장되고, GitHub Gist 또는 JSON 파일로 기기 간 동기화한다.
원본 PDF 파싱 결과는 `munjeloop_app/` 폴더 참고.
