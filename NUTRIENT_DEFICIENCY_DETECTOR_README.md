# Nutrient Deficiency Detector

## Overview

The Nutrient Deficiency Detector is an AI-powered tool that analyzes lab values to identify potential nutrient deficiencies and provides personalized recommendations for diet, supplements, and lifestyle changes.

## Features

### 🔬 Dual Input Methods
- **Manual Input**: Enter specific lab values for key nutrients
- **PDF Upload**: Upload lab report PDFs for automatic analysis using OCR

### 🧪 Essential Nutrients Analyzed
- **Iron Status**: Hemoglobin (Hb), Ferritin
- **Vitamin Levels**: Vitamin B12, Vitamin D (25-OH)
- **Mineral Status**: Calcium, Magnesium, Folate, Zinc

### 🤖 AI-Powered Analysis
- Uses Gemini AI (Google) for intelligent nutrient analysis
- Identifies deficiency levels (Low/Borderline/Normal/High)
- Assesses risk levels (Mild/Moderate/Severe)
- Provides comprehensive health impact analysis

### 📊 Comprehensive Results
- **Deficiencies Tab**: Detailed analysis of each nutrient deficiency
- **Recommendations Tab**: Actionable advice for diet, supplements, and lifestyle
- **Analysis Details Tab**: Patient information and next steps

## How It Works

### Manual Input Method
1. Select "Manual Input" tab
2. Enter available lab values (at least one required)
3. Click "Analyze Nutrient Status"
4. AI analyzes values and provides insights

### PDF Upload Method
1. Select "Upload PDF Report" tab
2. Upload lab report PDF (max 10MB)
3. AI extracts text using OCR technology
4. Analyzes extracted data for nutrient deficiencies

## API Integration

### Gemini AI
- **API Key**: Integrated with Google's Gemini 1.5 Flash model
- **Analysis**: Structured JSON response with comprehensive nutrient analysis
- **Focus**: Medical-grade analysis with actionable recommendations

### OCR Technology
- **Service**: OCR.space API for PDF text extraction
- **Capabilities**: Handles various PDF formats and orientations
- **Accuracy**: High-quality text extraction for reliable analysis

## Output Structure

The AI provides structured analysis including:

```json
{
  "patientInfo": {
    "name": "Patient name",
    "age": "Age",
    "gender": "Gender",
    "dateOfTest": "Test date"
  },
  "summary": "Overall nutrient status summary",
  "deficiencies": [
    {
      "nutrient": "Nutrient name",
      "level": "Low/Borderline/Normal/High",
      "riskLevel": "Mild/Moderate/Severe",
      "currentValue": "Actual lab value",
      "normalRange": "Reference range",
      "healthEffects": ["Health impact list"],
      "recommendations": {
        "diet": ["Dietary changes"],
        "supplements": ["Supplement advice"],
        "lifestyle": ["Lifestyle modifications"]
      }
    }
  ],
  "overallRisk": "Overall risk assessment",
  "nextSteps": ["Recommended actions"],
  "disclaimer": "Medical disclaimer"
}
```

## Technical Implementation

### Component Structure
- **File**: `src/components/models/NutrientDeficiencyDetector.tsx`
- **Framework**: React with TypeScript
- **UI Library**: Custom UI components with Tailwind CSS
- **State Management**: React hooks for local state

### Key Functions
- `handleManualAnalyze()`: Processes manual lab value inputs
- `handlePDFAnalyze()`: Processes PDF uploads with OCR
- `analyzeWithGemini()`: Sends data to Gemini AI for analysis
- `extractTextFromPDF()`: Extracts text from PDF using OCR

### Error Handling
- Input validation for lab values
- PDF size and format validation
- API error handling with user-friendly messages
- Graceful fallbacks for unexpected responses

## Usage Instructions

### For Users
1. Navigate to Nutrition Tools → Nutrient Deficiency Detector
2. Choose input method (Manual or PDF)
3. Enter values or upload report
4. Click analyze button
5. Review comprehensive results in organized tabs
6. Follow personalized recommendations

### For Developers
1. Component is fully integrated into the routing system
2. Route: `/model/deficiency-detector`
3. Follows established component patterns
4. Uses shared UI components and styling

## Medical Disclaimer

⚠️ **Important**: This tool is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Custom UI components
- Gemini AI API
- OCR.space API

## Future Enhancements

- Additional nutrient parameters
- Historical trend analysis
- Integration with health tracking apps
- Personalized meal planning based on deficiencies
- Supplement interaction checking
- Export functionality for healthcare providers
