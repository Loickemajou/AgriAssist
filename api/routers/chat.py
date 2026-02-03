from databases.database import SessionLocal
from databases.model import Chat, Diagnosis
from pydantic import BaseModel, Field
from fastapi import Depends, HTTPException, Path, APIRouter
from starlette import status
from typing import Annotated
from sqlalchemy.orm import Session
from routers.user_admin.authentication import get_current_user
from datetime import datetime
from services.gemini_service import  translate_text, build_prompt, gemini_chat
from services.audio_image_managment import upload_audio,text_to_speech, transcribe_audio
from typing import List



router=APIRouter(prefix="/chat", tags=["Chat"])

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session, Depends(get_db)]
user_dependency=Annotated[dict, Depends(get_current_user)]


class ChatResponse(BaseModel):
    id: int
    message: str
    diagnosis_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True 

class ChatRequest(BaseModel):
    message:str
   





@router.get('/chat/{diagnosis_id}',response_model=List[ChatResponse])
async def get_chat_history(user:user_dependency, db:db_dependency,diagnosis_id: int=Path(gt=0) ):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Authentification Failed')
    
    diagnosis_model=db.query(Diagnosis).filter(Diagnosis.user_id==user.get('id')).filter(Diagnosis.id==diagnosis_id).first()

    

    if diagnosis_model is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    
    chat_history=db.query(Chat).filter(Chat.diagnosis_id==diagnosis_id,Chat.user_id == user.get("id")).order_by(Chat.created_at.asc()).all()


    return list(chat_history)
   




@router.post('/chat/{diagnosi_id}', status_code=status.HTTP_201_CREATED)
async def create_chat(user:user_dependency, db:db_dependency, chat_request:ChatRequest, diagnosis_id:int ):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
   
    
    diagnosis_model=db.query(Diagnosis).filter(Diagnosis.user_id==user.get('id')).filter(Diagnosis.id==diagnosis_id).first()

    
 
  
    if diagnosis_model is None:
        raise HTTPException(404, "Diagnosis not found")
    
    chat_history=db.query(Chat).filter(Chat.diagnosis_id==diagnosis_id).order_by(Chat.created_at.asc()).all()
    
    # Frontend already transcribed audio to text
    user_text = chat_request.message

    

    user_text=chat_request.message

    translated_input=user_text

    if user.get('language').lower() not in ['English', 'en-US', 'english', 'en-GB']:
        
        translated_input=translate_text(user_text, user.get('language'), "English")


        prompt = build_prompt(diagnosis_model, chat_history, translated_input)

        gemini_result = gemini_chat(prompt)

        output_text = translate_text(gemini_result["text"],"English",user.get('language'))
    
    else:
        prompt = build_prompt(diagnosis_model, chat_history, translated_input)

        gemini_result= gemini_chat(prompt)

        output_text=gemini_result['text']



        
    # I will have to impliment something where I am going to store the audio

    # audio_bytes = text_to_speech(output_text, user.get('language'))
    # audio_url = upload_audio(audio_bytes)
    audio_url="htis is to be done"


    
    chat = Chat(
        user_id=user.get('id'),
        diagnosis_id=diagnosis_id,
        response=output_text,
        audio_url_output=audio_url,
        message=chat_request.message,
        created_at=datetime.now()
    )

    db.add(chat)
    db.commit()

    return {
        "text": output_text,
        "audio_url": audio_url,
        "confidence": gemini_result["confidence"]
    }


@router.put('/chat/{diagnosis_id}/{chat_id}',status_code=status.HTTP_204_NO_CONTENT)
async def update_chat(user:user_dependency, db:db_dependency, chat_request:ChatRequest, diagnosis_id:int=Path(gt=0),chat_id:int=Path(gt=0)):

    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    diagnosis_model=db.query(Diagnosis).filter(diagnosis_id==diagnosis_id, Diagnosis.user_id==user.get('id')).first()

    if diagnosis_model is None:
        raise HTTPException(404, "Diagnosis not found")
    
    chat_model = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.diagnosis_id == diagnosis_id,
        Chat.user_id == user.get("id")
    ).first()

    if chat_model is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    
    chat_history=db.query(Chat).filter(Chat.diagnosis_id==diagnosis_id).order_by(Chat.created_at.asc()).all()
    

    user_text=chat_request.message

    translated_input=user_text

    if user.get('language').lower() not in ['English', 'en-US', 'english', 'en-GB']:
        
        translated_input=translate_text(user_text, user.get('language'), "English")


        prompt = build_prompt(diagnosis_model, chat_history, translated_input)

        gemini_result = gemini_chat(prompt)

        output_text = translate_text(gemini_result["text"],"English",user.get('language'))
    
    else:
        prompt = build_prompt(diagnosis_model, chat_history, translated_input)

        gemini_result= gemini_chat(prompt)

        output_text=gemini_result['text']
    
    # Convert AI response to speech
  
    # audio_bytes = text_to_speech(output_text, user.get('language'))
    # audio_url = upload_audio(audio_bytes)
    audio_url="htis is to be done"


    chat_model.message=chat_request.message
    chat_model.response=output_text
    chat_model.audio_url_output=audio_url
    
    chat_model.created_at = datetime.now()

    db.add(chat_model)
    db.commit()

    return {
        "text": output_text,
        "audio_url": audio_url,
        "confidence": gemini_result["confidence"]
    }


@router.delete('/chat/{diagnosis_id}/{chat_id}',status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(user: user_dependency,db:db_dependency,
                      chat_id: int=Path(gt=0),diagnosis_id: int=Path(gt=0)):
    
    if user is None:
        raise HTTPException(status_code=401, detail='Authentification Failed')
    
    diagnosis_model=db.query(Diagnosis).filter(Diagnosis.user_id==user.get('id')).filter(Diagnosis.id==diagnosis_id).first()

    if diagnosis_model is None:
        raise HTTPException(404, "Diagnosis not found")
    
    chat_model = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.diagnosis_id == diagnosis_id,
        Chat.user_id == user.get("id")
    ).first()

    if chat_model is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.query(Chat).filter(Chat.id==chat_id).filter(Chat.user_id==user.get('id')).delete()

    db.commit()
