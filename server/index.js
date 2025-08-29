import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import { config } from './config.js';

const app = express();
const port = config.PORT || 3001;
const envApiKey = config.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'med-vision-core-backend' });
});

app.get('/api/skin/ping', async (req, res) => {
  try {
    const headerKey = req.headers['x-api-key'];
    const apiKey = typeof headerKey === 'string' && headerKey.trim() !== '' ? headerKey : envApiKey;
    if (!apiKey) return res.status(500).json({ ok: false, error: 'Missing Gemini API key: provide GEMINI_API_KEY on server or send x-api-key header' });

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: 'pong' }] }
          ],
          generationConfig: { maxOutputTokens: 1 }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ ok: false, error: 'Gemini request failed', details: `${response.status} ${response.statusText} ${errText}`.trim() });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Unexpected server error', details: String(error && (error.message || error)) });
  }
});

app.post('/api/skin/analyze', upload.single('image'), async (req, res) => {
  try {
    const headerKey = req.headers['x-api-key'];
    const apiKey = typeof headerKey === 'string' && headerKey.trim() !== '' ? headerKey : envApiKey;
    if (!apiKey) return res.status(500).json({ error: 'Missing Gemini API key: provide GEMINI_API_KEY on server or send x-api-key header' });

    if (!req.file) {
      return res.status(400).json({ error: 'Missing image file' });
    }

    const affectedArea = String(req.body?.affectedArea || 'unspecified');

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const instruction = `You analyze dermatology images. You are NOT a medical device and DO NOT provide diagnoses.
Return ONLY JSON matching exactly this schema (no prose):
{
  "diseases": Array<{
    "name": string,
    "probability": number, // 0-100 integer
    "severity": "Low" | "Medium" | "High",
    "summary"?: string,
    "redFlags"?: string[],
    "tests"?: string[],
    "careAdvice"?: string[],
    "medications"?: string[],
    "sources"?: Array<{"title": string, "url": string}>
  }>,
  "explanation"?: string,
  "recommendations": string[],
  "triage"?: "Self-care" | "Primary care" | "Urgent care" | "Emergency",
  "redFlags"?: string[],
  "suggestedTests"?: string[],
  "medications"?: string[],
  "disclaimer": string,
  "sources"?: Array<{"title": string, "url": string}>
}
Rules:
- Include 3-5 likely conditions seen in skin images (e.g., eczema, dermatitis, acne, psoriasis, benign nevus). Use lay language.
- probabilities are 0-100 integers that sum to <= 100.
- severity reflects urgency, not certainty.
- provide actionable but safe self-care advice; advise clinician review for concerning features.
- cite trustworthy sources when possible.
- ALWAYS set disclaimer to: "This is not a medical diagnosis. Consult a dermatologist or qualified clinician."

Context:
- Affected area (user-supplied): ${affectedArea}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: 'Respond with ONLY valid JSON. No markdown. No explanations.' }],
          },
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: base64 } },
                { text: instruction },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error('Gemini error:', response.status, response.statusText, errText);
      return res.status(502).json({ error: 'Gemini request failed', details: `${response.status} ${response.statusText} ${errText}`.trim() });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textParts = parts.map((p) => p?.text).filter(Boolean);
    let parsed = null;
    if (textParts.length > 0) {
      const combined = textParts.join('\n');
      try {
        parsed = JSON.parse(combined);
      } catch (_) {
        try {
          const match = combined.match(/[\{\[][\s\S]*[\}\]]/);
          if (match) parsed = JSON.parse(match[0]);
        } catch (_) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({
        diseases: [],
        recommendations: [],
        disclaimer: 'This is not a medical diagnosis. Consult a dermatologist or qualified clinician.',
        message: 'The AI did not return structured data. Please try again.',
      });
    }

    // Ensure medications are available for the top disease: if missing, fall back to global meds
    try {
      const diseases = Array.isArray(parsed.diseases) ? parsed.diseases : [];
      const globalMeds = Array.isArray(parsed.medications) ? parsed.medications : [];
      if (diseases.length > 0) {
        diseases.sort((a, b) => (Number(b?.probability) || 0) - (Number(a?.probability) || 0));
        if ((!Array.isArray(diseases[0].medications) || diseases[0].medications.length === 0) && globalMeds.length > 0) {
          diseases[0].medications = globalMeds.slice(0, 10);
        }
        parsed.diseases = diseases;
      }
    } catch (_) {
      // noop
    }

    return res.status(200).json(parsed);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Analyze error', error);
    return res.status(500).json({ error: 'Unexpected server error', details: String(error && (error.message || error)) });
  }
});

app.post('/api/history/analyze', async (req, res) => {
  try {
    const headerKey = req.headers['x-api-key'];
    const apiKey = typeof headerKey === 'string' && headerKey.trim() !== '' ? headerKey : envApiKey;
    if (!apiKey) return res.status(500).json({ error: 'Missing Gemini API key: provide GEMINI_API_KEY on server or send x-api-key header' });

    const history = req.body || {};
    const instruction = `You convert raw patient history into structured clinical insights. You are NOT a medical device.
Return ONLY JSON matching exactly this schema (no prose):
{
  "profile": {
    "age": number,
    "gender": string,
    "heightCm"?: number,
    "weightKg"?: number,
    "bmi"?: number,
    "pastConditions"?: string[],
    "medications"?: Array<{"name": string, "dose"?: string, "frequency"?: string}>,
    "allergies"?: string[],
    "familyHistory"?: string[]
  },
  "riskFactors"?: string[],
  "redFlags"?: string[],
  "timeline"?: Array<{"dateOrPeriod": string, "event": string}>,
  "knowledgeGraph"?: {
    "nodes": Array<{"id": string, "type": string, "label": string}>,
    "edges": Array<{"source": string, "target": string, "relation": string}>
  },
  "alerts"?: string[],
  "suggestions"?: string[],
  "recommendations"?: string[],
  "testsRecommended"?: string[],
  "riskScores"?: {"cardiovascular"?: number, "diabetes"?: number, "renal"?: number, "stroke"?: number, "cancer"?: number, "respiratory"?: number},
  "disclaimer": string
}
Rules:
- Use lay language where appropriate; keep items concise.
- Identify red flags based on history and labs.
- Create a simple timeline using years or dates if present.
- Build a minimal knowledge graph linking conditions, medications, and complications.
- ALWAYS set disclaimer to: "This is not a medical diagnosis. Consult a clinician."

Raw history (JSON):\n${JSON.stringify(history, null, 2)}`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { role: 'system', parts: [{ text: 'Respond with ONLY valid JSON. No markdown. No explanations.' }] },
          contents: [ { role: 'user', parts: [ { text: instruction } ] } ],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.2, response_mime_type: 'application/json' }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Gemini request failed', details: `${response.status} ${response.statusText} ${errText}`.trim() });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textParts = parts.map((p) => p?.text).filter(Boolean);
    let parsed = null;
    if (textParts.length > 0) {
      const combined = textParts.join('\n');
      try {
        parsed = JSON.parse(combined);
      } catch (_) {
        try {
          const match = combined.match(/[\{\[][\s\S]*[\}\]]/);
          if (match) parsed = JSON.parse(match[0]);
        } catch (_) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({
        profile: {},
        riskFactors: [],
        redFlags: [],
        timeline: [],
        knowledgeGraph: { nodes: [], edges: [] },
        alerts: [],
        suggestions: [],
        recommendations: [],
        testsRecommended: [],
        riskScores: {},
        disclaimer: 'This is not a medical diagnosis. Consult a clinician.'
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: String(error && (error.message || error)) });
  }
});

app.post('/api/eye/analyze', upload.single('image'), async (req, res) => {
  try {
    const headerKey = req.headers['x-api-key'];
    const apiKey = typeof headerKey === 'string' && headerKey.trim() !== '' ? headerKey : envApiKey;
    if (!apiKey) return res.status(500).json({ error: 'Missing Gemini API key: provide GEMINI_API_KEY on server or send x-api-key header' });

    if (!req.file) {
      return res.status(400).json({ error: 'Missing image file' });
    }

    const affectedArea = String(req.body?.affectedArea || 'unspecified');

    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const instruction = `You analyze ophthalmology images. You are NOT a medical device and DO NOT provide diagnoses.
Return ONLY JSON matching exactly this schema (no prose):
{
  "diseases": Array<{
    "name": string,
    "probability": number, // 0-100 integer
    "severity": "Low" | "Medium" | "High",
    "summary"?: string,
    "redFlags"?: string[],
    "tests"?: string[],
    "careAdvice"?: string[],
    "medications"?: string[],
    "sources"?: Array<{"title": string, "url": string}>
  }>,
  "explanation"?: string,
  "recommendations": string[],
  "triage"?: "Self-care" | "Primary care" | "Urgent care" | "Emergency",
  "redFlags"?: string[],
  "suggestedTests"?: string[],
  "medications"?: string[],
  "disclaimer": string,
  "sources"?: Array<{"title": string, "url": string}>
}
Rules:
- Include 3-5 likely eye conditions seen in images (e.g., conjunctivitis, blepharitis, corneal abrasion, stye, chalazion, pinguecula, pterygium, uveitis, glaucoma, diabetic retinopathy). Use lay language.
- probabilities are 0-100 integers that sum to <= 100.
- severity reflects urgency, not certainty.
- provide actionable but safe self-care advice; advise clinician review for concerning features.
- cite trustworthy sources when possible.
- ALWAYS set disclaimer to: "This is not a medical diagnosis. Consult an ophthalmologist or qualified clinician."

Context:
Affected area: ${affectedArea}
Image: [${mimeType} image data]`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: instruction },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64
                  }
                }
              ]
            }
          ],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.2, response_mime_type: 'application/json' }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Gemini request failed', details: `${response.status} ${response.statusText} ${errText}`.trim() });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textParts = parts.map((p) => p?.text).filter(Boolean);
    let parsed = null;
    if (textParts.length > 0) {
      const combined = textParts.join('\n');
      try {
        parsed = JSON.parse(combined);
      } catch (_) {
        try {
          const match = combined.match(/[\{\[][\s\S]*[\}\]]/);
          if (match) parsed = JSON.parse(match[0]);
        } catch (_) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({
        diseases: [
          {
            name: 'Unable to analyze',
            probability: 100,
            severity: 'Medium',
            summary: 'Image analysis was unsuccessful. Please consult an ophthalmologist.',
            redFlags: ['Unable to determine condition'],
            tests: ['Comprehensive eye examination'],
            careAdvice: ['Schedule appointment with ophthalmologist'],
            medications: [],
            sources: []
          }
        ],
        explanation: 'The AI was unable to analyze the provided image. This could be due to image quality, lighting, or other factors.',
        recommendations: ['Consult an ophthalmologist for proper diagnosis', 'Ensure good image quality for future analysis'],
        triage: 'Primary care',
        redFlags: ['Unable to determine condition'],
        suggestedTests: ['Comprehensive eye examination'],
        medications: [],
        disclaimer: 'This is not a medical diagnosis. Consult an ophthalmologist or qualified clinician.',
        sources: []
      });
    }

    // Ensure medications are available for the top disease
    if (parsed.diseases && parsed.diseases.length > 0 && (!parsed.diseases[0].medications || parsed.diseases[0].medications.length === 0)) {
      parsed.diseases[0].medications = parsed.medications || [];
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: String(error && (error.message || error)) });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


