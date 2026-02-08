from google import genai
from google.genai import types
from typing import List
from dotenv import load_dotenv
import base64
import os
from pydantic import BaseModel, Field
from typing import List, Optional,Dict
from pathlib import Path
import mimetypes
import json
from services.audio_image_managment import transcribe_audio
load_dotenv()

GEMINI_KEY=os.getenv("GEMINI_API_KEY")


if GEMINI_KEY is None:
    raise Exception("Gemini API KEY is not set")
else:
    print(GEMINI_KEY[0])


client=genai.Client(api_key=GEMINI_KEY,http_options={'api_version': 'v1alpha'})



def translate_text(text: str, source:str, dest:str):
    prompts=f"""You are a professional tranlator. You actually have a good mastery of all the languages in the world.
    You are given a text in {source}. Translate this text to {dest}: {text}

    Just return the translated text, no markdown, no code blocks, no additional text.
    strictly just the text, it should not show that it was actually translated, but only the translated text should be given!!!

    It should always remove phrases starting by "Here is the translation in {dest}". It should just give the text!!!

    """
    
    response=client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=prompts,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="high")
        ),
    )

    return response.text



import re
import json
import mimetypes
from pathlib import Path
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List


def clean_gemini_response(response):
    response_text = response.text.strip()
        
    if response_text.startswith('```'):
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        else:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
        
    print(f"Cleaned response: {response_text}")  
    result = json.loads(response_text)

    return result


def validate_media_input(image_url: Optional[str], video_url: Optional[str]):
    if not image_url and not video_url:
        return {
            "crop": "unknown",
            "disease": "No image or video provided",
            "treatment": "Please upload an image or video",
            "confidence": 0.0,
            "error": "No media provided"
        }
    return None

def read_media_file(file_path: str, default_mime: str):
    with open(file_path, 'rb') as f:
        file_data = f.read()
    
    mime_type = mimetypes.guess_type(file_path)[0] or default_mime
    return file_data, mime_type

def prepare_media_parts(image_url: Optional[str] = None,video_url: Optional[str] = None):
    content_parts = []
    
    if video_url:
        try:
            video_data, video_mime_type = read_media_file(video_url, "video/mp4")
            content_parts.append(
                types.Part.from_bytes(
                    data=video_data,
                    mime_type=video_mime_type
                )
            )
            print(f"Added video: {video_url}, mime: {video_mime_type}")
        except Exception as e:
            print(f"Error reading video: {e}")
            raise ValueError(f"Error reading video file: {str(e)}")
    
    if image_url:
        try:
            image_data, image_mime_type = read_media_file(image_url, "image/jpeg")
            content_parts.append(
                types.Part.from_bytes(
                    data=image_data,
                    mime_type=image_mime_type
                )
            )
            print(f"Added image: {image_url}, mime: {image_mime_type}")
        except Exception as e:
            print(f"Error reading image: {e}")
            raise ValueError(f"Error reading image file: {str(e)}")
    
    return content_parts


def build_diagnosis_prompt(
    response_language: str,
    has_video: bool,
    audio_bytes: Optional[bytes] = None,
    location_context: Optional[Dict] = None,
    source_language: Optional[str] = None
) -> str:
    
    media_type = 'video' if has_video else 'image'
    
    prompt = f"""You are an expert in **Agriculture only** (crops, soil, pests, plant diseases, farm practices).
    Do NOT answer questions outside agriculture.
    If the user asks anything not related to agriculture, respond in {response_language} with a short refusal like:
    "Sorry, I can only help with agriculture-related questions."
    Then ask them to share a crop/farm question or upload a crop image/video.

    Now analyze this {media_type} and return the answer in {response_language}.
    You MUST return ONLY valid JSON with no markdown formatting, no code blocks, no additional text.
    
    Return exactly this format:
    {{
        "crop": "the identified crop type",
        "disease": "the suggested disease or 'healthy' if no disease detected",
        "treatment": "the proposed treatment or 'none needed' if healthy",
        "confidence": 0.85
    }}
    
    IMPORTANT: Return ONLY the JSON object in {response_language}, nothing else.
    """
    if audio_bytes:
        transcribed_audio = transcribe_audio(audio_bytes, response_language)
        english_text = translate_text(transcribed_audio, source_language or 'auto', 'english')
        prompt += f"\n\nAlso consider the described symptoms: {english_text}."
    
    if location_context:
        from services.location_service import create_location_context_prompt
        location_prompt = create_location_context_prompt(location_context)
        prompt += f"\n\n{location_prompt}"
    
    return prompt






def call_gemini_initial_analysis(content_parts: List[types.Part]) -> Dict:
    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=content_parts
    )
    
    result = clean_gemini_response(response)
    
    if 'confidence' in result:
        result['confidence'] = float(result['confidence'])
    
    return result


