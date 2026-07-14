export type SummaryType = "soap" | "patient" | "memo";

const PROMPTS: Record<SummaryType, string> = {
  soap: `You are an expert medical scribe and assistant. Review the following doctor-patient consultation transcript and generate a structured SOAP Note in clean Markdown format:

- **Subjective**: Chief complaint, history of present illness, symptoms, patient's description of the issue.
- **Objective**: Vital signs, physical exam findings, lab/imaging results discussed (if mentioned in the transcript. If not mentioned, state "None documented").
- **Assessment**: Clinical impression, working diagnoses, differential diagnoses.
- **Plan**: Prescribed medications, diagnostic tests ordered, referrals, patient education, follow-up timeline.

Format the output clearly with bold headers and bullet points. Use professional medical terminology but keep it strictly based on the transcript details. If information for a section is missing from the transcript, note it as "Not discussed" rather than inventing details.`,

  patient: `You are an empathetic, professional medical assistant. Review the following consultation transcript and generate a patient-friendly summary and instruction sheet in clean Markdown format:

- **Diagnosis / Visit Summary**: Explain what was discussed and the main concerns in simple, patient-friendly terms (avoiding complex jargon, or explaining it clearly).
- **Treatments & Medications**: List each medication, dosage, and how/when to take it clearly.
- **Next Steps & Lifestyle Advice**: Diet, exercise, precautions, or home care.
- **Follow-up**: When to see the doctor again and warning signs that require immediate medical attention.

Keep the language clear, warm, and easy to read.`,

  memo: `You are a clinical scribe. Generate a concise, high-level clinical memo of the visit in bullet points. Highlight key symptoms, diagnosis, decisions, and immediate tasks.`
};

export async function generateClinicalSummary(
  transcript: string,
  summaryType: SummaryType,
  apiKey: string
): Promise<string> {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
              text: `${PROMPTS[summaryType]}\n\nTranscript:\n${transcript}`
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
  return content;
}
