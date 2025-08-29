import { useState, useRef } from 'react';
import { Mic, Upload, Play, Pause, MicOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import SubModelPanel from '../common/SubModelPanel';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VoiceEmotionClassifier = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mockResults = {
    primaryEmotion: 'Calm',
    confidence: 82,
    emotions: [
      { name: 'Calm', score: 60, color: 'hsl(var(--success))' },
      { name: 'Happy', score: 25, color: 'hsl(var(--primary))' },
      { name: 'Neutral', score: 10, color: 'hsl(var(--muted))' },
      { name: 'Anxious', score: 5, color: 'hsl(var(--warning))' }
    ],
    indicators: [
      'Steady speaking pace indicates relaxation',
      'Clear pronunciation suggests good mental state',
      'Consistent tone throughout recording',
      'No significant stress markers detected'
    ],
    analysis: 'Voice analysis indicates a generally positive and relaxed emotional state. The steady pace and clear articulation suggest good mental well-being.',
    stressLevel: 'Low'
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setAudioFile(file);
      setRecordedAudio(null);
    } else {
      alert('Please select an audio file under 10MB');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        setAudioFile(null);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnalyze = async () => {
    if (!audioFile && !recordedAudio) return;

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
    setAudioFile(null);
    setRecordedAudio(null);
    setContext('');
    setResults(null);
    setProgress(0);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const chartData = {
    labels: results?.emotions.map((emotion: any) => emotion.name) || [],
    datasets: [
      {
        label: 'Emotion Score (%)',
        data: results?.emotions.map((emotion: any) => emotion.score) || [],
        backgroundColor: results?.emotions.map((emotion: any) => emotion.color + '/0.8') || [],
        borderColor: results?.emotions.map((emotion: any) => emotion.color) || [],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`
        }
      }
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const inputPanel = (
    <>
      {/* Audio Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Voice Recording *
        </label>
        
        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">OR</div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/m4a"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Audio Preview */}
        {(audioFile || recordedAudio) && (
          <div className="mt-4 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {audioFile ? audioFile.name : 'Recorded Audio'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : 'Voice recording'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            
            <audio
              ref={audioRef}
              src={audioFile ? URL.createObjectURL(audioFile) : recordedAudio ? URL.createObjectURL(recordedAudio) : ''}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Recording Context (Optional)
        </label>
        <Select value={context} onValueChange={setContext}>
          <SelectTrigger className="medical-input">
            <SelectValue placeholder="Select context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resting">Resting State</SelectItem>
            <SelectItem value="reading">Reading Aloud</SelectItem>
            <SelectItem value="conversation">Conversation</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="phone-call">Phone Call</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const outputPanel = !results && !isAnalyzing ? (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">🎤</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Analysis
      </h3>
      <p className="text-sm text-muted-foreground">
        Record audio or upload a file and click "Run AI Analysis"
      </p>
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      {/* Primary Emotion */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Primary Emotion Detected
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">
              {results.primaryEmotion}
            </span>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={getStressColor(results.stressLevel)}
              >
                {results.stressLevel} Stress
              </Badge>
              <span className="text-lg font-bold text-primary">
                {results.confidence}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Emotion Analysis
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Analysis Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Voice Analysis Indicators
        </h3>
        <div className="space-y-2">
          {results.indicators.map((indicator: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-foreground">{indicator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Detailed Analysis
        </h3>
        <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
          <p className="text-sm text-foreground leading-relaxed">
            {results.analysis}
          </p>
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
      title="Voice Emotion Classifier"
      description="Analyze speech patterns and vocal characteristics to assess emotional state and stress levels"
      backLink="/feature/mental-health"
      backLinkText="Back to Mental Health Tools"
      icon="🎤"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={!!(audioFile || recordedAudio)}
    />
  );
};

export default VoiceEmotionClassifier;