# 🔗 Frontend-Backend Connection Explained

## Here's Exactly Where They're Connected!

---

## 1️⃣ **The Connection Point: `lib/api.ts`**

**File Location:** `Gemination/web/lib/api.ts`

```typescript
// THIS IS THE CONNECTION! ↓↓↓

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
//    ↑ Gets URL from .env.local
//    ↑ Falls back to localhost:8000 if not set

const apiClient = axios.create({
  baseURL: API_URL,
  //     ↑ Creates HTTP client pointing to backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token automatically to every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Define API functions that call the backend
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
    //   ↑ Calls http://localhost:8000/auth/login

  register: (email: string, password: string, name: string) =>
    apiClient.post('/auth/register', { email, password, name }),
    //   ↑ Calls http://localhost:8000/auth/register
}

export const diagnosisAPI = {
  getDiagnoses: () => apiClient.get('/diagnosis/'),
  //                              ↑ Calls http://localhost:8000/diagnosis/
  
  createDiagnosis: (data: FormData) =>
    apiClient.post('/diagnosis/', data, {
      //   ↑ Calls http://localhost:8000/diagnosis/ (with files)
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const chatAPI = {
  sendMessage: (diagnosisId: number, message: string) =>
    apiClient.post('/chat/private', {
      //   ↑ Calls http://localhost:8000/chat/private
      diagnosis_id: diagnosisId,
      message,
    }),
}
```

---

## 2️⃣ **The Configuration: `.env.local`**

**File Location:** `Gemination/web/.env.local`

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
# ↑ THIS TELLS FRONTEND WHERE BACKEND IS!
```

**How it works:**
- When you run `npm run dev`, Next.js reads this file
- `api.ts` loads this value: `process.env.NEXT_PUBLIC_API_URL`
- All API calls use this URL as the base

---

## 3️⃣ **Using the Connection: Example in Components**

**File Location:** `Gemination/web/components/DiagnosisForm.tsx`

```typescript
import { diagnosisAPI } from '@/lib/api'
//                            ↑ Imports the API client we just explained

export function DiagnosisForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('audio', audio)
    formData.append('lat', location.lat)
    formData.append('lng', location.lng)

    try {
      // THIS MAKES THE CONNECTION! ↓
      const response = await diagnosisAPI.createDiagnosis(formData)
      //                    ↑
      //        Calls: POST http://localhost:8000/diagnosis/
      //        With: image, audio, location data
      //        Backend processes and returns result
      
      toast.success('Diagnosis created!')
    } catch (error) {
      toast.error('Failed to create diagnosis')
    }
  }
}
```

---

## Complete Connection Flow

### Visual Flow:

```
┌─────────────────────────────────────────────────────┐
│ Frontend (http://localhost:3000)                    │
│                                                     │
│  User clicks "Get Diagnosis" button                │
│           ↓                                         │
│  DiagnosisForm.tsx calls:                          │
│    diagnosisAPI.createDiagnosis(formData)          │
│           ↓                                         │
│  lib/api.ts makes HTTP request:                    │
│    POST http://localhost:8000/diagnosis/           │
│           ↓                                         │
│  Sends: { image, audio, location }                │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP Request
                  │ (Network Call)
                  ↓
┌─────────────────────────────────────────────────────┐
│ Backend (http://localhost:8000)                     │
│                                                     │
│  main.py receives POST request                     │
│           ↓                                         │
│  routers/api/diagnosis.py processes it:            │
│    - Saves image to static_image/                  │
│    - Saves audio to static_audio/                  │
│    - Analyzes with Gemini AI                       │
│    - Stores in database                            │
│           ↓                                         │
│  Returns: { id, disease, treatment, ... }          │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP Response
                  │ (JSON data)
                  ↓
┌─────────────────────────────────────────────────────┐
│ Frontend receives response                          │
│           ↓                                         │
│  DiagnosisForm.tsx gets: { id: 123, ... }         │
│           ↓                                         │
│  Shows success toast                               │
│  Redirects to /diagnosis/123                       │
└─────────────────────────────────────────────────────┘
```

---

## All API Calls in Frontend

Here's every place frontend connects to backend:

### **Authentication (`lib/api.ts`)**
```typescript
authAPI.login()          → POST /auth/login
authAPI.register()       → POST /auth/register
```

**Used in:**
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`

---

### **Diagnosis (`lib/api.ts`)**
```typescript
diagnosisAPI.getDiagnoses()      → GET  /diagnosis/
diagnosisAPI.getDiagnosis(id)    → GET  /diagnosis/{id}
diagnosisAPI.createDiagnosis()   → POST /diagnosis/
diagnosisAPI.transcribeAudio()   → POST /diagnosis/transcribe
```

**Used in:**
- `components/DiagnosisForm.tsx` → Create diagnosis
- `app/diagnosis/page.tsx` → List all diagnoses
- `app/diagnosis/[id]/page.tsx` → View diagnosis
- `components/ChatInterface.tsx` → Transcribe audio

---

### **Chat (`lib/api.ts`)**
```typescript
chatAPI.getChats()        → GET  /chat/diagnosis/{id}
chatAPI.sendMessage()     → POST /chat/private
```

**Used in:**
- `components/ChatInterface.tsx` → Send/receive messages

---

## Real Example: Login Flow

### Step 1: User enters email & password
**File:** `app/auth/login/page.tsx`
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const response = await authAPI.login(email, password)
  // ↑ Calls lib/api.ts
}
```

### Step 2: API makes HTTP request
**File:** `lib/api.ts`
```typescript
login: (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password })
  // ↑ POST http://localhost:8000/auth/login
