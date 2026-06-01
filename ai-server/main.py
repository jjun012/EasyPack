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
            return {"item": row[0], "category": row[1], "explanation": row[2]}
    except Exception:
        pass
    return None


def identify_item_from_image(image_b64: str) -> str:
    image_data = {"mime_type": "image/jpeg", "data": image_b64}
    prompt = (
        "이 이미지에서 물품을 하나 인식해서 한국어로 짧게 물품명만 답해줘. "
        "예시: 보조배터리, 손톱깎이, 라이터, 노트북. "
        "물품명 외 다른 말은 하지 마."
    )
    response = model.generate_content([prompt, image_data])
    return response.text.strip()


def get_regulation_from_gemini(item: str, country: str, airline: str) -> dict:
    prompt = (
        f"'{item}'을(를) {country} 여행 시 {airline} 항공기에 가져갈 수 있는지 알려줘. "
        "반드시 아래 형식으로만 답해줘:\n"
        "category: 반입가능 또는 반입불가 또는 제한적반입\n"
        "explanation: 간단한 설명 (2문장 이내)"
    )
    response = model.generate_content(prompt)
    text = response.text.strip()

    category = "알 수 없음"
    explanation = text
    for line in text.splitlines():
        if line.startswith("category:"):
            category = line.replace("category:", "").strip()
        elif line.startswith("explanation:"):
            explanation = line.replace("explanation:", "").strip()

    return {"item": item, "category": category, "explanation": explanation}


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
