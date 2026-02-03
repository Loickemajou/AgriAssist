from fastapi import  Depends, HTTPException, Path, APIRouter

from databases.database import  SessionLocal
from sqlalchemy.orm import Session
from typing import Annotated
from databases.model import  Chat, Users,Diagnosis
from starlette import status
from pydantic import BaseModel, Field 
from .authentication import get_current_user


router=APIRouter(
    prefix='/admin_delete',
    tags=['auth']
)


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency=Annotated[Session, Depends(get_db)]
user_dependency=Annotated[dict, Depends(get_current_user)]


@router.delete('/chat/{chat_id}',status_code=status.HTTP_204_NO_CONTENT)
async def  delete_todo(user: user_dependency, db: db_dependency, chat_id:int=Path(gt=0)):
    if user is None or user.get('user_role')!= 'admin':
        raise HTTPException(status_code=401, detail='Authentication Failed')
    chat_model=db.query(Chat).filter(Chat.id==chat_id).first()

    if chat_model is None:
        raise HTTPException(status_code=401, detail='Chat not found')
    db.query(Chat).filter(Chat.id==chat_id).delete()
    db.commit()


@router.delete('/diagnosis/{diagnosi_id}',status_code=status.HTTP_204_NO_CONTENT)
async def  delete_todo(user: user_dependency, db: db_dependency, diagnosis_id:int=Path(gt=0)):
    if user is None or user.get('user_role')!= 'admin':
        raise HTTPException(status_code=401, detail='Authentication Failed')
    diagnosis_model=db.query(Diagnosis).filter(Diagnosis.id==diagnosis_id).first()

    if diagnosis_model is None:
        raise HTTPException(status_code=401, detail='Chat not found')
    db.query(Chat).filter(Diagnosis.id==diagnosis_id).delete()
    db.commit()





