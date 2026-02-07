Gemination – Simple Guide
=========================

This project is called **Gemination**.  
It is an agriculture helper app that uses **Google Gemini 3**.

With this app, a farmer can:

- Take a **photo** or **video** of a crop
- (Optionally) record **audio** to describe the problem
- Send it to the app
- Get a **diagnosis**: crop, possible disease, treatment, and a **confidence score**
- Ask follow‑up questions in a **chat**

If the AI is **not very confident**, it can **search the web** to double‑check the answer.  
If you send your **location (lat/lng)**, the app also uses where you are to adjust the diagnosis.

There is:

- a **backend API** in the `api` folder (FastAPI + Gemini 3)
- a **frontend web app** in the `web` folder (Next.js/React)

---

How to Run the Backend (API)
----------------------------

1. **Open a terminal** in the `api` folder
   - Example:  
     Go to the project folder, then:
     - `cd api`

2. **Create and activate a Python virtual environment** (only needed once)
   - On Windows (PowerShell):
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```

3. **Install Python packages**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your Gemini API key**
   - Create a file called `.env` inside the `api` folder.
   - Put your key inside like this:
     ```text
     GEMINI_API_KEY=your_key_here
     ```

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload
   ```
   - The API will usually run at `http://localhost:8000`.
   - You can see the docs at `http://localhost:8000/docs`.

What the Backend Does
---------------------

- **User accounts**: create user, login, get current user (authentication).
- **Diagnosis**:
  - Receive image, audio, and video.
  - Save files in `static_image`, `static_audio`, and `static_video`.
  - Call **Gemini 3** with the media and optional **location**.
  - Get back: `crop`, `disease`, `treatment`, and `confidence`.
  - If confidence is low, call Gemini again with **web search** to verify.
  - Store the diagnosis in the database.
- **Chat**:
  - Let users ask questions about a specific diagnosis.
  - Use Gemini 3 to answer.
  - Use the diagnosis info, chat history, and location context.
  - Follow confidence rules (say “unsure” when confidence is low).
- **Translation**:
  - Translate between the user’s language and English.
  - This is used both for the diagnosis and for chat replies.

---

How to Run the Frontend (Web App)
---------------------------------

1. **Open a second terminal** in the `web` folder
   - From the main project folder:
     ```bash
     cd web
     ```

2. **Install Node packages** (only needed once)
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open the app in the browser**
   - Go to `http://localhost:3000`

What the Frontend Does
----------------------

- **Auth pages**
  - `Register`: create a new user (this calls the backend user API).
  - `Login`: log in the user and store the token.
- **Main agriculture flow**
  - Page to upload **images / video** of crops.
  - Attach **audio** (or use audio that was transcribed).
  - Send **location** (lat/lng) from the browser if allowed.
  - Show the diagnosis result from the backend: crop, disease, treatment, confidence.
- **Chat page**
  - Let the user ask questions about a chosen diagnosis.
  - Show AI answers and confidence flag (high/low).

How Everything Fits Together
----------------------------

- The **web app** talks to the **backend API** using HTTP (usually `localhost:8000`).
- The **backend API** talks to **Gemini 3** using your `GEMINI_API_KEY`.
- The **database** stores:
  - users
  - diagnoses
  - chat history
- Location + media + text all work together to give better crop diagnostics.

If you follow the steps above (backend first, then frontend), you should be able to:

1. Register a user  
2. Log in  
3. Upload crop media and location  
4. See a diagnosis and confidence  
5. Chat with the AI about that diagnosis

