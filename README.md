# SugboDoc Clinical Transcription & Summarization System

SugboDoc is a secure, browser-based medical transcription and offline AI summarization application designed for outpatient clinics, physicians, and administrative staff. It converts spoken medical consultations into structured clinical documentation conforming to international healthcare standards.

Developed by **Orlando Fornolles Jr.** — Software Developer Intern at **SugboDoc Technologies Inc.** & 3rd-Year BS Information Technology Student at **Southwestern University PHINMA**, built with **Google Antigravity AI**.

---

## Task Update & Changelog

### July 23, 2026 — Enterprise Refinements & Language Model Optimization

- **Company Entity Alignment**: Updated official company ownership references to **SugboDoc Technologies Inc.** across the documentation and system footers.
- **Audio Capture & Speech Stability**: Enhanced real-time transcript streaming and audio input handling for multi-language speech recognition (`en-US`, `fil-PH`, `ceb-PH`).
- **Medical Standard Prompt Templates**: Optimized prompt structures for offline `Llama-3.2-1B-Instruct` AI summarization to output clean ICD-10 diagnostic codes, RxNorm medication orders, CPT procedures, and FHIR encounter schema.

---

## Operating Modes

The system supports two primary modes of operation to accommodate clinical workflows:

### 1. Live Doctor-Patient Consultation
* **Description**: Record active two-way dialogue between the healthcare provider and the patient during an office visit.
* **Best Practices**: Position the microphone between the provider and patient. Ensure symptoms, physical exam findings, diagnoses, and treatment plans are spoken clearly.

### 2. Physician Dictation
* **Description**: Dictate a single-person verbal summary of the consultation after the patient visit.
* **Best Practices**: State patient demographics, chief complaints, vital signs, physical exam results, ICD-10 diagnoses, and RxNorm medication orders in sequence.

---

## Standard Workflow

### Step 1: Input Patient Metadata
Enter the patient's name, age or birthdate (auto-calculated), gender, and consultation date in the **Patient & Visit Details** card.

### Step 2: Select Transcription Language
Choose the appropriate spoken language for speech recognition:
* **English** (`en-US`)
* **Tagalog** (`fil-PH`)
* **Bisaya / Cebuano** (`ceb-PH`)

### Step 3: Record Consultation
* Click the **Record** button or press `Alt + R` to start recording.
* Speak clearly into the microphone. A real-time transcript will appear on screen.
* Click **Stop** when the consultation or dictation is complete.

### Step 4: Generate Clinical Summary
Select the desired document format from the dropdown menu and click **Generate AI Summary**:
* **FHIR Patient Encounter**: Comprehensive report with tabulated ICD-10, RxNorm, CPT, and LOINC data.
* **SOAP Note**: Standardized Subjective, Objective, Assessment, and Plan documentation.
* **Patient Instructions**: Patient-friendly self-care and medication intake schedule.
* **Clinical Memo**: Executive physician referral and handover summary.

### Step 5: Review and Save
* Use the **Edit** button to make manual corrections to the generated text if necessary.
* Click **Save to History** to archive the encounter locally in browser storage.
* Click **Download** to save `.md` markdown summaries or `.txt` raw transcripts.

---

## System Requirements and Offline AI

### System Requirements
* **Browser**: Google Chrome (version 113 or higher) or Microsoft Edge (version 113 or higher).
* **Hardware Acceleration**: Must be enabled in browser settings to support WebGPU.
* **Microphone Access**: Browser permission must be set to `Allow`.

### First-Time Setup & Model Caching
* The system utilizes local offline AI (`Llama-3.2-1B-Instruct`) running directly inside the browser via WebGPU.
* On the first run, the system requires an active internet connection to download approximately 1.2 GB of model weights.
* Once downloaded, model weights are cached locally in browser Cache Storage for offline execution.

---

## Medical Standards Compliance

The generated summaries align with international health informatics standards:
* **HL7 FHIR**: Encounter metadata, status codes, and clinical structure.
* **ICD-10-CM**: Tabulated diagnostic codes with rank, clinical status, and verification status.
* **RxNorm**: Medication orders including generic name, brand name, dosage strength, form, quantity, and instructions.
* **CPT**: Procedure requests with body site, laterality, and classification.
* **LOINC**: Laboratory and radiology order codes.

---

## Technology Stack & Development Tools

- **Core Framework**: React 19, TypeScript 5, Vite 6
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **AI Engine**: WebLLM / WebGPU Local Client AI
- **AI Pair Programmer & Coding Assistant**: Google Antigravity AI

---

## Local Development & Setup

```bash
# Clone the repository and navigate to project directory
git clone https://github.com/orlandosugbodoc-source/sugbodocsample.git
cd sugbodocsample

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## License & Ownership

Copyright © 2026 **SugboDoc Technologies Inc.**. All Rights Reserved.
