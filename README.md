# ✈️ EasyPack

해외여행 수하물 규정 확인 + 여행 후기 커뮤니티 모바일 앱

---

## 소개

EasyPack은 해외여행 전 수하물 반입 규정을 AI로 빠르게 확인하고, 여행자들이 후기를 공유할 수 있는 모바일 앱입니다.

- **AI 물품 분석** — 카메라로 촬영하거나 직접 검색하면 기내 반입 / 위탁 수하물 가능 여부를 즉시 확인
- **수하물 규정** — 항공사·국가별 수하물 허용 기준 조회
- **여행 커뮤니티** — 목적지별 여행 후기 게시판
- **날씨 위젯** — 설정한 여행지의 현재 날씨 표시

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모바일 앱 | React Native (Expo SDK 54) |
| 백엔드 | Spring Boot 3, JPA, PostgreSQL |
| AI 서버 | FastAPI, Google Gemini 1.5 Flash |
| 인프라 | Railway (백엔드 + AI 서버), Supabase (DB) |

---

## 프로젝트 구조

```
EasyPack/
├── frontend/          # React Native / Expo 앱
│   └── src/
│       ├── screens/   # 화면 컴포넌트 (auth, home, community, ai, baggage, profile)
│       ├── navigation/ # AppNavigator (Stack + Bottom Tab)
│       ├── api/       # API 클라이언트
│       └── constants/ # 테마, 도시·항공사 데이터
├── backend/           # Spring Boot REST API
│   └── src/main/java/com/easypack/backend/
│       ├── controller/ # Auth, Post, Comment, Like
│       ├── service/
│       ├── model/
│       ├── dto/
│       └── config/    # JWT, Security
└── ai-server/         # FastAPI + Gemini AI
    └── main.py
```

---

## 주요 기능

### AI 물품 분석
카메라 촬영 또는 텍스트 입력으로 물품을 분석합니다.

- Gemini Vision API로 이미지 인식
- 기내 반입 / 위탁 수하물 가능·불가·조건부 판정
- DB에 등록된 항공사별 규정이 있으면 우선 적용

### 수하물 규정
항공사별 수하물 허용 기준(크기, 무게, 개수)을 탭으로 확인합니다.

### 커뮤니티
목적지별 여행 후기를 작성·조회·수정·삭제할 수 있는 게시판입니다. JWT 인증 기반으로 본인 글만 수정/삭제 가능합니다.

### 프로필
닉네임, 여행 도시, 항공사를 설정하면 홈 화면 날씨와 수하물 규정이 맞춤 표시됩니다.

---

## 환경 변수

### 백엔드 (`backend/`)
| 변수 | 설명 |
|------|------|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 |
| `PORT` | 서버 포트 (기본 8082) |

### AI 서버 (`ai-server/`)
| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `DB_HOST` | PostgreSQL 호스트 |
| `DB_USER` | DB 사용자 |
| `DB_PASSWORD` | DB 비밀번호 |
| `DB_NAME` | DB 이름 |

---

## 로컬 실행

### 프론트엔드
```bash
cd frontend
npm install
npx expo start
```

### 백엔드
```bash
cd backend
./gradlew bootRun
```

### AI 서버
```bash
cd ai-server
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## API 엔드포인트

### 백엔드 (`https://easypack-back-production.up.railway.app`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/user/me` | 내 정보 조회 |
| PUT | `/api/auth/user/update` | 내 정보 수정 |
| GET | `/api/posts` | 게시글 목록 |
| POST | `/api/posts` | 게시글 작성 |
| PUT | `/api/posts/{id}` | 게시글 수정 |
| DELETE | `/api/posts/{id}` | 게시글 삭제 |
| POST | `/api/posts/{id}/like` | 좋아요 토글 |
| GET | `/api/posts/{id}/comments` | 댓글 목록 |
| POST | `/api/posts/{id}/comments` | 댓글 작성 |
| DELETE | `/api/comments/{id}` | 댓글 삭제 |

### AI 서버 (`https://easypack-ai-production.up.railway.app`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/predict` | 이미지 기반 물품 분석 |
| POST | `/predict-text` | 텍스트 기반 물품 분석 |

---

## 지원 항공사 / 국가

**항공사**: 대한항공, 아시아나항공, 제주항공, 티웨이항공, 진에어항공

**국가**: 일본, 미국, 베트남, 필리핀, 태국

---

## 배포

Railway에서 `main` 브랜치 푸시 시 백엔드와 AI 서버가 자동 배포됩니다.

- 백엔드: `railway.toml` — Nixpacks 빌드, `java -jar` 실행
- AI 서버: `ai-server/Dockerfile` — Python 컨테이너
