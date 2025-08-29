import { useState, useRef } from 'react';
import { Upload, FileText, TrendingUp, CheckCircle, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import SubModelPanel from '../common/SubModelPanel';
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart';
import { PieChart, Pie, Cell, PolarAngleAxis, RadialBarChart, RadialBar } from 'recharts';

const HealthReportDecoder = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Analysis Results Interface
  interface AnalysisResults {
    patientInfo?: {
      name?: string;
      age?: string;
      gender?: string;
      dateOfTest?: string;
      patientId?: string;
      referringPhysician?: string;
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      chiefComplaint?: string;
    };
    summary?: string;
    keyFindings?: Array<{
      finding: string;
      significance: string;
      category: string;
      details: string;
    }>;
    criticalAlerts?: string[];
    recommendations?: string[];
    labValues?: {
      normal?: string[];
      abnormal?: string[];
    };
    riskLevel?: string;
    nextSteps?: string[];
    disclaimer?: string;
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
    const prompt = `Analyze the following health report/lab results and provide a comprehensive summary. Please structure your response as JSON with the following format:

{
  "patientInfo": {
    "name": "Patient's full name if found in the document",
    "age": "Patient's age if found in the document",
    "gender": "Patient's gender if found in the document",
    "dateOfTest": "Date when the test/report was performed if found in the document",
    "patientId": "Patient ID or medical record number if found in the document",
    "referringPhysician": "Name of the referring physician if found in the document",
    "bloodPressure": "Blood pressure reading if found in the document",
    "heartRate": "Heart rate if found in the document",
    "temperature": "Body temperature if found in the document",
    "chiefComplaint": "Patient's chief complaint or reason for visit if found in the document"
  },
  "summary": "Brief overall summary of the health report",
  "keyFindings": [
    {
      "finding": "Description of the finding",
      "significance": "High/Medium/Low",
      "category": "Lab Result/Diagnosis/Recommendation/Alert",
      "details": "Additional details about this finding"
    }
  ],
  "criticalAlerts": [
    "List any critical or urgent findings that require immediate attention"
  ],
  "recommendations": [
    "List actionable recommendations based on the findings"
  ],
  "labValues": {
    "normal": ["List any lab values that are within normal range with specific values and units"],
    "abnormal": ["List any lab values that are outside normal range with specific values, units, and what the normal range should be"]
  },
  "riskLevel": "Low/Medium/High",
  "nextSteps": [
    "List recommended next steps for the patient"
  ],
  "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice"
}

Health Report Text:
${text}

Please analyze this health report and provide the structured response above. Focus on identifying the most important findings, any abnormal values, and actionable recommendations. For lab values, be specific about the actual values, units, and whether they fall within normal ranges. 

IMPORTANT: Extract any patient information (name, age, gender, test date, patient ID, referring physician, vital signs, chief complaint) that you can find in the document. If any information is not present in the document, set that field to null or omit it.`;

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
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini AI');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      
      return JSON.parse(jsonString);
    } catch (parseError) {
      return {
        patientInfo: {},
        summary: "Analysis completed but response format was unexpected",
        keyFindings: [],
        criticalAlerts: [],
        recommendations: [],
        labValues: { normal: [], abnormal: [] },
        riskLevel: "Unknown",
        nextSteps: [],
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice",
        rawResponse: responseText
      };
    }
  };

  const handleAnalyze = async () => {
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
      setProgress(100);

      setResults({
        ...analysisResults,
        fileName: pdfFile.name,
        uploadTime: new Date().toISOString(),
        fileSize: pdfFile.size
      });

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance?.toLowerCase()) {
      case 'high':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'medium':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'low':
        return 'bg-default text-default-foreground hover:bg-default/90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'alert':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'lab result':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'finding':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      case 'medium':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      case 'low':
        return 'bg-default text-default-foreground hover:bg-default/90';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/90';
    }
  };

  const ChartTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {payload[0].name}
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].value}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartLegendContent = () => {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {results?.keyFindings?.map((finding: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: ['#4f46e5', '#06b6d4', '#22c55e', '#eab308', '#ef4444'][i % 5] }}
            />
            <span className="text-muted-foreground">{finding.finding}</span>
          </div>
        ))}
      </div>
    );
  };

  const inputPanel = (
    <>
      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload Health Report PDF *
        </label>
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
                Drag and drop or click to select health report PDF
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
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
        
        {/* Processing Overlay with Centered Circle */}
        {isProcessing && (
          <div className="mt-4 relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-blue-400 animate-spin"></div>
                  <div className="absolute inset-4 rounded-full bg-blue-500 animate-ping"></div>
                </div>
                <div className="text-sm font-medium text-blue-700">Processing PDF...</div>
                <div className="text-xs text-blue-600 mt-1">{progress}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Professional Feature Overview */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">AI-Powered Health Report Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
              Advanced OCR technology extracts text from your health reports, while cutting-edge AI analyzes and summarizes key findings, 
              providing you with actionable insights and comprehensive health assessments.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-700">OCR Technology</span>
          </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-xs font-medium text-indigo-700">AI Analysis</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-medium text-emerald-700">Smart Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={!pdfFile || isProcessing}
          className="btn-medical text-white"
        >
          {isProcessing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
      </div>

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
      <div className="text-6xl mb-4 opacity-50">📋</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Analysis
      </h3>
      <p className="text-sm text-muted-foreground">
        Upload a health report PDF and click "Analyze Health Report" to get AI-powered insights
      </p>
      {error ? (
        <p className="text-sm text-destructive mt-4">{error}</p>
      ) : null}
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-lg border p-3 bg-accent/20">
        <div className="flex items-start gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div className="text-sm">
            <div className="font-medium text-foreground">Analyzed Report</div>
            <div className="text-muted-foreground">
              {results.fileName} • {(results.fileSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>



             {/* Analysis Summary */}
         {results.summary && (
           <div className="rounded-lg border p-4 mb-4 bg-gradient-to-br from-blue-10 via-background to-blue-5 backdrop-blur-sm shadow-lg">
             <div className="flex items-start gap-3">
               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                 <FileText className="w-4 h-4 text-blue-600" />
          </div>
               <div className="flex-1">
                 <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Summary</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {results.summary}
                 </p>
          </div>
        </div>
      </div>
         )}

             {/* Summary banner */}
       <div className="rounded-lg border p-4 mb-4 bg-primary/5">
         <div className="flex flex-wrap items-center gap-2">
           {results.riskLevel && <Badge variant={results.riskLevel === 'High' ? 'destructive' : results.riskLevel === 'Medium' ? 'secondary' : 'default'}>{results.riskLevel} Risk</Badge>}
           {results.criticalAlerts && results.criticalAlerts.length > 0 && <Badge variant="destructive">{results.criticalAlerts.length} Critical Alerts</Badge>}
           {results.keyFindings && results.keyFindings.length > 0 && (
             <Badge variant="outline">{results.keyFindings.length} Key Findings</Badge>
           )}
           {results.labValues && (results.labValues.normal?.length > 0 || results.labValues.abnormal?.length > 0) ? (
             <Badge variant="outline">
               {results.labValues.normal?.length || 0} Normal, {results.labValues.abnormal?.length || 0} Abnormal
             </Badge>
           ) : (
             <Badge variant="outline">No Lab Values</Badge>
           )}
         </div>
       </div>

       {/* Patient Information - Above the tabs */}
       {results.patientInfo && Object.keys(results.patientInfo).some(key => results.patientInfo[key]) ? (
         <div className="mb-6 rounded-2xl border p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
               <FileText className="w-6 h-6 text-white" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-900">Patient Information</h3>
               <p className="text-sm text-blue-600 font-medium">Personal and medical details</p>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Basic Info */}
             <div className="bg-white/60 rounded-xl p-4 border border-blue-100/50">
               <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                 Basic Information
               </h4>
               <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Name:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.name || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Age:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.age || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Gender:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.gender || 'Not provided'}
                 </span>
                 </div>
               </div>
             </div>
             
             {/* Test Info */}
             <div className="bg-white/60 rounded-xl p-4 border border-blue-100/50">
               <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                 Test Information
               </h4>
               <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Test Date:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.dateOfTest || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Patient ID:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.patientId || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Referring Physician:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.referringPhysician || 'Not provided'}
                 </span>
                 </div>
               </div>
             </div>
             
             {/* Vital Signs */}
             <div className="bg-white/60 rounded-xl p-4 border border-blue-100/50">
               <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                 Vital Signs
               </h4>
               <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Blood Pressure:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.bloodPressure || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Heart Rate:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.heartRate || 'Not provided'}
                 </span>
               </div>
                 <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                   <span className="text-sm text-gray-600 font-medium">Temperature:</span>
                   <span className="text-sm font-semibold text-gray-900">
                   {results.patientInfo.temperature || 'Not provided'}
                 </span>
                 </div>
               </div>
             </div>
           </div>
           
           {/* Chief Complaint */}
           {results.patientInfo.chiefComplaint && (
             <div className="mt-6 pt-6 border-t border-blue-200">
               <div className="flex items-center gap-3 mb-3">
                 <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                 <h4 className="text-lg font-semibold text-blue-800">Chief Complaint</h4>
               </div>
               <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/50">
                 <p className="text-sm text-blue-800 leading-relaxed">
                 {results.patientInfo.chiefComplaint}
               </p>
               </div>
             </div>
         )}
       </div>
       ) : (
           <div className="mb-6 rounded-2xl border p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                 <FileText className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-gray-900">Patient Information</h3>
                 <p className="text-sm text-blue-600 font-medium">Personal and medical details</p>
               </div>
             </div>
             <div className="text-center py-8">
               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FileText className="w-8 h-8 text-blue-500" />
               </div>
               <p className="text-blue-600 font-medium">No patient information available</p>
               <p className="text-sm text-gray-500 mt-1">Patient information will be extracted and displayed here after analyzing the uploaded document.</p>
             </div>
         </div>
       )}

       {/* Main Content Tabs */}
       <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
         <TabsTrigger value="overview">Overview</TabsTrigger>
         <TabsTrigger value="normal-values">Normal Values</TabsTrigger>
         <TabsTrigger value="abnormal-values">Abnormal Values</TabsTrigger>
         <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
         <TabsTrigger value="report-details">Report Details</TabsTrigger>
       </TabsList>

             <TabsContent value="overview" className="mt-4">

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Lab Values Overview */}
           <div className="rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-4">Lab Values Overview</h3>
               <div className="space-y-4">
                 {/* Overall Summary */}
                 <div className="text-center p-4 bg-background/40 rounded-lg border">
                 <div className="text-2xl font-bold text-primary mb-1">
                   {(results.labValues?.normal?.length || 0) + (results.labValues?.abnormal?.length || 0)}
                 </div>
                 <div className="text-sm text-muted-foreground">Total Lab Values</div>
                 </div>

               {results.labValues && (results.labValues.normal?.length > 0 || results.labValues.abnormal?.length > 0) ? (
                 <>
                   {/* Lab Values Distribution */}
                 <div className="space-y-3">
                     <div className="space-y-2">
                         <div className="flex items-center justify-between text-sm">
                         <span className="font-medium text-foreground">Normal Values</span>
                         <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                           {results.labValues?.normal?.length || 0}
                           </Badge>
                         </div>
                         <div className="w-full bg-muted rounded-full h-2">
                           <div 
                           className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                           style={{ width: `${((results.labValues?.normal?.length || 0) / ((results.labValues?.normal?.length || 0) + (results.labValues?.abnormal?.length || 0))) * 100}%` }}
                           />
                         </div>
                         </div>
                     
                     <div className="space-y-2">
                       <div className="flex items-center justify-between text-sm">
                         <span className="font-medium text-foreground">Abnormal Values</span>
                         <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                           {results.labValues?.abnormal?.length || 0}
                         </Badge>
                       </div>
                       <div className="w-full bg-muted rounded-full h-2">
                         <div 
                           className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                           style={{ width: `${((results.labValues?.abnormal?.length || 0) / ((results.labValues?.normal?.length || 0) + (results.labValues?.abnormal?.length || 0))) * 100}%` }}
                         />
                       </div>
                     </div>
                 </div>

                                    {/* Quick Stats */}
                   <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="text-center p-2 bg-green-100 rounded border border-green-200">
                       <div className="text-lg font-bold text-green-700">
                         {results.labValues?.normal?.length || 0}
                       </div>
                       <div className="text-xs text-green-600">Normal</div>
                     </div>
                     <div className="text-center p-2 bg-red-100 rounded border border-red-200">
                       <div className="text-lg font-bold text-red-700">
                         {results.labValues?.abnormal?.length || 0}
                       </div>
                       <div className="text-xs text-red-600">Abnormal</div>
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-8">
                   <FileText className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                   <p className="text-blue-600 font-medium">No lab values identified</p>
                   <p className="text-sm text-muted-foreground mt-1">The analysis did not identify specific lab values</p>
                 </div>
               )}
             </div>
           </div>

           {/* Findings Summary */}
           <div className="rounded-2xl border p-4 bg-gradient-to-br from-purple-10 via-background to-purple-5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-4">Findings Summary</h3>
               {results.keyFindings && results.keyFindings.length > 0 ? (
               <div className="space-y-4">
                 {/* Overall Summary */}
                 <div className="text-center p-4 bg-background/40 rounded-lg border">
                   <div className="text-2xl font-bold text-primary mb-1">
                     {results.keyFindings.length}
                   </div>
                   <div className="text-sm text-muted-foreground">Total Findings</div>
                 </div>

                 {/* Top Findings with Progress Bars */}
                 <div className="space-y-3">
                   {results.keyFindings.slice(0, 4).map((finding: any, index: number) => {
                   const significanceValue = finding.significance === 'High' ? 100 : 
                                          finding.significance === 'Medium' ? 66 : 33;
                   const barColor = finding.significance === 'High' ? 'bg-red-500' : 
                                    finding.significance === 'Medium' ? 'bg-orange-500' : 'bg-green-500';
                   
                   return (
                       <div key={index} className="space-y-2">
                       {/* Finding Title */}
                       <div className="font-medium text-foreground text-sm leading-tight">
                         {finding.finding}
                       </div>
                       
                         {/* Significance Badge and Progress */}
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className={getSignificanceColor(finding.significance)}>
                             {finding.significance} Priority
                         </Badge>
                         <span className="text-sm font-bold text-primary">
                           {significanceValue}%
                         </span>
                       </div>
                       
                       {/* Progress Bar */}
                       <div className="w-full bg-muted rounded-full h-2">
                         <div 
                           className={`${barColor} h-2 rounded-full transition-all duration-500 ease-out`}
                           style={{ width: `${significanceValue}%` }}
                         />
                       </div>
                       
                       {/* Finding Details */}
                       {finding.details && (
                         <p className="text-xs text-muted-foreground leading-relaxed">
                           {finding.details}
                         </p>
                       )}
                     </div>
                   );
                   })}
                 </div>

                 {/* Quick Stats */}
                 <div className="grid grid-cols-3 gap-3 pt-2">
                   <div className="text-center p-2 bg-red-100 rounded border border-red-200">
                     <div className="text-lg font-bold text-red-700">
                       {results.keyFindings.filter((f: any) => f.significance === 'High').length}
                     </div>
                     <div className="text-xs text-red-600">High Priority</div>
                   </div>
                   <div className="text-center p-2 bg-orange-100 rounded border border-orange-200">
                     <div className="text-lg font-bold text-orange-700">
                       {results.keyFindings.filter((f: any) => f.significance === 'Medium').length}
                     </div>
                     <div className="text-xs text-orange-600">Medium Priority</div>
                   </div>
                   <div className="text-center p-2 bg-green-100 rounded border border-green-200">
                     <div className="text-lg font-bold text-green-700">
                       {results.keyFindings.filter((f: any) => f.significance === 'Low').length}
                     </div>
                     <div className="text-xs text-green-600">Low Priority</div>
                   </div>
                 </div>
               
                                {/* Significance Legend */}
                 <div className="pt-2 border-t">
                   <div className="flex items-center gap-3 text-xs text-muted-foreground">
                     <span className="inline-flex items-center gap-1">
                       <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> High
                     </span>
                     <span className="inline-flex items-center gap-1">
                       <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span> Medium
                     </span>
                     <span className="inline-flex items-center gap-1">
                       <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Low
                     </span>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-center py-8">
                 <FileText className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                 <p className="text-purple-600 font-medium">No findings identified</p>
                 <p className="text-sm text-muted-foreground mt-1">The analysis did not identify specific findings</p>
               </div>
             )}
           </div>

           
                     </div>

                   

                 {/* Critical Alerts Summary */}
         {results.criticalAlerts && results.criticalAlerts.length > 0 && (
           <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-amber-10 via-background to-amber-5">
             <h3 className="text-lg font-semibold text-foreground mb-3">Critical Alerts</h3>
             <div className="space-y-2">
               {results.criticalAlerts.map((alert: string, index: number) => (
                 <div key={index} className="flex items-start space-x-3">
                   <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                   <span className="text-foreground">{alert}</span>
                 </div>
               ))}
             </div>
           </div>
         )}
       </TabsContent>

      <TabsContent value="top-findings" className="mt-4">
        <div className="space-y-8">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">Top Findings & Important Results</h2>
                  <p className="text-purple-700">Key insights and critical information</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-900">
                  {results.keyFindings?.length || 0}
                </div>
                <div className="text-sm text-purple-700">Total Findings</div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {results.keyFindings?.filter((f: any) => f.significance === 'High').length || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">High Priority</div>
                <div className="w-16 h-1 bg-red-200 rounded-full mx-auto mt-2"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {results.keyFindings?.filter((f: any) => f.significance === 'Medium').length || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Medium Priority</div>
                <div className="w-16 h-1 bg-orange-200 rounded-full mx-auto mt-2"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.keyFindings?.filter((f: any) => f.significance === 'Low').length || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Low Priority</div>
                <div className="w-16 h-1 bg-blue-200 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
          </div>

          {/* Top Findings by Priority */}
          <div className="space-y-6">
            {/* High Priority Findings */}
            {results.keyFindings && results.keyFindings.filter((f: any) => f.significance === 'High').length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-red-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">High Priority Findings</h3>
                    <span className="ml-auto px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      {results.keyFindings.filter((f: any) => f.significance === 'High').length}
                       </span>
                     </div>
                   </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {results.keyFindings.filter((f: any) => f.significance === 'High').map((finding: any, index: number) => (
                      <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-l-red-400 hover:bg-red-100 transition-colors duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm mb-1">{finding.finding}</div>
                   {finding.details && (
                              <p className="text-xs text-gray-600 leading-relaxed">{finding.details}</p>
                   )}
                 </div>
                          <div className="ml-auto">
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">High Priority</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medium Priority Findings */}
            {results.keyFindings && results.keyFindings.filter((f: any) => f.significance === 'Medium').length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-orange-900">Medium Priority Findings</h3>
                    <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      {results.keyFindings.filter((f: any) => f.significance === 'Medium').length}
                    </span>
           </div>
           </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {results.keyFindings.filter((f: any) => f.significance === 'Medium').map((finding: any, index: number) => (
                      <div key={index} className="p-4 bg-orange-50 rounded-lg border-l-4 border-l-orange-400 hover:bg-orange-100 transition-colors duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm mb-1">{finding.finding}</div>
                            {finding.details && (
                              <p className="text-xs text-gray-600 leading-relaxed">{finding.details}</p>
                            )}
         </div>
                          <div className="ml-auto">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Medium Priority</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Low Priority Findings */}
            {results.keyFindings && results.keyFindings.filter((f: any) => f.significance === 'Low').length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Low Priority Findings</h3>
                    <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {results.keyFindings.filter((f: any) => f.significance === 'Low').length}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {results.keyFindings.filter((f: any) => f.significance === 'Low').map((finding: any, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-400 hover:bg-blue-100 transition-colors duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm mb-1">{finding.finding}</div>
                            {finding.details && (
                              <p className="text-xs text-gray-600 leading-relaxed">{finding.details}</p>
                            )}
                          </div>
                          <div className="ml-auto">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Low Priority</span>
                          </div>
                        </div>
                </div>
              ))}
                  </div>
            </div>
          </div>
        )}

            {/* No Findings Message */}
            {(!results.keyFindings || results.keyFindings.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-600 font-medium">No findings identified</p>
                <p className="text-sm text-gray-500 mt-1">The analysis did not identify specific findings</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

            <TabsContent value="normal-values" className="mt-4">
         {/* Normal Values & Priority Findings */}
         <div className="relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 rounded-2xl"></div>
           <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50">
             <div className="p-6">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                   <CheckCircle className="w-6 h-6 text-white" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-xl font-bold text-gray-900">Normal Values & Low Priority Findings</h3>
                   <p className="text-sm text-indigo-600 font-medium">Healthy ranges and minimal concerns</p>
                 </div>
                 <div className="flex gap-6">
                   <div className="text-center">
                     <div className="text-2xl font-bold text-indigo-600">{results.labValues?.normal?.length || 0}</div>
                     <div className="text-sm text-gray-600">Normal Values</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-indigo-600">{results.keyFindings?.filter((f: any) => f.significance === 'Low').length || 0}</div>
                     <div className="text-sm text-gray-600">Low Priority</div>
                   </div>
                 </div>
          </div>



          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Normal Lab Values */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Normal Lab Values</h4>
              {results.labValues?.normal && results.labValues.normal.length > 0 ? (
                <div className="space-y-3">
                  {results.labValues.normal.map((value: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-green-100/50 hover:bg-white/80 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No normal values identified</p>
                </div>
              )}
            </div>

            {/* Low Priority Findings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Low Priority Findings</h4>
                              {results.keyFindings && results.keyFindings.filter((f: any) => f.significance === 'Low').length > 0 ? (
                  <div className="space-y-3">
                    {results.keyFindings.filter((f: any) => f.significance === 'Low').map((finding: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100/50 hover:bg-white/80 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800 leading-relaxed">{finding.finding}</span>
                {finding.details && (
                          <p className="text-xs text-gray-600 mt-1">{finding.details}</p>
                )}
                      </div>
              </div>
                    ))}
                  </div>
          ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No low priority findings</p>
                  </div>
          )}
            </div>
          </div>
            </div>
          </div>
                 </div>
       </TabsContent>

            <TabsContent value="abnormal-values" className="mt-4">
          <div className="space-y-6">
          {/* Header with Logo and Stats */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Abnormal Values & Priority Findings</h2>
              <p className="text-sm text-indigo-600 font-medium">Values requiring attention and monitoring</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{results.labValues?.abnormal?.length || 0}</div>
                <div className="text-sm text-gray-600">Abnormal Values</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{results.keyFindings?.filter((f: any) => f.significance === 'High' || f.significance === 'Medium').length || 0}</div>
                <div className="text-sm text-gray-600">High/Medium Priority</div>
              </div>
            </div>
          </div>
              
                     {/* Content */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
             {/* Abnormal Lab Values */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Abnormal Lab Values</h4>
              {results.labValues?.abnormal && results.labValues.abnormal.length > 0 ? (
                <div className="space-y-3">
                  {results.labValues.abnormal.map((value: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-green-100/50 hover:bg-white/80 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No abnormal values detected</p>
                </div>
              )}
            </div>
              
            {/* High/Medium Priority Findings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Priority Findings</h4>
              {results.keyFindings && results.keyFindings.filter((f: any) => f.significance === 'High' || f.significance === 'Medium').length > 0 ? (
                <div className="space-y-3">
                  {results.keyFindings.filter((f: any) => f.significance === 'High' || f.significance === 'Medium').map((finding: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border hover:bg-white/80 transition-colors" style={{
                      borderColor: finding.significance === 'High' ? 'rgb(254 202 202)' : 'rgb(254 215 170)',
                      borderWidth: '1px'
                    }}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        finding.significance === 'High' ? 'bg-red-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800 leading-relaxed">{finding.finding}</span>
                      {finding.details && (
                          <p className="text-xs text-gray-600 mt-1">{finding.details}</p>
                      )}
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          finding.significance === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {finding.significance} Priority
                        </span>
                        </div>
                </div>
              </div>
                  ))}
            </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No priority findings identified</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="recommendations" className="mt-4">
        <div className="space-y-6">
                    {/* Header with Logo and Stats */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Recommendations & Next Steps</h2>
              <p className="text-sm text-indigo-600 font-medium">Actionable guidance and follow-up actions</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{results.recommendations?.length || 0}</div>
                <div className="text-sm text-gray-600">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{results.nextSteps?.length || 0}</div>
                <div className="text-sm text-gray-600">Next Steps</div>
              </div>
            </div>
          </div>

                     {/* Content Side by Side */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
             {/* Recommendations Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Actionable Recommendations</h3>
              </div>
              
                              {results.recommendations && results.recommendations.length > 0 ? (
                    <div className="space-y-3">
                    {results.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-800">{rec}</span>
                        </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No recommendations available</p>
                    </div>
                  )}
              </div>

            {/* Next Steps Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recommended Next Steps</h3>
                    </div>
              
                              {results.nextSteps && results.nextSteps.length > 0 ? (
                    <div className="space-y-3">
                    {results.nextSteps.map((step: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-800">{step}</span>
                        </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No next steps identified</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
      </TabsContent>





      <TabsContent value="report-details" className="mt-4 space-y-6">
        {/* Report Analysis Details */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Report Analysis Details</h3>
                  <p className="text-sm text-indigo-600 font-medium">Comprehensive analysis summary</p>
                </div>
              </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-indigo-100/50">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Analysis Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Analysis Date:</span>
                        <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Risk Level:</span>
                        <Badge variant="outline" className={getRiskColor(results.riskLevel)}>
                          {results.riskLevel || 'Not specified'}
                        </Badge>
                    </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Findings:</span>
                        <span className="text-sm font-medium text-gray-900">{results.keyFindings?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-indigo-100/50">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Lab Values Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Normal Values:</span>
                        <span className="text-sm font-medium text-gray-900">{results.labValues?.normal?.length || 0}</span>
                        </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Abnormal Values:</span>
                        <span className="text-sm font-medium text-gray-900">{results.labValues?.abnormal?.length || 0}</span>
                    </div>
                  </div>
                </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-indigo-100/50">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Recommendations Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Actionable Recommendations:</span>
                        <span className="text-sm font-medium text-gray-900">{results.recommendations?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next Steps:</span>
                        <span className="text-sm font-medium text-gray-900">{results.nextSteps?.length || 0}</span>
                    </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Critical Alerts:</span>
                        <span className="text-sm font-medium text-gray-900">{results.criticalAlerts?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-indigo-100/50">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Patient Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Patient Data:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.patientInfo && Object.keys(results.patientInfo).some(key => results.patientInfo[key]) ? 'Available' : 'Not provided'}
                        </span>
                        </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">File Name:</span>
                        <span className="text-sm font-medium text-gray-900">{results.fileName || 'Unknown'}</span>
                    </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">File Size:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {results.fileSize ? `${(results.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                        </span>
                  </div>
                </div>
            </div>
          </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Value Trend Predictions */}
        <div className="mt-8 rounded-2xl border p-6 bg-gradient-to-br from-yellow-10 via-background to-yellow-5 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Lab Value Trend Predictions</h3>
              <p className="text-sm text-yellow-600 font-medium">AI-powered future trend analysis</p>
            </div>
          </div>
          
          <div className="bg-white/60 rounded-xl p-4 border border-yellow-100/50">
            <h4 className="text-sm font-semibold text-yellow-700 mb-3 uppercase tracking-wide">Next 5 Predictions (2-Week Intervals)</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Prediction Period:</span>
                    <span className="font-medium text-gray-900">2-week intervals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Predictions:</span>
                    <span className="font-medium text-gray-900">5 future dates</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Analysis Method:</span>
                    <span className="font-medium text-gray-900">AI Trend Analysis</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Data Requirements:</span>
                    <span className="font-medium text-gray-900">Minimum 2 data points</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Prediction Accuracy:</span>
                    <span className="font-medium text-gray-900">Trend-based</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Update Frequency:</span>
                    <span className="font-medium text-gray-900">Real-time</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="font-medium">How It Works</span>
                </div>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Enter lab values for at least 2 different dates</p>
                  <p>• AI analyzes trends and predicts next 5 values</p>
                  <p>• Predictions are spaced at 2-week intervals</p>
                  <p>• Based on historical data patterns and medical trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Analysis */}
        {results.recommendations && results.recommendations.length > 0 && (
          <div className="mt-8 rounded-2xl border p-6 bg-gradient-to-br from-green-10 via-background to-green-5 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
          </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recommendations Analysis</h3>
                <p className="text-sm text-green-600 font-medium">Actionable health improvement steps</p>
              </div>
              <div className="ml-auto">
                <div className="px-3 py-1 bg-green-100 rounded-full">
                  <span className="text-sm font-semibold text-green-800">
                    {results.recommendations.length} Recommendations
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actionable Recommendations */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Actionable Recommendations</h4>
                <div className="space-y-3">
                  {results.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-green-100/50 hover:bg-white/80 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-800 leading-relaxed">{rec}</span>
          </div>
                  ))}
        </div>
              </div>

              {/* Next Steps */}
              {results.nextSteps && results.nextSteps.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Next Steps</h4>
                  <div className="space-y-3">
                    {results.nextSteps.map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100/50 hover:bg-white/80 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-800 leading-relaxed">{step}</span>
          </div>
                    ))}
            </div>
                </div>
              )}
        </div>

            {/* Critical Alerts */}
            {results.criticalAlerts && results.criticalAlerts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-amber-200">
                <h4 className="text-lg font-semibold text-amber-800 mb-3">Critical Alerts</h4>
                <div className="space-y-3">
                  {results.criticalAlerts.map((alert: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-lg border border-amber-200/50">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-amber-800 leading-relaxed">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sources if provided */}
        {results.sources && results.sources.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Reference Sources</div>
            <ul className="list-disc pl-5 text-sm text-foreground">
              {results.sources.map((s: any, i: number) => (
                <li key={i}><a className="text-primary underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
              ))}
            </ul>
          </div>
                              )}
           </TabsContent>
         </Tabs>
       </div>
     ) : null;

  return (
    <>
      <SubModelPanel
        title="Health Report Decoder"
        description="Upload health report PDFs for AI-powered OCR text extraction and intelligent analysis"
        backLink="/feature/diagnosis"
        backLinkText="Back to Diagnosis Tools"
        icon="📋"
        inputPanel={inputPanel}
        outputPanel={outputPanel}
        isAnalyzing={isProcessing}
        progress={progress}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        canAnalyze={!!pdfFile}
        hideInputPanel={!!results}
      />
      
      {/* Disclaimer */}
      {results && (
        <Card className="medical-card mt-8 bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
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

export default HealthReportDecoder;
