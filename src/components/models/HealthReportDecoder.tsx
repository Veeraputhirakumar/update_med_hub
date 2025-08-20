import { useState, useRef } from 'react';
import { Upload, FileText, TrendingUp, CheckCircle, AlertCircle, Download } from 'lucide-react';
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
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Patient Information State
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    dateOfBirth: '',
    patientId: '',
    contactNumber: '',
    email: '',
    referringPhysician: '',
    dateOfTest: '',
    chiefComplaint: '',
    currentMedications: '',
    medicalHistory: '',
    height: '',
    weight: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: ''
  });

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

  const analyzeWithGemini = async (text: string): Promise<any> => {
    const prompt = `Analyze the following health report/lab results and provide a comprehensive summary. Please structure your response as JSON with the following format:

{
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
    "normal": ["List any values that are within normal range"],
    "abnormal": ["List any values that are outside normal range with details"]
  },
  "riskLevel": "Low/Medium/High",
  "nextSteps": [
    "List recommended next steps for the patient"
  ],
  "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice"
}

Health Report Text:
${text}

Please analyze this health report and provide the structured response above. Focus on identifying the most important findings, any abnormal values, and actionable recommendations.`;

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
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload Health Report PDF
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose PDF
          </Button>
        </div>

        {pdfFile && (
          <div className="mt-4 p-3 bg-accent/20 rounded-lg border">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium text-foreground">{pdfFile.name}</div>
                <div className="text-muted-foreground">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="text-blue-800 text-sm">
            <p className="font-medium">AI-Powered Analysis</p>
            <p className="text-blue-700">
              This tool uses OCR Space API to extract text from PDFs and Gemini AI to analyze and summarize key findings from your health reports.
            </p>
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
          {isProcessing ? 'Analyzing...' : 'Analyze Health Report'}
        </Button>
        {isProcessing && (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            Processing PDF...
          </div>
        )}
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

      <div className="rounded-lg border p-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">Analysis Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getSignificanceColor(results.riskLevel)}>
              {results.riskLevel} Risk
            </Badge>
          </div>
        </div>
        {results.summary && (
          <p className="text-sm text-muted-foreground mt-2">{results.summary}</p>
        )}
      </div>

             {/* Summary banner */}
       <div className="rounded-lg border p-4 mb-4 bg-primary/5">
         <div className="flex flex-wrap items-center gap-2">
           {results.riskLevel && <Badge variant={results.riskLevel === 'High' ? 'destructive' : results.riskLevel === 'Medium' ? 'secondary' : 'default'}>{results.riskLevel} Risk</Badge>}
           {results.criticalAlerts && results.criticalAlerts.length > 0 && <Badge variant="destructive">{results.criticalAlerts.length} Critical Alerts</Badge>}
           {results.keyFindings && results.keyFindings.length > 0 && <Badge variant="outline">{results.keyFindings.length} Key Findings</Badge>}
         </div>
         {results.summary && (
           <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
             {results.summary}
           </p>
         )}
       </div>

       {/* Main Content Tabs */}
       <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
         <TabsTrigger value="overview">Overview</TabsTrigger>
         <TabsTrigger value="findings">Key Findings</TabsTrigger>
         <TabsTrigger value="care">Care & Tests</TabsTrigger>
         <TabsTrigger value="meds">Medication Guidance</TabsTrigger>
         <TabsTrigger value="sources">Sources</TabsTrigger>
       </TabsList>

             <TabsContent value="overview" className="mt-4">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Key Findings Overview - Clean Progress Bars */}
           <div className="rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-4">Key Findings Overview</h3>
             {Array.isArray(results.keyFindings) && results.keyFindings.length > 0 && (
               <div className="space-y-4">
                 {/* Overall Summary */}
                 <div className="text-center p-4 bg-background/40 rounded-lg border">
                   <div className="text-2xl font-bold text-primary mb-1">{results.keyFindings.length}</div>
                   <div className="text-sm text-muted-foreground">Total Findings</div>
                 </div>

                 {/* Individual Finding Bars */}
                 <div className="space-y-3">
                   {results.keyFindings.slice(0, 5).map((finding: any, index: number) => {
                     const significanceValue = finding.significance === 'High' ? 100 : 
                                            finding.significance === 'Medium' ? 66 : 33;
                     const barColor = finding.significance === 'High' ? 'bg-destructive' : 
                                    finding.significance === 'Medium' ? 'bg-secondary' : 'bg-success';
                     
                     return (
                       <div key={index} className="space-y-2">
                         <div className="flex items-center justify-between text-sm">
                           <span className="font-medium text-foreground truncate flex-1 mr-2">
                             {finding.finding}
                           </span>
                           <Badge variant="outline" className={getSignificanceColor(finding.significance)}>
                             {finding.significance}
                           </Badge>
                         </div>
                         <div className="w-full bg-muted rounded-full h-2">
                           <div 
                             className={`${barColor} h-2 rounded-full transition-all duration-500 ease-out`}
                             style={{ width: `${significanceValue}%` }}
                           />
                         </div>
                         <div className="flex items-center justify-between text-xs text-muted-foreground">
                           <span>{finding.category}</span>
                           <span>{significanceValue}% significance</span>
                         </div>
                       </div>
                     );
                   })}
                 </div>

                 {/* Quick Stats */}
                 <div className="grid grid-cols-2 gap-3 pt-2">
                   <div className="text-center p-2 bg-destructive/10 rounded border border-destructive/20">
                     <div className="text-lg font-bold text-destructive">
                       {results.keyFindings.filter((f: any) => f.significance === 'High').length}
                     </div>
                     <div className="text-xs text-destructive/70">High Priority</div>
                   </div>
                   <div className="text-center p-2 bg-primary/10 rounded border border-primary/20">
                     <div className="text-lg font-bold text-primary">
                       {results.keyFindings.filter((f: any) => f.category === 'Alert').length}
                     </div>
                     <div className="text-xs text-primary/70">Alerts</div>
                   </div>
                 </div>
               </div>
             )}
           </div>

                     {/* Top Findings */}
           <div className="rounded-2xl border p-4 bg-gradient-to-br from-accent/10 via-background to-primary/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
             <h3 className="text-lg font-semibold text-foreground mb-4">Top Findings</h3>
             <div className="space-y-4">
               {results.keyFindings && results.keyFindings.length > 0 ? (
                 results.keyFindings.slice(0, 3).map((finding: any, index: number) => {
                   const significanceValue = finding.significance === 'High' ? 100 : 
                                          finding.significance === 'Medium' ? 66 : 33;
                   const barColor = finding.significance === 'High' ? 'bg-red-500' : 
                                  finding.significance === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
                   
                   return (
                     <div key={index} className="space-y-3">
                       {/* Finding Title */}
                       <div className="font-medium text-foreground text-sm leading-tight">
                         {finding.finding}
                       </div>
                       
                       {/* Significance Badge */}
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className={getSignificanceColor(finding.significance)}>
                           {finding.significance} Significance
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
                 })
               ) : (
                 <p className="text-muted-foreground italic text-center">No key findings identified</p>
               )}
               
               {/* Significance Legend */}
               <div className="pt-3 border-t">
                 <div className="flex items-center gap-3 text-xs text-muted-foreground">
                   <span className="inline-flex items-center gap-1">
                     <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> High
                   </span>
                   <span className="inline-flex items-center gap-1">
                     <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span> Medium
                   </span>
                   <span className="inline-flex items-center gap-1">
                     <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Low
                   </span>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Top Findings */}
         <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-accent/10 via-background to-primary/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
           <h3 className="text-lg font-semibold text-foreground mb-4">Top Findings</h3>
           <div className="space-y-3">
             {results.keyFindings && results.keyFindings.length > 0 ? (
               results.keyFindings.slice(0, 5).map((finding: any, index: number) => (
                 <div key={index} className="rounded-xl p-4 border bg-background/60 hover:bg-background transition-colors">
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-medium text-foreground">{finding.finding}</span>
                     <div className="flex items-center space-x-2">
                       <Badge variant="outline" className={getSignificanceColor(finding.significance)}>
                         {finding.significance} Significance
                       </Badge>
                       <span className="text-sm font-bold text-primary">
                         {finding.significance === 'High' ? '100%' : finding.significance === 'Medium' ? '66%' : '33%'}
                       </span>
                     </div>
                   </div>
                   <Progress 
                     value={finding.significance === 'High' ? 100 : finding.significance === 'Medium' ? 66 : 33} 
                     className="medical-progress h-2" 
                   />
                   {finding.details && (
                     <p className="text-xs text-muted-foreground mt-2">{finding.details}</p>
                   )}
                 </div>
               ))
             ) : (
               <p className="text-muted-foreground italic">No key findings identified</p>
             )}
           </div>
           {/* Significance legend */}
           <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
             <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> High</span>
             <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span> Medium</span>
             <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Low</span>
           </div>
         </div>

        {/* Next Steps */}
        {results.nextSteps && results.nextSteps.length > 0 && (
          <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
            <h3 className="text-lg font-semibold text-foreground mb-3">Next Steps</h3>
            <div className="space-y-2">
              {results.nextSteps.map((step: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="findings" className="mt-4">
        <div className="space-y-4">
          {results.keyFindings && results.keyFindings.length > 0 ? (
            results.keyFindings.map((finding: any, index: number) => (
              <div key={index} className="rounded-xl p-4 border bg-background/60 hover:bg-background transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">{finding.finding}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSignificanceColor(finding.significance)}>
                      {finding.significance} Significance
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(finding.category)}>
                      {finding.category}
                    </Badge>
                  </div>
                </div>
                {finding.details && (
                  <p className="text-sm text-muted-foreground">{finding.details}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">No key findings identified</p>
          )}
                 </div>
       </TabsContent>



               <TabsContent value="care" className="mt-4 space-y-6">
          {/* Lab Values Dashboard */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {results.labValues?.normal?.length || 0}
                </div>
                <div className="text-sm text-green-600">Normal Values</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {results.labValues?.abnormal?.length || 0}
                </div>
                <div className="text-sm text-red-600">Abnormal Values</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {results.recommendations?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Recommendations</div>
              </div>
            </div>

            {/* Lab Values - Interactive Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Normal Values */}
              <div className="group relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-green-800">Normal Values</h3>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {results.labValues?.normal && results.labValues.normal.length > 0 ? (
                    <div className="space-y-3">
                      {results.labValues.normal.map((value: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-100/50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-foreground text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">All values are within normal range</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Abnormal Values */}
              <div className="group relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-red-800">Abnormal Values</h3>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {results.labValues?.abnormal && results.labValues.abnormal.length > 0 ? (
                    <div className="space-y-3">
                      {results.labValues.abnormal.map((value: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-red-100/50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors duration-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-foreground text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                      <p className="text-green-600 font-medium">No abnormal values detected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-blue-800">Recommendations</h3>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {results.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-100/50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-foreground text-sm leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Tests */}
              {results.suggestedTests && results.suggestedTests.length > 0 && (
                <div className="group relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-purple-800">Suggested Tests</h3>
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {results.suggestedTests.map((test: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-purple-100/50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors duration-200">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-foreground text-sm leading-relaxed">{test}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

      <TabsContent value="meds" className="mt-4 space-y-4">
        {/* Medication guidance if provided */}
        {results.medications && results.medications.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">General medication guidance</div>
            <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
              {results.medications.map((m: string, i: number) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        <div className="rounded-lg border p-4 bg-warning/5 border-warning/20">
          <div className="text-xs text-muted-foreground">
            This guidance is informational and not a substitute for professional medical advice. Always consult a healthcare provider for prescriptions, dosing, and contraindications.
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sources" className="mt-4 space-y-4">
        {/* Raw Text Access */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Extracted Text</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([extractedText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'extracted_text.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Text
            </Button>
          </div>
          <ScrollArea className="h-96 w-full">
            <div className="p-4 bg-muted/20 rounded border">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {extractedText}
              </pre>
            </div>
          </ScrollArea>
        </div>

        {/* Sources if provided */}
        {results.sources && results.sources.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Sources</div>
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