def call_gemini_web_search(
    content_parts: List[types.Part],
    initial_result: Dict,
    prompt: str,
    response_language: str,
    has_video: bool
) -> Dict:
    
    class MatchResult(BaseModel):
        crop: str = Field(description="The name of the crop.")
        disease: str = Field(description="The name of the disease.")
        treatment: str = Field(description="The treatment recommendations.")
        confidence: float = Field(description="Confidence score between 0 and 1")
    
    media_type = 'video' if has_video else 'image'
    
    content = f"""Based on this initial analysis: {json.dumps(initial_result)}
    
    Search the web to verify if this diagnosis is correct for the crop disease shown in the {media_type}.
    Consider the symptoms described: {prompt}
    
    If the diagnosis seems incorrect based on your search, provide the correct diagnosis.
    Include the source of your information.
    Respond in {response_language}.
    """
    
    search_parts = content_parts + [types.Part(text=content)]
    
    response = client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=search_parts,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(google_search=types.GoogleSearch()),
            ],
            response_mime_type="application/json",
            response_schema=MatchResult,
        )
    )
    
    try:
        result = MatchResult.model_validate_json(response.text)
        return result.model_dump()
    except Exception as e:
        print(f"Error parsing web search result: {e}")
        print(f"Raw response: {response.text}")
        return initial_result


def create_error_response(error_type: str, error: Exception):
    print(f"{error_type}: {error}")
    if error_type == "JSON decode error":
        import traceback
        traceback.print_exc()
    
    return {
        "crop": "unknown",
        "disease": "Could not parse response" if "JSON" in error_type else "unknown",
        "treatment": "Please try again",
        "confidence": 0.0,
        "error": str(error)
    }



def analyze_diagnosis(
    image_url: Optional[str] = None,
    video_url: Optional[str] = None,
    source=None,
    audio_bytes: bytes = None,
    location_context: dict = None,
    language: str = None
):
    
    validation_error = validate_media_input(image_url, video_url)
    if validation_error:
        return validation_error
    
    response_language = language or "English"
    
    try:
        media_parts = prepare_media_parts(image_url, video_url)
    except ValueError as e:
        return create_error_response("Media preparation error", e)
    
    prompt = build_diagnosis_prompt(
        response_language=response_language,
        has_video=bool(video_url),
        audio_bytes=audio_bytes,
        location_context=location_context,
        source_language=source
    )
    
    content_parts = media_parts + [types.Part(text=prompt)]
    
    try:
        result = call_gemini_initial_analysis(content_parts)
    except json.JSONDecodeError as e:
        raise Exception(f"Json eror: {e}" )
    except Exception as e:
        raise Exception(f"Analysis error: {e}")
    
    if result.get('confidence', 0) < 0.5:
        try:
            result = call_gemini_web_search(
                content_parts=media_parts,
                initial_result=result,
                prompt=prompt,
                response_language=response_language,
                has_video=bool(video_url)
            )
        except Exception as e:
            print(f"Web search failed: {e}")

    return result







def build_prompt(diagnosis, chat_history, user_message, location_context: dict=None):
    history_text=""

    for chat in chat_history:
        history_text += f"User: {chat.message} \nAI : {chat.response}\n"

    location_text = ""
    if location_context:
        from services.location_service import create_location_context_prompt
        location_text = create_location_context_prompt(location_context)

    return f"""
        You are an expert agricultural assistant.
        IMPORTANT SCOPE RULE:
        - You ONLY answer agriculture-related topics (crops, soil, pests, plant diseases, farm practices, irrigation, fertilizer, livestock basics).
        - If the user asks something not related to agriculture, reply politely and clearly:
          "Sorry, I can only help with agriculture-related questions."
          Then ask them to ask an agriculture question.
        - Do not provide the non-agriculture answer even if you know it.
        - You are given a language context to respond in.
        - You must respond in the language context provided.
        -You must responds in plain text not markdown so that it can be converted to speech.

        Your job is to help users diagnose their crops and provide safe, practical suggestions about diseases and treatments.
        You are given a diagnosis context, location context, and a chat history to help the user based on their message.
         
        DIAGNOSIS CONTEXT:

        Crop: {diagnosis.crop}
        Disease: {diagnosis.disease}
        Treatment: {diagnosis.treatment}
        Confidence: {diagnosis.confidence}
         
        LOCATION CONTEXT
        {location_text}

        CHAT HISTORY:
        {history_text}
     
        CONFIDENCE RULES:
        - If confidence < 0.6 → say you are unsure and recommend community help and also put low to indicate
        - If confidence >= 0.8 → answer confidently 
        - Never hallucinate
        - Be practical and safe.

        USER QUESTION:
        {user_message}

        Strictly respond in the language provided, no markdown, just the language. This should be very important!!!!
         
        """

def gemini_chat(prompt: str) -> dict:

    response=client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="low")
        ),
    )

    text = response.text.lower()
    confidence_flag = "low" if "not confident" in text else "high"

    return {
        "text": response.text,
        "confidence": confidence_flag
    }
    