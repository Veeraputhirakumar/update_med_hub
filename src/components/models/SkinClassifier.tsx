import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pie } from 'react-chartjs-2';
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

const SkinClassifier = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [affectedArea, setAffectedArea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockResults = {
    classification: 'Psoriasis',
    confidence: 82,
    alternatives: [
      { name: 'Psoriasis', probability: 82 },
      { name: 'Eczema', probability: 12 },
      { name: 'Normal', probability: 6 }
    ],
    careTips: [
      'Use moisturizer twice daily',
      'Avoid harsh soaps and detergents',
      'Consider topical corticosteroids as prescribed',
      'Consult dermatologist for proper treatment plan'
    ],
    riskLevel: 'Medium'
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
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
        return prev + 25;
      });
    }, 1000);
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview('');
    setAffectedArea('');
    setResults(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const chartData = {
    labels: results?.alternatives.map((alt: any) => alt.name) || [],
    datasets: [
      {
        data: results?.alternatives.map((alt: any) => alt.probability) || [],
        backgroundColor: [
          'hsl(var(--primary) / 0.8)',
          'hsl(var(--secondary) / 0.8)',
          'hsl(var(--accent) / 0.8)'
        ],
        borderColor: [
          'hsl(var(--primary))',
          'hsl(var(--secondary))',
          'hsl(var(--accent))'
        ],
        borderWidth: 2
      }
    ]
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';  
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const inputPanel = (
    <>
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload Skin Image *
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            className="hidden"
            id="skin-image-upload"
          />
          {!imagePreview ? (
            <div>
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to select skin image
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Image
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG up to 5MB
              </p>
            </div>
          ) : (
            <div>
              <img
                src={imagePreview}
                alt="Skin preview"
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
      </div>

      {/* Affected Area */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Affected Area (Optional)
        </label>
        <Select value={affectedArea} onValueChange={setAffectedArea}>
          <SelectTrigger className="medical-input">
            <SelectValue placeholder="Select affected area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="face">Face</SelectItem>
            <SelectItem value="arm">Arm</SelectItem>
            <SelectItem value="leg">Leg</SelectItem>
            <SelectItem value="torso">Torso</SelectItem>
            <SelectItem value="hand">Hand</SelectItem>
            <SelectItem value="foot">Foot</SelectItem>
            <SelectItem value="scalp">Scalp</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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
        Upload a skin image and click "Run AI Analysis" to get classification
      </p>
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      {/* Classification Result */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Classification Result
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-foreground">
              {results.classification}
            </span>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={getRiskColor(results.riskLevel)}
              >
                {results.riskLevel} Risk
              </Badge>
              <span className="text-lg font-bold text-primary">
                {results.confidence}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Chart */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Confidence Breakdown
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="w-64 mx-auto">
            <Pie 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Care Tips */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Care Recommendations
        </h3>
        <div className="space-y-2">
          {results.careTips.map((tip: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{tip}</span>
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
  ) : null;

  return (
    <SubModelPanel
      title="Skin Disease Classifier"
      description="Upload skin images for AI-powered dermatological analysis and care recommendations"
      backLink="/feature/diagnosis"
      backLinkText="Back to Diagnosis Tools"
      icon="📸"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={!!image}
    />
  );
};

export default SkinClassifier;