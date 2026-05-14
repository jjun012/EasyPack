# API 명세서

- 프로젝트명: EasyPack
- 백엔드: Spring Boot 3
- Base URL: https://[railway-url]/api
- 인증 방식: JWT Bearer Token
- 작성일: 2026

---

## 공통 규칙

### Request Header (인증 필요 API)
```
Authorization: Bearer {token}
Content-Type: application/json
```

### 공통 에러 응답
```json
{
  "error": "에러 메시지"
}
```

| 상태코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 (토큰 없음/만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## 1. Auth API

### 1.1 회원가입
```
POST /api/auth/register
인증: 불필요
```

**Request**
```json
{
  "user_id": "hong123",
  "password": "password123",
  "nickname": "홍길동",
  "travel_destination": "일본",
  "airline": "대한항공"
}
```

**Response 200**
```json
{
  "id": 1,
  "user_id": "hong123",
  "nickname": "홍길동",
  "travel_destination": "일본",
  "airline": "대한항공",
  "created_at": "2025-01-01T00:00:00"
}
```

**에러 케이스**
- 400: 이미 존재하는 user_id

---

### 1.2 로그인
```
POST /api/auth/login
인증: 불필요
```

**Request**
```json
{
  "user_id": "hong123",
  "password": "password123"
}
```

**Response 200**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "userId": "hong123",
    "nickname": "홍길동",
    "travel_destination": "일본",
    "airline": "대한항공"
  }
}
```

**에러 케이스**
- 400: 아이디 없음 / 비밀번호 불일치

---

### 1.3 내 정보 조회
```
GET /api/auth/user/me
인증: 필요
```

**Response 200**
```json
{
  "userId": "hong123",
  "nickname": "홍길동",
  "travel_destination": "일본",
  "airline": "대한항공"
}
```

---

### 1.4 내 정보 수정
```
PUT /api/auth/user/update
인증: 필요
```

**Request** (변경할 항목만 전송)
```json
{
  "nickname": "새닉네임",
  "travel_destination": "미국",
  "airline": "아시아나항공"
}
```

**Response 200**
```json
{
  "userId": "hong123",
  "nickname": "새닉네임",
  "travel_destination": "미국",
  "airline": "아시아나항공"
}
```

---

## 2. Community API

### 2.1 게시글 작성
```
POST /api/community/post
인증: 필요
```

**Request**
```json
{
  "title": "도쿄 여행 후기",
  "content": "너무 좋았어요!",
  "rating": 5
}
```
> country는 토큰에서 user 정보로 자동 설정

**Response 200**
```json
{
  "id": 1,
  "title": "도쿄 여행 후기",
  "content": "너무 좋았어요!",
  "authorNickname": "홍길동",
  "rating": 5,
  "likeCount": 0,
  "country": "일본",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### 2.2 게시글 상세 조회
```
GET /api/community/post/{postId}
인증: 불필요
```

**Response 200**
```json
{
  "id": 1,
  "title": "도쿄 여행 후기",
  "content": "너무 좋았어요!",
  "authorNickname": "홍길동",
  "rating": 5,
  "likeCount": 3,
  "country": "일본",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### 2.3 나라별 게시글 목록
```
GET /api/community/posts/country/{country}
인증: 불필요
```

**Path Parameter**
- country: 일본, 미국, 베트남, 필리핀, 태국

**Response 200**
```json
[
  {
    "id": 1,
    "title": "도쿄 여행 후기",
    "contentSummary": "너무 좋았어요! 음식도 맛있고...",
    "authorNickname": "홍길동",
    "rating": 5,
    "likeCount": 3,
    "commentCount": 2,
    "country": "일본",
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

### 2.4 인기글 조회
```
GET /api/community/posts/popular
인증: 불필요
```

**Response 200** (좋아요 수 내림차순 상위 5개)
```json
[
  {
    "id": 1,
    "title": "도쿄 여행 후기",
    "contentSummary": "너무 좋았어요!...",
    "authorNickname": "홍길동",
    "rating": 5,
    "likeCount": 10,
    "commentCount": 5,
    "country": "일본",
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

### 2.5 게시글 수정
```
PUT /api/community/post/{postId}
인증: 필요 (본인만)
```

**Request**
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "rating": 4
}
```

**Response 200**: 수정된 게시글 (2.2와 동일)

**에러 케이스**
- 403: 본인 게시글 아님

---

### 2.6 게시글 삭제
```
DELETE /api/community/post/{postId}
인증: 필요 (본인만)
```

**Response 200**
```json
"게시글이 삭제되었습니다."
```

**에러 케이스**
- 403: 본인 게시글 아님

---

### 2.7 댓글 작성
```
POST /api/community/post/{postId}/comment
인증: 필요
```

**Request**
```json
{
  "content": "좋은 후기네요!"
}
```

**Response 200**
```json
{
  "id": 1,
  "content": "좋은 후기네요!",
  "authorNickname": "홍길동",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### 2.8 댓글 목록 조회
```
GET /api/community/post/{postId}/comments
인증: 불필요
```

**Response 200**
```json
[
  {
    "id": 1,
    "content": "좋은 후기네요!",
    "authorNickname": "홍길동",
    "createdAt": "2025-01-01T00:00:00"
  }
]
```

---

### 2.9 댓글 삭제
```
DELETE /api/community/comment/{commentId}
인증: 필요 (본인만)
```

**Response 200**
```json
"댓글이 삭제되었습니다."
```

---

### 2.10 좋아요 토글
```
POST /api/community/post/{postId}/like
인증: 필요
```

**Response 200**
```json
{
  "liked": true
}
```
> liked: true = 좋아요 추가, false = 좋아요 취소

---

### 2.11 좋아요 여부 조회
```
GET /api/community/post/{postId}/like
인증: 필요
```

**Response 200**
```json
{
  "liked": true
}
```

---

## 3. AI 서버 API (FastAPI)

Base URL: https://[render-url]

### 3.1 이미지 분석
```
POST /predict
Content-Type: multipart/form-data
인증: 불필요
```

**Request (Form Data)**
| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 촬영된 이미지 |
| country | String | 여행 국가 (예: 일본) |
| airline | String | 항공사 (예: 대한항공) |

**Response 200**
```json
{
  "detections": [
    {
      "label": "보조배터리",
      "category": "제한적반입",
      "description": "100Wh 이하 보조배터리는 기내 반입 가능, 위탁 불가. 1인 5개 제한"
    }
  ]
}
```

**에러 케이스**
```json
{
  "detections": [],
  "message": "물품을 인식할 수 없습니다."
}
```

---

### 3.2 텍스트 검색
```
POST /predict/text
Content-Type: application/json
인증: 불필요
```

**Request**
```json
{
  "item_name": "보조배터리",
  "country": "일본",
  "airline": "대한항공"
}
```

**Response 200** (3.1과 동일)