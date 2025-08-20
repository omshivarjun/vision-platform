from fastapi import APIRouter
from pydantic import BaseModel
from transformers import MarianMTModel, MarianTokenizer

api_router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

# Load the translation model and tokenizer
model_name = "Helsinki-NLP/opus-mt-en-es"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

@api_router.post("/translation/translate")
async def translate_text(request: TranslationRequest):
    # Tokenize the input text
    inputs = tokenizer(request.text, return_tensors="pt", padding=True)

    # Generate the translation
    translated = model.generate(**inputs)

    # Decode the translated text
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

    return {"translatedText": translated_text}