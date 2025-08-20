export type PredictedDisease = {
  name: string;
  probability: number;
  severity: 'Low' | 'Medium' | 'High';
  summary?: string;
  redFlags?: string[];
  tests?: string[];
  careAdvice?: string[];
  medications?: string[];
  sources?: { title: string; url: string }[];
};

export type PredictionResult = {
  diseases: PredictedDisease[];
  explanation: string;
  recommendations: string[];
  triage?: 'Self-care' | 'Primary care' | 'Urgent care' | 'Emergency';
  redFlags?: string[];
  suggestedTests?: string[];
  medications?: string[];
  sources?: { title: string; url: string }[];
};

type PredictInput = {
  symptoms: string;
  ageRange: string;
  gender: string;
};

function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(fenced);
  } catch (_) {
    // Try to locate the first and last curly braces span
    const match = fenced.match(/[\{\[][\s\S]*[\}\]]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {
        // fallthrough
      }
    }
  }
  throw new Error('Model did not return valid JSON.');
}

function normalizeSeverity(value: string): PredictedDisease['severity'] {
  const normalized = value?.toLowerCase() || '';
  if (normalized.startsWith('h')) return 'High';
  if (normalized.startsWith('m')) return 'Medium';
  return 'Low';
}

export async function predictDiseaseWithGemini(
  input: PredictInput
): Promise<PredictionResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env.local and restart the dev server.');
  }

  const prompt = `You are a clinical triage assistant.
Return ONLY JSON with this exact TypeScript schema, no prose and no backticks:
{
  "diseases": Array<{
    "name": string;
    "probability": number; // 0-100
    "severity": "Low" | "Medium" | "High";
    "summary"?: string; // brief lay explanation
    "redFlags"?: string[]; // disease-specific red flags
    "tests"?: string[]; // likely initial tests
    "careAdvice"?: string[]; // self-care and when to seek help
    "medications"?: string[]; // include 2-5 medication suggestions (OTC first-line; note when to consult for Rx); use generic names only
    "sources"?: Array<{ "title": string; "url": string }>; // credible citations
  }>;
  "explanation": string;
  "recommendations": string[];
  "triage"?: "Self-care" | "Primary care" | "Urgent care" | "Emergency"; // overall urgency
  "redFlags"?: string[]; // global red flags to watch
  "suggestedTests"?: string[]; // general suggested tests
  "medications"?: string[]; // include 3-7 general medication guidance items (OTC first-line and when Rx may be needed)
  "sources"?: Array<{ "title": string; "url": string }>; // global citations
}

Rules:
- probabilities are 0-100 integers that sum to <= 100.
- include 3-5 most likely diseases.
- severity reflects clinical urgency of each disease.
- provide actionable, safe advice.
- cite trustworthy sources when possible.
- For EACH predicted disease, provide 2-5 "medications" items with generic names only (no brand names). Prefer OTC first; when mentioning Rx, advise consulting a clinician. No dosing.
- Also provide a global "medications" list (3-7 items) summarizing cross-disease guidance.

Patient:
- symptoms: ${input.symptoms}
- age range: ${input.ageRange}
- gender: ${input.gender}`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
      encodeURIComponent(apiKey),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text:
                'You must respond with ONLY valid JSON matching the provided schema. Do not include explanations or markdown fences. Use double quotes and valid numbers. Do not include trailing commas.'
            }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          response_mime_type: 'application/json',
          response_schema: {
            type: 'object',
            properties: {
              diseases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    probability: { type: 'integer' },
                    severity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                    summary: { type: 'string' },
                    redFlags: { type: 'array', items: { type: 'string' } },
                    tests: { type: 'array', items: { type: 'string' } },
                    careAdvice: { type: 'array', items: { type: 'string' } },
                    medications: { type: 'array', items: { type: 'string' } },
                    sources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          url: { type: 'string' },
                        },
                        required: ['title', 'url'],
                      },
                    },
                  },
                  required: ['name', 'probability', 'severity'],
                },
              },
              explanation: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } },
              triage: { type: 'string' },
              redFlags: { type: 'array', items: { type: 'string' } },
              suggestedTests: { type: 'array', items: { type: 'string' } },
              medications: { type: 'array', items: { type: 'string' } },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                  },
                  required: ['title', 'url'],
                },
              },
            },
            required: ['diseases', 'explanation', 'recommendations'],
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText} ${text}`.trim());
  }

  const data = (await response.json()) as any;
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const textParts: string[] = parts.map((p: any) => p?.text).filter(Boolean);

  let raw: any | null = null;
  if (textParts.length > 0) {
    const combined = textParts.join('\n');
    try {
      raw = extractJsonFromText(combined) as any;
    } catch (_) {
      // Try a softer parse: replace single quotes and remove trailing commas
      const softened = combined
        .replace(/```json|```/g, '')
        .replace(/\,(\s*[\}\]])/g, '$1')
        .replace(/\"/g, '"');
      try {
        raw = JSON.parse(softened);
      } catch (_) {
        raw = null;
      }
    }
  }

  if (!raw) {
    const inlineJsonPart = parts.find((p: any) => p?.inlineData?.mimeType?.includes('json') && p?.inlineData?.data);
    if (inlineJsonPart) {
      try {
        const base64 = inlineJsonPart.inlineData.data as string;
        const decoded = atob(base64);
        raw = JSON.parse(decoded);
      } catch (_) {
        // ignore; final error thrown below
      }
    }
  }

  if (!raw) {
    // Return a minimal valid structure rather than throwing to keep UX smooth
    return {
      diseases: [],
      explanation: 'The AI did not return structured data. Please try again.',
      recommendations: [],
    };
  }

  // Normalize alternative medication keys the model might return
  const coerceStringArray = (value: any): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.map((v) => String(v));
    return [String(value)];
  };

  const normalizedDiseasesInput: any[] = (raw?.diseases || []).map((d: any) => {
    if (d && !d.medications) {
      d.medications = coerceStringArray(d.medications)
        || coerceStringArray(d.meds)
        || coerceStringArray(d.medication)
        || coerceStringArray(d.medicationGuidance);
    }
    return d;
  });

  const diseases: PredictedDisease[] = (normalizedDiseasesInput)
    .slice(0, 5)
    .map((d: any) => ({
      name: String(d?.name || 'Unknown'),
      probability: Math.max(0, Math.min(100, Math.round(Number(d?.probability) || 0))),
      severity: normalizeSeverity(String(d?.severity || 'Low')),
      summary: d?.summary ? String(d.summary) : undefined,
      redFlags: Array.isArray(d?.redFlags) ? d.redFlags.map((x: any) => String(x)) : undefined,
      tests: Array.isArray(d?.tests) ? d.tests.map((x: any) => String(x)) : undefined,
      careAdvice: Array.isArray(d?.careAdvice) ? d.careAdvice.map((x: any) => String(x)) : undefined,
      medications: Array.isArray(d?.medications) ? d.medications.map((x: any) => String(x)) : undefined,
      sources: Array.isArray(d?.sources)
        ? d.sources
            .map((s: any) => ({ title: String(s?.title || 'Source'), url: String(s?.url || '') }))
            .filter((s: any) => !!s.url)
        : undefined,
    }));

  const result: PredictionResult = {
    diseases,
    explanation: String(raw?.explanation || 'No explanation provided.'),
    recommendations: Array.isArray(raw?.recommendations)
      ? raw.recommendations.map((r: any) => String(r)).slice(0, 10)
      : [],
    triage: raw?.triage as any,
    redFlags: Array.isArray(raw?.redFlags) ? raw.redFlags.map((x: any) => String(x)) : undefined,
    suggestedTests: Array.isArray(raw?.suggestedTests)
      ? raw.suggestedTests.map((x: any) => String(x))
      : undefined,
    medications: coerceStringArray(raw?.medications)
      || coerceStringArray(raw?.meds)
      || coerceStringArray(raw?.medication)
      || coerceStringArray(raw?.medicationGuidance),
    sources: Array.isArray(raw?.sources)
      ? raw.sources
          .map((s: any) => ({ title: String(s?.title || 'Source'), url: String(s?.url || '') }))
          .filter((s: any) => !!s.url)
      : undefined,
  };

  // Aggregate per-disease medications into global list if global is missing or empty
  if ((!result.medications || result.medications.length === 0) && diseases.some(d => Array.isArray(d.medications) && d.medications.length > 0)) {
    const aggregated = Array.from(
      new Set(
        diseases.flatMap(d => (Array.isArray(d.medications) ? d.medications : [])).map(m => String(m))
      )
    ).slice(0, 10);
    if (aggregated.length > 0) {
      result.medications = aggregated;
    }
  }

  return result;
}


