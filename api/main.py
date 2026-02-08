from fastapi import FastAPI
from databases.database import Base, engine, SessionLocal
from routers.user_admin import admin_delete, admin_get, users, authentication
from routers.chat import router as chat_router
from routers.diagnosis import router as diagnosis_router
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI(title='AgriAssist Community')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
audio_directory=os.path.join(BASE_DIR, "static_audio")
image_directory=os.path.join(BASE_DIR, "static_image")
video_directory=os.path.join(BASE_DIR, "static_video")

os.makedirs(audio_directory, exist_ok=True)
os.makedirs(image_directory, exist_ok=True)
os.makedirs(video_directory, exist_ok=True)




@app.get('/healthy')
def healthy():
    return {'status':'healthy'}

app.mount("/static_image", StaticFiles(directory=image_directory), name="static_image")
app.mount("/static_audio", StaticFiles(directory=audio_directory), name="static_audio")
app.mount("/static_video", StaticFiles(directory=video_directory), name="static_video")

Base.metadata.create_all(bind=engine)

app.include_router(authentication.router)
app.include_router(users.router)
app.include_router(admin_delete.router)
app.include_router(admin_get.router)
app.include_router(chat_router)
app.include_router(diagnosis_router)


