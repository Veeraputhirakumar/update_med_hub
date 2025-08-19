import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SubModelPanel from '../common/SubModelPanel';

const DrugInteractionChecker = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const mockDrugList = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Warfarin', 'Lisinopril',
    'Metformin', 'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Levothyroxine',
    'Metoprolol', 'Hydrochlorothiazide', 'Simvastatin', 'Losartan', 'Gabapentin'
  ];

  const mockResults = {
    interactions: [
      {
        drugs: ['Aspirin', 'Warfarin'],
        severity: 'High',
        warning: 'Increased risk of bleeding. Monitor INR closely.',
        mechanism: 'Both drugs affect blood clotting mechanisms'
      },
      {
        drugs: ['Ibuprofen', 'Lisinopril'],
        severity: 'Medium',
        warning: 'May reduce effectiveness of blood pressure medication',
        mechanism: 'NSAIDs can interfere with ACE inhibitor effectiveness'
      }
    ],
    safetyMatrix: [
      { drug1: 'Aspirin', drug2: 'Warfarin', risk: 'High', color: 'destructive' },
      { drug1: 'Aspirin', drug2: 'Ibuprofen', risk: 'Medium', color: 'warning' },
      { drug1: 'Warfarin', drug2: 'Ibuprofen', risk: 'Low', color: 'success' }
    ],
    overallRisk: 'High',
    recommendations: [
      'Consult your healthcare provider before taking these medications together',
      'Monitor for signs of bleeding (bruising, unusual bleeding)',
      'Consider alternative pain management options',
      'Regular blood tests may be required'
    ]
  };

  const handleDrugSelect = (drug: string) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
  };

  const removeDrug = (drugToRemove: string) => {
    setSelectedDrugs(selectedDrugs.filter(drug => drug !== drugToRemove));
  };

  const handleAnalyze = async () => {
    if (selectedDrugs.length < 2) return;

    setIsAnalyzing(true);
    setProgress(0);
    setResults(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setResults(mockResults);
          return 100;
        }
        return prev + 33;
      });
    }, 1000);
  };

  const handleReset = () => {
    setSelectedDrugs([]);
    setDosage('');
    setResults(null);
    setProgress(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive' as const;
      case 'Medium': return 'secondary' as const;
      case 'Low': return 'outline' as const;
      default: return 'outline' as const;
    }
  };

  const inputPanel = (
    <>
      {/* Drug Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Medications * (minimum 2)
        </label>
        <Select onValueChange={handleDrugSelect}>
          <SelectTrigger className="medical-input">
            <SelectValue placeholder="Select medications" />
          </SelectTrigger>
          <SelectContent>
            {mockDrugList.filter(drug => !selectedDrugs.includes(drug)).map(drug => (
              <SelectItem key={drug} value={drug}>{drug}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Selected Drugs */}
        {selectedDrugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedDrugs.map(drug => (
              <Badge
                key={drug}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-white"
                onClick={() => removeDrug(drug)}
              >
                {drug} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Dosage Information */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Dosage Information (Optional)
        </label>
        <Input
          placeholder="e.g., Aspirin 100mg daily, Warfarin 5mg daily"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="medical-input"
          maxLength={200}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Include dosage and frequency for more accurate analysis
        </div>
      </div>
    </>
  );

  const outputPanel = !results && !isAnalyzing ? (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">💊</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Analysis
      </h3>
      <p className="text-sm text-muted-foreground">
        Select at least 2 medications and click "Run AI Analysis"
      </p>
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Risk */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Overall Interaction Risk
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <Badge 
              variant={getSeverityBadgeVariant(results.overallRisk)}
              className="text-lg px-4 py-2"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              {results.overallRisk} Risk
            </Badge>
          </div>
        </div>
      </div>

      {/* Specific Interactions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Detected Interactions
        </h3>
        <div className="space-y-3">
          {results.interactions.map((interaction: any, index: number) => (
            <div key={index} className="bg-accent/30 rounded-lg p-4 border-l-4 border-destructive">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">
                    {interaction.drugs.join(' + ')}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(interaction.severity)}>
                    {interaction.severity}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-foreground mb-2 font-medium">
                {interaction.warning}
              </p>
              <p className="text-xs text-muted-foreground">
                {interaction.mechanism}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Matrix */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Safety Matrix
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-2">
            {results.safetyMatrix.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                <span className="text-sm font-medium">{item.drug1} + {item.drug2}</span>
                <Badge variant={getSeverityBadgeVariant(item.risk)}>
                  {item.risk}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Safety Recommendations
        </h3>
        <div className="space-y-2">
          {results.recommendations.map((rec: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
            Save Analysis
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SubModelPanel
      title="Drug Interaction Checker"
      description="Check for potentially harmful drug interactions and get safety recommendations"
      backLink="/feature/drug-interactions"
      backLinkText="Back to Drug Safety Tools"
      icon="⚠️"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={selectedDrugs.length >= 2}
    />
  );
};

export default DrugInteractionChecker;