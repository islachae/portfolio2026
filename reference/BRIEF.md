# "Rethinking tipping for the age of AI" — 케이스 스터디 페이지 핸드오프

이 패키지는 Claude Design 아티팩트(프로토타입 툴)로 만든 포트폴리오 케이스 스터디 페이지를 실제 웹사이트에 옮기기 위한 참고 자료입니다.

- 원본 프로토타입(비주얼 확인용, 로그인 필요): https://claude.ai/artifact/CVgA8MV3npWM16okmnJqnq
- 캔버스 크기: 1280px 너비, 세로 약 10,000px 스크롤 페이지

## ⚠️ 먼저 알아둘 것

`reference/case-study-reference.html`은 **그대로 실행되는 완성 코드가 아니라 참고용 소스**입니다. 원본은 Claude 아티팩트 전용 런타임(`support.js`, 커스텀 템플릿 엔진)에 의존하는 프로토타입이라, 그 런타임 없이는 브라우저에서 정상 동작하지 않습니다. 이 파일에서는:

- `{{accent}}` 처럼 CSS/속성에 박혀있던 템플릿 홀은 실제 값(`#f55c2d`)으로 치환해뒀습니다.
- 이미지 경로(`/_blob/...`)는 같이 첨부한 `assets/images/`, `assets/fonts/` 폴더의 실제 파일 경로로 바꿔뒀습니다.
- `{{steps}}`, `{{tabs}}`, `{{st.pick}}` 처럼 **JS 컴포넌트 상태에 따라 값이 바뀌는 부분**(탭 선택, 스텝 선택, 열림/닫힘 등)은 템플릿 홀 그대로 남아있습니다. 이 부분은 실제 동작을 아래 "다시 구현해야 하는 인터랙션" 섹션을 참고해서 우리 사이트 스택(React 등)의 상태 관리 방식으로 새로 짜야 합니다.

즉 이 파일은 **레이아웃 구조 · 정확한 CSS 값 · 카피 문구 · 색상/타이포**를 그대로 베낄 수 있는 참고 코드이고, 인터랙션 로직은 아래 설명을 보고 재구현하는 용도입니다.

## 디자인 토큰

- 포인트 컬러(accent): `#f55c2d`
- 본문 텍스트: `#1a1a1a`
- 배경: 기본 흰색(`#ffffff`), 섹션별로 `#fefaf7`, `#f4f4f4`, `#faf8f6` 등의 톤온톤 오프화이트 사용
- 폰트: **Satoshi** (Fontshare 무료 폰트) — `assets/fonts/`에 weight 300/400/500/700/900 × normal/italic 총 10개 woff 파일 포함. 상업적 사용 가능한 무료 폰트지만, 실제 배포 전 Fontshare 라이선스 조건은 한 번 확인 권장.
- 코너 radius, 보더 컬러(`#e6e1db`, `#dcd3ce` 등)는 `case-study-reference.html`의 `<style>` 블록에 원본 값 그대로 있음.

## 페이지 섹션 구성 (위에서 아래 순서)

1. **HEADER** — 타이틀 + 히어로 이미지 (두 폰 화면: 체크아웃/피드백 시트)
2. **PROBLEM** — 문제 정의
3. **QUESTION BLOCK** — 영수증 카드 비주얼("receipt" 섹션)
4. **DEEPER PROBLEM**
5. **KEY QUESTION** — "SKIP TO SOLUTION" 앵커 링크 포함
6. **WHY NOW** — "Payment evolved / Dining expanded" 2패널. 스크롤 진입 시 순차 페이드인 애니메이션 (아래 참고)
7. **DESIGN PRINCIPLE** + Uber Eats 카드 비주얼
8. **MECHANISM** (`id="solution"`) — 3단계 스텝 네비게이션 + 상세 패널 + 그 사이를 잇는 "indicating bar"
9. **USER TESTING & ITERATION** — Tested vs Iterated 비교 2세트 (피드백 패턴 1, 2)
10. **FINAL DESIGN** — 탭으로 전환되는 3개 화면 (Checkout / Delivery feedback / Adjust tip)
11. **SYSTEMIC THINKING** — 클릭 가능한 3개 노드(Customers/Platform/Couriers/Restaurants) + 연결선 다이어그램
12. **TAKEAWAYS** — 마무리

## 다시 구현해야 하는 인터랙션 (중요)

원본은 이런 동작들을 자체 JS로 구현하고 있습니다. 정적 export 파일만 보면 이 부분들이 어떻게 동작하는지 안 보이니, 실제 사이트에서는 아래 동작을 재현해야 합니다.

1. **Mechanism 섹션 스텝 네비게이션** — 01/02/03 점을 클릭하면 그 아래 화면(패널)이 전환됨. 화면 전환 시:
   - 클릭 가능한 점 3개는 항상 pulse 애니메이션(테두리 링이 부드럽게 커졌다 사라짐)
   - 현재 선택된 스텝의 점에는 추가로 얇은 링(border) 표시
   - 점들과 상세 패널 사이의 세로 커넥터 바("indicating bar")가 선택된 스텝의 x좌표로 부드럽게(`transition: left 250ms ease`) 이동
2. **Final design 섹션 탭** — 3개 탭(Checkout / Delivery feedback / Adjust tip) 클릭 시 이미지와 라벨이 전환.
3. **Why now 섹션 스크롤 애니메이션** — 섹션이 뷰포트에 약 20% 들어오면, 0.5초 대기 후 각 패널의 타일들이 순차적으로(스태거) 페이드인 + 살짝 이동하며 나타남. 한 번 재생 후 최종 상태 유지(반복 없음). `prefers-reduced-motion` 사용자에게는 즉시 최종 상태로 표시.
4. **통계 숫자 카운트업** — `cu-58`, `cu-24`, `cu-77` 등으로 표시된 숫자들은 스크롤로 뷰포트에 40% 들어오면 0에서 목표값까지 카운트업.
5. **Systemic thinking 다이어그램** — 4개 노드 중 하나를 클릭하면 선택 상태가 바뀌고 연결선(arc) 색이 바뀜.
6. **User testing 섹션의 accordion/드롭다운류 상태**(`ddOpen`, `toggleDd` 등) — 필요 시 원본 아티팩트 링크에서 실제 동작을 직접 확인해서 재현.

## 첨부 파일

- `reference/case-study-reference.html` — 위에서 설명한 정적 참고 소스 (마크업 + CSS + 카피 원문)
- `assets/images/` — 사용된 스크린샷/일러스트 이미지 21개 (PNG, 투명 배경 포함)
- `assets/fonts/` — Satoshi 폰트 10개 woff 파일
