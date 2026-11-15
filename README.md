# 문제루프 (munjeloop)

자체 2차 임종평 문제은행 웹앱. 2023학년도 · 2025학년도 각 4교시, 총 8회 640문항.

- 문항: `data/exam{연도}_{교시}.json` (지문·선지·그림 경로·원문 쪽)
- 그림: `assets/<exam_id>/qNNN_figK.webp` (301장, WebP q90)
- 원문 쪽: `pages/<exam_id>/pNNN.webp` (문항이 걸친 311쪽, 1.5배 렌더)
- 앱: `index.html` · `styles.css` · `app.js` (빌드 도구 없는 정적 SPA)

풀이 기록은 브라우저 localStorage(`munjeloop:v1`)에 저장되고, GitHub Gist 또는 JSON 파일로 기기 간 동기화한다.
원본 PDF 파싱 결과는 `munjeloop_app/` 폴더 참고.
