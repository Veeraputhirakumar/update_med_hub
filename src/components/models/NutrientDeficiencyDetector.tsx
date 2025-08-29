import { useState, useRef } from 'react';
import { Upload, FileText, FlaskConical, AlertTriangle, CheckCircle, Download, ArrowRight, TrendingUp, Activity, Heart, Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubModelPanel from '../common/SubModelPanel';

const NutrientDeficiencyDetector = () => {
  console.log('🔬 NutrientDeficiencyDetector component loaded!');
  
  const [inputMethod, setInputMethod] = useState<'manual' | 'pdf'>('manual');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manual input state
  const [labValues, setLabValues] = useState({
    hemoglobin: '',
    ferritin: '',
    vitaminB12: '',
    vitaminD: '',
    calcium: '',
    magnesium: '',
    folate: '',
    zinc: ''
  });

  // Analysis Results Interface
  interface AnalysisResults {
    patientInfo?: {
      name?: string;
      age?: string;
      gender?: string;
      dateOfTest?: string;
    };
    summary?: string;
    deficiencies?: Array<{
      nutrient: string;
      level: string; // Low/Medium/Normal
      riskLevel: 'Mild' | 'Moderate' | 'Severe';
      currentValue: string;
      normalRange: string;
      healthEffects: string[];
      recommendations: {
        foods: string[];
        mealPlan: string[];
        lifestyle: string[];
      };
    }>;
    overallRisk: string;
    nextSteps?: string[];
    disclaimer?: string;
    rawResponse?: string; // For debugging purposes
  }

  // API Keys
  const OCR_SPACE_API_KEY = 'K87657393688957';
  const GEMINI_API_KEY = 'AIzaSyBUIwW1exVkPrqPT_jLtIRG1wiivEnRn9I';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
      setPdfFile(file);
      setResults(null);
      setError(null);
      setExtractedText('');
    } else if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file');
    } else if (file && file.size > 10 * 1024 * 1024) {
      alert('Please select a PDF under 10MB');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'pdf');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract text from PDF');
    }

    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage || 'OCR processing failed');
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    const extractedText = data.ParsedResults
      .map((result: any) => result.ParsedText)
      .join('\n\n');

    return extractedText;
  };

  const analyzeWithGemini = async (text: string): Promise<AnalysisResults> => {
    console.log('🔬 Starting Gemini analysis with text:', text);
    
    const prompt = `You are a nutritionist. Analyze the user's nutrient levels. For each nutrient, classify them as Low, Medium, or Normal based on healthy ranges. Then create a dietary plan with foods, meal suggestions, and lifestyle tips.

Please structure your response as JSON with the following format:

{
  "patientInfo": {
    "name": "Patient's name if found",
    "age": "Patient's age if found",
    "gender": "Patient's gender if found",
    "dateOfTest": "Test date if found"
  },
  "summary": "Brief overall summary of nutrient status",
  "deficiencies": [
    {
      "nutrient": "Name of the nutrient",
      "level": "Low/Medium/Normal",
      "riskLevel": "Mild/Moderate/Severe",
      "currentValue": "Actual lab value with units",
      "normalRange": "Normal reference range",
      "healthEffects": [
        "List of potential health effects of this deficiency"
      ],
      "recommendations": {
        "foods": [
          "Specific foods to address the deficiency"
        ],
        "mealPlan": [
          "Specific meal suggestions and daily plans"
        ],
        "lifestyle": [
          "Lifestyle tips and habits to improve nutrient status"
        ]
      }
    }
  ],
  "overallRisk": "Overall risk assessment (Low/Medium/High)",
  "nextSteps": [
    "Recommended next steps for the patient"
  ],
  "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice"
}

Focus on these key nutrients: Hemoglobin, Ferritin, Vitamin B12, Vitamin D, Calcium, Magnesium, Folate, and Zinc. 

For each deficiency, provide:
- 🩸 Hemoglobin: Foods + lifestyle for boosting Hb
- 🌞 Vitamin D: Foods + sun exposure recommendations  
- 🦴 Calcium: Bone health diet suggestions
- 🧲 Iron: Energy & oxygen supply diet
- 💊 Vitamin B12: Nerve & brain function foods

Analyze the values and provide specific, actionable recommendations with foods, meal plans, and lifestyle tips.

Lab Values/Report Text:
${text}

Please analyze this information and provide the structured response above. Be specific about the actual values, normal ranges, and provide practical dietary and lifestyle recommendations.`;

    console.log('🔬 Sending prompt to Gemini:', prompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze with Gemini AI');
    }

    const data = await response.json();
    console.log('🔬 Raw Gemini response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini AI');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('🔬 Gemini response text:', responseText);
    
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      console.log('🔬 Extracted JSON string:', jsonString);
      
      const parsedResult = JSON.parse(jsonString);
      console.log('🔬 Parsed result:', parsedResult);
      
      return parsedResult;
    } catch (parseError) {
      console.error('🔬 JSON parsing error:', parseError);
      console.log('🔬 Response text that failed to parse:', responseText);
      
      return {
        patientInfo: {},
        summary: "Analysis completed but response format was unexpected. Check console for details.",
        deficiencies: [],
        overallRisk: "Unknown",
        nextSteps: [],
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice",
        rawResponse: responseText
      };
    }
  };

  const handleManualAnalyze = async () => {
    // Check if at least one lab value is provided
    const hasValues = Object.values(labValues).some(value => value.trim() !== '');
    if (!hasValues) {
      setError('Please enter at least one lab value for analysis');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);
    setError(null);

    try {
      setProgress(30);
      
      // Create a formatted text from manual inputs
      const manualInputText = Object.entries(labValues)
        .filter(([_, value]) => value.trim() !== '')
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join('\n');

      setProgress(60);
      const analysisResults = await analyzeWithGemini(manualInputText);
      console.log('🔬 AI Analysis Results:', analysisResults);
      setProgress(100);

      setResults(analysisResults);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handlePDFAnalyze = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);
    setResults(null);
    setError(null);

    try {
      setProgress(10);
      const extractedText = await extractTextFromPDF(pdfFile);
      setExtractedText(extractedText);
      setProgress(30);

      setProgress(50);
      const analysisResults = await analyzeWithGemini(extractedText);
      console.log('🔬 AI Analysis Results (PDF):', analysisResults);
      setProgress(100);

      setResults(analysisResults);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setResults(null);
    setError(null);
    setExtractedText('');
    setLabValues({
      hemoglobin: '',
      ferritin: '',
      vitaminB12: '',
      vitaminD: '',
      calcium: '',
      magnesium: '',
      folate: '',
      zinc: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'severe':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'moderate':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'mild':
        return 'bg-default text-default-foreground hover:bg-default/90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getNutrientIcon = (nutrient: string) => {
    const nutrientLower = nutrient.toLowerCase();
    if (nutrientLower.includes('hemoglobin') || nutrientLower.includes('hb')) return '🩸';
    if (nutrientLower.includes('vitamin d') || nutrientLower.includes('d')) return '🌞';
    if (nutrientLower.includes('calcium')) return '🦴';
    if (nutrientLower.includes('iron') || nutrientLower.includes('ferritin')) return '🧲';
    if (nutrientLower.includes('vitamin b12') || nutrientLower.includes('b12')) return '💊';
    if (nutrientLower.includes('magnesium')) return '⚡';
    if (nutrientLower.includes('folate')) return '🥬';
    if (nutrientLower.includes('zinc')) return '🔋';
    return '🧪';
  };

  const inputPanel = (
    <>
      {/* Input Method Selection */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-foreground mb-3">
          Choose Input Method
        </Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={inputMethod === 'manual' ? 'default' : 'outline'}
            onClick={() => setInputMethod('manual')}
            className="flex-1"
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Manual Input
          </Button>
          <Button
            type="button"
            variant={inputMethod === 'pdf' ? 'default' : 'outline'}
            onClick={() => setInputMethod('pdf')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload PDF Report
          </Button>
        </div>
      </div>

      {inputMethod === 'manual' ? (
        /* Manual Input Form */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1.5">Essential Lab Values for Nutrient Analysis</h3>
                                                <p className="text-xs text-blue-600 leading-relaxed mb-2.5">
                                  Enter your lab values below. You only need to fill in the values you have available.
                                  The AI will analyze what you provide and identify potential nutrient deficiencies.
                                  <br /><br />
                                  <strong>Example:</strong> Hemoglobin: 9.5, Vitamin D: 18, Calcium: 7.9
                                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-700">Iron Status</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs font-medium text-indigo-700">Vitamin Levels</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-medium text-emerald-700">Mineral Status</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Iron Status */}
            <div className="space-y-3">
              <Label htmlFor="hemoglobin" className="text-sm font-medium text-foreground">
                Hemoglobin (Hb)
              </Label>
              <Input
                id="hemoglobin"
                placeholder="e.g., 12.5 g/dL"
                value={labValues.hemoglobin}
                onChange={(e) => setLabValues(prev => ({ ...prev, hemoglobin: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 12.0-15.5 g/dL (women), 13.5-17.5 g/dL (men)</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="ferritin" className="text-sm font-medium text-foreground">
                Ferritin
              </Label>
              <Input
                id="ferritin"
                placeholder="e.g., 45 ng/mL"
                value={labValues.ferritin}
                onChange={(e) => setLabValues(prev => ({ ...prev, ferritin: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 20-250 ng/mL (women), 30-400 ng/mL (men)</p>
            </div>

            {/* Vitamin Levels */}
            <div className="space-y-3">
              <Label htmlFor="vitaminB12" className="text-sm font-medium text-foreground">
                Vitamin B12
              </Label>
              <Input
                id="vitaminB12"
                placeholder="e.g., 350 pg/mL"
                value={labValues.vitaminB12}
                onChange={(e) => setLabValues(prev => ({ ...prev, vitaminB12: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 200-900 pg/mL</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="vitaminD" className="text-sm font-medium text-foreground">
                Vitamin D (25-OH)
              </Label>
              <Input
                id="vitaminD"
                placeholder="e.g., 25 ng/mL"
                value={labValues.vitaminD}
                onChange={(e) => setLabValues(prev => ({ ...prev, vitaminD: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 30-100 ng/mL</p>
            </div>

            {/* Mineral Status */}
            <div className="space-y-3">
              <Label htmlFor="calcium" className="text-sm font-medium text-foreground">
                Calcium
              </Label>
              <Input
                id="calcium"
                placeholder="e.g., 9.2 mg/dL"
                value={labValues.calcium}
                onChange={(e) => setLabValues(prev => ({ ...prev, calcium: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 8.5-10.5 mg/dL</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="magnesium" className="text-sm font-medium text-foreground">
                Magnesium
              </Label>
              <Input
                id="magnesium"
                placeholder="e.g., 1.8 mg/dL"
                value={labValues.magnesium}
                onChange={(e) => setLabValues(prev => ({ ...prev, magnesium: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 1.7-2.2 mg/dL</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="folate" className="text-sm font-medium text-foreground">
                Folate
              </Label>
              <Input
                id="folate"
                placeholder="e.g., 8.5 ng/mL"
                value={labValues.folate}
                onChange={(e) => setLabValues(prev => ({ ...prev, folate: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 2.0-20.0 ng/mL</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="zinc" className="text-sm font-medium text-foreground">
                Zinc
              </Label>
              <Input
                id="zinc"
                placeholder="e.g., 85 μg/dL"
                value={labValues.zinc}
                onChange={(e) => setLabValues(prev => ({ ...prev, zinc: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Normal: 70-120 μg/dL</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleManualAnalyze}
            disabled={isProcessing}
            className="btn-medical text-white w-full"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Nutrient Status'}
          </Button>

          <Button
            type="button"
            onClick={() => {
              setLabValues({
                hemoglobin: '9.5',
                ferritin: '35',
                vitaminB12: '120',
                vitaminD: '18',
                calcium: '7.9',
                magnesium: '',
                folate: '',
                zinc: ''
              });
            }}
            variant="outline"
            className="w-full"
          >
            🧪 Load Sample Data (Test)
          </Button>

          <Button
            type="button"
            onClick={() => {
              // Test with mock data to see if display works
              setResults({
                patientInfo: {},
                summary: "Test analysis completed successfully",
                deficiencies: [
                  {
                    nutrient: "Hemoglobin",
                    level: "Low",
                    riskLevel: "Moderate",
                    currentValue: "9.5 g/dL",
                    normalRange: "12.0-15.5 g/dL",
                    healthEffects: ["Fatigue", "Weakness", "Shortness of breath"],
                    recommendations: {
                      foods: ["Spinach", "Lean red meat", "Lentils"],
                      mealPlan: ["Add spinach to daily meals", "Include red meat 2x/week"],
                      lifestyle: ["Take iron with Vitamin C", "Avoid tea/coffee with meals"]
                    }
                  }
                ],
                overallRisk: "Medium",
                nextSteps: ["Consult healthcare provider", "Start iron-rich diet"],
                disclaimer: "This is test data for debugging purposes"
              });
            }}
            variant="outline"
            className="w-full"
          >
            🧪 Test Display (Mock Data)
          </Button>
        </div>
      ) : (
        /* PDF Upload */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 via-white to-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 mb-1.5">AI-Powered Lab Report Analysis</h3>
                <p className="text-xs text-green-600 leading-relaxed mb-2.5">
                  Upload your lab report PDF and our AI will automatically extract and analyze your nutrient levels, 
                  identifying deficiencies and providing personalized recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-700">OCR Technology</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-medium text-emerald-700">AI Analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 border border-teal-200 rounded-full">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="text-xs font-medium text-teal-700">Smart Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Upload Lab Report PDF *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              {!pdfFile ? (
                <div>
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to select lab report PDF
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select PDF
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF files up to 10MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-foreground mb-2">{pdfFile.name}</div>
                  <div className="text-xs text-muted-foreground mb-4">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change PDF
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={handlePDFAnalyze}
            disabled={!pdfFile || isProcessing}
            className="btn-medical text-white w-full"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Lab Report'}
          </Button>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="mt-4 relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-4 border-blue-400 animate-spin"></div>
                <div className="absolute inset-4 rounded-full bg-blue-500 animate-ping"></div>
              </div>
              <div className="text-sm font-medium text-blue-700">
                {inputMethod === 'manual' ? 'Analyzing Lab Values...' : 'Processing PDF...'}
              </div>
              <div className="text-xs text-blue-600 mt-1">{progress}%</div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing...</span>
            <span className="text-primary font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="medical-progress" />
        </div>
      )}
    </>
  );

  const outputPanel = !results && !isProcessing ? (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <FlaskConical className="w-12 h-12 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">🧪 Ready for Analysis</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {inputMethod === 'manual'
          ? 'Enter your lab values above and click "Analyze Nutrient Status" to get AI-powered insights'
          : 'Upload a lab report PDF and click "Analyze Lab Report" to get comprehensive nutrient analysis'
        }
      </p>
      
      {/* Analysis Result Field with Logo */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm max-w-lg mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <h4 className="text-lg font-semibold text-blue-900 mb-2">Analysis Result Field</h4>
        <p className="text-sm text-blue-700 mb-4">
          Your comprehensive nutrient analysis will appear here with detailed insights, recommendations, and personalized treatment plans.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span>AI-powered analysis</span>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {error ? (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-red-800 font-medium">Error:</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">


             {/* Analysis Summary - Professional */}
       {results.summary && (
         <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
           <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                 <FlaskConical className="w-4 h-4 text-blue-600" />
               </div>
               <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide">CLINICAL ANALYSIS SUMMARY</h3>
             </div>
           </div>
           <div className="p-4">
             <p className="text-sm text-gray-700 leading-relaxed font-medium">
               {results.summary}
             </p>
           </div>
         </div>
       )}

             {/* Overall Risk Assessment - Professional */}
       {results.overallRisk && (
         <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
           <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center border border-red-200">
                 <AlertTriangle className="w-4 h-4 text-red-600" />
               </div>
               <h3 className="text-lg font-bold text-red-900 uppercase tracking-wide">RISK ASSESSMENT</h3>
             </div>
           </div>
           <div className="p-4">
             <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2">
                 <span className="text-sm font-medium text-gray-600">Overall Risk Level:</span>
                 <Badge 
                   variant="outline"
                   className={`font-semibold ${
                     results.overallRisk === 'High' ? 'bg-red-50 text-red-700 border-red-300' : 
                     results.overallRisk === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : 
                     'bg-green-50 text-green-700 border-green-300'
                   }`}
                 >
                   {results.overallRisk}
                 </Badge>
               </div>
               {results.deficiencies && results.deficiencies.length > 0 && (
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-medium text-gray-600">Nutrients Evaluated:</span>
                   <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 font-semibold">
                     {results.deficiencies.length} Parameter{results.deficiencies.length !== 1 ? 's' : ''}
                   </Badge>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

      {/* Check if we have deficiencies to show */}
      {(!results.deficiencies || results.deficiencies.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Deficiencies Detected
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your nutrient levels appear to be within normal ranges, or the analysis didn't identify specific deficiencies.
          </p>
          {results.rawResponse && (
            <details className="text-left">
              <summary className="text-sm font-medium text-blue-600 cursor-pointer">View Raw AI Response</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {results.rawResponse}
              </pre>
            </details>
          )}
        </div>
      ) : (
                 /* Professional Content Tabs */
         <Tabs defaultValue="deficiencies" className="w-full">
           <TabsList className="grid grid-cols-3 w-full h-12 bg-gray-100 border border-gray-200 rounded-lg p-1">
             <TabsTrigger 
               value="deficiencies" 
               className="flex items-center gap-2 font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all"
             >
               <FlaskConical className="w-4 h-4" />
               <span className="hidden sm:inline">Lab Results</span>
               <span className="sm:hidden">Results</span>
             </TabsTrigger>
             <TabsTrigger 
               value="recommendations" 
               className="flex items-center gap-2 font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all"
             >
               <Heart className="w-4 h-4" />
               <span className="hidden sm:inline">Treatment Plan</span>
               <span className="sm:hidden">Treatment</span>
             </TabsTrigger>
             <TabsTrigger 
               value="details" 
               className="flex items-center gap-2 font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all"
             >
               <Brain className="w-4 h-4" />
               <span className="hidden sm:inline">Clinical Details</span>
               <span className="sm:hidden">Details</span>
             </TabsTrigger>
           </TabsList>

          <TabsContent value="deficiencies" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.deficiencies.map((deficiency, index) => (
                                 <Card key={index} className="group relative overflow-hidden border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-300">
                   {/* Subtle Risk Level Indicator Bar */}
                   <div className={`absolute top-0 left-0 w-full h-0.5 ${
                     deficiency.riskLevel === 'Severe' ? 'bg-red-400' :
                     deficiency.riskLevel === 'Moderate' ? 'bg-orange-400' :
                     'bg-yellow-400'
                   }`} />
                   
                   <CardContent className="p-4">
                     {/* Header Section */}
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex items-start gap-3">
                         <div className="relative w-12 h-12 rounded-lg flex items-center justify-center text-lg bg-gray-100 border border-gray-200">
                           {getNutrientIcon(deficiency.nutrient)}
                           <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200">
                             <FlaskConical className="w-2.5 h-2.5 text-gray-500" />
                           </div>
                         </div>
                         <div className="flex-1">
                           <h3 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">
                             {deficiency.nutrient}
                           </h3>
                           <div className="flex items-center gap-2">
                             <Badge 
                               variant="outline" 
                               className={`px-2 py-0.5 text-xs font-medium ${
                                 deficiency.level === 'Low' ? 'bg-red-50 text-red-600 border-red-300' :
                                 deficiency.level === 'Borderline' ? 'bg-yellow-50 text-yellow-600 border-yellow-300' :
                                 'bg-green-50 text-green-600 border-green-300'
                               }`}
                             >
                               {deficiency.level}
                             </Badge>
                             <Badge 
                               variant="secondary"
                               className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border-gray-200"
                             >
                               {deficiency.riskLevel} Risk
                             </Badge>
                           </div>
                         </div>
                       </div>
                     </div>

                                         <div className="space-y-4">
                       {/* Current Status - Compact */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                             <TrendingUp className="w-3 h-3 text-blue-600" />
                           </div>
                           <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">CURRENT STATUS</h4>
                         </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Current Value</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  deficiency.level === 'Low' ? 'bg-red-400' :
                                  deficiency.level === 'Borderline' ? 'bg-yellow-400' :
                                  'bg-green-400'
                                }`} />
                                <span className="text-sm font-bold text-gray-900">{deficiency.currentValue}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Normal Range</span>
                              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                                {deficiency.normalRange}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                                             {/* Health Effects - Compact */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                             <AlertTriangle className="w-3 h-3 text-red-600" />
                           </div>
                           <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">HEALTH EFFECTS</h4>
                         </div>
                         
                         <div className="space-y-2">
                           {deficiency.healthEffects && deficiency.healthEffects.length > 0 ? (
                             deficiency.healthEffects.map((effect, effectIndex) => (
                               <div 
                                 key={effectIndex} 
                                 className="group/effect flex items-start gap-2 p-2.5 bg-white border border-red-100 rounded-lg hover:border-red-200 hover:shadow-sm transition-all duration-200"
                               >
                                 <div className="w-4 h-4 bg-red-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/effect:bg-red-100 transition-colors">
                                   <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                 </div>
                                 <span className="text-xs font-medium text-gray-800 leading-relaxed">{effect}</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                               <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center mx-auto mb-1">
                                 <CheckCircle className="w-3 h-3 text-gray-500" />
                               </div>
                               <span className="text-xs font-medium text-gray-600">No specific effects identified</span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

                     <TabsContent value="recommendations" className="mt-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {results.deficiencies.map((deficiency, index) => (
                 <Card key={index} className="group relative overflow-hidden border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-300">
                   {/* Subtle Success Indicator Bar */}
                   <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400" />
                   
                   <CardContent className="p-4">
                     {/* Header Section */}
                     <div className="flex items-center gap-3 mb-4">
                       <div className="relative w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg border border-gray-200">
                         {getNutrientIcon(deficiency.nutrient)}
                         <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200">
                           <TrendingUp className="w-2.5 h-2.5 text-gray-500" />
                         </div>
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-gray-900 mb-0.5 tracking-tight">
                           {deficiency.nutrient} Plan
                         </h3>
                         <p className="text-xs text-gray-600 font-medium">Recovery strategy</p>
                       </div>
                     </div>

                     <div className="space-y-3">
                       {/* Recommended Foods - Simplified */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                             <Heart className="w-3 h-3 text-green-600" />
                           </div>
                           <h4 className="text-sm font-bold text-green-900 uppercase tracking-wide">RECOMMENDED FOODS</h4>
                         </div>
                         
                         <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                           {deficiency.recommendations.foods && deficiency.recommendations.foods.length > 0 ? (
                             deficiency.recommendations.foods.map((rec, recIndex) => (
                               <div 
                                 key={recIndex} 
                                 className={`group/food flex items-start gap-2 p-2 hover:bg-gray-100 transition-colors ${
                                   recIndex !== deficiency.recommendations.foods.length - 1 ? 'border-b border-gray-200' : ''
                                 }`}
                               >
                                 <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/food:bg-gray-300 transition-colors">
                                   <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                                 </div>
                                 <span className="text-xs font-medium text-gray-800 leading-relaxed">{rec}</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-3 text-center">
                               <span className="text-xs font-medium text-gray-500">No specific foods</span>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Meal Plan - Simplified */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                             <Shield className="w-3 h-3 text-blue-600" />
                           </div>
                           <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">MEAL PLAN</h4>
                         </div>
                         
                         <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                           {deficiency.recommendations.mealPlan && deficiency.recommendations.mealPlan.length > 0 ? (
                             deficiency.recommendations.mealPlan.map((rec, recIndex) => (
                               <div 
                                 key={recIndex} 
                                 className={`group/meal flex items-start gap-2 p-2 hover:bg-gray-100 transition-colors ${
                                   recIndex !== deficiency.recommendations.mealPlan.length - 1 ? 'border-b border-gray-200' : ''
                                 }`}
                               >
                                 <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/meal:bg-gray-300 transition-colors">
                                   <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                                 </div>
                                 <span className="text-xs font-medium text-gray-800 leading-relaxed">{rec}</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-3 text-center">
                               <span className="text-xs font-medium text-gray-500">No specific meals</span>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Lifestyle Changes - Simplified */}
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                             <Activity className="w-3 h-3 text-purple-600" />
                           </div>
                           <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wide">LIFESTYLE CHANGES</h4>
                         </div>
                         
                         <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                           {deficiency.recommendations.lifestyle && deficiency.recommendations.lifestyle.length > 0 ? (
                             deficiency.recommendations.lifestyle.map((rec, recIndex) => (
                               <div 
                                 key={recIndex} 
                                 className={`group/lifestyle flex items-start gap-2 p-2 hover:bg-gray-100 transition-colors ${
                                   recIndex !== deficiency.recommendations.lifestyle.length - 1 ? 'border-b border-gray-200' : ''
                                 }`}
                               >
                                 <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/lifestyle:bg-gray-300 transition-colors">
                                   <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                                 </div>
                                 <span className="text-xs font-medium text-gray-800 leading-relaxed">{rec}</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-3 text-center">
                               <span className="text-xs font-medium text-gray-500">No specific tips</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-6">
                             {/* Patient Information - Professional - Only show for PDF input */}
               {inputMethod === 'pdf' && results.patientInfo && Object.keys(results.patientInfo).some(key => results.patientInfo[key]) && (
                 <Card className="border border-gray-200 shadow-sm bg-white">
                   <div className="border-b border-gray-200 px-6 py-4">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center border border-indigo-200">
                         <Brain className="w-4 h-4 text-indigo-600" />
                       </div>
                       <h3 className="text-lg font-bold text-indigo-900 uppercase tracking-wide">PATIENT INFORMATION</h3>
                     </div>
                   </div>
                   <CardContent className="p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {Object.entries(results.patientInfo).map(([key, value]) => value && (
                         <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                           <span className="text-sm font-medium text-gray-600 capitalize">
                             {key.replace(/([A-Z])/g, ' $1').trim()}:
                           </span>
                           <span className="text-sm font-semibold text-gray-900">{value}</span>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               )}

                             {/* Clinical Recommendations - Professional */}
               {results.nextSteps && results.nextSteps.length > 0 && (
                 <Card className="border border-gray-200 shadow-sm bg-white">
                   <div className="border-b border-gray-200 px-6 py-4">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                         <TrendingUp className="w-4 h-4 text-green-600" />
                       </div>
                       <h3 className="text-lg font-bold text-green-900 uppercase tracking-wide">CLINICAL RECOMMENDATIONS</h3>
                     </div>
                   </div>
                   <CardContent className="p-6">
                     <div className="space-y-3">
                       {results.nextSteps.map((step, index) => (
                         <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                           <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                             <ArrowRight className="w-3 h-3 text-gray-600" />
                           </div>
                           <span className="text-sm font-medium text-gray-800 leading-relaxed">{step}</span>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               )}

                             {/* Laboratory Analysis Summary - Professional */}
               <Card className="border border-gray-200 shadow-sm bg-white">
                 <div className="border-b border-gray-200 px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
                       <FlaskConical className="w-4 h-4 text-orange-600" />
                     </div>
                     <h3 className="text-lg font-bold text-orange-900 uppercase tracking-wide">LABORATORY ANALYSIS SUMMARY</h3>
                   </div>
                 </div>
                 <CardContent className="p-6">
                   <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="border border-gray-200 rounded-lg p-4">
                         <div className="text-sm font-medium text-gray-600 mb-2">Overall Risk Assessment</div>
                         <div className="text-2xl font-bold text-gray-900">{results.overallRisk || 'Not specified'}</div>
                       </div>
                       <div className="border border-gray-200 rounded-lg p-4">
                         <div className="text-sm font-medium text-gray-600 mb-2">Parameters Evaluated</div>
                         <div className="text-2xl font-bold text-gray-900">{results.deficiencies?.length || 0}</div>
                       </div>
                     </div>
                     
                     {results.summary && (
                       <div className="border border-gray-200 rounded-lg p-4">
                         <div className="text-sm font-medium text-gray-600 mb-3">Clinical Summary</div>
                         <div className="text-sm text-gray-800 leading-relaxed font-medium">{results.summary}</div>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  ) : null;

  return (
    <>
      <SubModelPanel
        title="Nutrient Deficiency Detector"
        description="Analyze lab values to identify potential nutrient deficiencies and get personalized recommendations"
        backLink="/feature/nutrition"
        backLinkText="Back to Nutrition Tools"
        icon="🧪"
        inputPanel={inputPanel}
        outputPanel={outputPanel}
        isAnalyzing={isProcessing}
        progress={progress}
        onAnalyze={inputMethod === 'manual' ? handleManualAnalyze : handlePDFAnalyze}
        onReset={handleReset}
        canAnalyze={inputMethod === 'manual' ? Object.values(labValues).some(v => v.trim() !== '') : !!pdfFile}
        hideInputPanel={!!results}
      />
      
      {/* Disclaimer */}
      {results && (
        <Card className="medical-card mt-8 bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  Medical Disclaimer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This AI tool is for informational purposes only and should not replace professional medical advice, 
                  diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions. 
                  In case of emergency, contact emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default NutrientDeficiencyDetector;
