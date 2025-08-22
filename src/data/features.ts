import { 
  Brain, 
  FileText, 
  Apple, 
  Shield, 
  Heart, 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Mic, 
  Target 
} from "lucide-react";

export interface SubModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputType: 'text' | 'image' | 'audio' | 'file' | 'form';
  mockOutput?: any;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  subModels: SubModel[];
}

export const features: Feature[] = [
  {
    id: 'diagnosis',
    title: 'Remote Multimodal Diagnosis System',
    description: 'AI-powered diagnosis tools using symptoms, images, and medical history analysis',
    icon: Brain,
    color: 'from-blue-500 to-purple-600',
    subModels: [
      {
        id: 'symptom-predictor',
        name: 'Symptom-based Disease Predictor',
        description: 'Enter symptoms to get potential disease predictions with confidence scores',
        icon: '🔍',
        inputType: 'text',
        mockOutput: {
          diseases: [
            { name: 'Common Cold', probability: 75, severity: 'Low' },
            { name: 'Allergic Rhinitis', probability: 60, severity: 'Low' },
            { name: 'Sinusitis', probability: 45, severity: 'Medium' }
          ]
        }
      },
      {
        id: 'skin-classifier',
        name: 'Skin Disease Classifier',
        description: 'Upload skin images for AI-powered dermatological analysis',
        icon: '📸',
        inputType: 'image',
        mockOutput: {
          classification: 'Eczema',
          confidence: 87,
          recommendations: ['Apply moisturizer twice daily', 'Avoid harsh soaps', 'Consult dermatologist if symptoms persist']
        }
      },
      {
        id: 'eye-detector',
        name: 'Eye Disease Detector',
        description: 'Analyze eye images for potential conditions and abnormalities',
        icon: '👁️',
        inputType: 'image',
        mockOutput: {
          detection: 'Normal',
          riskLevel: 'Low',
          findings: ['No significant abnormalities detected', 'Healthy retinal structure']
        }
      },
      
    ]
  },
  {
    id: 'health-reports',
    title: 'Health Report Decoder',
    description: 'Intelligent interpretation of medical reports, lab results, and imaging studies',
    icon: FileText,
    color: 'from-green-500 to-teal-600',
    subModels: [
      {
        id: 'pdf-summarizer',
        name: 'PDF OCR & Lab Summarizer',
        description: 'Extract and summarize key information from medical PDFs using OCR and Gemini AI',
        icon: '📄',
        inputType: 'file',
        mockOutput: {
          patientInfo: {
            name: 'John Smith',
            age: '45 years',
            gender: 'Male',
            dateOfTest: '2024-01-15',
            patientId: 'MRN-12345',
            referringPhysician: 'Dr. Sarah Johnson',
            bloodPressure: '120/80 mmHg',
            heartRate: '72 bpm',
            temperature: '98.6°F',
            chiefComplaint: 'Routine health checkup and cholesterol monitoring'
          },
          summary: 'Overall health parameters are within acceptable ranges with mild cholesterol elevation.',
          keyFindings: [
            { finding: 'Hemoglobin: 12.5 g/dL', significance: 'Low', category: 'Lab Result', details: 'Within normal range (12.0-15.5 g/dL)' },
            { finding: 'Cholesterol: 220 mg/dL', significance: 'Medium', category: 'Alert', details: 'Elevated above normal range (<200 mg/dL)' },
            { finding: 'Blood Sugar: 95 mg/dL', significance: 'Low', category: 'Lab Result', details: 'Within normal range (70-100 mg/dL)' },
            { finding: 'White Blood Cells: 7.2 K/μL', significance: 'Low', category: 'Lab Result', details: 'Within normal range (4.5-11.0 K/μL)' },
            { finding: 'Platelets: 250 K/μL', significance: 'Low', category: 'Lab Result', details: 'Within normal range (150-450 K/μL)' }
          ],
          criticalAlerts: ['Cholesterol levels require monitoring'],
          recommendations: ['Reduce saturated fat intake', 'Increase physical activity', 'Monitor cholesterol levels monthly'],
          labValues: {
            normal: ['Hemoglobin: 12.5 g/dL (Normal: 12.0-15.5 g/dL)', 'Blood Sugar: 95 mg/dL (Normal: 70-100 mg/dL)', 'White Blood Cells: 7.2 K/μL (Normal: 4.5-11.0 K/μL)', 'Platelets: 250 K/μL (Normal: 150-450 K/μL)'],
            abnormal: ['Cholesterol: 220 mg/dL (Normal: <200 mg/dL) - Elevated']
          },
          riskLevel: 'Medium',
          nextSteps: ['Follow up in 3 months', 'Consider dietary changes', 'Schedule lipid panel retest']
        }
      },
      {
        id: 'imaging-interpreter',
        name: 'CT/MRI Report Interpreter',
        description: 'Simplified interpretation of complex imaging reports',
        icon: '🧠',
        inputType: 'text',
        mockOutput: {
          findings: ['No acute abnormalities', 'Age-appropriate changes'],
          severity: 'Normal',
          recommendations: ['Continue routine monitoring']
        }
      },
      {
        id: 'trend-forecaster',
        name: 'Lab Value Trend Forecaster',
        description: 'Predict future health trends based on historical lab data',
        icon: '📈',
        inputType: 'file',
        mockOutput: {
          trends: [
            { parameter: 'Cholesterol', trend: 'Increasing', forecast: '240 mg/dL in 6 months' },
            { parameter: 'Blood Pressure', trend: 'Stable', forecast: 'Within normal range' }
          ]
        }
      }
    ]
  },
  {
    id: 'nutrition',
    title: 'Personalized Nutritionist + Disease Reversal',
    description: 'AI-powered nutrition planning and dietary recommendations for optimal health',
    icon: Apple,
    color: 'from-orange-500 to-red-600',
    subModels: [
      {
        id: 'deficiency-detector',
        name: 'Nutrient Deficiency Detector',
        description: 'Analyze lab values to identify potential nutrient deficiencies',
        icon: '🧪',
        inputType: 'form',
        mockOutput: {
          deficiencies: [
            { nutrient: 'Vitamin D', level: 'Low', recommendation: 'Increase sun exposure, consider supplements' },
            { nutrient: 'Iron', level: 'Borderline', recommendation: 'Include iron-rich foods' }
          ]
        }
      },
      {
        id: 'meal-generator',
        name: 'AI Meal Plan Generator',
        description: 'Generate personalized meal plans based on health goals and preferences',
        icon: '🍽️',
        inputType: 'form',
        mockOutput: {
          weeklyPlan: 'Mediterranean-style meal plan',
          dailyCalories: 1800,
          macros: { protein: '25%', carbs: '45%', fats: '30%' }
        }
      },
      {
        id: 'meal-optimizer',
        name: 'Adaptive Meal Optimizer',
        description: 'Continuously optimize meal plans based on feedback and results',
        icon: '⚡',
        inputType: 'form',
        mockOutput: {
          optimizations: ['Increased fiber content', 'Reduced sodium'],
          improvements: '15% better nutrient balance'
        }
      }
    ]
  },
  {
    id: 'drug-interactions',
    title: 'Drug Interaction & Alert System',
    description: 'Comprehensive drug safety checking and interaction analysis',
    icon: Shield,
    color: 'from-red-500 to-pink-600',
    subModels: [
      {
        id: 'interaction-checker',
        name: 'Drug Interaction Checker',
        description: 'Check for potentially harmful drug interactions',
        icon: '⚠️',
        inputType: 'form',
        mockOutput: {
          interactions: [
            { drugs: ['Warfarin', 'Aspirin'], severity: 'High', warning: 'Increased bleeding risk' }
          ],
          safetyScore: 65
        }
      },
      {
        id: 'supplement-checker',
        name: 'Supplement Safety Checker',
        description: 'Verify safety of supplements with current medications',
        icon: '💊',
        inputType: 'form',
        mockOutput: {
          safety: 'Caution advised',
          conflicts: ['St. John\'s Wort may reduce effectiveness of prescription medications']
        }
      },
      {
        id: 'alternative-finder',
        name: 'Alternative Drug Finder',
        description: 'Find safer alternatives to current medications',
        icon: '🔄',
        inputType: 'text',
        mockOutput: {
          alternatives: [
            { drug: 'Lisinopril', reason: 'Lower side effect profile', effectiveness: '95%' }
          ]
        }
      }
    ]
  },
  {
    id: 'mental-health',
    title: 'Mental Health Emotion Monitor',
    description: 'AI-powered emotional analysis and mental health tracking tools',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    subModels: [
      {
        id: 'text-sentiment',
        name: 'Text Sentiment Analyzer',
        description: 'Analyze written text for emotional patterns and mental health indicators',
        icon: '📝',
        inputType: 'text',
        mockOutput: {
          sentiment: 'Neutral-Positive',
          emotions: { joy: 40, anxiety: 20, calm: 30, sadness: 10 },
          score: 7.2
        }
      },
      {
        id: 'voice-emotion',
        name: 'Voice Emotion Classifier',
        description: 'Analyze speech patterns for emotional state assessment',
        icon: '🎤',
        inputType: 'audio',
        mockOutput: {
          primaryEmotion: 'Calm',
          confidence: 82,
          indicators: ['Steady pace', 'Clear pronunciation', 'Relaxed tone']
        }
      },
      {
        id: 'risk-tracker',
        name: 'Mental Health Risk Tracker',
        description: 'Track mental health patterns over time and identify risk factors',
        icon: '📊',
        inputType: 'form',
        mockOutput: {
          riskLevel: 'Low',
          trends: 'Improving over past month',
          recommendations: ['Continue current activities', 'Maintain social connections']
        }
      }
    ]
  },
  {
    id: 'fall-stroke',
    title: 'Elderly Fall & Stroke Risk Predictor',
    description: 'Advanced risk assessment for falls and stroke prevention in elderly patients',
    icon: Activity,
    color: 'from-purple-500 to-indigo-600',
    subModels: [
      {
        id: 'fall-prediction',
        name: 'Fall Risk Prediction from Gait',
        description: 'Analyze gait patterns from video to predict fall risk',
        icon: '🚶',
        inputType: 'file',
        mockOutput: {
          fallRisk: 'Medium',
          riskFactors: ['Slightly unsteady gait', 'Reduced step length'],
          probability: 35
        }
      },
      {
        id: 'stroke-calculator',
        name: 'Stroke Probability Calculator',
        description: 'Calculate stroke risk based on vital signs and health factors',
        icon: '🧠',
        inputType: 'form',
        mockOutput: {
          strokeRisk: 'Low',
          riskScore: 2.1,
          preventionTips: ['Regular exercise', 'Blood pressure monitoring', 'Healthy diet']
        }
      },
      {
        id: 'fall-detection',
        name: 'Real-time Fall Detection',
        description: 'Continuous monitoring for fall detection using camera feed',
        icon: '📹',
        inputType: 'image',
        mockOutput: {
          status: 'Normal activity',
          confidence: 95,
          lastUpdate: new Date().toLocaleTimeString()
        }
      }
    ]
  },
  {
    id: 'health-timeline',
    title: 'Personal Health Timeline & Anomaly Detector',
    description: 'Comprehensive health data visualization and anomaly detection over time',
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-600',
    subModels: [
      {
        id: 'timeline-visualizer',
        name: 'Time Series Health Visualizer',
        description: 'Create interactive timelines of health data and trends',
        icon: '📈',
        inputType: 'file',
        mockOutput: {
          timeRange: '12 months',
          dataPoints: 365,
          trends: ['Weight: Decreasing', 'BP: Stable', 'Exercise: Increasing']
        }
      },
      {
        id: 'anomaly-detector',
        name: 'Health Anomaly Detector',
        description: 'Identify unusual patterns in health data that may require attention',
        icon: '🚨',
        inputType: 'file',
        mockOutput: {
          anomalies: [
            { date: '2024-01-15', parameter: 'Heart Rate', value: '105 bpm', severity: 'Medium' }
          ]
        }
      },
      {
        id: 'health-forecasting',
        name: 'Health Forecasting',
        description: 'Predict future health trends based on historical data',
        icon: '🔮',
        inputType: 'file',
        mockOutput: {
          forecast: '6 months',
          predictions: ['Weight will stabilize at current level', 'Blood pressure may increase slightly']
        }
      }
    ]
  },
  {
    id: 'teleconsultation',
    title: 'Teleconsultation AI Assistant',
    description: 'AI-powered support tools for remote medical consultations and case management',
    icon: MessageSquare,
    color: 'from-indigo-500 to-purple-600',
    subModels: [
      {
        id: 'medical-chatbot',
        name: 'AI Medical Chatbot',
        description: 'Interactive AI assistant for medical questions and guidance',
        icon: '🤖',
        inputType: 'text',
        mockOutput: {
          response: 'Based on your symptoms, this appears to be a minor condition. I recommend...',
          confidence: 78,
          followUp: ['Monitor symptoms for 24-48 hours', 'Contact doctor if symptoms worsen']
        }
      },
      {
        id: 'case-summarizer',
        name: 'Case Summary Generator',
        description: 'Generate comprehensive summaries of patient consultations',
        icon: '📋',
        inputType: 'text',
        mockOutput: {
          summary: 'Patient presented with mild respiratory symptoms...',
          keyPoints: ['No fever', 'Normal oxygen saturation', 'Mild cough'],
          recommendations: 'Rest and hydration'
        }
      },
      {
        id: 'diagnosis-engine',
        name: 'Diagnosis Suggestion Engine',
        description: 'AI-powered differential diagnosis suggestions for healthcare providers',
        icon: '🔍',
        inputType: 'form',
        mockOutput: {
          differentials: [
            { diagnosis: 'Viral upper respiratory infection', probability: 85 },
            { diagnosis: 'Allergic rhinitis', probability: 45 }
          ]
        }
      }
    ]
  },
  {
    id: 'voice-breath',
    title: 'Voice & Breath Biomarker Analyzer',
    description: 'Advanced analysis of voice and breathing patterns for health assessment',
    icon: Mic,
    color: 'from-teal-500 to-green-600',
    subModels: [
      {
        id: 'voice-biomarker',
        name: 'Voice Biomarker Detector',
        description: 'Analyze voice patterns for health condition indicators',
        icon: '🎵',
        inputType: 'audio',
        mockOutput: {
          biomarkers: ['Vocal tremor: Mild', 'Breath support: Good', 'Articulation: Clear'],
          healthScore: 8.2
        }
      },
      {
        id: 'breath-classifier',
        name: 'Breath Sound Classifier',
        description: 'Classify breath sounds and detect respiratory abnormalities',
        icon: '💨',
        inputType: 'audio',
        mockOutput: {
          classification: 'Normal breathing',
          abnormalities: 'None detected',
          lungHealth: 'Good'
        }
      },
      {
        id: 'disease-estimator',
        name: 'Disease Risk Estimator',
        description: 'Estimate disease risk based on vocal and respiratory biomarkers',
        icon: '📊',
        inputType: 'audio',
        mockOutput: {
          risks: [
            { condition: 'Respiratory infection', risk: 'Low', confidence: 75 },
            { condition: 'Vocal cord issues', risk: 'Very Low', confidence: 88 }
          ]
        }
      }
    ]
  },
  {
    id: 'preventive-coach',
    title: 'Smart Preventive Health Coach',
    description: 'Personalized preventive health recommendations and lifestyle optimization',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
    subModels: [
      {
        id: 'risk-assessment',
        name: 'Health Risk Assessment Quiz',
        description: 'Comprehensive questionnaire to assess overall health risks',
        icon: '❓',
        inputType: 'form',
        mockOutput: {
          overallRisk: 'Low-Medium',
          riskBreakdown: {
            cardiovascular: 25,
            diabetes: 15,
            cancer: 10
          },
          recommendations: ['Increase physical activity', 'Improve diet quality']
        }
      },
      {
        id: 'test-generator',
        name: 'Recommended Tests Generator',
        description: 'Generate personalized recommendations for health screenings and tests',
        icon: '🧪',
        inputType: 'form',
        mockOutput: {
          tests: [
            { test: 'Lipid Panel', priority: 'High', frequency: 'Annual' },
            { test: 'Mammography', priority: 'Medium', frequency: 'Biennial' }
          ]
        }
      },
      {
        id: 'habit-optimizer',
        name: 'Lifestyle Habit Optimizer',
        description: 'Personalized recommendations for optimizing daily health habits',
        icon: '🎯',
        inputType: 'form',
        mockOutput: {
          currentScore: 7.2,
          improvements: [
            { habit: 'Sleep quality', impact: 'High', suggestion: 'Maintain consistent bedtime' },
            { habit: 'Exercise frequency', impact: 'Medium', suggestion: 'Add 2 more days per week' }
          ]
        }
      }
    ]
  }
];