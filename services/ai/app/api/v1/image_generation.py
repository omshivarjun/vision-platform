from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import requests

router = APIRouter()

class ImageGenerationRequest(BaseModel):
    prompt: str
    size: Optional[str] = "1024x1024"
    provider: Optional[str] = "openai"

class ImageGenerationResponse(BaseModel):
    image_url: str
    provider: str
    prompt: str
    size: str

@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """Generate an image from a text prompt using the selected provider."""
    provider = request.provider or os.getenv("IMAGE_GEN_PROVIDER", "openai")
    size = request.size or os.getenv("IMAGE_GEN_DEFAULT_SIZE", "1024x1024")
    prompt = request.prompt

    if provider == "openai":
        api_key = os.getenv("OPENAI_IMAGE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        try:
            response = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": prompt,
                    "n": 1,
                    "size": size
                },
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            image_url = data["data"][0]["url"]
            return ImageGenerationResponse(
                image_url=image_url,
                provider="openai",
                prompt=prompt,
                size=size
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI image generation failed: {e}")
    # Add Stable Diffusion and Midjourney integration here as needed
    raise HTTPException(status_code=400, detail=f"Provider '{provider}' not supported yet.")
