export type SummaryType = "soap" | "patient" | "memo" | "encounter";

export interface PatientMetadata {
  name: string;
  age: string;
  gender: string;
  date: string;
}

export const PROMPTS: Record<SummaryType, string> = {
  soap: `You are an expert medical scribe and assistant. Review the following doctor-patient consultation details and transcript, then generate a structured SOAP Note in clean Markdown format:

- **Subjective**: Chief complaint, history of present illness, symptoms, patient's description of the issue.
- **Objective**: Vital signs, physical exam findings, lab/imaging results discussed (if mentioned in the transcript. If not mentioned, state "None documented").
- **Assessment**: Clinical impression, working diagnoses, differential diagnoses.
- **Plan**: Prescribed medications, diagnostic tests ordered, referrals, patient education, follow-up timeline.

Important Instructions:
1. If the consultation contains Bisaya (Cebuano), Tagalog, or Taglish, translate and summarize everything into professional, standard clinical English.
2. Under no circumstances should you invent patient details, clinical findings, or diagnoses that were not stated or heavily implied in the transcript or provided details. If details are missing, state "Not discussed".`,

  patient: `You are an empathetic, professional medical assistant. Review the following consultation details and transcript, then generate a patient-friendly summary and instruction sheet in clean Markdown format:

- **Diagnosis / Visit Summary**: Explain what was discussed and the main concerns in simple, patient-friendly terms (avoiding complex jargon, or explaining it clearly).
- **Treatments & Medications**: List each medication, dosage, and how/when to take it clearly.
- **Next Steps & Lifestyle Advice**: Diet, exercise, precautions, or home care.
- **Follow-up**: When to see the doctor again and warning signs that require immediate medical attention.

Important Instructions:
1. If the consultation contains Bisaya (Cebuano), Tagalog, or Taglish, write the final summary in clear, easy-to-understand English.
2. Keep the language clear, warm, and easy for a layperson to read.`,

  memo: `You are a clinical scribe. Generate a concise, high-level clinical memo of the visit in bullet points. Highlight key symptoms, diagnosis, decisions, and immediate tasks. Translate any Bisaya/Tagalog terms to English.`,

  encounter: `You are an expert medical scribe and health informatics specialist. Review the following consultation details and transcript, and generate a highly structured, HL7 FHIR-aligned Patient Encounter summary in Markdown.

Format the output strictly into the following sections using Markdown tables and formatting for readability:

### 1. Consultation & Encounter Metadata
A table containing:
- **Encounter Status**: "finished" (FHIR EncounterStatus code)
- **Encounter Class**: "AMB" (ambulatory) (HL7 ActEncounterCode)
- **Consultation Date**: Use the provided date of visit in ISO 8601 format (e.g. YYYY-MM-DD)
- **Provider**: Dr. Maria Santos, MD (or the clinician mentioned in the transcript)
- **Reason for Visit / Chief Complaint**: Clear explanation of patient's reason for visit

### 2. Patient's Vital Signs
A table containing:
- **Parameter**: Temperature, Blood Pressure, Heart Rate, Respiratory Rate, Oxygen Saturation
- **Value**: The vital signs extracted from the transcript. If a vital sign is not mentioned, write "Not documented".
- **LOINC Code**: Use the standard LOINC codes (Temperature: 8310-5, BP: 85354-9, Heart Rate: 8867-4, RR: 9279-1, SpO2: 2708-6)
- **Clinical Interpretation**: Brief clinical note (e.g., normal, elevated, tachypnea, mild hypoxemia)

### 3. SOAP Notes
Use the following strict formatting rules:
- Start every bullet point under the Subjective, Objective, Assessment, and Plan subsections with either "(+)" to indicate positive findings/presence, or "(-)" to indicate negative findings/absence of signs/symptoms/actions.
- Write each section as a bulleted list.
- Keep observations clear, concise, and clinically relevant.

### 4. Diagnoses (HL7 FHIR Standard)
A table containing:
- **Diagnosis (ICD-10-CM)**: Name of diagnosis and corresponding ICD-10 code if known
- **Rank**: Primary, Secondary, or Tertiary (Rank 1, 2, 3)
- **Clinical Status**: FHIR clinical status code (e.g., active, recurrence, remission)
- **Verification Status**: FHIR verification status code (e.g., confirmed, unconfirmed, differential)
- **Diagnosis Note**: Additional clinical context if applicable

### 5. Prescriptions (RxNorm Standard)
A table containing:
- **RxNorm Standard Code / Name**: The standard RxNorm ID and name (e.g., "308422 - Amoxicillin 875 MG / Clavulanate Potassium 125 MG Oral Tablet")
- **Generic Name**: Generic name of active ingredients
- **Brand Name**: Brand name of the medication (Optional - state "N/A" if unknown)
- **Dosage Strength**: Strength of active ingredient (e.g. 500mg)
- **Dosage Form**: Form (e.g. Oral Tablet, Oral Suspension, Inhalation Aerosol)
- **Quantity**: Numeric quantity (e.g. 14 tablets)
- **Sig (Instructions)**: Clear administration instructions (e.g. Take 1 tablet by mouth every 12 hours for 7 days)
- **Uses**: Primary clinical indication for this prescription
- **Side Effects**: Common or important side effects (Optional)
*Note: If no prescriptions were discussed or planned, state "None prescribed" instead of a table.*

### 6. Procedure Requests (CPT & HL7 FHIR Standard)
A table containing:
- **CPT Code / Description**: Standard CPT code and description (Only for surgical procedures, either minor or major, discussed or planned)
- **Body Site**: Anatomical body site
- **Laterality**: Left, Right, Bilateral, or Unilateral
- **Request Status**: FHIR RequestStatus code (e.g. active, suspended, completed)
- **Note**: Detail of the surgery or planned procedure.
*Note: If no surgery/procedure was discussed or planned, state "None requested" instead of a table.*

### 7. Laboratory & Imaging Requests (LOINC Standard)
A table containing:
- **LOINC Code / Description**: Standard LOINC code and description
- **Indication**: Reason for request (distinguishing if laboratory test, imaging/radiology, etc.)
- **Request Status**: FHIR RequestStatus code (e.g. active, completed)
- **Instructions**: Specific patient instructions (e.g. fast for 12 hours)
*Note: If no laboratory or imaging requests were discussed, state "None requested" instead of a table.*

Important Instructions:
1. Translate any Tagalog, Bisaya, or Taglish terms from the transcript into standard medical English.
2. Under no circumstances invent clinical values. If a vital sign, diagnosis detail, procedure, or lab test is not mentioned or implied, write "Not documented" or "None requested" where appropriate. Do not make up mock numbers if not mentioned in the transcript.`
};

export async function generateClinicalSummary(
  transcript: string,
  summaryType: SummaryType,
  apiKey: string,
  patientDetails?: PatientMetadata
): Promise<string> {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Construct a neat patient metadata header
  let patientHeader = "";
  if (patientDetails) {
    const { name, age, gender, date } = patientDetails;
    const details = [];
    if (name) details.push(`**Patient Name**: ${name}`);
    if (age) details.push(`**Age/DOB**: ${age}`);
    if (gender) details.push(`**Gender**: ${gender}`);
    if (date) details.push(`**Date of Visit**: ${date}`);
    
    if (details.length > 0) {
      patientHeader = `### Patient & Visit Details\n${details.join(" | ")}\n\n---\n\n`;
    }
  }

  const prompt = `${PROMPTS[summaryType]}\n\n${patientDetails ? `Patient Context:\n- Name: ${patientDetails.name || "N/A"}\n- Age: ${patientDetails.age || "N/A"}\n- Gender: ${patientDetails.gender || "N/A"}\n- Date: ${patientDetails.date || "N/A"}\n\n` : ""}Transcript:\n${transcript}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("No summary returned from Gemini API.");
  }

  // Prepend the formatted patient header to the AI response
  return patientHeader + content;
}
