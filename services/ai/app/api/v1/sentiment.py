from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
import time

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: Literal['positive', 'neutral', 'negative']
    score: float
    processing_time: float

@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    start = time.time()
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    # TODO: Integrate real provider (OpenAI, Azure, Google, etc.)
    # For now, mock logic
    lower = text.lower()
    if any(word in lower for word in ["good", "great", "excellent", "happy", "love"]):
        sentiment = "positive"
        score = 0.9
    elif any(word in lower for word in ["bad", "terrible", "sad", "hate", "awful"]):
        sentiment = "negative"
        score = -0.8
    else:
        sentiment = "neutral"
        score = 0.0
    return SentimentResponse(
        sentiment=sentiment,
        score=score,
        processing_time=time.time() - start
    )

