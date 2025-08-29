import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import FeatureDetail from "./pages/FeatureDetail";
// Import all sub-model components
import SymptomPredictor from "./components/models/SymptomPredictor";
import SkinClassifier from "./components/models/SkinClassifier";
import EyeDiseaseDetector from "./components/models/EyeDiseaseDetector";
import DrugInteractionChecker from "./components/models/DrugInteractionChecker";
import VoiceEmotionClassifier from "./components/models/VoiceEmotionClassifier";
import MealPlanGenerator from "./components/models/MealPlanGenerator";
import HealthRiskAssessment from "./components/models/HealthRiskAssessment";
import HealthReportDecoder from "./components/models/HealthReportDecoder";
import LabValueTrendResult from "./components/models/LabValueTrendResult";
import NutrientDeficiencyDetector from "./components/models/NutrientDeficiencyDetector";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="feature/:featureId" element={<FeatureDetail />} />
            
            {/* Diagnosis System Models */}
            <Route path="model/symptom-predictor" element={<SymptomPredictor />} />
            <Route path="model/skin-classifier" element={<SkinClassifier />} />
            <Route path="model/eye-detector" element={<EyeDiseaseDetector />} />
            
            {/* Health Report Models */}
            <Route path="model/pdf-summarizer" element={<HealthReportDecoder />} />
            <Route path="model/imaging-interpreter" element={<SymptomPredictor />} />
            <Route path="model/trend-forecaster" element={<LabValueTrendResult />} />
            
            {/* Nutrition Models */}
            <Route path="model/deficiency-detector" element={<NutrientDeficiencyDetector />} />
            <Route path="model/meal-generator" element={<MealPlanGenerator />} />
            <Route path="model/meal-optimizer" element={<MealPlanGenerator />} />
            
            {/* Drug Interaction Models */}
            <Route path="model/interaction-checker" element={<DrugInteractionChecker />} />
            <Route path="model/supplement-checker" element={<DrugInteractionChecker />} />
            <Route path="model/alternative-finder" element={<DrugInteractionChecker />} />
            
            {/* Mental Health Models */}
            <Route path="model/text-sentiment" element={<SymptomPredictor />} />
            <Route path="model/voice-emotion" element={<VoiceEmotionClassifier />} />
            <Route path="model/risk-tracker" element={<SymptomPredictor />} />
            
            {/* Fall & Stroke Models */}
            <Route path="model/fall-prediction" element={<SymptomPredictor />} />
            <Route path="model/stroke-calculator" element={<SymptomPredictor />} />
            <Route path="model/fall-detection" element={<SymptomPredictor />} />
            
            {/* Health Timeline Models */}
            <Route path="model/timeline-visualizer" element={<SymptomPredictor />} />
            <Route path="model/anomaly-detector" element={<SymptomPredictor />} />
            <Route path="model/health-forecasting" element={<SymptomPredictor />} />
            
            {/* Teleconsultation Models */}
            <Route path="model/medical-chatbot" element={<SymptomPredictor />} />
            <Route path="model/case-summarizer" element={<SymptomPredictor />} />
            <Route path="model/diagnosis-engine" element={<SymptomPredictor />} />
            
            {/* Voice & Breath Models */}
            <Route path="model/voice-biomarker" element={<VoiceEmotionClassifier />} />
            <Route path="model/breath-classifier" element={<VoiceEmotionClassifier />} />
            <Route path="model/disease-estimator" element={<VoiceEmotionClassifier />} />
            
            {/* Preventive Coach Models */}
            <Route path="model/risk-assessment" element={<HealthRiskAssessment />} />
            <Route path="model/test-generator" element={<HealthRiskAssessment />} />
            <Route path="model/habit-optimizer" element={<HealthRiskAssessment />} />
            
            {/* Fallback for other models - Temporarily commented out for debugging */}
            {/* <Route path="model/*" element={<SymptomPredictor />} /> */}
            
            <Route path="features" element={<Home />} />
            <Route path="about" element={<Home />} />
            <Route path="terms" element={<Home />} />
            <Route path="privacy" element={<Home />} />
            <Route path="disclaimer" element={<Home />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
