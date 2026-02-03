from fastapi import  Depends, HTTPException, Path, APIRouter

from databases.database import  SessionLocal
from sqlalchemy.orm import Session
from typing import Annotated
from databases.model import  Chat, Users,Diagnosis
from starlette import status
from routers.user_admin.authentication import get_current_user


router=APIRouter(
    prefix='/admin_get',
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

@router.get('/user', status_code=status.HTTP_204_NO_CONTENT)
async def get_all_users(user:user_dependency, db:db_dependency):
    """
    This functions is mostly for admin in order to get all the users.
    This can be useful in order to have some analysis about the different users and help improve the app

    Parameters:
        user  (user_dependency): depends on the current user
        db : (db_dependendcy): attached to the database
    
    Returns:
        db (table) : users
    """
    if user is None or user.get("user_role")!='admin':
        raise HTTPException(status_code=401, detail='Authentication Failed')
    user_model=db.query(Users).all()

    return user_model


@router.get('/chat', status_code=status.HTTP_204_NO_CONTENT)
async def get_all_chat(user:user_dependency, db:db_dependency):
    """
    This functions is mostly for admin in order to get all the chats.
    This can be useful in order to have some analysis about the different chats and help improve the app

    Parameters:
        user  (user_dependency): depends on the current user
        db : (db_dependendcy): attached to the database
    
    Returns:
        db (table) : chats
    """
    if user is None or user.get("user_role")!='admin':
        raise HTTPException(status_code=401, detail='Authentication Failed')
    chat_model=db.query(Chat).all()
    
    return chat_model

@router.get('/diagnosis', status_code=status.HTTP_204_NO_CONTENT)
async def get_all_diagnosis(user:user_dependency, db:db_dependency):
    """
    This functions is mostly for admin in order to get all the diagnosis.
    This can be useful in order to have some analysis about the different diagnosis and help improve the app

    Parameters:
        user  (user_dependency): depends on the current user
        db : (db_dependendcy): attached to the database
    
    Returns:
        db (table) : diaganosis
    """
    if user is None or user.get("user_role")!='admin':
        raise HTTPException(status_code=401, detail='Authentication Failed')
    diagnosis_model=db.query(Diagnosis).all()
    
    return diagnosis_model




