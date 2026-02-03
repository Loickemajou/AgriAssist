from databases.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float,DateTime, func



class Users(Base):
    __tablename__='users'

    id=Column(Integer, primary_key=True, index=True)
    email=Column(String, unique=True)
    username=Column(String, unique=True)
    first_name=Column(String)
    last_name=Column(String)
    hashed_password=Column(String)
    is_active=Column(Boolean, default=True)
    role=Column(String)
    language=Column(String, default='en')
    lat=Column(Float)
    lng=Column(Float)


class Diagnosis(Base):
    __tablename__='diagnosis'
    id=Column(Integer, primary_key=True, index=True)
    user_id=Column(Integer, ForeignKey('users.id'))
    image_url=Column(String)
    audio_url=Column(String)
    crop=Column(String)
    disease=Column(String)
    video_url=Column(String)
    treatment=Column(String)
    confidence=Column(Float)
    lat=Column(Float)
    lng=Column(Float)
    recovered=Column(String, default='pending')
    created_at=Column(DateTime, default=func.now())


class Chat(Base):
    __tablename__='chat'
    id=Column(Integer, primary_key=True, index=True)
    user_id=Column(Integer, ForeignKey('users.id'))
    diagnosis_id=Column(Integer, ForeignKey('diagnosis.id')) 
    message=Column(String)
    audio_url_output=Column(String)
    response=Column(String)
    created_at=Column(DateTime, default=func.now())

