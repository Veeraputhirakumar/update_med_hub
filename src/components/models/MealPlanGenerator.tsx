import { useState } from 'react';
import { Utensils, Target, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import SubModelPanel from '../common/SubModelPanel';

ChartJS.register(ArcElement, Tooltip, Legend);

const MealPlanGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState([3]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const allergyOptions = [
    'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy', 'Fish'
  ];

  const preferenceOptions = [
    'High Protein', 'Low Carb', 'High Fiber', 'Low Sodium', 'Heart Healthy', 'Diabetic Friendly'
  ];

  const activityLabels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];

  const mockResults = {
    planType: 'Mediterranean High-Protein',
    dailyCalories: 1800,
    macros: {
      protein: 35,
      carbs: 40,
      fats: 25
    },
    weeklyPlan: {
      Monday: {
        breakfast: 'Greek Yogurt with Berries and Almonds',
        lunch: 'Grilled Chicken Salad with Quinoa',
        dinner: 'Baked Salmon with Roasted Vegetables',
        snack: 'Hummus with Vegetables'
      },
      Tuesday: {
        breakfast: 'Protein Smoothie with Spinach',
        lunch: 'Turkey and Avocado Wrap',
        dinner: 'Lean Beef Stir-fry with Brown Rice',
        snack: 'Greek Yogurt with Nuts'
      },
      Wednesday: {
        breakfast: 'Oatmeal with Protein Powder',
        lunch: 'Lentil Soup with Side Salad',
        dinner: 'Grilled Chicken with Sweet Potato',
        snack: 'Apple with Almond Butter'
      }
    },
    tips: [
      'Meal prep on Sundays for the week ahead',
      'Stay hydrated with at least 8 glasses of water daily',
      'Include a variety of colorful vegetables',
      'Adjust portion sizes based on hunger and activity'
    ]
  };

  const handleAllergyToggle = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handlePreferenceToggle = (preference: string) => {
    setPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleAnalyze = async () => {
    if (!goal) return;

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
    setCurrentStep(1);
    setGoal('');
    setAllergies([]);
    setPreferences([]);
    setActivityLevel([3]);
    setResults(null);
    setProgress(0);
  };

  const chartData = {
    labels: ['Protein', 'Carbohydrates', 'Fats'],
    datasets: [
      {
        data: results ? [results.macros.protein, results.macros.carbs, results.macros.fats] : [],
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Step 1: Health Goals *
            </label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="medical-input">
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight-loss">Weight Loss</SelectItem>
                <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                <SelectItem value="general-health">General Health</SelectItem>
                <SelectItem value="disease-management">Disease Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Step 2: Food Allergies & Restrictions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {allergyOptions.map(allergy => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={allergies.includes(allergy)}
                    onCheckedChange={() => handleAllergyToggle(allergy)}
                  />
                  <label 
                    htmlFor={`allergy-${allergy}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {allergy}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Step 3: Dietary Preferences
            </label>
            <div className="grid grid-cols-1 gap-3">
              {preferenceOptions.map(preference => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pref-${preference}`}
                    checked={preferences.includes(preference)}
                    onCheckedChange={() => handlePreferenceToggle(preference)}
                  />
                  <label 
                    htmlFor={`pref-${preference}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {preference}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Step 4: Activity Level
            </label>
            <div className="space-y-4">
              <Slider
                value={activityLevel}
                onValueChange={setActivityLevel}
                max={4}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {activityLabels.map((label, index) => (
                  <span key={index} className={activityLevel[0] === index ? 'text-primary font-medium' : ''}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-primary">
                  Current: {activityLabels[activityLevel[0]]}
                </Badge>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const inputPanel = (
    <div className="space-y-6">
      {renderStep()}
      
      {/* Step Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                step === currentStep 
                  ? 'bg-primary' 
                  : step < currentStep 
                    ? 'bg-success' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          disabled={currentStep === 4}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const outputPanel = !results && !isAnalyzing ? (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">🍽️</div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Awaiting Plan Generation
      </h3>
      <p className="text-sm text-muted-foreground">
        Complete all steps and click "Run AI Analysis" to generate your meal plan
      </p>
    </div>
  ) : results ? (
    <div className="space-y-6 animate-fade-in">
      {/* Plan Overview */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Your Personalized Plan
        </h3>
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-foreground">
              {results.planType}
            </span>
            <Badge variant="outline" className="text-primary">
              {results.dailyCalories} cal/day
            </Badge>
          </div>
        </div>
      </div>

      {/* Macro Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Macronutrient Distribution
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

      {/* Weekly Plan Sample */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Sample Weekly Plan
        </h3>
        <div className="space-y-3">
          {Object.entries(results.weeklyPlan).map(([day, meals]: [string, any]) => (
            <div key={day} className="bg-accent/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">{day}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Breakfast:</span> {meals.breakfast}</div>
                <div><span className="font-medium">Lunch:</span> {meals.lunch}</div>
                <div><span className="font-medium">Dinner:</span> {meals.dinner}</div>
                <div><span className="font-medium">Snack:</span> {meals.snack}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Success Tips
        </h3>
        <div className="space-y-2">
          {results.tips.map((tip: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <Target className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="pt-4 border-t border-border">
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Download PDF Plan
          </Button>
          <Button variant="outline" size="sm">
            Save to Profile
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SubModelPanel
      title="AI Meal Plan Generator"
      description="Generate personalized meal plans based on your health goals, preferences, and activity level"
      backLink="/feature/nutrition"
      backLinkText="Back to Nutrition Tools"
      icon="🍽️"
      inputPanel={inputPanel}
      outputPanel={outputPanel}
      isAnalyzing={isAnalyzing}
      progress={progress}
      onAnalyze={handleAnalyze}
      onReset={handleReset}
      canAnalyze={!!goal}
    />
  );
};

export default MealPlanGenerator;