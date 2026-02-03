# Audio Implementation Checklist

This document outlines what's needed to fully implement the audio-to-chat flow with clear implementation steps.

---

## Current Status: What Works vs. What's Missing

### ✅ What's Already Built

| Component | Status | File |
|-----------|--------|------|
| Frontend: Microphone button in chat | ✅ Implemented | `web/components/ChatInterface.tsx` |
| Frontend: Audio recording with MediaRecorder | ✅ Implemented | `web/components/ChatInterface.tsx` |
| Frontend: Send message to chat API | ✅ Implemented | `web/lib/api.ts` |
| Backend: Chat endpoint receives message | ✅ Implemented | `api/routers/chat.py` |
| Backend: Save chat to database | ✅ Implemented | `api/routers/chat.py` |

### ❌ What's Missing

| Component | Status | File | Priority |
|-----------|--------|------|----------|
| Backend: `/transcribeAudio` endpoint | ❌ Missing | `api/routers/diagnosis.py` | HIGH |
| Gemini transcription function | ❌ Placeholder | `api/services/gemini_service.py` | HIGH |
| Text-to-speech function | ❌ Placeholder | `api/services/gemini_service.py` | HIGH |
| Audio upload/storage function | ❌ Placeholder | `api/services/audio_managment.py` | HIGH |
| Frontend API client: `transcribeAudio` method | ❌ Missing | `web/lib/api.ts` | HIGH |

---

## Implementation Steps

### STEP 1: Add `transcribeAudio` Endpoint to Backend

**File:** `api/routers/diagnosis.py`

```python
from fastapi import UploadFile, File
from services.gemini_service import transcribe_audio

@router.post('/transcribeAudio')
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    Receive audio file from frontend and transcribe to text
    
    Request:
    - file: audio file (wav, mp3, etc.)
    
    Response:
    {
        "text": "transcribed text from audio",
        "confidence": 0.95
    }
    """
    # Read uploaded audio file
    audio_bytes = await file.read()
    
    # Call Gemini API to transcribe
    transcribed_text = transcribe_audio(audio_bytes)
    
    return {
        "text": transcribed_text,
        "confidence": 0.95  # TODO: Get actual confidence from Gemini
    }
```

---

### STEP 2: Implement `transcribe_audio()` in Gemini Service

**File:** `api/services/gemini_service.py`

```python
import google.generativeai as genai
from typing import Optional

def transcribe_audio(audio_bytes: bytes, language: Optional[str] = None) -> str:
    """
    Convert audio bytes to text using Gemini API
    
    Args:
        audio_bytes: Raw audio data
        language: Optional language hint (e.g., "Twi", "Pidgin")
    
    Returns:
        Transcribed text
    """
    try:
        # Convert audio bytes to file for Gemini API
        import tempfile
        import os
        
        # Create temporary file to store audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        try:
            # Upload to Gemini
            audio_file = genai.upload_file(tmp_path)
            
            # Build prompt with language hint if provided
            prompt = "Transcribe this audio to text. "
            if language:
                prompt += f"The audio is in {language}. "
            prompt += "Provide only the transcribed text, nothing else."
            
            # Call Gemini with audio
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content([audio_file, prompt])
            
            transcribed_text = response.text.strip()
            
            # Clean up uploaded file
            genai.delete_file(audio_file.name)
            
            return transcribed_text
            
        finally:
            # Clean up temporary file
            os.remove(tmp_path)
    
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return ""  # Return empty string on error
```

---

### STEP 3: Implement `text_to_speech()` in Gemini Service

**File:** `api/services/gemini_service.py`

```python
from google.cloud import texttospeech

def text_to_speech(text: str, language: str) -> bytes:
    """
    Convert text to speech audio using Google Cloud TTS
    
    Args:
        text: Text to convert to speech
        language: Language code (e.g., "en-US", "fr-FR", "tw" for Twi)
    
    Returns:
        Audio bytes (MP3 format)
    """
    try:
        # Initialize TTS client
        client = texttospeech.TextToSpeechClient()
        
        # Map our language codes to Google Cloud language codes
        language_mapping = {
            "English": "en-US",
            "French": "fr-FR",
            "Spanish": "es-ES",
            "Swahili": "sw-KE",
            "Yoruba": "yo-NG",
            "Twi": "tw-GH",
            "Pidgin": "en-NG",  # Nigerian Pidgin uses English code
            "Amharic": "am-ET",
            "Zulu": "zu-ZA",
            "Hausa": "ha-NG",
            "Igbo": "ig-NG",
            "Kinyarwanda": "rw-RW",
            "Akan": "ak-GH",
        }
        
        # Get language code
        lang_code = language_mapping.get(language, "en-US")
        
        # Create synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Configure voice parameters
        voice = texttospeech.VoiceSelectionParams(
            language_code=lang_code,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        
        # Configure audio output
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        # Call TTS API
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Return audio bytes
        return response.audio_content
        
    except Exception as e:
        print(f"TTS error: {str(e)}")
        return b""  # Return empty bytes on error
```

