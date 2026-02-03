from databases.database import SessionLocal
from databases.model import Diagnosis
from pydantic import BaseModel, Field
from fastapi import Depends, HTTPException, Path, APIRouter, UploadFile, File, Form, Query
from starlette import status
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from routers.user_admin.authentication import get_current_user
from datetime import datetime
from services.gemini_service import analyze_diagnosis
from services.audio_image_managment import transcribe_audio
from services.language_map import normalize_language
import os
from services.audio_image_managment import upload_audio, upload_image,upload_video


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
audio_directory=os.path.join(BASE_DIR, "static_audio")
image_directory=os.path.join(BASE_DIR, "static_image")
video_directory=os.path.join(BASE_DIR, "static_video")
# ensure static directories exist
os.makedirs(audio_directory, exist_ok=True)
os.makedirs(image_directory, exist_ok=True)
os.makedirs(video_directory, exist_ok=True)


router=APIRouter(prefix="/diagnosis", tags=['Diagnosis'])

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session, Depends(get_db)]
user_dependency=Annotated[dict, Depends(get_current_user)]





@router.get('/', status_code=status.HTTP_200_OK)
async def real_all_diagnosis(user:user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentification Failed')
    return db.query(Diagnosis).filter(Diagnosis.user_id==user.get('id')).all()

# @router.get("/id/{diagnosis_id}", status_code=status.HTTP_200_OK)
# async def read_diagnosis(user:user_dependency,db: db_dependency, diagnosis_id:int=Path(gt=0)):
#     if user is None:
#         raise HTTPException(status_code=401, detail='Authentification Failed')
    
#     diagnosis_model=db.query(Diagnosis).filter(Diagnosis.id==diagnosis_id).filter(Diagnosis.user_id==user.get('id')).first()
#     if diagnosis_model is not None:
#         return diagnosis_model
#     raise HTTPException(status_code=404, detail="Diagnosis not found.")

@router.get("/diagnosis/crop/{crop}", status_code=status.HTTP_200_OK)
async def read_diagnosis(user:user_dependency,db: db_dependency, crop:str):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentification Failed')
    
    diagnosis_model=db.query(Diagnosis
                             ).filter(Diagnosis.crop==crop).filter(Diagnosis.user_id==user.get('id')).all()
    if diagnosis_model is not None:
        return diagnosis_model
    raise HTTPException(status_code=404, detail="Diagnosis not found.")


@router.post('/diagnosis', status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    user: user_dependency,
    db: db_dependency,
    image: UploadFile = File(None),
    audio: UploadFile = File(None),
    video:UploadFile=File(None),
    lat: float = Form(None),
    lng: float = Form(None),
    crop: str = Form(None)
):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    

    # I will have to impliment and image management heree
    
    image_url = None
    if image:
        image_url= await upload_image(image)
        

    audio_bytes=None
    audio_url=None
    if audio:
        audio_url, audio_bytes= await upload_audio(audio)

    video_url=None 
    if video:
        video_url=await upload_video(video)

    # Analyze diagnosis if image or audio provided, with location context
    result = None
    location_context = None
    if image_url or audio_bytes:
        
        from services.location_service import get_region_from_coordinates
        
        # Get location context if available
        if lat and lng:
            location_context = get_region_from_coordinates(lat, lng)
        
        result = analyze_diagnosis(image_url=image_url,video_url=video_url, audio_bytes=audio_bytes, location_context=location_context,language=user.get('language'))

    diagnosis_model = Diagnosis(
        user_id=user["id"],
        crop=result.get('crop', 'unknown') if not None else crop ,
        image_url=image_url,
        audio_url=audio_url,
        disease=result.get('disease', 'unknown'),
        treatment=result.get('treatment', 'unknown'),
        confidence=result.get('confidence', '0') ,
        video_url=video_url,
        lat=lat,
        lng=lng,
        created_at=datetime.utcnow()
    )

    db.add(diagnosis_model)
    db.commit()
    db.refresh(diagnosis_model)

    return diagnosis_model, result


@router.put('/diagnosis/{diagnosis_id}',status_code=status.HTTP_204_NO_CONTENT)
async def update_diagnosis(user:user_dependency, db:db_dependency, crop: str = Form(...),recovered: str = Form(...),diagnosis_id:int=Path(gt=0),
                           image: UploadFile=File(...), audio: UploadFile=File(None),video:UploadFile=File(None),lat: float = Form(None),lng: float = Form(None)
    ):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    diagnosis_model=db.query(Diagnosis).filter(Diagnosis.id==diagnosis_id).filter(Diagnosis.user_id==user.get('id')).first()

    if diagnosis_model is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    
    
    image_url = None
    if image:
        image_url= await upload_image(image)
        

    audio_bytes=None
    audio_url=None
    if audio:
        audio_url, audio_bytes= await upload_audio(audio)

    video_url=None 
    if video:
        video_url=await upload_video(video)
    # Analyze diagnosis if image or audio provided, with location context
    result = None
    location_context = None
    if image_url or audio_bytes:
        
        from services.location_service import get_region_from_coordinates
        
        # Get location context if available
        if lat and lng:
            location_context = get_region_from_coordinates(lat, lng)
        
        result = analyze_diagnosis(image_url=image_url,video_url=video_url,  audio_bytes=audio_bytes, location_context=location_context, language=user.get('language'))

    
    
    diagnosis_model.image_url=image_url
    diagnosis_model.crop=result.get('crop', 'unknown') if not None else crop
    diagnosis_model.disease=result.get('disease', 'unknown')
    diagnosis_model.treatment=result.get('treatment', 'unknown')
    diagnosis_model.confidence=result.get('confidence', '0')
    diagnosis_model.audio_url=audio_url
    diagnosis_model.video_url=video_url
    diagnosis_model.lat=lat
    diagnosis_model.lng=lng
    diagnosis_model.recovered=recovered
    diagnosis_model.created_at=datetime.utcnow()

    db.add(diagnosis_model)
    db.commit()


@router.delete('/diagnosis/{diagnosis_id}',status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis(user: user_dependency,db:db_dependency,
                      diagnosis_id: int=Path(gt=0)):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    todo_model=db.query(Diagnosis).filter(Diagnosis.id==diagnosis_id).filter(Diagnosis.user_id==user.get('id')).first()

    if todo_model is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.query(Diagnosis).filter(Diagnosis.id==diagnosis_id).filter(Diagnosis.user_id==user.get('id')).delete()

    db.commit()


@router.post('/transcribe', status_code=status.HTTP_200_OK)
async def transcribe_audio_endpoint(
    file: UploadFile = File(...),
    language: str = Query(default="English")
):
    """
    Receive audio from frontend, transcribe with Gemini API
    
    Args:
        file: Audio file uploaded from frontend
        language: Language the audio is in (e.g., "Twi", "Yoruba", "English")
    
    Returns:
        {
            "text": "transcribed text",
            "confidence": 0.95
        }
    """
    try:
        # Read audio bytes from uploaded file
        audio_bytes = await file.read()
        
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio data received")
        
        # Normalize language (map display name to canonical code) and send to Gemini
        language_code = normalize_language(language)
        # result = transcribe_audio(audio_bytes, language=language_code)
        result={'text':"this to be done", 'langauge_used':"this is to be done"}

        # transcribe_audio returns a dict with text and confidence
        if isinstance(result, dict):
            transcribed_text = result.get('text', '')
            language_used = result.get('language_used', 'auto')
        
        else:
            transcribed_text = str(result)
            language_used = 'auto'
      

        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio - received empty response")

        return {
            "text": transcribed_text,
            "language_used": language_used
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")




