import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import SubModelPanel from '../common/SubModelPanel';

const EyeDiseaseDetector = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [affectedArea, setAffectedArea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiseaseIndex, setSelectedDiseaseIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image under 5MB');
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    console.log('Starting analysis with image:', image.name);
    setIsAnalyzing(true);
    setProgress(10);
    setResults(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      if (affectedArea) formData.append('affectedArea', affectedArea);

      console.log('Sending request to /api/eye/analyze');
      const response = await fetch('/api/eye/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', response.status, response.statusText);
      setProgress(60);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let message = 'Failed to analyze image';
        try {
          const j = JSON.parse(text);
          message = j?.error || message;
          if (j?.details) {
            // Check if it's a quota exceeded error
            if (j.details.includes('429') || j.details.includes('quota') || j.details.includes('Too Many Requests')) {
              message = 'API quota exceeded. Please try again later or upgrade your Gemini API plan.';
            } else {
              message += `: ${j.details}`;
            }
          }
        } catch (_) {
          if (text) message = text;
        }
        throw new Error(message);
      }

      const data = await response.json();
      setProgress(100);

      const rawDiseases = Array.isArray(data?.diseases) ? data.diseases : [];
      const diseasesSorted = rawDiseases
        .slice(0)
        .sort((a: any, b: any) => (Number(b?.probability) || 0) - (Number(a?.probability) || 0))
        .slice(0, 5);
      const rawAlts = diseasesSorted;

      const totalProb = rawAlts.reduce((sum: number, d: any) => sum + (Number(d?.probability) || 0), 0);
      const alternatives = rawAlts.map((d: any) => ({
        ...d,
        probability: totalProb > 0 ? Math.round((Number(d?.probability) || 0) * 100 / totalProb) : 0
      }));

      setResults({
        ...data,
        alternatives,
        diseases: diseasesSorted,
        selectedDiseaseIndex: 0
      });
      setSelectedDiseaseIndex(0);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview('');
    setAffectedArea('');
    setResults(null);
    setError(null);
    setSelectedDiseaseIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const inputPanel = (
    <>
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload Eye Image
        </label>
        <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="eye-image-upload"
            />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
            Choose Image
          </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Eye preview"
              className="max-w-full h-48 object-contain mx-auto mb-4 rounded"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </Button>
          </div>
        )}
      </div>

      {/* Affected Area */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Affected Eye Area (Optional)
        </label>
          <Select value={affectedArea} onValueChange={setAffectedArea}>
          <SelectTrigger className="medical-input">
              <SelectValue placeholder="Select affected area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left-eye">Left Eye</SelectItem>
              <SelectItem value="right-eye">Right Eye</SelectItem>
              <SelectItem value="both-eyes">Both Eyes</SelectItem>
              <SelectItem value="eyelid">Eyelid</SelectItem>
              <SelectItem value="cornea">Cornea</SelectItem>
              <SelectItem value="conjunctiva">Conjunctiva</SelectItem>
              <SelectItem value="sclera">Sclera (White part)</SelectItem>
              <SelectItem value="around-eye">Around Eye</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Quota Information */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-amber-800 text-sm">
              <p className="font-medium">API Quota Notice</p>
              <p className="text-amber-700">
                This feature uses Google's Gemini AI API. Free tier users have a daily limit of 50 requests. 
                If you encounter quota errors, please try again later or consider upgrading your API plan.
              </p>
            </div>
          </div>
        </div>

      {/* Analyze Button and Loading */}
      <div className="flex items-center gap-3 pt-4">
          <Button
          type="button"
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
          className="btn-medical text-white"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        {isAnalyzing && (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            Processing image...
        </div>
        )}
      </div>
    </>
  );

  const outputPanel = !results && !isAnalyzing ? (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">🔬</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Analysis
      </h3>
      <p className="text-sm text-muted-foreground">
        Upload an eye image and click "Run AI Analysis" to get classification
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
          {imagePreview ? (
            <img src={imagePreview} alt="Eye preview" className="w-16 h-16 object-cover rounded" />
          ) : null}
          <div className="text-sm">
            <div className="font-medium text-foreground">Submitted Image</div>
            <div className="text-muted-foreground">{affectedArea ? `Affected area: ${affectedArea}` : 'Affected area: unspecified'}</div>
                </div>
              </div>
            </div>

      <div className="rounded-lg border p-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">Analysis Results</span>
            </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getRiskColor(results.riskLevel)}>
                {results.riskLevel} Risk
              </Badge>
            <span className="text-sm font-bold text-primary">{results.confidence}%</span>
              </div>
            </div>
        {results.explanation ? (
          <p className="text-sm text-muted-foreground mt-2">{results.explanation}</p>
        ) : null}
        <p className="text-xs text-muted-foreground mt-2">
          {results.disclaimer || 'This is not a medical diagnosis. Consult an ophthalmologist.'}
        </p>
      </div>

        <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Disease Details</TabsTrigger>
            <TabsTrigger value="care">Care & Tests</TabsTrigger>
            <TabsTrigger value="meds">Medication Guidance</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <RadialBarChart
                      width={320}
                      height={240}
                      innerRadius={40}
                      outerRadius={110}
                      data={results.diseases.map((d: any, i: number) => ({ name: d.name, value: Math.max(0, Math.min(100, Math.round(d.probability))), fill: `var(--color-${i})` }))}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                      <RadialBar background dataKey="value" cornerRadius={6} />
                    </RadialBarChart>
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
                        <span className="font-medium text-foreground">{Math.max(0, Math.min(100, Math.round(d.probability)))}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border p-4 bg-gradient-to-br from-accent/10 via-background to-primary/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Predictions</h3>
              <div className="space-y-3">
                {results.diseases?.map((disease: any, index: number) => (
                  <div key={index} className="rounded-xl p-4 border bg-background/60 hover:bg-background transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getRiskColor(disease.severity)}>
                          {disease.severity} Risk
                          </Badge>
                        <span className="text-sm font-bold text-primary">
                          {Math.max(0, Math.min(100, Math.round(disease.probability)))}%
                        </span>
                        </div>
                      </div>
                    <Progress value={Math.max(0, Math.min(100, Math.round(disease.probability)))} className="medical-progress h-2" />
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

                {results.explanation && (
            <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-background to-accent/5">
              <h3 className="text-lg font-semibold text-foreground mb-3">AI Analysis</h3>
              <p className="text-muted-foreground">{results.explanation}</p>
                  </div>
                )}

                {results.triage && (
            <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-background to-primary/5">
              <h3 className="text-lg font-semibold text-foreground mb-3">Care Level</h3>
                    <Badge 
                      variant={results.triage === 'Emergency' ? 'destructive' : 
                              results.triage === 'Urgent care' ? 'destructive' :
                              results.triage === 'Primary care' ? 'secondary' : 'default'}
                      className="text-lg px-4 py-2"
                    >
                      {results.triage}
                    </Badge>
                  </div>
                )}
          </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: selectable list */}
            <div className="lg:col-span-1 rounded-lg border">
              <ScrollArea className="h-[360px]">
                <div className="p-2 space-y-2">
                  {results.diseases?.map((disease: any, index: number) => {
                    const isActive = index === selectedDiseaseIndex;
                    return (
                      <button
                          key={index}
                          onClick={() => setSelectedDiseaseIndex(index)}
                        className={`w-full text-left rounded-md p-3 border transition-colors ${isActive ? 'bg-primary/10 border-primary text-foreground' : 'bg-background hover:bg-accent/40'}`}
                        >
                          <div className="flex items-center justify-between">
                          <span className="font-medium">{disease.name}</span>
                          <Badge variant="outline" className={getRiskColor(disease.severity)}>
                            {Math.max(0, Math.min(100, Math.round(disease.probability)))}%
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
                    {results.diseases?.[selectedDiseaseIndex] && (
                        <div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{results.diseases[selectedDiseaseIndex].name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getRiskColor(results.diseases[selectedDiseaseIndex].severity)}>
                        {results.diseases[selectedDiseaseIndex].severity}
                      </Badge>
                      <Badge>{Math.max(0, Math.min(100, Math.round(results.diseases[selectedDiseaseIndex].probability)))}%</Badge>
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
              {results.recommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
          </TabsContent>

          <TabsContent value="meds" className="mt-4 space-y-4">
            {(() => {
              const topDisease = results.diseases?.[0];
              const globalMeds = Array.isArray(results.medications) ? results.medications : [];
              const topMeds = Array.isArray(topDisease?.medications) && topDisease.medications.length > 0
                ? topDisease.medications
                : globalMeds;
              return (
                <>
                  {topDisease && topMeds.length > 0 && (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{topDisease.name} — medication suggestions</div>
                        <Badge variant="outline" className={getRiskColor(topDisease.severity)}>
                          {topDisease.severity || 'Low'}
                        </Badge>
                      </div>
                      <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed mt-2">
                        {topMeds.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {globalMeds.length > 0 && (
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium mb-2">General medication guidance</div>
                      <ul className="list-disc pl-5 text-sm text-foreground space-y-1.5 leading-relaxed">
                        {globalMeds.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="rounded-lg border p-4 bg-warning/5 border-warning/20">
                    <div className="text-xs text-muted-foreground">
                      This guidance is informational and not a substitute for professional medical advice. Always consult a healthcare provider for prescriptions, dosing, and contraindications.
                    </div>
                  </div>
                </>
              );
            })()}
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
        </div>
  ) : null;

  return (
    <SubModelPanel
      title="Eye Disease Detector"
      description="Upload eye images for AI-powered ophthalmological analysis and condition assessment"
      backLink="/feature/diagnosis"
      backLinkText="Back to Diagnosis Tools"
      icon="👁️"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={!!image}
      hideInputPanel={!!results}
    />
  );
};

export default EyeDiseaseDetector;