```

### Step 3: Backend receives & processes
**File:** `Gemination/api/routers/user_admin/authentication.py`
```python
@router.post('/auth/login')
async def login(user: UserRequest):
    # Checks password
    # Returns JWT token
```

### Step 4: Frontend stores token
**File:** `app/auth/login/page.tsx`
```typescript
localStorage.setItem('token', response.data.token)
// ↑ Stores token for future requests
```

### Step 5: Token automatically sent to backend
**File:** `lib/api.ts`
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// ↑ Every future request includes: Authorization: Bearer <token>
```

---

## The 3-File Connection

There are only **3 files** involved in the connection:

### 1. **`.env.local`** - Backend URL
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. **`lib/api.ts`** - API Client
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL
const apiClient = axios.create({ baseURL: API_URL })
```

### 3. **Any Component** - Uses the API
```typescript
import { authAPI } from '@/lib/api'
await authAPI.login(email, password)
```

---

## How to Trace Any API Call

### Want to know where diagnosis creation happens?

**1. Find the button in a component:**
```typescript
// components/DiagnosisForm.tsx
<button onClick={handleSubmit}>Get Diagnosis</button>
```

**2. See what API it calls:**
```typescript
const response = await diagnosisAPI.createDiagnosis(formData)
```

**3. Look at the API definition:**
```typescript
// lib/api.ts
createDiagnosis: (data: FormData) =>
  apiClient.post('/diagnosis/', data)
```

**4. Know it goes to:**
```
POST http://localhost:8000/diagnosis/
```

**5. Find the backend endpoint:**
```python
# Gemination/api/routers/api/diagnosis.py
@router.post('/diagnosis/')
async def create_diagnosis(...):
    # This function runs!
```

---

## Testing the Connection

### Test 1: Check Frontend Has Backend URL
```typescript
// Open browser DevTools Console and type:
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should output: http://localhost:8000
```

### Test 2: Check Backend is Running
```
Visit in browser: http://localhost:8000/docs
Should see: Swagger UI with all endpoints
```

### Test 3: Make a Test Call
```typescript
// In browser console:
fetch('http://localhost:8000/diagnosis/', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(d => console.log(d))
// Should return diagnoses
```

---

## Summary

### **Frontend connects to Backend in 3 steps:**

1. **`.env.local` sets the URL:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. **`lib/api.ts` creates HTTP client:**
   ```
   const apiClient = axios.create({ baseURL: API_URL })
   ```

3. **Components import and use it:**
   ```
   import { diagnosisAPI } from '@/lib/api'
   await diagnosisAPI.createDiagnosis(data)
   ```

**That's it!** 🎉

When frontend calls `diagnosisAPI.createDiagnosis()`, it automatically:
- Gets the base URL from `.env.local`
- Makes HTTP request to `http://localhost:8000/diagnosis/`
- Includes JWT token from localStorage
- Backend processes and returns result

---

## All Connection Files at a Glance

| File | Purpose | Connection |
|------|---------|-----------|
| `.env.local` | Backend URL | `NEXT_PUBLIC_API_URL=http://localhost:8000` |
| `lib/api.ts` | API client | Creates axios client with base URL |
| `components/*.tsx` | Uses API | Imports and calls API functions |
| Backend `main.py` | Receives requests | Listens on port 8000 |
| Backend `routers/` | Handles requests | Processes and returns data |

---

**That's the complete connection!** The frontend and backend talk to each other through HTTP requests using the URL you set in `.env.local` 🚀
