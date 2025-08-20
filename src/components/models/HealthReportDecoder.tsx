import { useState, useRef } from 'react';
import { Upload, FileText, TrendingUp, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import SubModelPanel from '../common/SubModelPanel';

const HealthReportDecoder = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Keys
  const OCR_SPACE_API_KEY = 'K87657393688957';
  const GEMINI_API_KEY = 'AIzaSyBUIwW1exVkPrqPT_jLtIRG1wiivEnRn9I';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) { // 10MB limit
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

    // Combine all extracted text
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
      // Try to parse the JSON response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      
      return JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
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
      // Step 1: Extract text from PDF (30%)
      setProgress(10);
      const extractedText = await extractTextFromPDF(pdfFile);
      setExtractedText(extractedText);
      setProgress(30);

      // Step 2: Analyze with Gemini AI (70%)
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
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'lab result': return 'primary';
      case 'diagnosis': return 'secondary';
      case 'recommendation': return 'success';
      case 'alert': return 'destructive';
      default: return 'default';
    }
  };

  const inputPanel = (
    <>
      {/* PDF Upload */}
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

        {/* File Info */}
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

      {/* API Information */}
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

      {/* Analyze Button and Loading */}
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

      {/* Progress Bar */}
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
      {/* Submitted context */}
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

      {/* Summary Banner */}
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Key Findings</TabsTrigger>
          <TabsTrigger value="labValues">Lab Values</TabsTrigger>
          <TabsTrigger value="rawText">Raw Text</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Alerts */}
            <div className="rounded-2xl border p-4 bg-gradient-to-br from-destructive/10 via-background to-destructive/5 backdrop-blur-sm shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Critical Alerts</h3>
              {results.criticalAlerts && results.criticalAlerts.length > 0 ? (
                <div className="space-y-3">
                  {results.criticalAlerts.map((alert: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{alert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No critical alerts identified</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl border p-4 bg-gradient-to-br from-success/10 via-background to-success/5 backdrop-blur-sm shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
              {results.recommendations && results.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {results.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-success/10 rounded-lg border border-success/20">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No specific recommendations</p>
              )}
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

          {/* Disclaimer */}
          {results.disclaimer && (
            <div className="mt-6 rounded-2xl border p-4 bg-warning/5 border-warning/20">
              <div className="text-xs text-muted-foreground">{results.disclaimer}</div>
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

        <TabsContent value="labValues" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Normal Values */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Normal Values</h3>
              {results.labValues?.normal && results.labValues.normal.length > 0 ? (
                <div className="space-y-2">
                  {results.labValues.normal.map((value: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No normal values identified</p>
              )}
            </div>

            {/* Abnormal Values */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Abnormal Values</h3>
              {results.labValues?.abnormal && results.labValues.abnormal.length > 0 ? (
                <div className="space-y-2">
                  {results.labValues.abnormal.map((value: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No abnormal values identified</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rawText" className="mt-4">
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
                Download
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
        </TabsContent>
      </Tabs>
    </div>
  ) : null;

  return (
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
  );
};

export default HealthReportDecoder;
