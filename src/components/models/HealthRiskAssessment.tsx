import { useState } from 'react';
import { Target, Heart, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import SubModelPanel from '../common/SubModelPanel';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const HealthRiskAssessment = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    smokingStatus: '',
    exerciseFrequency: '',
    alcoholConsumption: '',
    familyHistory: false,
    chronicConditions: [] as string[],
    medications: '',
    stressLevel: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const chronicOptions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol', 'Asthma', 'Arthritis'
  ];

  const mockResults = {
    overallRisk: 'Low-Medium',
    riskScore: 3.2,
    riskBreakdown: {
      cardiovascular: 25,
      diabetes: 15,
      cancer: 10,
      stroke: 12,
      respiratory: 8
    },
    riskFactors: [
      { factor: 'Family History', impact: 'High', modifiable: false },
      { factor: 'Sedentary Lifestyle', impact: 'Medium', modifiable: true },
      { factor: 'Stress Level', impact: 'Medium', modifiable: true },
      { factor: 'Age', impact: 'Low', modifiable: false }
    ],
    recommendations: [
      'Increase physical activity to 150 minutes per week',
      'Implement stress management techniques',
      'Schedule annual health screenings',
      'Consider consulting with a nutritionist',
      'Monitor blood pressure regularly'
    ],
    priorityActions: [
      'Start a walking routine - 30 minutes daily',
      'Reduce processed food intake',
      'Practice meditation or yoga for stress relief'
    ]
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  const handleAnalyze = async () => {
    if (!formData.age || !formData.gender) return;

    setIsAnalyzing(true);
    setProgress(10);
    setResults(null);
    setError(null);

    try {
      const payload = {
        age: formData.age,
        gender: formData.gender,
        heightCm: formData.height,
        weightKg: formData.weight,
        smokingStatus: formData.smokingStatus,
        exerciseFrequency: formData.exerciseFrequency,
        alcoholConsumption: formData.alcoholConsumption,
        familyHistory: formData.familyHistory,
        chronicConditions: formData.chronicConditions,
        medications: formData.medications,
        labs: {},
      };

      const response = await fetch('/api/history/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      setProgress(60);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let message = 'Failed to analyze history';
        try {
          const j = JSON.parse(text);
          message = j?.error || message;
          if (j?.details) message += `: ${j.details}`;
        } catch (_) {
          if (text) message = text;
        }
        throw new Error(message);
      }

      const data = await response.json();
      setProgress(100);
      setResults(data);
    } catch (e: any) {
      setError(e?.message || 'An error occurred');
      setResults(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      height: '',
      weight: '',
      smokingStatus: '',
      exerciseFrequency: '',
      alcoholConsumption: '',
      familyHistory: false,
      chronicConditions: [],
      medications: '',
      stressLevel: ''
    });
    setResults(null);
    setProgress(0);
  };

  const riskChartData = {
    labels: Object.keys(results?.riskBreakdown || {}),
    datasets: [
      {
        data: Object.values(results?.riskBreakdown || {}),
        backgroundColor: [
          'hsl(var(--destructive) / 0.8)',
          'hsl(var(--warning) / 0.8)',
          'hsl(var(--primary) / 0.8)',
          'hsl(var(--secondary) / 0.8)',
          'hsl(var(--accent) / 0.8)'
        ],
        borderColor: [
          'hsl(var(--destructive))',
          'hsl(var(--warning))',
          'hsl(var(--primary))',
          'hsl(var(--secondary))',
          'hsl(var(--accent))'
        ],
        borderWidth: 2
      }
    ]
  };

  const factorsChartData = {
    labels: results?.riskFactors.map((f: any) => f.factor) || [],
    datasets: [
      {
        label: 'Impact Level',
        data: results?.riskFactors.map((f: any) => 
          f.impact === 'High' ? 3 : f.impact === 'Medium' ? 2 : 1
        ) || [],
        backgroundColor: results?.riskFactors.map((f: any) => 
          f.modifiable ? 'hsl(var(--success) / 0.8)' : 'hsl(var(--muted) / 0.8)'
        ) || [],
        borderColor: results?.riskFactors.map((f: any) => 
          f.modifiable ? 'hsl(var(--success))' : 'hsl(var(--muted))'
        ) || [],
        borderWidth: 2
      }
    ]
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'text-destructive';
    if (risk.includes('Medium')) return 'text-warning';
    return 'text-success';
  };

  const inputPanel = (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Age *</label>
          <Input
            type="number"
            placeholder="Years"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="medical-input"
            min="18"
            max="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger className="medical-input">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Physical Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
          <Input
            type="number"
            placeholder="170"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className="medical-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
          <Input
            type="number"
            placeholder="70"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className="medical-input"
          />
        </div>
      </div>

      {/* Lifestyle Factors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Smoking Status</label>
          <Select value={formData.smokingStatus} onValueChange={(value) => handleInputChange('smokingStatus', value)}>
            <SelectTrigger className="medical-input">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="former">Former</SelectItem>
              <SelectItem value="current">Current</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Exercise Frequency</label>
          <Select value={formData.exerciseFrequency} onValueChange={(value) => handleInputChange('exerciseFrequency', value)}>
            <SelectTrigger className="medical-input">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="1-2">1-2 times/week</SelectItem>
              <SelectItem value="3-4">3-4 times/week</SelectItem>
              <SelectItem value="5+">5+ times/week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Past diagnoses (box list) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Past Diagnoses</label>
        <textarea
          placeholder="e.g., Diabetes (since 2018); Hypertension (since 2020)"
          className="medical-input w-full min-h-[70px] p-2 rounded"
          onChange={(e) => handleInputChange('chronicConditions', e.target.value.split(';').map(s => s.trim()).filter(Boolean))}
        />
        <div className="text-xs text-muted-foreground mt-1">Separate items with semicolons</div>
      </div>

      {/* Medications (box format) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Medications</label>
        <textarea
          placeholder="One per line: Name, dose, frequency\nMetformin, 500mg, 2x daily\nAmlodipine, 10mg, 1x daily"
          className="medical-input w-full min-h-[90px] p-2 rounded"
          value={formData.medications}
          onChange={(e) => handleInputChange('medications', e.target.value)}
        />
      </div>

      {/* Allergies */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Allergies</label>
        <textarea
          placeholder="e.g., Penicillin; Peanuts"
          className="medical-input w-full min-h-[60px] p-2 rounded"
          onChange={(e) => handleInputChange('allergies', e.target.value.split(';').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      {/* Family history */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Family History</label>
        <textarea
          placeholder="e.g., Father – Heart disease; Mother – Cancer"
          className="medical-input w-full min-h-[60px] p-2 rounded"
          onChange={(e) => handleInputChange('familyHistory', e.target.value.split(';').map(s => s.trim()).filter(Boolean))}
        />
      </div>

      {/* Labs */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Lab Results</label>
        <textarea
          placeholder="e.g., HbA1c=7.5; BP=140/90; LDL=130"
          className="medical-input w-full min-h-[70px] p-2 rounded"
          onChange={(e) => handleInputChange('labs', e.target.value.split(';').map(s => s.trim()).filter(Boolean))}
        />
        <div className="text-xs text-muted-foreground mt-1">Separate items with semicolons. Use key=value format where possible.</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Chronic Conditions</label>
        <div className="grid grid-cols-2 gap-2">
          {chronicOptions.map(condition => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${condition}`}
                checked={formData.chronicConditions.includes(condition)}
                onCheckedChange={() => handleConditionToggle(condition)}
              />
              <label htmlFor={`condition-${condition}`} className="text-sm text-foreground cursor-pointer">
                {condition}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Family History */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="family-history"
          checked={formData.familyHistory}
          onCheckedChange={(checked) => handleInputChange('familyHistory', checked)}
        />
        <label htmlFor="family-history" className="text-sm text-foreground cursor-pointer">
          Family history of chronic diseases
        </label>
      </div>
    </div>
  );

  const outputPanel = !results && !isAnalyzing ? (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">❓</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Assessment
      </h3>
      <p className="text-sm text-muted-foreground">
        Complete the health questionnaire to get your risk assessment
      </p>
      {error ? (
        <p className="text-sm text-destructive mt-4">{error}</p>
      ) : null}
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Risk */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Overall Health Risk</h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${getRiskColor(results.overallRisk)}`}>
              {results.overallRisk}
            </span>
            <Badge variant="outline" className="text-primary">
              Score: {results.riskScore}/10
            </Badge>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk by Category</h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="w-64 mx-auto">
            <Doughnut 
              data={riskChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk Factors Analysis</h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <Bar 
            data={factorsChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 3,
                  ticks: {
                    callback: (value) => ['Low', 'Medium', 'High'][value as number - 1] || ''
                  }
                }
              }
            }}
          />
          <div className="mt-4 text-xs text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-success rounded mr-2"></span>Modifiable
            <span className="inline-block w-3 h-3 bg-muted rounded mr-2 ml-4"></span>Non-modifiable
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Priority Actions</h3>
        <div className="space-y-2">
          {results.priorityActions.map((action: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="pt-4 border-t border-border">
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">Download Report</Button>
          <Button variant="outline" size="sm">Schedule Follow-up</Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SubModelPanel
      title="Health Risk Assessment Quiz"
      description="Comprehensive questionnaire to assess your overall health risks and get personalized recommendations"
      backLink="/feature/preventive-coach"
      backLinkText="Back to Preventive Health Tools"
      icon="❓"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={!!(formData.age && formData.gender)}
    />
  );
};

export default HealthRiskAssessment;