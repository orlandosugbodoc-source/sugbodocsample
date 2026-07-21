import { useState } from "react";
import { X, FileText } from "lucide-react";
import { MarkdownRenderer } from "./ui/MarkdownRenderer";

interface SampleSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "encounter" | "soap" | "patient" | "memo";

const SAMPLES: Record<TabType, string> = {
  encounter: `### Patient & Visit Details
**Patient Name**: Juan Dela Cruz | **Age/DOB**: 42 yrs (1984-03-15) | **Gender**: Male | **Date of Visit**: 2026-07-21

---

## 1. Consultation & Encounter Metadata

| Parameter | Value | Standard / Schema Reference |
| :--- | :--- | :--- |
| **Encounter ID** | \`enc-98217-abc\` | HL7 FHIR Resource ID |
| **Encounter Status** | \`finished\` | HL7 FHIR EncounterStatus code |
| **Encounter Class** | \`AMB\` (ambulatory) | HL7 ActEncounterCode |
| **Provider** | Dr. Maria Santos, MD | Provider National Registry |
| **Reason for Visit / CC** | Shortness of breath, chest tightness, and productive cough for 3 days. | Patient Reported Free Text |

---

## 2. Patient's Vital Signs

| Vital Sign | Measured Value | LOINC Code | Clinical Interpretation |
| :--- | :--- | :--- | :--- |
| **Temperature** | 38.2 °C (100.8 °F) | \`8310-5\` | Elevated (Fever) |
| **Blood Pressure** | 132/84 mmHg | \`85354-9\` | Stage 1 Hypertension |
| **Heart Rate** | 92 bpm | \`8867-4\` | Normal (Borderline Tachycardia) |
| **Respiratory Rate** | 22 breaths/min | \`9279-1\` | Tachypnea (Elevated) |
| **Oxygen Saturation (SpO2)** | 94% on room air | \`2708-6\` | Mild Hypoxemia |

---

## 3. SOAP Notes

### Subjective
* (+) Productive cough with thick, yellowish sputum
* (+) Mild shortness of breath upon moderate exertion (climbing stairs)
* (+) Left-sided chest tightness on deep inspiration (pleuritic)
* (-) Hemoptysis (no coughing of blood)
* (-) Chills or night sweats
* (-) Previous history of asthma or COPD

### Objective
* (+) Dullness to percussion noted on left lower lung base
* (+) Decreased vesicular breath sounds in left lower lung field
* (+) Late inspiratory crackles (rales) heard over left lower lobe
* (-) Wheezing, rhonchi, or stridor on auscultation
* (-) Cyanosis of lips or peripheral extremities

### Assessment
* (+) Clinical presentation highly suggestive of community-acquired pneumonia (CAP), left lower lobe
* (+) Mild hypoxemia and tachypnea, stable for outpatient management
* (-) Evidence of systemic sepsis or respiratory failure (CURB-65 = 0)

### Plan
* (+) Initiate outpatient course of oral antibiotics and rescue bronchodilator therapy
* (+) Order diagnostic workup including chest X-ray and sputum tests
* (+) Counsel patient on red flag symptoms (severe dyspnea, confusion) and hydration
* (-) Need for immediate hospitalization or oxygen therapy at this stage

---

## 4. Diagnoses (HL7 FHIR Standard)

| Diagnosis (ICD-10-CM) | Rank | Clinical Status | Verification Status | Diagnosis Note |
| :--- | :--- | :--- | :--- | :--- |
| **\`J18.9\`** - Pneumonia, unspecified organism | Primary (Rank 1) | \`active\` | \`confirmed\` | Localized to left lower lobe based on physical exam. |
| **\`R06.02\`** - Shortness of breath | Secondary (Rank 2) | \`active\` | \`confirmed\` | Exertional dyspnea. |
| **\`R07.1\`** - Chest pain on breathing | Tertiary (Rank 3) | \`active\` | \`confirmed\` | Pleuritic left-sided chest pain. |

---

## 5. Prescriptions (RxNorm Standard)

| RxNorm ID / Name | Generic Name | Brand Name | Dosage Strength | Dosage Form | Quantity | Sig (Instructions) | Uses | Side Effects |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **\`308422\`**<br>Amoxicillin 875 MG / Clavulanate Potassium 125 MG | Amoxicillin / Clavulanate | Augmentin | 875 mg / 125 mg | Oral Tablet | 14 tabs | Take 1 tablet by mouth every 12 hours for 7 days. Complete full course. | Antibiotic for lower respiratory tract infection | Diarrhea, nausea, abdominal discomfort |
| **\`313002\`**<br>Salbutamol 0.09 MG/ACTUAl Inhalation Aerosol | Albuterol (Salbutamol) | ProAir HFA | 90 mcg per puff | Inhalation Aerosol | 1 inhaler | Inhale 2 puffs every 4 to 6 hours as needed for shortness of breath. | Bronchodilator for airway constriction relief | Tremors, palpitations, headache |

---

## 6. Procedure Requests (CPT Standard)

| CPT Code / Description | Body Site | Laterality | Request Status | Surgery Class | Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **\`31622\`**<br>Bronchoscopy, diagnostic | Bronchus | Bilateral | \`suspended\` | Major / Invasive | Perform only if patient fails to respond to oral antibiotics or shows deterioration. |

---

## 7. Laboratory & Imaging Requests (LOINC Standard)

| LOINC Code / Description | Indication | Category | Request Status | Instructions |
| :--- | :--- | :--- | :--- | :--- |
| **\`28562-7\`**<br>DX Chest AP + Lateral (X-ray) | Evaluate pulmonary consolidation | Imaging / Radiology | \`active\` | Perform standard PA and lateral views. Check for lobar pneumonia. |
| **\`9318-7\`**<br>Sputum Gram Stain & Culture | Identify causative bacterial pathogen | Laboratory | \`active\` | Collect deep-cough sputum specimen in sterile container in the morning. |`,

  soap: `### Patient & Visit Details
**Patient Name**: Juan Dela Cruz | **Age/DOB**: 42 yrs | **Gender**: Male | **Date of Visit**: 2026-07-21

---

### Subjective
* (+) 3-day history of productive cough with yellowish sputum
* (+) Exertional shortness of breath when walking or climbing stairs
* (+) Pleuritic chest tightness on deep inspiration
* (-) No fever or chills reported today
* (-) No hemoptysis or night sweats

### Objective
* **Vitals**: BP 132/84 mmHg | HR 92 bpm | Temp 38.2 °C | RR 22/min | SpO2 94% on room air
* (+) Dullness to percussion over left lower lung base
* (+) Decreased breath sounds and late inspiratory crackles over left lower lobe
* (-) No wheezing, rhonchi, or respiratory distress

### Assessment
1. **Community-Acquired Pneumonia (CAP)** - Left lower lobe, mild to moderate severity, stable for outpatient management (ICD-10: \`J18.9\`).
2. **Exertional Dyspnea** - Secondary to acute pulmonary consolidation (ICD-10: \`R06.02\`).

### Plan
1. **Pharmacotherapy**:
   * Amoxicillin / Clavulanic Acid 875/125 mg PO q12h x 7 days.
   * Salbutamol 90 mcg inhaler 2 puffs q4-6h PRN for shortness of breath.
2. **Diagnostics**:
   * Order Chest X-ray (PA + Lateral view).
   * Order Sputum Gram Stain & Culture.
3. **Follow-up & Safety**:
   * Re-evaluate in 48-72 hours or return immediately if dyspnea worsens or high fever persists.`,

  patient: `### Patient Care Instructions for Juan Dela Cruz

---

### 1. Medication Schedule
* **Augmentin (Amoxicillin/Clavulanate 875/125mg)**:
  * **How to take**: 1 tablet every 12 hours (with meals) for 7 days.
  * **Important**: Take all 14 tablets even if you feel completely better.
* **Salbutamol Inhaler (Rescue Bronchodilator)**:
  * **How to take**: Inhale 2 puffs every 4 to 6 hours as needed when feeling short of breath or chest tightness.

---

### 2. Home Care & Recovery Tips
* **Hydration**: Drink at least 8 to 10 glasses of water daily to help loosen lung mucus.
* **Rest**: Rest adequately and avoid strenuous physical activities for the next week.
* **Fever Management**: You may take Paracetamol 500mg every 6 hours if your fever exceeds 37.8 °C.

---

### 3. When to Seek Immediate Medical Help (Red Flags)
Contact SugboDoc or go to the nearest Emergency Room if you experience any of the following:
* Severe difficulty breathing or gasping for air
* Bluish discoloration of lips or fingernails
* High fever above 39 °C that does not respond to medication
* Confusion, severe dizziness, or chest pain that spreads to your jaw or arm`,

  memo: `### Clinical Referral / Handover Memo

**To**: Pulmonology Specialist / Outpatient Clinic  
**From**: Dr. Maria Santos, MD (SugboDoc Outpatient Care)  
**Date**: July 21, 2026  
**Re**: Consultation Handover for Patient Juan Dela Cruz (42M)

---

### Executive Summary
Patient presented with a 3-day history of productive cough, pleuritic left-sided chest tightness, and exertional dyspnea. Physical examination revealed left lower lobe crackles and dullness to percussion. SpO2 is 94% on room air with low-grade fever (38.2 °C).

### Diagnosis & Current Management
* **Primary Diagnosis**: Acute Community-Acquired Pneumonia (CAP), left lower lobe (\`ICD-10: J18.9\`).
* **Initial Therapy**: Initiated oral Augmentin (875/125mg BD) and Salbutamol inhaler PRN.
* **Pending Orders**: Chest X-Ray (AP/Lat) and Sputum Culture & Sensitivity.

### Plan & Action Required
Outpatient management initiated. If patient fails to show clinical improvement within 48-72 hours or exhibits oxygen desaturation (<92%), formal pulmonology evaluation and chest CT imaging are recommended.`
};

export function SampleSummaryModal({ isOpen, onClose }: SampleSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("encounter");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light/60 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Clinical Summary Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab("encounter")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "encounter"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            FHIR Patient Encounter
          </button>
          <button
            onClick={() => setActiveTab("soap")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "soap"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            SOAP Note
          </button>
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "patient"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Patient Instructions
          </button>
          <button
            onClick={() => setActiveTab("memo")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "memo"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/70"
            }`}
          >
            Clinical Memo
          </button>
        </div>

        {/* Markdown Content Output Area */}
        <div className="p-6 overflow-y-auto flex-grow select-text markdown-content">
          <MarkdownRenderer content={SAMPLES[activeTab]} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
