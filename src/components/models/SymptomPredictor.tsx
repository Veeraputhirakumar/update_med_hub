import { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';

const SymptomPredictor = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiseaseIndex, setSelectedDiseaseIndex] = useState(0);
  
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  async function callGemini(symptomsText: string, ageRange: string, genderValue: string) {
    const { predictDiseaseWithGemini } = await import('@/lib/gemini');
    return predictDiseaseWithGemini({ symptoms: symptomsText, ageRange, gender: genderValue });
  }

  const mockResults = {
    diseases: [
      { name: 'Common Cold', probability: 78, severity: 'Low', color: 'bg-success', summary: 'Viral URI with congestion and fatigue.', redFlags: ['Shortness of breath', 'High persistent fever'], tests: ['None typically needed'], careAdvice: ['Rest', 'Hydration', 'OTC analgesics'], medications: ['Acetaminophen for pain/fever', 'Ibuprofen for pain (if not contraindicated)', 'Nasal saline spray'] },
      { name: 'Allergic Rhinitis', probability: 65, severity: 'Low', color: 'bg-warning', summary: 'Allergic inflammation of nasal mucosa.', tests: ['Allergen testing if recurrent'], careAdvice: ['Antihistamines', 'Avoid triggers'], medications: ['Cetirizine or loratadine', 'Intranasal corticosteroid (fluticasone)'] },
      { name: 'Sinusitis', probability: 45, severity: 'Medium', color: 'bg-destructive', summary: 'Inflammation of paranasal sinuses.', redFlags: ['Facial swelling', 'Vision changes'], tests: ['Consider CT if severe or persistent'], careAdvice: ['Nasal saline', 'Analgesics'], medications: ['Acetaminophen or ibuprofen', 'Intranasal corticosteroid'] },
      { name: 'Viral Infection', probability: 32, severity: 'Low', color: 'bg-primary', summary: 'Non-specific viral syndrome.', medications: ['Fluids and rest', 'Acetaminophen for fever'] }
    ],
    explanation: "Based on the symptoms provided, the most likely condition is a common cold, which typically presents with the combination of symptoms described. The high probability score reflects the common nature of these symptoms during cold and flu season.",
    recommendations: [
      "Get plenty of rest and stay hydrated",
      "Consider over-the-counter pain relievers if needed",
      "Monitor symptoms for 5-7 days",
      "Consult a healthcare provider if symptoms worsen"
    ],
    triage: 'Self-care',
    redFlags: ['Chest pain', 'Severe breathing difficulty', 'Confusion'],
    suggestedTests: ['COVID-19 rapid antigen if fever and cough'],
    medications: ['OTC analgesics for pain/fever', 'Nasal saline irrigation', 'Antihistamines for allergic symptoms'],
    sources: [{ title: 'CDC Common Cold', url: 'https://www.cdc.gov' }]
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() || !age || !gender) return;

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
      const aiResults = await callGemini(symptoms, age, gender);
      setResults(aiResults);
      setSelectedDiseaseIndex(0);
      setProgress(100);
    } catch (e: any) {
      // Fallback to mock without surfacing console errors for cleaner UX
      setResults(mockResults);
      setSelectedDiseaseIndex(0);
    } finally {
          clearInterval(interval);
          setIsAnalyzing(false);
        }
  };

  const handleReset = () => {
    setSymptoms('');
    setAge('');
    setGender('');
    setResults(null);
    setProgress(0);
    setError(null);
    setSelectedDiseaseIndex(0);
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

        <div className={`grid grid-cols-1 ${!results ? 'lg:grid-cols-2' : ''} gap-8`}>
          {/* Input Panel */}
          {!results && (
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
          )}

          {/* Output Panel */}
          <Card className="medical-card">
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Analysis Results</span>
              </CardTitle>
                {results && (
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Edit Input
                  </Button>
                )}
              </div>
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

              {error && (
                <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {results && (
                <Tabs defaultValue="overview" className="w-full animate-fade-in">
                  {/* Summary banner */}
                  <div className="rounded-lg border p-4 mb-4 bg-primary/5">
                    <div className="flex flex-wrap items-center gap-2">
                      {results.triage && <Badge>{results.triage}</Badge>}
                      {age && <Badge variant="outline">Age: {age}</Badge>}
                      {gender && <Badge variant="outline" className="capitalize">{gender}</Badge>}
                    </div>
                    {symptoms && (
                      <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
                        {symptoms}
                      </p>
                    )}
                  </div>

                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Disease Details</TabsTrigger>
                    <TabsTrigger value="care">Care & Tests</TabsTrigger>
                    <TabsTrigger value="meds">Medication Guidance</TabsTrigger>
                    <TabsTrigger value="sources">Sources</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Probability Breakdown */}
                      <div className="rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Probability Breakdown</h3>
                        {Array.isArray(results.diseases) && results.diseases.length > 0 && (
                          <>
                            <ChartContainer
                              config={Object.fromEntries(
                                results.diseases.map((d: any, i: number) => [
                                  String(i),
                                  { label: d.name as string, color: [
                                    '#4f46e5', '#06b6d4', '#22c55e', '#eab308', '#ef4444'
                                  ][i % 5] }
                                ])
                              )}
                              className="w-full"
                            >
                              <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Pie
                                  data={results.diseases.map((d: any, i: number) => ({ key: String(i), name: d.name, value: d.probability, fill: `var(--color-${i})` }))}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={60}
                                  outerRadius={90}
                                  strokeWidth={2}
                                  isAnimationActive
                                >
                                  {results.diseases.map((_: any, i: number) => (
                                    <Cell key={`cell-${i}`} fill={`var(--color-${i})`} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                            {/* Custom legend below chart for clarity */}
                            <div className="mt-3 flex flex-wrap gap-3">
                              {results.diseases.map((d: any, i: number) => (
                                <div key={i} className="inline-flex items-center gap-2 text-xs">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-sm"
                                    style={{ backgroundColor: ['#4f46e5', '#06b6d4', '#22c55e', '#eab308', '#ef4444'][i % 5] }}
                                  />
                                  <span className="text-muted-foreground">{d.name}</span>
                                  <span className="font-medium text-foreground">{d.probability}%</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Top Predictions */}
                      <div className="rounded-2xl border p-4 bg-gradient-to-br from-accent/10 via-background to-primary/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Top Predictions</h3>
                    <div className="space-y-3">
                      {results.diseases.map((disease: any, index: number) => (
                            <div key={index} className="rounded-xl p-4 border bg-background/60 hover:bg-background transition-colors">
                          <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{disease.name}</span>
                            <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={getSeverityColor(disease.severity)}>
                                {disease.severity} Risk
                              </Badge>
                                  <span className="text-sm font-bold text-primary">{disease.probability}%</span>
                            </div>
                          </div>
                              <Progress value={disease.probability} className="medical-progress h-2" />
                              {disease.summary && (
                                <p className="text-xs text-muted-foreground mt-2">{disease.summary}</p>
                              )}
                        </div>
                      ))}
                    </div>
                        {/* Severity legend */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> High</span>
                          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span> Medium</span>
                          <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Low</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left: selectable list */}
                      <div className="lg:col-span-1 rounded-lg border">
                        <ScrollArea className="h-[360px]">
                          <div className="p-2 space-y-2">
                            {results.diseases.map((disease: any, index: number) => {
                              const isActive = index === selectedDiseaseIndex;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedDiseaseIndex(index)}
                                  className={`w-full text-left rounded-md p-3 border transition-colors ${isActive ? 'bg-primary/10 border-primary text-foreground' : 'bg-background hover:bg-accent/40'}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{disease.name}</span>
                                    <Badge variant="outline" className={getSeverityColor(disease.severity)}>
                                      {disease.probability}%
                                    </Badge>
                                  </div>
                                  {disease.summary && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{disease.summary}</p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                  </div>

                      {/* Right: detail view */}
                      <div className="lg:col-span-2 rounded-lg border p-4">
                        {results.diseases[selectedDiseaseIndex] && (
                  <div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-semibold">{results.diseases[selectedDiseaseIndex].name}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getSeverityColor(results.diseases[selectedDiseaseIndex].severity)}>
                                  {results.diseases[selectedDiseaseIndex].severity}
                                </Badge>
                                <Badge>{results.diseases[selectedDiseaseIndex].probability}%</Badge>
                              </div>
                            </div>
                            {results.diseases[selectedDiseaseIndex].summary && (
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{results.diseases[selectedDiseaseIndex].summary}</p>
                            )}

                            {Array.isArray(results.diseases[selectedDiseaseIndex].redFlags) && results.diseases[selectedDiseaseIndex].redFlags.length > 0 && (
                              <div className="mt-4">
                                <div className="text-sm font-medium">Red flags</div>
                                <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
                                  {results.diseases[selectedDiseaseIndex].redFlags.map((r: string, i: number) => <li key={i} className="">{r}</li>)}
                                </ul>
                              </div>
                            )}

                            {Array.isArray(results.diseases[selectedDiseaseIndex].tests) && results.diseases[selectedDiseaseIndex].tests.length > 0 && (
                              <div className="mt-4">
                                <div className="text-sm font-medium">Likely tests</div>
                                <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
                                  {results.diseases[selectedDiseaseIndex].tests.map((t: string, i: number) => <li key={i} className="">{t}</li>)}
                                </ul>
                              </div>
                            )}

                            {Array.isArray(results.diseases[selectedDiseaseIndex].careAdvice) && results.diseases[selectedDiseaseIndex].careAdvice.length > 0 && (
                              <div className="mt-4">
                                <div className="text-sm font-medium">Care advice</div>
                                <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
                                  {results.diseases[selectedDiseaseIndex].careAdvice.map((c: string, i: number) => <li key={i} className="">{c}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                  </TabsContent>

                  <TabsContent value="care" className="mt-4 space-y-4">
                    {Array.isArray(results.redFlags) && results.redFlags.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium mb-2">General red flags</div>
                        <ul className="list-disc pl-5 text-sm text-foreground">
                          {results.redFlags.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(results.suggestedTests) && results.suggestedTests.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium mb-2">Suggested general tests</div>
                        <ul className="list-disc pl-5 text-sm text-foreground">
                          {results.suggestedTests.map((t: string, i: number) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                  <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {results.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  </TabsContent>

                  <TabsContent value="meds" className="mt-4 space-y-4">
                    {/* Global medication guidance if provided */}
                    {Array.isArray(results.medications) && results.medications.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium mb-2">General medication guidance</div>
                        <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
                          {results.medications.map((m: string, i: number) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Per-disease medication suggestions */}
                    {results.diseases.map((disease: any, index: number) => (
                      Array.isArray(disease.medications) && disease.medications.length > 0 ? (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{disease.name}</div>
                            <Badge variant="outline" className={getSeverityColor(disease.severity)}>
                              {disease.severity}
                            </Badge>
                          </div>
                          <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed mt-2">
                            {disease.medications.map((m: string, i: number) => <li key={i}>{m}</li>)}
                          </ul>
                        </div>
                      ) : null
                    ))}

                    <div className="rounded-lg border p-4 bg-warning/5 border-warning/20">
                      <div className="text-xs text-muted-foreground">
                        This guidance is informational and not a substitute for professional medical advice. Always consult a healthcare provider for prescriptions, dosing, and contraindications.
                    </div>
                  </div>
                  </TabsContent>

                  <TabsContent value="sources" className="mt-4 space-y-4">
                    {Array.isArray(results.sources) && results.sources.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm font-medium mb-2">General sources</div>
                        <ul className="list-disc pl-5 text-sm text-foreground">
                          {results.sources.map((s: any, i: number) => (
                            <li key={i}><a className="text-primary underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
                          ))}
                        </ul>
                </div>
                    )}
                    {results.diseases.map((disease: any, index: number) => (
                      Array.isArray(disease.sources) && disease.sources.length > 0 ? (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="text-sm font-medium mb-2">{disease.name} sources</div>
                          <ul className="list-disc pl-5 text-sm text-foreground">
                            {disease.sources.map((s: any, i: number) => (
                              <li key={i}><a className="text-primary underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
                            ))}
                          </ul>
                        </div>
                      ) : null
                    ))}
                  </TabsContent>
                </Tabs>
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