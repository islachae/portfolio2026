# 친구 초대 체크리스트 (만든 사람용)

친구는 **채원 님이 준 친구용 Claude 키**로 Mellon을 써요. 그래서 비용은 채원 님의 Anthropic 계정에 청구돼요.

## 처음 한 번만: 친구용 키 만들기
키를 **따로 분리하고 한도를 걸어두는 게** 핵심이에요. 그래야 비용이 예상보다 커지지 않고, 문제가 생기면 그 키만 끄면 돼요.

1. https://console.anthropic.com 에 로그인하세요.
2. 왼쪽 아래 **Settings → Workspaces**로 가서 → **Create Workspace**를 누르세요. 이름은 `Mellon friends`로 하세요.
3. 만든 워크스페이스에 들어가서 **Limits**를 찾아 **월 사용 한도(Spend limit)**를 정하세요.
   - 예: **$15/월**. 친구 10명이 평소처럼 쓰면 한 달 10~20달러 정도예요.
   - 한도에 닿으면 그달은 Mellon의 Claude 요청이 멈춰요. 친구 화면에는 "Claude error 4xx" 같은 메시지가 떠요.
4. 그 워크스페이스에서 **API Keys → Create Key**를 누르세요. 이름은 `mellon-friends`로 하세요.
   - **본인이 쓰는 키와 꼭 따로 만드세요.**
5. 키(`sk-ant-...`)를 복사해서 안전한 곳에 보관하세요. 이 화면에서만 한 번 보여요.

> 메뉴 이름은 Console 업데이트에 따라 조금 다를 수 있어요. "Workspace", "Limits", "Spend limit"이라는 단어를 찾으면 돼요.

## 친구가 생길 때마다
1. 친구에게 **Mellon에 쓸 Gmail 주소**를 물어보세요.
2. Google Cloud에 그 주소를 추가하세요: https://console.cloud.google.com → Mellon 프로젝트 → **Google Auth Platform → Audience → Test users → + Add users** → 주소 입력 → **Save**
   - 최대 100명까지 추가할 수 있어요.
3. 친구에게 아래 메시지를 보내세요. **키는 단톡방 말고 1:1 메시지로** 보내는 게 좋아요.

### 보낼 메시지 (복사해서 쓰세요)
```
Mellon 써봐줘서 고마워! 🍈
1) 설치 링크: [스토어 링크]
2) 설치 안내: https://github.com/islachae/portfolio2026/blob/main/mellon-extension/FRIENDS.md
3) 설정에 넣을 것
   - Google client ID: [client ID]
   - Claude API 키: [친구용 키]  ← 다른 사람한테는 공유하지 말아줘!
메일은 네 컴퓨터랑 Claude 사이에서만 오가고, 나는 네 메일을 볼 수 없어. 비용만 내 계정으로 나와.
```

## 가끔 확인하기
- **사용량:** Anthropic Console → **Usage**에서 `Mellon friends` 워크스페이스를 고르면 돼요. 메일 내용은 보이지 않고 사용량과 비용만 보여요.
- **키가 퍼진 것 같으면:** 그 키를 **Disable/Delete**하고, 새 키를 만들어 친구들에게 다시 보내세요.
- **친구가 그만 쓰면:** Google Cloud Test users에서 그 주소를 빼면 돼요.

## 스토어에 올린 뒤 한 번만
스토어에 올린 Mellon은 **확장 ID가 새로 생겨요.** 친구들이 로그인할 수 있게 하려면 이렇게 하세요.
1. 스토어 버전 Mellon을 설치하고 → 설정 화면을 여세요. 화면에 나온 **Authorized redirect URI**(`https://<새 ID>.chromiumapp.org/`)를 복사하세요.
2. Google Cloud → **Clients** → Mellon extension → **Authorized redirect URIs**에 그 주소를 **추가**하세요. 기존 주소는 그대로 둬도 돼요.
