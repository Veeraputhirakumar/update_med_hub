import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, CheckCircle, TrendingUp, FileText, Calendar, Activity, Target, Clock, Plus, Trash2, BarChart3, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeLabTrendsWithGemini, type LabTrendResult, type LabValueTrend } from '@/lib/gemini';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine, ReferenceArea } from 'recharts';

interface LabRecord {
  date: string;
  hemoglobin: string;
  wbc: string;
  platelets: string;
  glucose: string;
  creatinine: string;
  cholesterol: string;
  hba1c: string;
}

interface ChartDataPoint {
  date: string;
  originalDate: string;
  Hemoglobin: number | null;
  WBC: number | null;
  Platelets: number | null;
  Glucose: number | null;
  Creatinine: number | null;
  Cholesterol: number | null;
  HbA1c: number | null;
  type: 'historical' | 'prediction';
  predictionIndex?: number;
}

const LabValueTrendResult = () => {
  const [labRecords, setLabRecords] = useState<LabRecord[]>([
    {
      date: '',
      hemoglobin: '',
      wbc: '',
      platelets: '',
      glucose: '',
      creatinine: '',
      cholesterol: '',
      hba1c: ''
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<LabTrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Function to calculate next 5 prediction dates based on user input dates
  const calculateNextPredictionDates = (): string[] => {
    const validRecords = labRecords.filter(record => record.date.trim() !== '');
    if (validRecords.length === 0) return [];

    // Sort dates to find the latest date
    const sortedDates = validRecords
      .map(record => new Date(record.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const latestDate = sortedDates[0];
    const predictionDates: string[] = [];

    // Calculate next 5 dates (every 2 weeks)
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(latestDate);
      nextDate.setDate(nextDate.getDate() + (i * 14)); // 14 days = 2 weeks
      predictionDates.push(nextDate.toISOString().split('T')[0]);
    }

    return predictionDates;
  };

  const addMonth = () => {
    setLabRecords([...labRecords, {
      date: '',
      hemoglobin: '',
      wbc: '',
      platelets: '',
      glucose: '',
      creatinine: '',
      cholesterol: '',
      hba1c: ''
    }]);
  };

  const removeMonth = (index: number) => {
    if (labRecords.length > 1) {
      setLabRecords(labRecords.filter((_, i) => i !== index));
    }
  };

  const updateLabRecord = (index: number, field: keyof LabRecord, value: string) => {
    const updatedRecords = [...labRecords];
    updatedRecords[index] = { ...updatedRecords[index], [field]: value };
    setLabRecords(updatedRecords);
  };

  const parseLabData = (): Array<{ date: string; [key: string]: string | number }> => {
    return labRecords
      .filter(record => record.date.trim() !== '')
      .map(record => ({
        date: record.date,
        Hemoglobin: record.hemoglobin ? parseFloat(record.hemoglobin) : 0,
        WBC: record.wbc ? parseFloat(record.wbc) : 0,
        Platelets: record.platelets ? parseFloat(record.platelets) : 0,
        Glucose: record.glucose ? parseFloat(record.glucose) : 0,
        Creatinine: record.creatinine ? parseFloat(record.creatinine) : 0,
        Cholesterol: record.cholesterol ? parseFloat(record.cholesterol) : 0,
        HbA1c: record.hba1c ? parseFloat(record.hba1c) : 0
      }));
  };

  const handleAnalyze = async () => {
    const validRecords = labRecords.filter(record => record.date.trim() !== '');
    if (validRecords.length < 2) {
              setError('Please provide at least 2 entries of lab data for trend analysis.');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);
    setError(null);
    
    if (abortController) {
      abortController.abort();
    }
    const controller = new AbortController();
    setAbortController(controller);

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 95 ? prev : prev + 5));
    }, 200);

    try {
      const parsedData = parseLabData();
      if (parsedData.length === 0) {
        throw new Error('No valid lab data provided. Please check your entries.');
      }

      const aiResults = await analyzeLabTrendsWithGemini({
        labData: parsedData,
        patientAge: '',
        patientGender: '',
        monthsToPredict: 5 // Always predict 5 entries ahead
      });
      
      setResults(aiResults);
      setSelectedTrendIndex(0);
      setProgress(100);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setLabRecords([{
      date: '',
      hemoglobin: '',
      wbc: '',
      platelets: '',
      glucose: '',
      creatinine: '',
      cholesterol: '',
      hba1c: ''
    }]);
    setResults(null);
    setProgress(0);
    setError(null);
    setSelectedTrendIndex(0);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      case 'Critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Critical': return 'bg-red-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Increasing': return '↗️';
      case 'Decreasing': return '↘️';
      case 'Stable': return '→';
      case 'Fluctuating': return '↕️';
      default: return '→';
    }
  };

  // Helper functions for parameter descriptions
  const getParameterDescription = (parameter: string) => {
    switch (parameter) {
      case 'Hemoglobin': return 'Oxygen-carrying protein in red blood cells';
      case 'WBC': return 'White blood cell count for immune function';
      case 'Platelets': return 'Blood cells responsible for clotting';
      case 'Glucose': return 'Blood sugar level for energy metabolism';
      case 'Creatinine': return 'Waste product indicating kidney function';
      case 'Cholesterol': return 'Fat-like substance in blood vessels';
      case 'HbA1c': return 'Long-term average blood sugar control';
      default: return 'Laboratory measurement value';
    }
  };

  const getHealthSignificance = (parameter: string, riskLevel: string) => {
    const baseSignificance = {
      'Hemoglobin': 'Essential for oxygen delivery to tissues',
      'WBC': 'Critical for fighting infections and immunity',
      'Platelets': 'Vital for blood clotting and wound healing',
      'Glucose': 'Primary energy source for body cells',
      'Creatinine': 'Key indicator of kidney health',
      'Cholesterol': 'Important for cell structure and hormones',
      'HbA1c': 'Reflects 3-month blood sugar control'
    };

    const riskContext = {
      'Low': 'Current levels are within healthy range',
      'Medium': 'Levels may need monitoring and lifestyle adjustments',
      'High': 'Requires medical attention and intervention',
      'Critical': 'Immediate medical evaluation recommended'
    };

    return `${baseSignificance[parameter as keyof typeof baseSignificance] || 'Important health indicator'}. ${riskContext[riskLevel as keyof typeof riskContext] || 'Monitor closely'}.`;
  };

  const getTrendMeaning = (trend: string, parameter: string) => {
    const trendDescriptions = {
      'Increasing': {
        'Hemoglobin': 'May indicate improved oxygen capacity or dehydration',
        'WBC': 'Could suggest infection, inflammation, or stress response',
        'Platelets': 'May indicate clotting disorders or bone marrow issues',
        'Glucose': 'Could suggest diabetes or metabolic stress',
        'Creatinine': 'May indicate kidney strain or dehydration',
        'Cholesterol': 'Could suggest cardiovascular risk factors',
        'HbA1c': 'May indicate worsening blood sugar control'
      },
      'Decreasing': {
        'Hemoglobin': 'May indicate anemia or blood loss',
        'WBC': 'Could suggest immune suppression or bone marrow issues',
        'Platelets': 'May indicate bleeding risk or bone marrow problems',
        'Glucose': 'Could suggest improved control or hypoglycemia',
        'Creatinine': 'May indicate improved kidney function',
        'Cholesterol': 'Could suggest improved cardiovascular health',
        'HbA1c': 'May indicate better blood sugar management'
      },
      'Stable': {
        'Hemoglobin': 'Consistent oxygen-carrying capacity',
        'WBC': 'Maintained immune system function',
        'Platelets': 'Consistent clotting ability',
        'Glucose': 'Stable blood sugar control',
        'Creatinine': 'Consistent kidney function',
        'Cholesterol': 'Stable cardiovascular risk profile',
        'HbA1c': 'Consistent long-term blood sugar control'
      }
    };

    return trendDescriptions[trend as keyof typeof trendDescriptions]?.[parameter as keyof typeof trendDescriptions.Increasing] || 'Trend indicates changes in this health parameter';
  };

  // Prepare chart data for visualization
  const getChartData = (): ChartDataPoint[] => {
    const historicalData: ChartDataPoint[] = labRecords
      .filter(record => record.date.trim() !== '')
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        originalDate: record.date,
        Hemoglobin: record.hemoglobin ? parseFloat(record.hemoglobin) : null,
        WBC: record.wbc ? parseFloat(record.wbc) : null,
        Platelets: record.platelets ? parseFloat(record.platelets) : null,
        Glucose: record.glucose ? parseFloat(record.glucose) : null,
        Creatinine: record.creatinine ? parseFloat(record.creatinine) : null,
        Cholesterol: record.cholesterol ? parseFloat(record.cholesterol) : null,
        HbA1c: record.hba1c ? parseFloat(record.hba1c) : null,
        type: 'historical' as const
      }));

    // Add predicted values if we have results
    if (results && results.trends && results.trends.length > 0) {
      // Get the next 5 prediction dates
      const predictionDates = calculateNextPredictionDates();
      
      // Create predictions for the next 5 dates
      const predictions: ChartDataPoint[] = predictionDates.map((predDate, index) => {
        const dateLabel = new Date(predDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return {
          date: dateLabel,
          originalDate: predDate,
            Hemoglobin: null,
            WBC: null,
            Platelets: null,
            Glucose: null,
            Creatinine: null,
            Cholesterol: null,
          HbA1c: null,
          type: 'prediction' as const,
          predictionIndex: index + 1
        };
          });
        
        // Now populate the predictions with actual values from AI results
        results.trends.forEach(trend => {
          const parameterKey = trend.parameter;
          if (trend.nextPrediction && predictions[0]) {
          // Distribute predictions across the 5 future dates
          const predictionValue = trend.nextPrediction;
          const currentValue = trend.currentValue;
          const increment = (predictionValue - currentValue) / 5;
          
          predictions.forEach((pred, index) => {
            const calculatedValue = currentValue + (increment * (index + 1));
            (pred as any)[parameterKey] = Math.round(calculatedValue * 100) / 100;
          });
        }
      });
      
      return [...historicalData, ...predictions];
    }

    return historicalData;
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/feature/health-reports" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Health Reports
          </Link>
          
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Lab Value Trend Analysis
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                                      Enter historical lab data with dates to automatically predict the next 5 values 
              and identify potential health risks using AI-powered analysis.
            </p>
          </div>
        </div>





        <div className="grid grid-cols-1 gap-8">
          {/* Input Panel */}
          {!results && (
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <span>Lab Data Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Validation Status */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${labRecords.filter(r => r.date.trim() !== '').length >= 2 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {labRecords.filter(r => r.date.trim() !== '').length >= 2 
                          ? 'Ready for Analysis' 
                          : 'Need More Data'}
                      </span>
                    </div>
                                          <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {labRecords.filter(r => r.date.trim() !== '').length} of {labRecords.length} entries filled
                        </div>
                        <div className="text-xs text-gray-500">
                          Minimum 2 entries required
                        </div>
                      </div>
                  </div>
                </div>

                {/* Lab Data Input - Entry by Entry */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Label className="block text-base font-semibold text-foreground mb-2">
                      Lab Data by Entry *
                    </Label>
                      <p className="text-xs text-muted-foreground">
                        Enter your lab values with dates. At least 2 data points are required for trend analysis. 
                        The system will automatically predict the next 5 values.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={addMonth}
                      className="bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary/80 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {labRecords.map((record, index) => (
                      <div key={index} className="relative border-2 rounded-xl p-6 border-blue-200 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-blue-50/50 to-white shadow-sm hover:shadow-lg">
                        <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                          Entry {index + 1}
                        </div>
                        
                          {labRecords.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMonth(index)}
                            className="absolute -top-3 right-6 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 hover:text-white shadow-md"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Date</span>
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="date"
                              value={record.date}
                              onChange={(e) => updateLabRecord(index, 'date', e.target.value)}
                                className="h-9 text-xs border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="YYYY-MM-DD"
                            />
                          </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Hemoglobin (g/dL)</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={record.hemoglobin}
                              onChange={(e) => updateLabRecord(index, 'hemoglobin', e.target.value)}
                                className="h-9 text-xs border-green-300 focus:border-green-500 focus:ring-green-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="13.2"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: 12.0-15.5 g/dL</p>
                          </div>
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>WBC (K/μL)</span>
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={record.wbc}
                              onChange={(e) => updateLabRecord(index, 'wbc', e.target.value)}
                                className="h-9 text-xs border-purple-300 focus:border-purple-500 focus:ring-purple-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="6.1"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: 4.5-11.0 K/μL</p>
                          </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Platelets (K/μL)</span>
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={record.platelets}
                              onChange={(e) => updateLabRecord(index, 'platelets', e.target.value)}
                                className="h-9 text-xs border-orange-300 focus:border-orange-500 focus:ring-orange-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="200"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: 150-450 K/μL</p>
                          </div>
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Glucose (mg/dL)</span>
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                                step="0.1"
                              value={record.glucose}
                              onChange={(e) => updateLabRecord(index, 'glucose', e.target.value)}
                                className="h-9 text-xs border-red-300 focus:border-red-500 focus:ring-red-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="95"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: 70-100 mg/dL</p>
                          </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Creatinine (mg/dL)</span>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={record.creatinine}
                              onChange={(e) => updateLabRecord(index, 'creatinine', e.target.value)}
                                className="h-9 text-xs border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="0.9"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: 0.6-1.2 mg/dL</p>
                          </div>
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>Cholesterol (mg/dL)</span>
                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                                step="0.1"
                              value={record.cholesterol}
                              onChange={(e) => updateLabRecord(index, 'cholesterol', e.target.value)}
                                className="h-9 text-xs border-pink-300 focus:border-pink-500 focus:ring-pink-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="180"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: &lt;200 mg/dL</p>
                          </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <span>HbA1c (%)</span>
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                              </Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={record.hba1c}
                              onChange={(e) => updateLabRecord(index, 'hba1c', e.target.value)}
                                className="h-9 text-xs border-teal-300 focus:border-teal-500 focus:ring-teal-200 bg-white shadow-sm transition-all duration-200"
                              placeholder="5.5"
                            />
                              <p className="text-xs text-gray-500 mt-1">Normal: &lt;5.7%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    onClick={handleAnalyze}
                    disabled={labRecords.filter(r => r.date.trim() !== '').length < 2 || isAnalyzing}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Run AI Analysis
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Reset
                  </Button>
                </div>

                {/* Progress */}
                {isAnalyzing && (
                  <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Analyzing lab trends with AI...</span>
                      <span className="text-blue-600 font-bold text-lg">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-blue-100" />
                    <p className="text-xs text-gray-600 text-center">
                      This may take a few moments as we analyze your lab data patterns and generate predictions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Panel - Full Width */}
          {results && (
            <Card className="border-0 bg-white shadow-2xl overflow-hidden">
              <CardHeader className="relative bg-white text-gray-800 p-8">
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 shadow-lg">
                      <TrendingUp className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                  
                  <CardTitle className="flex items-center justify-center space-x-3 text-3xl font-bold text-center mb-4 text-gray-800">
                    AI-Powered Trend Analysis Results
                  </CardTitle>
                  
                  <div className="text-center space-y-4">
                    <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
                      Advanced machine learning analysis of your lab value patterns
                    </p>
                    
                    <div className="flex items-center justify-center gap-6 text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Real-time predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Risk assessment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Trend analysis</span>
                      </div>
                    </div>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="p-6">


                <Tabs defaultValue="overview" className="w-full animate-fade-in">

                  <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visualization">Lab Visualization</TabsTrigger>
                      <TabsTrigger value="next-predictions">Next 5 Prediction</TabsTrigger>
                    <TabsTrigger value="insights">Key Insights</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  </TabsList>
                    <Button
                      onClick={() => setResults(null)}
                      variant="outline"
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 ml-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Modify Data
                    </Button>
                  </div>

                  <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Risk Overview */}
                      <div className="rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Risk Assessment
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Risk:</span>
                            <Badge className={getRiskBadgeColor(results.overallRisk)}>
                              {results.overallRisk}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Parameters Analyzed:</span>
                            <span className="text-primary font-medium">{results.trends.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">High Risk Trends:</span>
                            <span className="text-destructive font-medium">
                              {results.trends.filter(t => t.riskLevel === 'High' || t.riskLevel === 'Critical').length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top Trends */}
                      <div className="rounded-2xl border p-4 bg-gradient-to-br from-accent/10 via-background to-primary/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Key Trends
                        </h3>
                        <div className="space-y-3">
                          {results.trends.slice(0, 3).map((trend, index) => (
                            <div key={index} className="rounded-xl p-3 border bg-background/60 hover:bg-background transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{trend.parameter}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={getRiskColor(trend.riskLevel)}>
                                    {trend.riskLevel}
                                  </Badge>
                                  <span className="text-sm font-bold text-primary">
                                    {getTrendIcon(trend.trend)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Current: {trend.currentValue} {trend.unit} | 
                                Predicted: {trend.nextPrediction} {trend.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>


                  </TabsContent>



                                    <TabsContent value="next-predictions" className="mt-4 space-y-6">
                    <div className="rounded-lg border border-gray-200 p-6 bg-white">

                      
                      {results.trends && results.trends.length > 0 ? (
                          <div>
                                                                              {/* Parameter Selection Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                              <BarChart3 className="w-4 h-4 text-gray-600" />
                              </div>
                            <h4 className="text-lg font-semibold text-gray-800">Select Lab Parameter</h4>
                            </div>
                          
                          {/* Parameter Selection - Same as Lab Visualization */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                <button
                              onClick={() => setSelectedTrendIndex(0)}
                              className="p-3 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-green-700">Hemoglobin</div>
                              <div className="text-xs text-muted-foreground">Red blood cells</div>
                                </button>
                            <button
                              onClick={() => setSelectedTrendIndex(1)}
                              className="p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-purple-700">WBC</div>
                              <div className="text-xs text-muted-foreground">White blood cells</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(2)}
                              className="p-3 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-orange-700">Platelets</div>
                              <div className="text-xs text-muted-foreground">Blood clotting</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(3)}
                              className="p-3 border rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-red-700">Glucose</div>
                              <div className="text-xs text-muted-foreground">Blood sugar</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(4)}
                              className="p-3 border rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-yellow-700">Creatinine</div>
                              <div className="text-xs text-muted-foreground">Kidney function</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(5)}
                              className="p-3 border rounded-lg hover:bg-pink-50 hover:border-pink-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-pink-700">Cholesterol</div>
                              <div className="text-xs text-muted-foreground">Blood lipids</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(6)}
                              className="p-3 border rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-teal-700">HbA1c</div>
                              <div className="text-xs text-muted-foreground">Long-term glucose</div>
                            </button>
                      </div>

                                                      {/* Selected Parameter Display */}
                            {selectedTrendIndex !== null && results.trends[selectedTrendIndex] && (
                              <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                                {/* Professional Parameter Header */}
                                <div className="text-center mb-6">
                                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3 border border-gray-200">
                                    <TrendingUp className="w-8 h-8 text-gray-600" />
                              </div>
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{results.trends[selectedTrendIndex].parameter}</h4>
                                  <div className="flex items-center justify-center gap-3">
                                    <Badge className={`px-3 py-1 text-xs font-medium ${getRiskColor(results.trends[selectedTrendIndex].riskLevel)}`}>
                                  {results.trends[selectedTrendIndex].riskLevel} Risk
                                </Badge>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md">
                                      <span className="text-sm">{getTrendIcon(results.trends[selectedTrendIndex].trend)}</span>
                                      <span className="text-xs font-medium text-gray-700">{results.trends[selectedTrendIndex].trend} Trend</span>
                                    </div>
                              </div>
                            </div>

                              {/* Current and Predicted Values - Professional Format with Description */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <div className="space-y-3">
                                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                                    <h5 className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wide">CURRENT STATUS</h5>
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Current Value:</span>
                                        <span className="font-medium text-gray-900">{results.trends[selectedTrendIndex].currentValue} {results.trends[selectedTrendIndex].unit}</span>
                                </div>
                                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Normal Range:</span>
                                        <span className="font-medium text-gray-900">{results.trends[selectedTrendIndex].normalRange}</span>
                                </div>
                                      <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600">Trend Direction:</span>
                                        <span className="font-medium flex items-center gap-1">
                                          {getTrendIcon(results.trends[selectedTrendIndex].trend)} {results.trends[selectedTrendIndex].trend}
                                  </span>
                                </div>
                                </div>
                              </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                                    <h5 className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wide">PREDICTION SUMMARY</h5>
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Next Prediction:</span>
                                        <span className="font-medium text-gray-900">{results.trends[selectedTrendIndex].nextPrediction} {results.trends[selectedTrendIndex].unit}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Prediction Date:</span>
                                        <span className="font-medium text-gray-900">{results.trends[selectedTrendIndex].predictionDate}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Change:</span>
                                        <span className={`font-medium ${results.trends[selectedTrendIndex].nextPrediction > results.trends[selectedTrendIndex].currentValue ? 'text-red-600' : 'text-green-600'}`}>
                                          {results.trends[selectedTrendIndex].nextPrediction > results.trends[selectedTrendIndex].currentValue ? '+' : ''}
                                          {(results.trends[selectedTrendIndex].nextPrediction - results.trends[selectedTrendIndex].currentValue).toFixed(2)} {results.trends[selectedTrendIndex].unit}
                                  </span>
                                      </div>
                                </div>
                              </div>
                            </div>

                                {/* Parameter Description Panel */}
                                <div className="space-y-3">
                                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                                    <h5 className="text-sm font-bold text-blue-700 mb-4 uppercase tracking-wide">PARAMETER INFO</h5>
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-800">{results.trends[selectedTrendIndex].parameter}</span>
                              </div>
                                      
                                      <div className="space-y-3">
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                          <strong>What it measures:</strong> {getParameterDescription(results.trends[selectedTrendIndex].parameter)}
                                        </div>
                                        
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                          <strong>Health significance:</strong> {getHealthSignificance(results.trends[selectedTrendIndex].parameter, results.trends[selectedTrendIndex].riskLevel)}
                                        </div>
                                        
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                          <strong>Trend meaning:</strong> {getTrendMeaning(results.trends[selectedTrendIndex].trend, results.trends[selectedTrendIndex].parameter)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Professional Timeline Section */}
                              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-center mb-6">
                                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3 border border-gray-200">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <h5 className="text-lg font-bold text-blue-700 mb-2 uppercase tracking-wide">PREDICTION TIMELINE</h5>
                                  <p className="text-gray-600 text-sm">AI-powered predictions showing your potential health trajectory</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                  {calculateNextPredictionDates().map((predDate, predIndex) => {
                                    const currentValue = results.trends[selectedTrendIndex].currentValue;
                                    const predictionValue = results.trends[selectedTrendIndex].nextPrediction;
                                    const increment = (predictionValue - currentValue) / 5;
                                    const calculatedValue = currentValue + (increment * (predIndex + 1));
                                    const dateLabel = new Date(predDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    });
                                    const isIncreasing = calculatedValue > currentValue;
                                    
                                    return (
                                      <div key={predIndex} className="group relative">
                                        <div className={`text-center p-3 bg-white rounded-lg border transition-all duration-200 ${
                                          isIncreasing ? 'border-red-200 hover:border-red-300' : 'border-green-200 hover:border-green-300'
                                        } shadow-sm hover:shadow-md`}>
                                          {/* Prediction Number */}
                                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium text-white mb-2 ${
                                            isIncreasing ? 'bg-red-500' : 'bg-green-500'
                                          }`}>
                                            {predIndex + 1}
                                          </div>
                                          
                                          {/* Date */}
                                          <div className="text-xs font-medium text-gray-700 mb-1">{dateLabel}</div>
                                          
                                          {/* Predicted Value */}
                                          <div className="text-lg font-bold text-gray-900 mb-1">
                                            {Math.round(calculatedValue * 100) / 100}
                                          </div>
                                          
                                          {/* Unit */}
                                          <div className="text-xs text-gray-600 mb-2">{results.trends[selectedTrendIndex].unit}</div>
                                          
                                          {/* Trend Indicator */}
                                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                            isIncreasing 
                                              ? 'bg-red-50 text-red-700 border border-red-200' 
                                              : 'bg-green-50 text-green-700 border border-green-200'
                                          }`}>
                                            <span className="text-xs">{isIncreasing ? '↗' : '↘'}</span>
                                            <span>{isIncreasing ? 'Rising' : 'Falling'}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                          {isIncreasing ? 'Value expected to increase' : 'Value expected to decrease'}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Professional Explanation */}
                                <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <Info className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h6 className="text-lg font-bold text-blue-700 uppercase tracking-wide">UNDERSTANDING YOUR PREDICTIONS</h6>
                                  </div>
                                  <div className="space-y-4">
                                    <p className="text-base text-gray-700 leading-relaxed">
                                      These predictions help you understand potential future health trends and what they mean for your health journey.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                        <span className="text-3xl text-green-600">↘</span>
                              <div>
                                          <div className="text-sm font-semibold text-gray-800">Green Arrows (↘)</div>
                                          <div className="text-sm text-gray-600">Suggest improving values</div>
                              </div>
                                      </div>
                                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                        <span className="text-3xl text-red-600">↗</span>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-800">Red Arrows (↗)</div>
                                          <div className="text-sm text-gray-600">Indicate values that may need attention</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                      <p className="text-sm text-gray-800 leading-relaxed">
                                        <strong>Important:</strong> Always discuss these predictions with your healthcare provider for personalized medical advice.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              



                          </div>
                        )}
                      </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No prediction data available for this analysis.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Key Insights
                      </h3>
                      {results.keyInsights && results.keyInsights.length > 0 ? (
                        <div className="space-y-2">
                          {results.keyInsights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-foreground">{insight}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No key insights available for this analysis.</p>
                        </div>
                      )}
                    </div>

                    {results.redFlags && results.redFlags.length > 0 ? (
                      <div className="rounded-lg border p-4 bg-destructive/5 border-destructive/20">
                        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          Red Flags
                        </h3>
                        <ul className="list-disc pl-5 text-xs text-foreground space-y-1">
                          {results.redFlags.map((flag, i) => (
                            <li key={i} className="text-destructive">{flag}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-lg border p-4 bg-success/5 border-success/20">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-xs font-medium">No red flags detected</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        General Recommendations
                      </h3>
                      {results.recommendations && results.recommendations.length > 0 ? (
                        <div className="space-y-2">
                          {results.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-foreground">{rec}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No recommendations available for this analysis.</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Next Steps
                      </h3>
                      {results.nextSteps && results.nextSteps.length > 0 ? (
                        <div className="space-y-2">
                          {results.nextSteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-foreground">{step}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No next steps available for this analysis.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="monitoring" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Monitoring Schedule
                      </h3>
                      {results.monitoringSchedule && results.monitoringSchedule.length > 0 ? (
                        <div className="space-y-2">
                          {results.monitoringSchedule.map((schedule, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-foreground">{schedule}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No monitoring schedule available for this analysis.</p>
                          </div>
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">Please run the analysis to get personalized monitoring recommendations.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="visualization" className="mt-4 space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Lab Value Trends Visualization
                      </h3>
                      
                      {chartData.length > 0 ? (
                        <div>
                          {/* Parameter Selection */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <button
                              onClick={() => setSelectedTrendIndex(0)}
                              className="p-3 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-green-700">Hemoglobin</div>
                              <div className="text-xs text-muted-foreground">Red blood cells</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(1)}
                              className="p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-purple-700">WBC</div>
                              <div className="text-xs text-muted-foreground">White blood cells</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(2)}
                              className="p-3 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-orange-700">Platelets</div>
                              <div className="text-xs text-muted-foreground">Blood clotting</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(3)}
                              className="p-3 border rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-red-700">Glucose</div>
                              <div className="text-xs text-muted-foreground">Blood sugar</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(4)}
                              className="p-3 border rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-yellow-700">Creatinine</div>
                              <div className="text-xs text-muted-foreground">Kidney function</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(5)}
                              className="p-3 border rounded-lg hover:bg-pink-50 hover:border-pink-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-pink-700">Cholesterol</div>
                              <div className="text-xs text-muted-foreground">Blood lipids</div>
                            </button>
                            <button
                              onClick={() => setSelectedTrendIndex(6)}
                              className="p-3 border rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-colors text-left"
                            >
                              <div className="text-sm font-medium text-teal-700">HbA1c</div>
                              <div className="text-xs text-muted-foreground">Long-term glucose</div>
                            </button>
                          </div>

                          {/* Selected Chart Display */}
                          <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white">
                            {selectedTrendIndex === 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-foreground text-green-700">Hemoglobin Trends (g/dL)</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-xs px-2 py-1 bg-green-100 text-green-800 border border-green-200">
                                      Normal Range: 12-16 g/dL
                                    </Badge>
                                    <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200">
                                      Risk: {results.trends[0]?.riskLevel || 'Unknown'}
                                    </Badge>
                                  </div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                      dataKey="date" 
                                      stroke="#6b7280"
                                      fontSize={12}
                                      tickLine={false}
                                    />
                                    <YAxis 
                                      stroke="#6b7280"
                                      fontSize={12}
                                      tickLine={false}
                                      domain={['dataMin - 1', 'dataMax + 1']}
                                    />
                                    <Tooltip 
                                      content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          const isPredicted = data.type === 'prediction';
                                          return (
                                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                              <p className="font-semibold text-gray-800 mb-2">{label}</p>
                                              <div className="space-y-1">
                                                <p className={`text-sm ${isPredicted ? 'text-yellow-600' : 'text-green-600'}`}>
                                                  <span className="font-medium">Value:</span> {data.Hemoglobin} g/dL
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                  <span className="font-medium">Type:</span> {isPredicted ? 'Prediction' : 'Historical'}
                                                </p>
                                                {isPredicted && (
                                                  <p className="text-xs text-yellow-600">
                                                    <span className="font-medium">Prediction #:</span> {data.predictionIndex}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Legend />
                                    {/* Normal Range Reference Lines with Labels */}
                                    <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label="Min (12)" />
                                    <ReferenceLine y={16} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label="Max (16)" />
                                    
                                    {/* Risk Zone Coloring */}
                                    <ReferenceArea y1={0} y2={12} fill="#fef2f2" fillOpacity={0.3} />
                                    <ReferenceArea y1={16} y2={25} fill="#fef2f2" fillOpacity={0.3} />
                                    
                                    {/* Moving Average Line for Trend Analysis */}
                                    <Line 
                                      type="monotone" 
                                      dataKey="Hemoglobin" 
                                      stroke="#10b981" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#10b981"}
                                            stroke={isPredicted ? "#d97706" : "#10b981"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                    
                                    {/* Trend Direction Indicator */}
                                    {chartData.length > 1 && (
                                      <Line 
                                        type="monotone" 
                                        dataKey="Hemoglobin" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2} 
                                        strokeDasharray="5 5"
                                        opacity={0.6}
                                        name="Trend Line"
                                      />
                                    )}
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 1 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-purple-700">White Blood Cell Trends (K/μL)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="WBC" 
                                      stroke="#8b5cf6" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#8b5cf6"}
                                            stroke={isPredicted ? "#d97706" : "#8b5cf6"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 2 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-orange-700">Platelet Trends (K/μL)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Platelets" 
                                      stroke="#f97316" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#f97316"}
                                            stroke={isPredicted ? "#d97706" : "#f97316"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 3 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-red-700">Glucose Trends (mg/dL)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Glucose" 
                                      stroke="#ef4444" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#ef4444"}
                                            stroke={isPredicted ? "#d97706" : "#ef4444"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 4 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-yellow-700">Creatinine Trends (mg/dL)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Creatinine" 
                                      stroke="#eab308" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#eab308"}
                                            stroke={isPredicted ? "#d97706" : "#eab308"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 5 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-pink-700">Cholesterol Trends (mg/dL)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="Cholesterol" 
                                      stroke="#ec4899" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#ec4899"}
                                            stroke={isPredicted ? "#d97706" : "#ec4899"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTrendIndex === 6 && (
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4 text-teal-700">HbA1c Trends (%)</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                  <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="HbA1c" 
                                      stroke="#14b8a6" 
                                      strokeWidth={3} 
                                      dot={(props) => {
                                        // Check if this is a prediction data point
                                        const isPredicted = props.payload.type === 'prediction';
                                        return (
                                          <circle
                                            cx={props.cx}
                                            cy={props.cy}
                                            r={isPredicted ? 8 : 6}
                                            fill={isPredicted ? "#fbbf24" : "#14b8a6"}
                                            stroke={isPredicted ? "#d97706" : "#14b8a1"}
                                            strokeWidth={isPredicted ? 2 : 1}
                                          />
                                        );
                                      }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                                {chartData.some(d => d.type === 'prediction') && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-yellow-800 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                      <span className="font-medium">Legend</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span>Historical data</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <span>Next 5 predictions (2-week intervals)</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-yellow-700">
                                      <strong>Prediction Dates:</strong> {chartData
                                        .filter(d => d.type === 'prediction')
                                        .map(d => d.date)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No chart data available. Please enter lab data and run analysis.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
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
                  diagnosis, or treatment. Lab value trends require clinical interpretation by qualified healthcare providers. 
                  Always consult with your healthcare team for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabValueTrendResult;
