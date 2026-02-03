from fastapi import Depends, HTTPException, Path, APIRouter
from databases.database import SessionLocal
from sqlalchemy.orm import Session
from typing import Annotated
from pydantic import BaseModel, Field
from databases.model import Users
from passlib.context import CryptContext
from pydantic import BaseModel
from starlette import status
from routers.user_admin.authentication import get_current_user



router=APIRouter(
    prefix='/user',
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


bcrypt_context=CryptContext(schemes=['bcrypt'])

class UserVerification(BaseModel):
    """
    This is a class that helps verify the user password in case 
    he/she wants to update the password
    
    Attributes:
        password (str) : Representing the old password
        new_password (str) : New password
    """
    password: str
    new_password: str



@router.get('/', status_code=status.HTTP_200_OK)
async def get_user_info( user: user_dependency, db: db_dependency):
    """
    This functions helps get all the informations of the current user

    Parameters:
        user  (user_dependency): depends on the current user
        db : (db_dependendcy): attached to the database
    
    Returns:
        JSON : user's informations
    """
    if user is None:
        raise(HTTPException(status_code=401, detail='Authentication Failed'))
    
    user_model=db.query(Users).filter(Users.id==user.get('id')).first()

    if user_model is None:
        raise HTTPException(status_code=401, detail='User Not Found')
    
    return user_model



@router.put('/change_password',status_code=status.HTTP_204_NO_CONTENT)
async def change_password(user: user_dependency, db: db_dependency, user_verification:UserVerification):
    """
    This functions helps get all the informations of the current user

    Parameters:
        user  (user_dependency): depends on the current user
        db : (db_dependendcy): attached to the database
    """
    if user is None:
        raise(HTTPException(status_code=401, detail='Authentication Failed'))
    
    user_model=db.query(Users).filter(Users.id==user.get('id')).first()

    if user_model is None:
        raise HTTPException(status_code=401, detail='User Not Found')
    
    if not bcrypt_context.verify(user_verification.password, user_model.hashed_password):
        raise HTTPException(status_code=401,detail='Wrong Password')

    user_model.hashed_password=bcrypt_context.hash(user_verification.new_password) 

    db.add(user_model)
    db.commit()

        
    

@router.put('/email/{email}', status_code=status.HTTP_204_NO_CONTENT)
async def change_email(user:user_dependency, db:db_dependency, email:str):
    if user is None:
        raise HTTPException(status_code=401,detail='Authentication Failed')
    user_model=db.query(Users).filter(Users.id==user.get('id')).first()
    user_model.email=email
    
    db.add(user_model)
    db.commit()


@router.put('/language/{language}', status_code=status.HTTP_204_NO_CONTENT)
async def change_language(user:user_dependency, db:db_dependency, language:str):
    if user is None:
        raise HTTPException(status_code=401,detail='Authentication Failed')
    user_model=db.query(Users).filter(Users.id==user.get('id')).first()
    user_model.language=language
    
    db.add(user_model)
    db.commit()