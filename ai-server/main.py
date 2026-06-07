import os
import base64
import psycopg2
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="EasyPack AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        dbname=os.environ["DB_NAME"],
        sslmode="require",
    )


def query_regulation(item: str, country: str, airline: str) -> dict | None:
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT item, category, explanation FROM regulations
            WHERE country = %s AND airline = %s
              AND item ILIKE %s
            LIMIT 1
            """,
            (country, airline, f"%{item}%"),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            cat = row[1]
            carry = "불가" if cat == "반입불가" else ("조건부" if cat == "제한적반입" else "가능")
            chk   = "불가" if cat == "반입불가" else "가능"
            return {"item": row[0], "category": cat, "carry_on": carry, "checked": chk, "tags": [], "explanation": row[2]}
    except Exception:
        pass
    return None


def identify_item_from_image(image_b64: str) -> str:
    image_bytes = base64.b64decode(image_b64)
    image_data = {"mime_type": "image/jpeg", "data": image_bytes}
    prompt = (
        "이 이미지에서 물품을 하나 인식해서 한국어로 짧게 물품명만 답해줘. "
        "예시: 보조배터리, 손톱깎이, 라이터, 노트북. "
        "물품명 외 다른 말은 하지 마."
    )
    response = model.generate_content([prompt, image_data])
    return response.text.strip()


REGULATION_CONTEXT = """
[2024-2025 IATA 항공 수하물 최신 규정 기준]

■ 보조배터리 / 리튬이온배터리
- 위탁 수하물: 완전 금지 (용량 무관)
- 기내 반입: 100Wh 이하 → 제한 없이 허용 / 100~160Wh → 항공사 사전 승인 후 1인 최대 2개 / 160Wh 초과 → 반입 불가
- 스마트백(배터리 내장 캐리어): 배터리 분리 후 기내 반입, 분리 불가 시 전체 위탁·반입 금지

■ 액체·젤·에어로졸 (LAGs 규정)
- 기내 반입: 용기당 100ml 이하, 1L 투명 지퍼백 1개에 한해 허용
- 위탁: 용량 제한 없음 (인화성 제외)
- 예외: 처방 의약품, 영유아 식품(동반 시)은 필요량 기내 반입 허용

■ 라이터 / 성냥
- 기내 반입: 1인 1개 한정 허용 (일반 부탄 라이터)
- 위탁 수하물: 완전 금지
- 토치 라이터(제트 라이터): 기내·위탁 모두 금지

■ 칼·가위류
- 기내 반입: 날 길이 6cm 이하 가위만 허용 / 칼·커터·맥가이버칼 불가
- 위탁: 허용 (안전 포장 필수)

■ 폭발물·인화성 물질
- 기내·위탁 모두 완전 금지: 폭죽, 화약, 부탄가스, 연료류, 페인트, 시너

■ 전동 이동 수단
- 전동킥보드, 전동휠, 호버보드: 리튬배터리 내장으로 기내·위탁 모두 금지 (대부분 항공사)
- 전동 휠체어: 항공사 사전 신청 시 위탁 가능 (배터리 조건 있음)

■ 스포츠 장비
- 골프채, 야구배트, 스키·보드, 다이빙 장비: 위탁 전용 (기내 불가)
- 자전거: 위탁 가능 (항공사별 초과 수하물 요금 별도)

■ 주류
- 기내 반입: 70% 미만, 용기당 100ml 이하 (LAGs 규정 적용)
- 위탁: 알코올 24% 이하 무제한 / 24~70% → 1인 5L까지 / 70% 초과 금지
""".strip()


def get_regulation_from_gemini(item: str, country: str, airline: str) -> dict:
    prompt = (
        f"너는 항공 수하물 규정 전문가야. IATA 규정과 {airline}의 수하물 정책을 기반으로 "
        f"'{item}'을(를) {country} 여행 시 기내 반입 및 위탁 수하물로 가져갈 수 있는지 판단해줘.\n"
        "반드시 아래 5줄 형식으로만 답해줘. 다른 말은 절대 하지 마:\n"
        "category: 반입가능 또는 반입불가 또는 제한적반입\n"
        "carry_on: 가능 또는 불가 또는 조건부\n"
        "checked: 가능 또는 불가 또는 조건부\n"
        "tags: 쉼표로 구분한 키워드 1~3개 (예: 배터리,위험물)\n"
        "explanation: 한 문장으로 핵심 조건만 간단히"
    )
    response = model.generate_content(prompt)
    text = response.text.strip()

    fields = {"category": "알 수 없음", "carry_on": "알 수 없음", "checked": "알 수 없음", "tags": "", "explanation": text}
    for line in text.splitlines():
        for key in fields:
            if line.startswith(f"{key}:"):
                fields[key] = line[len(key)+1:].strip()

    tags = [t.strip() for t in fields["tags"].split(",") if t.strip()]
    return {
        "item":        item,
        "category":    fields["category"],
        "carry_on":    fields["carry_on"],
        "checked":     fields["checked"],
        "tags":        tags,
        "explanation": fields["explanation"],
    }


class ImageRequest(BaseModel):
    image: str  # base64
    country: str
    airline: str


class TextRequest(BaseModel):
    item: str
    country: str
    airline: str


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict_from_image(req: ImageRequest):
    try:
        item = identify_item_from_image(req.image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 분석 실패: {str(e)}")

    result = query_regulation(item, req.country, req.airline)
    if not result:
        result = get_regulation_from_gemini(item, req.country, req.airline)

    return result


@app.post("/predict/text")
def predict_from_text(req: TextRequest):
    result = query_regulation(req.item, req.country, req.airline)
    if not result:
        result = get_regulation_from_gemini(req.item, req.country, req.airline)

    return result
