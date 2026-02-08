import os
import uuid
import json
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.cloud import texttospeech
from google.oauth2 import service_account

load_dotenv()
GEMINI_KEY=os.getenv("GEMINI_API_KEY")
if GEMINI_KEY is None:
    raise Exception("Gemini API KEY is not set")
else:
    print(GEMINI_KEY[0])

client=genai.Client(api_key=GEMINI_KEY)

def _init_tts_client():
    """Initialize TextToSpeechClient using credentials from env var or file."""
    credentials_json = os.getenv("GOOGLE_CLOUD_CREDENTIALS_JSON")
    
    if credentials_json:
        try:
            creds_dict = json.loads(credentials_json)
            credentials = service_account.Credentials.from_service_account_info(creds_dict)
            return texttospeech.TextToSpeechClient(credentials=credentials)
        except json.JSONDecodeError as e:
            print(f"Warning: Failed to parse GOOGLE_CLOUD_CREDENTIALS_JSON: {e}")
            print("Falling back to default credentials...")
    
    return texttospeech.TextToSpeechClient()

client_tts = _init_tts_client()


load_dotenv()

API_DIR = Path(__file__).resolve().parent.parent  # .../api
audio_directory = API_DIR / "static_audio"
image_directory = API_DIR / "static_image"
video_directory = API_DIR / "static_video"

audio_directory.mkdir(parents=True, exist_ok=True)
image_directory.mkdir(parents=True, exist_ok=True)
video_directory.mkdir(parents=True, exist_ok=True)


def _unique_filename(original_name: str) -> str:
    original_name = (original_name or "upload").strip()
    _, ext = os.path.splitext(original_name)
    return f"{uuid.uuid4().hex}{ext}"






async def upload_audio(audio):
    filename = _unique_filename(audio.filename)
    file_path = audio_directory / filename
    public_url = f"/static_audio/{filename}"
    audio_bytes = await audio.read()

    with open(file_path, "wb") as f:
        f.write(audio_bytes)
    
    return public_url, audio_bytes, str(file_path)


def save_tts_audio(audio_bytes: bytes, base_name: str = "tts-output.mp3") -> str:
    """
    Save text-to-speech audio bytes to the static audio directory and
    return a public URL that can be used by the frontend.
    """
    filename = _unique_filename(base_name)
    file_path = audio_directory / filename

    with open(file_path, "wb") as f:
        f.write(audio_bytes)

    return f"/static_audio/{filename}"
    
async def upload_image(image):

    filename = _unique_filename(image.filename)
    file_path = image_directory / filename
    public_url = f"/static_image/{filename}"
    image_bytes = await image.read()

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    return public_url, str(file_path)

async def upload_video(video):
    filename = _unique_filename(video.filename)
    file_path = video_directory / filename
    public_url = f"/static_video/{filename}"
    video_bytes = await video.read()

    with open(file_path, "wb") as f:
        f.write(video_bytes)

    return public_url, str(file_path)
    


def text_to_speech(text, language):
    
    input_text = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=language,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,  
            pitch=0.0 
        )
    
    response = client_tts.synthesize_speech(
        input=input_text,
        voice=voice,
        audio_config=audio_config
    )

    return response.audio_content

def transcribe_audio(audio_bytes:bytes, language:str):
    langauge_hint=f"The audio is in {language}. " if language else ""
    prompt=f"{langauge_hint}Transcribe this audio to text. Provide only the transcribed text and do not add commentary."
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=[
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type="audio/wav"  
                ),
                types.Part(text=prompt)
            ]
        )
        
        return response.text.strip()
    
    except Exception as e:
        print(f"Transcription error: {e}")
        return ""

   
    



