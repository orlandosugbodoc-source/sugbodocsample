# SugboDoc — Clinical Transcription & Offline AI Summarization

Welcome to **SugboDoc**, a secure, browser-based medical transcription and offline AI clinical summarization application designed for outpatient clinics, physicians, and medical staff.

Hi! I'm **Orlando Fornolles Jr.**, a 3rd-Year BSIT Student at Southwestern University PHINMA and a Software Developer Intern at **SugboDoc Technologies Inc.**. I built this application using **React, TypeScript, Tailwind CSS, WebLLM / WebGPU**, and paired with **Google Antigravity AI** to help doctors transcribe patient encounters and generate structured medical documentation directly in their browser.

---

## 🌟 About The Application

Documenting patient consultations manually can be time-consuming for healthcare providers. SugboDoc solves this by offering real-time voice transcription in multiple local Philippine languages (English, Tagalog, Cebuano/Bisaya) and using **local in-browser AI** (`Llama-3.2-1B-Instruct`) via WebGPU to summarize dictations into structured clinical reports offline—ensuring patient data never leaves the local machine.

---

## 🎙️ Operating Modes

SugboDoc supports two primary dictation workflows to fit different clinical settings:

1. **Live Doctor-Patient Consultation**:
   - Records live dialogue between the doctor and patient during an active office visit.
   - Captures symptoms, physical exam notes, diagnoses, and treatment plans in real time.

2. **Physician Dictation**:
   - Allows the physician to dictate a quick post-visit summary after seeing a patient.
   - Transcribes chief complaints, vital signs, ICD-10 diagnoses, and medication orders smoothly.

---

## 🛠️ Step-by-Step Clinical Workflow

1. **Patient & Visit Details**: Enter patient metadata (Name, Age, Gender, Consultation Date).
2. **Language Selection**: Choose spoken language for speech recognition (**English**, **Tagalog**, or **Cebuano / Bisaya**).
3. **Record Encounter**: Click **Record** (`Alt + R`) and speak into the microphone. Transcripts appear live on screen.
4. **Generate AI Summary**: Pick a structured document format and generate:
   - **SOAP Notes**: Standardized Subjective, Objective, Assessment, & Plan notes.
   - **FHIR Patient Encounter**: Detailed healthcare report with tabulated ICD-10, RxNorm, CPT, and LOINC data.
   - **Patient Care Instructions**: Clear, patient-friendly home care and medication guidelines.
   - **Clinical Referral Memo**: Executive physician handover summary.
5. **Review & Export**: Edit generated text manually if needed, save to browser history, or export as `.md` or `.txt` files.

---

## 🔒 Offline Privacy & WebGPU AI Engine

- **100% On-Device AI**: Powered by `Llama-3.2-1B-Instruct` running locally in the browser via WebGPU using WebLLM.
- **First-Time Setup**: On initial launch, the browser downloads the AI model weights (~1.2 GB) once over internet.
- **Offline Caching**: Once cached, all transcription processing and AI summarization run completely offline with zero data sent to external cloud servers.

---

## 📅 Latest Updates & Refinements

### July 23, 2026

- **Corporate Entity Alignment**: Updated official company ownership references to **SugboDoc Technologies Inc.** across the documentation.
- **Humanized Documentation**: Rewrote project overview, feature guides, and workflows in an authentic, developer-friendly voice.
- **Microphone & Speech Stability**: Enhanced real-time transcript streaming and audio capture error handling across Chrome and Edge browsers.
- **Medical Standard Output Formatting**: Refined prompt templates for cleaner ICD-10 diagnosis tables and RxNorm dosage formatting.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript 5, Vite 6
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Local AI Engine**: WebLLM / WebGPU (`Llama-3.2-1B-Instruct`)
- **Speech Recognition**: Web Speech API (`en-US`, `fil-PH`, `ceb-PH`)
- **AI Pair Programmer**: Google Antigravity AI

---

## 💻 Local Setup & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/orlandosugbodoc-source/sugbodocsample.git

# 2. Navigate to project directory
cd sugbodocsample

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Open your browser (`Chrome` or `Edge` with WebGPU enabled) at `http://localhost:5173/`.

---

## 📄 License & Ownership

Copyright © 2026 **SugboDoc Technologies Inc.**. All Rights Reserved.
