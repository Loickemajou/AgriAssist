from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from databases.model import Users
from passlib.context import CryptContext
from typing import Annotated
from sqlalchemy.orm import Session
from databases.database import SessionLocal
from starlette import status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import timedelta, datetime
import bcrypt



router=APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRETE_KEY=r"\Users\user\Desktop\learning_fastapi>"
algorithm='HS256'



bcrypt_context=CryptContext(schemes=["bcrypt"],deprecated="auto",bcrypt__truncate_error=False )
oauth2_bearer=OAuth2PasswordBearer(tokenUrl='/auth/token')



class CreatUserRequest(BaseModel):
    email :str
    username: str 
    first_name:str
    last_name:str
    password: str
    role: str
    language:str

class Token(BaseModel):
    access_token:str
    token_type:str


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()




def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"),bcrypt.gensalt())

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload=jwt.decode(token,SECRETE_KEY, algorithms=[algorithm])
        username :str=payload.get("sub")
        user_id: int=payload.get('id')
        user_role:str= payload.get('role')
        user_langauge:str=payload.get('language')

        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user')
        return {'username':username, 'id':user_id, 'user_role':user_role, 'language':user_langauge}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user')
    
    

db_dependency=Annotated[Session, Depends(get_db)]
user_dependency=Annotated[dict, Depends(get_current_user)]

def authenticate_user(username:str,password:str, db):
    user=db.query(Users).filter(Users.username==username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(username:str, user_id:int, role:str,user_language:str,expires_delta:timedelta):

    encode={'sub': username, 'id':user_id, 'role':role, 'language':user_language}
    expires=datetime.utcnow()+expires_delta

    encode.update({'exp':expires})
    return jwt.encode(encode, SECRETE_KEY, algorithm=algorithm)




    


@router.post('/register', status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreatUserRequest, db:db_dependency):

    new_user=Users(
        email=create_user_request.email,
        username=create_user_request.username,
        first_name=create_user_request.first_name,
        last_name=create_user_request.last_name,
        role=create_user_request.role,
        hashed_password=hash_password(create_user_request.password), 
        is_active=True,
        language=create_user_request.language
    )


    db.add(new_user)
    db.commit()


@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db:db_dependency):

    user=authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user')
    
    token= create_access_token(user.username, user.id,user.role,user.language,  timedelta(minutes=20))


    return {"access_token":token, "token_type": "bearer"}
