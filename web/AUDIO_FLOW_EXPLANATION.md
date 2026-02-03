# Audio Flow Explanation: Microphone to Chat API

## The Problem You're Asking About

You're confused about **how audio recorded in the browser gets to the `audio_url_input` field in the chat API**. Here's the complete end-to-end flow:

---

## Current Implementation Flow

### 1. **Frontend: Record Audio from Microphone** (ChatInterface.tsx)
```typescript
// User clicks the microphone button
const startRecording = async () => {
  // Request browser microphone access
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  
  // Create MediaRecorder instance
  const mediaRecorder = new MediaRecorder(stream)
  audioChunksRef.current = [] // Store audio chunks
  
  // Collect audio data chunks
  mediaRecorder.ondataavailable = (event) => {
    audioChunksRef.current.push(event.data)
  }
  
  // When recording stops, process the audio
  mediaRecorder.onstop = async () => {
    // Combine all chunks into a single Blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
    
    // Convert Blob to File object
    const audioFile = new File([audioBlob], 'audio.wav')
    
    // STEP 1: Send audio to backend for transcription
    const response = await diagnosisAPI.transcribeAudio(audioFile)
    
    // STEP 2: Get transcribed TEXT back
    const transcribedText = response.data.text
    
    // STEP 3: Put transcribed text in the input field
    setInput(transcribedText)
  }
  
  mediaRecorder.start()
}
```

### 2. **Key Insight: Transcription Happens FIRST**

**The audio is NOT directly sent to the chat API.** Instead:

1. **Audio blob** is sent to `/transcribeAudio` endpoint
2. Backend uses Gemini API to transcribe audio → returns **TEXT**
3. Frontend puts transcribed text into the message input
4. User submits the message

### 3. **Frontend: Send Chat Message** (ChatInterface.tsx)

```typescript
const handleSendMessage = async () => {
  // By this point, input contains transcribed text
  const userMessage = {
    id: Date.now().toString(),
    text: input,  // ← This is the transcribed TEXT from microphone
    sender: 'user',
    timestamp: new Date(),
  }
  
  setMessages((prev) => [...prev, userMessage])
  
  // SEND TO CHAT API
  const response = await chatAPI.sendMessage(diagnosisId, input)
}
```

**What gets sent to the chat API:**
```json
{
  "message": "The transcribed text from microphone",
  "user_language": "en",
  "language_from": "en",
  "language_to": "en"
}
```

### 4. **Backend: Process Chat Message** (chat.py)

```python
@router.post('/chat/{diagnosi_id}')
async def create_chat(user, db, chat_request: ChatRequest, diagnosis_id: int):
    # chat_request.message = transcribed text from frontend
    
    if chat_request.audio:
        # This checks if AUDIO was sent directly (it's not in current flow)
        user_text = transcribe_audio(chat_request.audio)
    else:
        # We use the already-transcribed message
        user_text = chat_request.message  # ← "The transcribed text..."
    
    # Translate to English
    translated_input = translate_text(user_text, user.language, "English")
    
    # Build prompt for Gemini
    prompt = build_prompt(diagnosis_model, chat_history, translated_input)
    
    # Get AI response
    gemini_result = gemini_chat(prompt)
    output_text = translate_text(gemini_result["text"], "English", user.language)
    
    # Convert response to speech
    audio_bytes = text_to_speech(output_text, user.language)  # ← AI response as audio
    audio_url = upload_audio(audio_bytes)  # ← Upload audio bytes to storage
    
    # Save to database
    chat = Chat(
        user_id=user["id"],
        diagnosis_id=diagnosis_id,
        user_message=user_text,          # ← Transcribed input text
        response=output_text,             # ← AI response text
        audio_url_input=audio_url,        # ← URL to AI's VOICE response
        message=chat_request.message,
        created_at=datetime.now()
    )
    
    db.add(chat)
    db.commit()
```

---

## The Key Confusion Clarified

### What is `audio_url_input`?

**It's NOT the audio the user spoke.**

It's the **AI's voice response URL** after:
1. Backend transcribed user's audio to text ✓
2. Backend sent text to Gemini AI ✓
3. Backend got AI's text response ✓
4. Backend converted AI's response to speech using TTS ✓
5. Backend uploaded that speech audio to storage ✓
6. Stored that URL in `audio_url_input` field

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (ChatInterface.tsx)                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  User speaks into microphone                             │
│        ↓                                                  │
│  MediaRecorder captures audio blob                       │
│        ↓                                                  │
│  Send blob to /transcribeAudio endpoint                  │
│        ↓                                                  │
│  Receive transcribed TEXT back                           │
│        ↓                                                  │
│  Put text in input field                                 │
│        ↓                                                  │
│  User clicks Send (or auto-submit)                       │
│        ↓                                                  │
│  Send {message: "transcribed text"} to /chat endpoint    │
│                                                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ BACKEND (chat.py)                                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Receive chat_request.message = "transcribed text"       │
│        ↓                                                  │
│  Translate to English                                    │
│        ↓                                                  │
│  Send to Gemini AI                                       │
│        ↓                                                  │
│  Get AI response text                                    │
│        ↓                                                  │
│  Convert AI response to speech (TTS)                     │
│        ↓                                                  │
│  Upload audio bytes to storage                           │
│        ↓                                                  │
│  Get audio_url back                                      │
│        ↓                                                  │
│  Save Chat record with:                                  │
│    - user_message = "transcribed text"                   │
│    - response = "AI response text"                       │
│    - audio_url_input = "https://storage/audio.wav" ✓     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## What's Currently Missing (Needed for Full Implementation)

### 1. **Backend Transcription Endpoint**

Currently missing: `POST /transcribeAudio`

```python
@router.post('/transcribeAudio')
async def transcribe_audio(file: UploadFile = File(...)):
    # Read audio file
    audio_bytes = await file.read()
    
    # Send to Gemini API for transcription
    transcribed_text = transcribe_audio(audio_bytes)
    
    return {
        "text": transcribed_text,
        "confidence": 0.95
    }
```

### 2. **Implement these placeholder functions** in `gemini_service.py`:

```python
def transcribe_audio(audio_bytes: bytes) -> str:
    """Convert audio to text using Gemini"""
    # TODO: Implement with actual Gemini API call
    return "transcribed text here"

def text_to_speech(text: str, language: str) -> bytes:
    """Convert text to speech"""
    # TODO: Implement with actual TTS API (Google Cloud TTS)
    return b"audio bytes"

def upload_audio(audio_bytes: bytes) -> str:
    """Upload audio to storage and return URL"""
    # TODO: Implement - save to static_audio/ and return URL
    return "http://localhost:8000/audio/audio_123.wav"
```

### 3. **Frontend API Client** needs `transcribeAudio` method

Currently missing in `web/lib/api.ts`:

```typescript
const diagnosisAPI = {
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData()
    formData.append('file', audioFile)
    return axios.post('/diagnose/transcribeAudio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

---

## Summary

**Audio path to chat API:**

1. User speaks → Microphone captures audio blob
2. Frontend sends blob to `/transcribeAudio` endpoint
3. Backend transcribes audio to text via Gemini
4. Frontend receives text, displays in input field
5. User submits (or auto-submit) the text message
6. Backend processes text, gets AI response
7. Backend converts AI response to speech via TTS
8. Backend uploads speech audio to storage
9. Backend stores URL in `audio_url_input` field
10. Frontend displays AI's audio response to user

**The user's spoken audio NEVER directly goes into `audio_url_input`.** Only the AI's generated speech response does.

