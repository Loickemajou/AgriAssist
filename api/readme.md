Backend – What It Does (Simple Version)
=======================================

This folder is the **backend API** for Gemination.  
It is written in **Python** using **FastAPI** and talks to **Google Gemini 3**.

The backend has four main parts:

- **`main.py`** – starts the FastAPI app and includes all routers.
- **`databases/`**
  - `database.py` – sets up SQLAlchemy and the database connection.
  - `model.py` – defines the tables: users, diagnosis, chat, etc.
- **`routers/`**
  - `diagnosis.py` – create, update, delete, and list diagnoses for a user.  
    It also has an endpoint to **transcribe audio** (turn speech into text).
  - `chat.py` – create, update, delete, and list chats linked to a diagnosis.
  - `user_admin/` – user and admin routes to **create users**, **login**, and **check authentication**.
- **`services/`**
  - `audio_image_managment.py` – saves uploaded **audio**, **image**, and **video** files and returns URLs.
  - `language_map.py` – maps language names and codes for translation.
  - `location_service.py` – builds location context (region info) to help Gemini give a better diagnosis.
  - `gemini_service.py` – the “brain” that calls **Gemini 3** for:
    - translation
    - image/video diagnosis (crop, disease, treatment, confidence)
    - using **web search** when confidence is low
    - chat responses based on diagnosis + history + location


How the Backend Works
---------------------

1. **User account**
   - User registers with email, username, password, language, and optional lat/lng.
   - Location (lat/lng) helps build a better agricultural diagnosis for that region.

2. **Create diagnosis**
   - Authenticated user uploads an **image** or **video** (and optional audio).
   - Backend stores the files and calls `analyze_diagnosis` in `gemini_service.py`.
   - Gemini returns:
     - `crop`
     - `disease`
     - `treatment`
     - `confidence` (how sure it is)
   - If confidence is low, Gemini is called again with **web search** to verify.
   - Diagnosis is saved in the database, linked to the user.

3. **Chat about a diagnosis**
   - User selects a diagnosis and sends a message.
   - Backend builds a prompt using:
     - diagnosis info
     - chat history
     - location context
   - It calls Gemini for an answer and applies **confidence rules**:
     - low confidence → say “not sure” and suggest getting more help.
   - If user language is not English, the backend translates both ways.

4. **Audio features (planned / partial)**
   - There is an endpoint to **transcribe audio** (speech to text).  
   - Converting AI text replies **back to audio** is planned but not fully done yet.


Running the Backend (Windows Example)
-------------------------------------

Do all these steps **inside the `api` folder**.

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

2. **Activate the environment**
   - PowerShell:
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - Command Prompt:
     ```bash
     venv\Scripts\activate.bat
     ```

3. **Install packages**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your Gemini API key**
   - Get a key from: https://aistudio.google.com/app/api-keys
   - Create a `.env` file in the `api` folder with:
     ```text
     GEMINI_API_KEY=your_api_key_here
     ```

5. **Start the server**
   ```bash
   uvicorn main:app --reload
   ```

The API will usually be available at `http://localhost:8000`, and docs at `http://localhost:8000/docs`.