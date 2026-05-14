# ERD (Entity Relationship Diagram)

- 프로젝트명: EasyPack
- DB: Supabase (PostgreSQL)
- 작성일: 2026

---

## 1. ERD 다이어그램

```
┌─────────────────┐         ┌─────────────────────┐
│     users       │         │       posts          │
├─────────────────┤         ├─────────────────────┤
│ PK id           │         │ PK id               │
│    user_id (UQ) │◄───┐    │ FK user_id          │
│    password     │    │    │    title            │
│    nickname     │    │    │    content          │
│    travel_dest  │    │    │    rating           │
│    airline      │    │    │    like_count       │
│    created_at   │    │    │    country          │
└─────────────────┘    │    │    created_at       │
                       │    │    updated_at       │
                       │    └──────────┬──────────┘
                       │               │
                       │    ┌──────────▼──────────┐
                       │    │      comments        │
                       │    ├─────────────────────┤
                       ├────│ PK id               │
                       │    │ FK post_id          │
                       │    │ FK user_id          │
                       │    │    content          │
                       │    │    created_at       │
                       │    └─────────────────────┘
                       │
                       │    ┌─────────────────────┐
                       │    │     post_likes       │
                       │    ├─────────────────────┤
                       └────│ PK id               │
                            │ FK post_id          │
                            │ FK user_id          │
                            │ UQ (post_id,user_id)│
                            └─────────────────────┘

┌──────────────────────────────────┐
│           regulations            │
├──────────────────────────────────┤
│ PK id                            │
│    country   (예: 일본, 미국)    │
│    airline   (예: 대한항공)      │
│    item      (예: 보조배터리)    │
│    category  (반입가능/불가/제한)│
│    explanation                   │
└──────────────────────────────────┘
```

---

## 2. 테이블 상세 정의

### 2.1 users

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
|--------|------|------|----------|------|
| id | BIGSERIAL | NOT NULL | PK | 내부 식별자 (자동증가) |
| user_id | VARCHAR(50) | NOT NULL | UNIQUE | 로그인 아이디 |
| password | VARCHAR(255) | NOT NULL | | BCrypt 암호화 |
| nickname | VARCHAR(50) | NOT NULL | | 표시 닉네임 |
| travel_destination | VARCHAR(50) | NOT NULL | | 여행 국가 |
| airline | VARCHAR(50) | NOT NULL | | 항공사 |
| created_at | TIMESTAMP | NOT NULL | DEFAULT NOW() | 가입일 |

### 2.2 posts

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
|--------|------|------|----------|------|
| id | BIGSERIAL | NOT NULL | PK | |
| user_id | VARCHAR(50) | NOT NULL | FK → users.user_id | 작성자 |
| title | VARCHAR(200) | NOT NULL | | 제목 |
| content | TEXT | NOT NULL | | 내용 |
| rating | INT | NOT NULL | CHECK (1~5) | 별점 |
| like_count | INT | NOT NULL | DEFAULT 0 | 좋아요 수 캐시 |
| country | VARCHAR(50) | NOT NULL | | 여행 국가 |
| created_at | TIMESTAMP | NOT NULL | DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL | DEFAULT NOW() | |

### 2.3 comments

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
|--------|------|------|----------|------|
| id | BIGSERIAL | NOT NULL | PK | |
| post_id | BIGINT | NOT NULL | FK → posts.id | 게시글 |
| user_id | VARCHAR(50) | NOT NULL | FK → users.user_id | 작성자 |
| content | TEXT | NOT NULL | | 댓글 내용 |
| created_at | TIMESTAMP | NOT NULL | DEFAULT NOW() | |

### 2.4 post_likes

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
|--------|------|------|----------|------|
| id | BIGSERIAL | NOT NULL | PK | |
| post_id | BIGINT | NOT NULL | FK → posts.id | |
| user_id | VARCHAR(50) | NOT NULL | FK → users.user_id | |
| - | - | - | UNIQUE(post_id, user_id) | 중복 좋아요 방지 |

### 2.5 regulations

| 컬럼명 | 타입 | NULL | 제약조건 | 설명 |
|--------|------|------|----------|------|
| id | BIGSERIAL | NOT NULL | PK | |
| country | VARCHAR(50) | NOT NULL | | 국가명 (한글) |
| airline | VARCHAR(50) | NOT NULL | | 항공사명 (한글) |
| item | VARCHAR(100) | NOT NULL | | 물품명 (한글/영문) |
| category | VARCHAR(50) | NOT NULL | | 반입가능/반입불가/제한적반입 |
| explanation | TEXT | NOT NULL | | 상세 설명 |

---

## 3. 관계 정의

| 관계 | 설명 |
|------|------|
| users → posts | 1:N (한 유저가 여러 게시글 작성) |
| users → comments | 1:N (한 유저가 여러 댓글 작성) |
| users → post_likes | 1:N (한 유저가 여러 게시글에 좋아요) |
| posts → comments | 1:N (한 게시글에 여러 댓글) |
| posts → post_likes | 1:N (한 게시글에 여러 좋아요) |
| regulations | 독립 테이블 (관계 없음) |

---

## 4. Supabase DDL (테이블 생성 SQL)

```sql
-- users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    travel_destination VARCHAR(50) NOT NULL,
    airline VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- posts
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    like_count INT NOT NULL DEFAULT 0,
    country VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- comments
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- post_likes
CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id),
    UNIQUE(post_id, user_id)
);

-- regulations
CREATE TABLE regulations (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(50) NOT NULL,
    airline VARCHAR(50) NOT NULL,
    item VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL
);
```