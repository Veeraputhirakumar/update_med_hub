import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const SymptomPredictor = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const mockResults = {
    diseases: [
      { name: 'Common Cold', probability: 78, severity: 'Low', color: 'bg-success' },
      { name: 'Allergic Rhinitis', probability: 65, severity: 'Low', color: 'bg-warning' },
      { name: 'Sinusitis', probability: 45, severity: 'Medium', color: 'bg-destructive' },
      { name: 'Viral Infection', probability: 32, severity: 'Low', color: 'bg-primary' }
    ],
    explanation: "Based on the symptoms provided, the most likely condition is a common cold, which typically presents with the combination of symptoms described. The high probability score reflects the common nature of these symptoms during cold and flu season.",
    recommendations: [
      "Get plenty of rest and stay hydrated",
      "Consider over-the-counter pain relievers if needed",
      "Monitor symptoms for 5-7 days",
      "Consult a healthcare provider if symptoms worsen"
    ]
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() || !age || !gender) return;

    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);

    // Simulate AI processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setResults(mockResults);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setSymptoms('');
    setAge('');
    setGender('');
    setResults(null);
    setProgress(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/feature/diagnosis" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Diagnosis Tools
          </Link>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Symptom-based Disease Predictor
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your symptoms and basic information to get AI-powered predictions 
              of potential conditions with confidence scores.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>Input Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Describe Your Symptoms *
                </label>
                <Textarea
                  placeholder="e.g., I have a runny nose, mild headache, and feel tired. Started 2 days ago..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="medical-input min-h-[120px] resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {symptoms.length}/500 characters
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age Range *
                  </label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="medical-input">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-12">0-12 years</SelectItem>
                      <SelectItem value="13-17">13-17 years</SelectItem>
                      <SelectItem value="18-30">18-30 years</SelectItem>
                      <SelectItem value="31-50">31-50 years</SelectItem>
                      <SelectItem value="51-70">51-70 years</SelectItem>
                      <SelectItem value="70+">70+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Gender *
                  </label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="medical-input">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!symptoms.trim() || !age || !gender || isAnalyzing}
                  className="btn-medical text-white flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Reset
                </Button>
              </div>

              {/* Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing symptoms...</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="medical-progress" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!results && !isAnalyzing && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">🔬</div>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Awaiting Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your symptoms and click "Run AI Analysis" to get predictions
                  </p>
                </div>
              )}

              {results && (
                <div className="space-y-6 animate-fade-in">
                  {/* Disease Predictions */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Top Predictions
                    </h3>
                    <div className="space-y-3">
                      {results.diseases.map((disease: any, index: number) => (
                        <div key={index} className="bg-accent/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">
                              {disease.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={getSeverityColor(disease.severity)}
                              >
                                {disease.severity} Risk
                              </Badge>
                              <span className="text-sm font-bold text-primary">
                                {disease.probability}%
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={disease.probability} 
                            className="medical-progress h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      AI Explanation
                    </h3>
                    <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                      <p className="text-sm text-foreground leading-relaxed">
                        {results.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {results.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Save Results
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
                  diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions. 
                  In case of emergency, contact emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SymptomPredictor;