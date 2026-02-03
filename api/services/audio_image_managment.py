import uuid
import os
# from abenasdk import AbenasClient
from dotenv import load_dotenv


load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
audio_directory=os.path.join(BASE_DIR, "static_audio")
image_directory=os.path.join(BASE_DIR, "static_image")
video_directory=os.path.join(BASE_DIR, "static_video")

os.makedirs(audio_directory, exist_ok=True)
os.makedirs(image_directory, exist_ok=True)
os.makedirs(video_directory, exist_ok=True)



# client=AbenasClient(api_key=os.getenv("ABENAS_API_KEY"))


async def upload_audio(audio):
    audio_url = f'{audio_directory}/{audio.filename}'
    audio_bytes = await audio.read()

    with open(audio_url, "wb") as f:
        f.write(audio_bytes)
    
    return audio_url, audio_bytes
    
async def upload_image(image):

    image_url = os.path.join(image_directory, image.filename)
    image_bytes = await image.read()

    with open(image_url, "wb") as f:
        f.write(image_bytes)

    return image_url

async def upload_video(video):
    video_url = os.path.join(video_directory, video.filename)
    video_bytes = await video.read()

    with open(video_url, "wb") as f:
        f.write(video_bytes)

    return video_url
    


def text_to_speech(text, landguage):
    # client.tts.synthesize(text, language_code=langauge, output_file=audio_directory/f"{text}.wav")
    # return audio_directory/f"{text}.wav"
    pass

def transcribe_audio(audio_bytes:bytes, language:str):
    pass
    # Still needs to be completely implimented
    # prompt = "You are a professional Transcriber that transcribes audio accurately according to the language."

    # language_hint = f"The audio is in {language}. " if language else ""
    # prompt += f"{language_hint}Transcribe this audio to text. Provide only the transcribed text and do not add commentary."

    # text_result=client.asr.transcribe(audio_bytes, language=language)

   
    


    # return {"text": text_result,"language_used": language or "auto"}