**NOTE:** This requires Google Cloud credentials. Add to your `.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-cloud-key.json
```

---

### STEP 4: Implement `upload_audio()` in Audio Management Service

**File:** `api/services/audio_managment.py`

```python
import os
from datetime import datetime
import uuid

def upload_audio(audio_bytes: bytes) -> str:
    """
    Save audio bytes to static storage and return accessible URL
    
    Args:
        audio_bytes: Audio file bytes
    
    Returns:
        URL path to access the audio file
    """
    try:
        # Create static_audio directory if it doesn't exist
        audio_dir = "static_audio"
        os.makedirs(audio_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"audio_{timestamp}_{unique_id}.mp3"
        
        # Full path to save file
        filepath = os.path.join(audio_dir, filename)
        
        # Write audio bytes to file
        with open(filepath, 'wb') as f:
            f.write(audio_bytes)
        
        # Return URL path (relative to static files serving)
        # NOTE: Make sure your backend serves static_audio/ directory
        audio_url = f"/static_audio/{filename}"
        
        return audio_url
        
    except Exception as e:
        print(f"Audio upload error: {str(e)}")
        return ""  # Return empty string on error
```

**Backend Setup:** Make sure your `main.py` serves static files:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/static_audio", StaticFiles(directory="static_audio"), name="static_audio")
```

---

### STEP 5: Add `transcribeAudio` to Frontend API Client

**File:** `web/lib/api.ts`

```typescript
// Add this to diagnosisAPI object

export const diagnosisAPI = {
  // ... existing methods ...
  
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData()
    formData.append('file', audioFile)
    
    return axios.post(`${API_URL}/diagnose/transcribeAudio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
```

---

## Testing the Complete Flow

### Manual Test Steps:

1. **Start Backend:**
   ```bash
   cd api
   python -m uvicorn main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd web
   npm run dev
   ```

3. **Test Audio Chat Flow:**
   - Navigate to a diagnosis
   - Click the microphone button in chat
   - Speak clearly (e.g., "This is a test")
   - Wait for transcription to appear in input
   - Click Send
   - Watch for AI response
   - Verify audio playback

4. **Check Database:**
   ```sql
   -- Verify audio_url_input is populated
   SELECT id, user_message, response, audio_url_input, created_at 
   FROM chat 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

---

## Environment Variables Needed

### `.env` (Backend)

```
# Google Cloud API
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=your-project-id

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Optional: Audio storage
AUDIO_STORAGE_PATH=./static_audio
```

### `.env.local` (Frontend)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Dependency Installation

### Backend (Python)

```bash
pip install google-cloud-texttospeech
pip install google-generativeai
```

### Frontend (Already included)

No new dependencies needed for frontend.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to transcribe audio" | Check Gemini API key and internet connection |
| "Audio file not found" | Verify `static_audio` directory exists and has write permissions |
| "TTS error" | Verify Google Cloud credentials and Text-to-Speech API is enabled |
| Audio not playing | Check backend is serving `/static_audio` route correctly |
| Empty `audio_url_input` | Check if `upload_audio()` returned a valid URL |

---

## Architecture Summary

```
User speaks into microphone
        ↓
Frontend records audio blob (MediaRecorder)
        ↓
Sends blob to POST /transcribeAudio
        ↓
Backend receives audio_bytes
        ↓
Calls Gemini transcribe_audio(audio_bytes)
        ↓
Gemini returns transcribed text
        ↓
Frontend receives text, puts in input field
        ↓
User submits message (or auto-submit)
        ↓
POST /chat/{diagnosis_id} with {message: "transcribed text"}
        ↓
Backend:
  1. Sends text to Gemini AI
  2. Gets AI response text
  3. Converts response to speech with TTS
  4. Uploads audio to static_audio/
  5. Gets audio_url back
  6. Saves Chat record with audio_url_input = audio_url
        ↓
Frontend receives response with audio_url
        ↓
Plays audio response to user
```

---

## Next Steps

1. Implement Step 1-5 above in order
2. Test each step individually
3. Use the troubleshooting guide if issues arise
4. Once working, consider:
   - Adding audio confidence score display
   - Caching transcriptions for identical audio
   - Adding audio file cleanup (old files retention policy)
   - Adding metrics/logging for transcription success rate

