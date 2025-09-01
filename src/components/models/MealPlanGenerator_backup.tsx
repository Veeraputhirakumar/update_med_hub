import { useState, useEffect } from 'react';
import { 
  Utensils, User, Target, Heart, Clock, Activity, AlertTriangle, CheckCircle, 
  ArrowRight, ArrowLeft, Brain, Sparkles, Gift, Calendar, ChefHat, TrendingUp,
  Droplets, Flame, Award, RefreshCw, Smile, PieChart, BarChart3, Lightbulb,
  Crown, Gem, Settings, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

// Enhanced interfaces for the new meal planner
interface UserProfile {
  // Basic Info
  age: string;
  gender: string;
  height: string;
  weight: string;
  bmi: number;
  
  // Medical History
  medicalConditions: string[];
  allergies: string[];
  
  // Goals
  primaryGoal: string;
  specificGoals: string[];
  
  // Lifestyle & Preferences
  activityLevel: string;
  sleepHours: number;
  sleepQuality: string;
  dietType: string;
  cuisinePreferences: string[];
  
  // Unique Engagement Inputs
  mealTiming: string;
  foodDislikes: string[];
  culturalMode: string;
}

interface MealPlan {
  day: string;
  meals: {
    breakfast: Meal;
    morningSnack: Meal;
    lunch: Meal;
    eveningSnack: Meal;
    dinner: Meal;
  };
  nutritionalBreakdown: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    iron: number;
    hydrationScore: number;
    gutHealthScore: number;
  };
  uniqueFeatures: {
    hydrationReminder: string;
    moodConnection: string;
    weeklyProgress: string;
  };
}

interface Meal {
  name: string;
  emoji: string;
  portionSize: string;
  cookingInstructions: string[];
  alternatives: string[];
  calories: number;
  benefits: string[];
}

const MealPlanGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Enhanced user profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    bmi: 0,
    medicalConditions: [],
    allergies: [],
    primaryGoal: '',
    specificGoals: [],
    activityLevel: '',
    sleepHours: 7,
    sleepQuality: 'good',
    dietType: '',
    cuisinePreferences: [],
    mealTiming: '3_meals',
    foodDislikes: [],
    culturalMode: 'none'
  });

  // Days selection state
  const [selectedDays, setSelectedDays] = useState(7);

  // Auto-calculate BMI
  useEffect(() => {
    if (userProfile.height && userProfile.weight) {
      const heightInM = parseInt(userProfile.height) / 100;
      const weightInKg = parseInt(userProfile.weight);
      const calculatedBMI = weightInKg / (heightInM * heightInM);
      setUserProfile(prev => ({ ...prev, bmi: Math.round(calculatedBMI * 10) / 10 }));
    }
  }, [userProfile.height, userProfile.weight]);

  // Medical conditions options
  const medicalConditions = [
    'Diabetes', 'Hypertension', 'Kidney Issues', 'Heart Disease', 
    'Thyroid Issues', 'PCOS', 'Cholesterol', 'Arthritis'
  ];

  // Primary goals
  const primaryGoals = [
    { id: 'weight_loss', name: 'Weight Loss', emoji: '📉' },
    { id: 'weight_gain', name: 'Weight Gain', emoji: '📈' },
    { id: 'muscle_gain', name: 'Muscle Gain', emoji: '💪' },
    { id: 'balanced_health', name: 'Balanced Health', emoji: '⚖️' }
  ];

  // Specific goals
  const specificGoals = [
    { id: 'gut_health', name: 'Gut Health', emoji: '🦠' },
    { id: 'glowing_skin', name: 'Glowing Skin', emoji: '✨' },
    { id: 'hormonal_balance', name: 'Hormonal Balance', emoji: '⚖️' },
    { id: 'heart_health', name: 'Heart Health', emoji: '❤️' },
    { id: 'anti_aging', name: 'Anti-Aging', emoji: '🧬' }
  ];

  // Activity levels
  const activityLevels = [
    { id: 'sedentary', name: 'Sedentary', emoji: '🪑' },
    { id: 'moderate', name: 'Moderate', emoji: '🚶' },
    { id: 'active', name: 'Active', emoji: '🏃' },
    { id: 'athlete', name: 'Athlete', emoji: '🏋️' }
  ];

  // Diet types
  const dietTypes = [
    { id: 'veg', name: 'Vegetarian', emoji: '🥬' },
    { id: 'vegan', name: 'Vegan', emoji: '🌱' },
    { id: 'keto', name: 'Keto', emoji: '🥑' },
    { id: 'low-carb', name: 'Low-Carb', emoji: '🥩' },
    { id: 'gluten-free', name: 'Gluten-Free', emoji: '🌾' },
    { id: 'jain', name: 'Jain', emoji: '🙏' },
    { id: 'balanced', name: 'Balanced', emoji: '⚖️' }
  ];

  // Cuisines
  const cuisines = [
    { id: 'indian', name: 'Indian', emoji: '🍛' },
    { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
    { id: 'asian', name: 'Asian', emoji: '🍜' },
    { id: 'continental', name: 'Continental', emoji: '🍝' },
    { id: 'mexican', name: 'Mexican', emoji: '🌮' },
    { id: 'middle-eastern', name: 'Middle Eastern', emoji: '🥙' }
  ];

  // Cultural/Festival modes
  const culturalModes = [
    { id: 'none', name: 'Regular', emoji: '🍽️' },
    { id: 'navratri', name: 'Navratri Fasting', emoji: '🕉️' },
    { id: 'ramadan', name: 'Ramadan', emoji: '🌙' },
    { id: 'christmas', name: 'Christmas Prep', emoji: '🎄' },
    { id: 'wedding', name: 'Wedding Prep', emoji: '💒' }
  ];

  // Meal timing options
  const mealTimingOptions = [
    { id: '3_meals', name: '3 Meals/Day', emoji: '🍽️' },
    { id: '5_meals', name: '5 Meals/Day', emoji: '🍽️🍽️' },
    { id: 'intermittent_16_8', name: 'Intermittent Fasting 16:8', emoji: '⏰' },
    { id: 'intermittent_14_10', name: 'Intermittent Fasting 14:10', emoji: '⏰' }
  ];

  // Common food dislikes
  const commonDislikes = [
    'Mushrooms', 'Olives', 'Seafood', 'Spicy Food', 
    'Dairy', 'Nuts', 'Eggs', 'Onions',
    'Garlic', 'Cilantro', 'Coconut', 'Tomatoes'
  ];

  const generateMealPlan = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      setProgress(20);
      
      // Create comprehensive user profile for Gemini
      const userProfileText = `
User Profile for AI Meal Plan Generation:

BASIC INFORMATION:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- BMI: ${userProfile.bmi}

MEDICAL HISTORY:
- Medical Conditions: ${userProfile.medicalConditions.join(', ') || 'None'}
- Allergies: ${userProfile.allergies.join(', ') || 'None'}

GOALS:
- Primary Goal: ${userProfile.primaryGoal}
- Specific Goals: ${userProfile.specificGoals.join(', ')}

LIFESTYLE & PREFERENCES:
- Activity Level: ${userProfile.activityLevel}
- Sleep Hours: ${userProfile.sleepHours}
- Sleep Quality: ${userProfile.sleepQuality}
- Diet Type: ${userProfile.dietType}
- Favorite Cuisines: ${userProfile.cuisinePreferences.join(', ')}

UNIQUE ENGAGEMENT:
- Meal Timing: ${userProfile.mealTiming}
- Food Dislikes: ${userProfile.foodDislikes.join(', ') || 'None'}
- Cultural/Festival Mode: ${userProfile.culturalMode}
      `;

      setProgress(40);
      
      // Call Gemini API
      const mealPlanData = await callGeminiForMealPlan(userProfileText);
      
      setProgress(80);
      
      if (mealPlanData) {
        setMealPlan(mealPlanData);
        setCurrentStep(2); // Move to results step
      } else {
        throw new Error('Failed to generate meal plan with AI');
      }
      
      setProgress(100);
      
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      setError(error.message || 'Failed to generate meal plan. Please try again.');
      
      // Generate mock data as fallback
      generateMockMealPlan();
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const callGeminiForMealPlan = async (userProfileText: string): Promise<MealPlan[]> => {
    const GEMINI_API_KEY = 'AIzaSyBUIwW1exVkPrqPT_jLtIRG1wiivEnRn9I';
    
    const prompt = `You are an expert nutritionist and meal planner. Create a comprehensive ${selectedDays}-day personalized meal plan based on the user's profile.

Please generate a meal plan in the following JSON format:

{
  "mealPlan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "emoji": "🍽️",
          "portionSize": "1 bowl (250ml)",
          "cookingInstructions": ["Step 1", "Step 2", "Step 3"],
          "alternatives": ["Alternative 1", "Alternative 2"],
          "calories": 300,
          "benefits": ["Benefit 1", "Benefit 2"]
        },
        "morningSnack": { /* same structure */ },
        "lunch": { /* same structure */ },
        "eveningSnack": { /* same structure */ },
        "dinner": { /* same structure */ }
      },
      "nutritionalBreakdown": {
        "calories": 1800,
        "protein": 120,
        "carbs": 200,
        "fats": 60,
        "fiber": 30,
        "iron": 15,
        "hydrationScore": 85,
        "gutHealthScore": 90
      },
      "uniqueFeatures": {
        "hydrationReminder": "Drink 2.5L water. Try: Cucumber mint water, Lemon ginger detox",
        "moodConnection": "This plan helps boost serotonin for better mood with magnesium-rich foods",
        "weeklyProgress": "Projected 0.5kg weight loss this week with 300 calories deficit"
      }
    }
  ]
}

IMPORTANT GUIDELINES:
1. Create exactly ${selectedDays} days of meal plans starting from Monday
2. Consider the user's diet type: ${userProfile.dietType}
3. Include their favorite cuisines: ${userProfile.cuisinePreferences.join(', ')}
4. Avoid foods they dislike: ${userProfile.foodDislikes.join(', ') || 'None'}
5. Focus on their primary goal: ${userProfile.primaryGoal}
6. Consider their activity level: ${userProfile.activityLevel}
7. Respect their meal timing preference: ${userProfile.mealTiming}
8. Include cultural elements: ${userProfile.culturalMode}
9. Provide specific portion sizes and detailed cooking instructions
10. Include alternative swap options for each meal
11. Focus on mood-boosting and gut-health foods
12. Make meals Instagram-worthy and visually appealing

User Profile:
${userProfileText}

Generate the complete 7-day meal plan now:`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to call Gemini API');
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini AI');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      
      const parsedResult = JSON.parse(jsonString);
      
      if (parsedResult.mealPlan && Array.isArray(parsedResult.mealPlan)) {
        return parsedResult.mealPlan;
      } else {
        throw new Error('Invalid meal plan format from AI');
      }
      
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate meal plan with AI: ' + error.message);
    }
  };

  const generateMockMealPlan = () => {
    const mockPlan: MealPlan[] = [
      {
        day: 'Monday',
        meals: {
          breakfast: {
            name: 'Golden Turmeric Smoothie Bowl',
            emoji: '🥣',
            portionSize: '1 bowl (300ml)',
            cookingInstructions: [
              'Blend 1 mango, 1 banana with 200ml coconut milk',
              'Add 1/2 tsp turmeric and 1 tbsp honey',
              'Pour into bowl and top with chia seeds and berries'
            ],
            alternatives: ['Papaya Smoothie Bowl', 'Oats Smoothie Bowl'],
            calories: 320,
            benefits: ['Anti-inflammatory', 'Boosts immunity', 'Glowing skin']
          },
          morningSnack: {
            name: 'Stress-Busting Almond Mix',
            emoji: '🥜',
            portionSize: '30g (small handful)',
            cookingInstructions: [
              'Mix 10 almonds, 5 walnuts, and 1 tbsp pumpkin seeds',
              'Add 2-3 dark chocolate chips',
              'Store in airtight container'
            ],
            alternatives: ['Roasted Chickpeas', 'Fruit & Nut Bar'],
            calories: 150,
            benefits: ['Reduces stress hormones', 'Brain food', 'Sustained energy']
          },
          lunch: {
            name: 'Rainbow Buddha Bowl',
            emoji: '🌈',
            portionSize: '1 large bowl (400g)',
            cookingInstructions: [
              'Cook 1/2 cup quinoa in vegetable broth',
              'Roast mixed vegetables (bell peppers, carrots, broccoli)',
              'Add 1/2 cup cooked chickpeas and sliced avocado',
              'Drizzle with tahini dressing'
            ],
            alternatives: ['Brown Rice Bowl', 'Millet Power Bowl'],
            calories: 450,
            benefits: ['Complete protein', 'Fiber-rich', 'Gut health', 'Colorful antioxidants']
          },
          eveningSnack: {
            name: 'Mood-Lifting Green Tea & Dates',
            emoji: '🍵',
            portionSize: '1 cup tea + 2 dates',
            cookingInstructions: [
              'Steep green tea bag in hot water for 3 minutes',
              'Add fresh mint leaves',
              'Serve with 2 Medjool dates'
            ],
            alternatives: ['Herbal Tea & Figs', 'Matcha Latte'],
            calories: 80,
            benefits: ['Antioxidants', 'Natural sweetness', 'Calm energy']
          },
          dinner: {
            name: 'Spiced Paneer with Cauliflower Rice',
            emoji: '🧀',
            portionSize: '150g paneer + 200g cauliflower rice',
            cookingInstructions: [
              'Marinate paneer cubes in yogurt and spices for 30 minutes',
              'Grill paneer until golden',
              'Pulse cauliflower in food processor to make rice',
              'Sauté cauliflower rice with cumin and turmeric',
              'Serve with lemon wedge'
            ],
            alternatives: ['Grilled Tofu', 'Chickpea Curry'],
            calories: 420,
            benefits: ['High protein', 'Low carb', 'Calcium rich', 'Probiotic support']
          }
        },
        nutritionalBreakdown: {
          calories: 1420,
          protein: 85,
          carbs: 125,
          fats: 65,
          fiber: 35,
          iron: 12,
          hydrationScore: 85,
          gutHealthScore: 88
        },
        uniqueFeatures: {
          hydrationReminder: 'Target: 2.5L water today. Try infused water with cucumber-mint or lemon-ginger for extra flavor and detox benefits.',
          moodConnection: 'Today\'s meals are rich in magnesium and omega-3s to naturally boost serotonin levels and improve your mood!',
          weeklyProgress: 'Following this plan, you\'re on track to lose 0.5kg this week with a healthy 300-calorie deficit per day.'
        }
      }
    ];
    
    // Generate additional days based on selectedDays
    const days = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const additionalDays = days.slice(0, selectedDays - 1);
    additionalDays.forEach((day, index) => {
      mockPlan.push({
        ...mockPlan[0],
        day: day,
        nutritionalBreakdown: {
          ...mockPlan[0].nutritionalBreakdown,
          calories: 1420 + (index * 50), // Slight variations
          gutHealthScore: 85 + index,
          hydrationScore: 80 + index
        }
      });
    });
    
    setMealPlan(mockPlan);
    setCurrentStep(2);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { category: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-orange-100 text-orange-800' };
    return { category: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const toggleArrayItem = (array: string[], item: string, fieldName: keyof UserProfile) => {
    const isSelected = array.includes(item);
    setUserProfile(prev => ({
      ...prev,
      [fieldName]: isSelected 
        ? array.filter(i => i !== item)
        : [...array, item]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <Button variant="ghost" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 group p-0 h-auto font-normal">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Nutrition Tools
            </Button>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              AI Meal Plan Generator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create personalized, interactive meal plans with AI-powered nutrition insights, 
              mood-boosting recipes, and beautiful visual dashboards tailored to your health goals.
            </p>
          </div>
        </div>

        {/* Single Full-Width Form */}
        {!mealPlan.length && (
          <div className="max-w-5xl mx-auto">
            <Card className="medical-card">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <Settings className="w-6 h-6 text-primary" />
                  <span>Create Your Personalized Meal Plan</span>
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Tell us about yourself to get AI-powered nutrition recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Basic Info with BMI Calculator */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Age *</label>
                      <Input
                        id="age"
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="28"
                        className="medical-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
                      <Select value={userProfile.gender} onValueChange={(value) => setUserProfile(prev => ({ ...prev, gender: value }))}>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Height (cm) *</label>
                      <Input
                        id="height"
                        type="number"
                        value={userProfile.height}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="165"
                        className="medical-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Weight (kg) *</label>
                      <Input
                        id="weight"
                        type="number"
                        value={userProfile.weight}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="65"
                        className="medical-input"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* BMI Display */}
                  {userProfile.bmi > 0 && (
                    <div className="rounded-lg border p-4 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">Your BMI</h4>
                          <p className="text-2xl font-bold text-primary">{userProfile.bmi}</p>
                        </div>
                        <Badge className={getBMICategory(userProfile.bmi).color}>
                          {getBMICategory(userProfile.bmi).category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Days Selection Bar */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border">
                    <h4 className="font-semibold text-foreground mb-4 text-center">
                      How many days meal plan do you want?
                    </h4>
                    <div className="flex items-center justify-center space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <Button
                          key={day}
                          variant={selectedDays === day ? "default" : "outline"}
                          size="lg"
                          onClick={() => setSelectedDays(day)}
                          className={`w-12 h-12 rounded-full font-bold ${
                            selectedDays === day 
                              ? 'bg-primary text-white shadow-lg scale-110' 
                              : 'hover:bg-primary/10'
                          } transition-all duration-200`}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <p className="text-center text-muted-foreground mt-3">
                      Selected: <span className="font-semibold text-primary">{selectedDays} day{selectedDays > 1 ? 's' : ''}</span> meal plan
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Medical History */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Medical History
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Medical Conditions (Select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {medicalConditions.map((condition) => (
                        <Button
                          key={condition}
                          variant={userProfile.medicalConditions.includes(condition) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(userProfile.medicalConditions, condition, 'medicalConditions')}
                          className="text-xs justify-start"
                        >
                          {condition}
                          {userProfile.medicalConditions.includes(condition) && <CheckCircle className="w-3 h-3 ml-2" />}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Food Allergies</label>
                    <Input
                      id="allergies"
                      value={userProfile.allergies.join(', ')}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, allergies: e.target.value.split(', ').filter(Boolean) }))}
                      placeholder="e.g., Nuts, Dairy, Shellfish"
                      className="medical-input"
                    />
                  </div>
                </div>

                <Separator />

                {/* Goals */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Health Goals
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Primary Goal *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {primaryGoals.map((goal) => (
                        <Button
                          key={goal.id}
                          variant={userProfile.primaryGoal === goal.id ? "default" : "outline"}
                          size="lg"
                          onClick={() => setUserProfile(prev => ({ ...prev, primaryGoal: goal.id }))}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          <span className="text-2xl">{goal.emoji}</span>
                          <span className="text-xs">{goal.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Specific Goals (Select multiple)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {specificGoals.map((goal) => (
                        <Button
                          key={goal.id}
                          variant={userProfile.specificGoals.includes(goal.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(userProfile.specificGoals, goal.id, 'specificGoals')}
                          className="flex items-center gap-2 justify-start"
                        >
                          <span>{goal.emoji}</span>
                          <span>{goal.name}</span>
                          {userProfile.specificGoals.includes(goal.id) && <CheckCircle className="w-4 h-4 ml-auto" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Lifestyle & Preferences */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Lifestyle & Preferences
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Daily Activity Level *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {activityLevels.map((level) => (
                        <Button
                          key={level.id}
                          variant={userProfile.activityLevel === level.id ? "default" : "outline"}
                          size="lg"
                          onClick={() => setUserProfile(prev => ({ ...prev, activityLevel: level.id }))}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          <span className="text-2xl">{level.emoji}</span>
                          <span className="text-xs">{level.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sleep Hours: {userProfile.sleepHours}h</label>
                      <Slider
                        value={[userProfile.sleepHours]}
                        onValueChange={([value]) => setUserProfile(prev => ({ ...prev, sleepHours: value }))}
                        max={12}
                        min={4}
                        step={0.5}
                        className="mt-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sleep Quality</label>
                      <Select value={userProfile.sleepQuality} onValueChange={(value) => setUserProfile(prev => ({ ...prev, sleepQuality: value }))}>
                        <SelectTrigger className="medical-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Diet Type *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {dietTypes.map((diet) => (
                        <Button
                          key={diet.id}
                          variant={userProfile.dietType === diet.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUserProfile(prev => ({ ...prev, dietType: diet.id }))}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span>{diet.emoji}</span>
                          <span>{diet.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Favorite Cuisines</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {cuisines.map((cuisine) => (
                        <Button
                          key={cuisine.id}
                          variant={userProfile.cuisinePreferences.includes(cuisine.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(userProfile.cuisinePreferences, cuisine.id, 'cuisinePreferences')}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span>{cuisine.emoji}</span>
                          <span>{cuisine.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Unique Engagement Inputs */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Unique Engagement Inputs
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Meal Timing Flexibility</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      {mealTimingOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={userProfile.mealTiming === option.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUserProfile(prev => ({ ...prev, mealTiming: option.id }))}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <span>{option.emoji}</span>
                          <span className="text-xs text-center">{option.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Food Dislikes (Auto exclude from plan)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {commonDislikes.map((food) => (
                        <Button
                          key={food}
                          variant={userProfile.foodDislikes.includes(food.toLowerCase()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrayItem(userProfile.foodDislikes, food.toLowerCase(), 'foodDislikes')}
                          className="text-xs"
                        >
                          {food}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Cultural/Festival Mode</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      {culturalModes.map((mode) => (
                        <Button
                          key={mode.id}
                          variant={userProfile.culturalMode === mode.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUserProfile(prev => ({ ...prev, culturalMode: mode.id }))}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <span className="text-lg">{mode.emoji}</span>
                          <span className="text-xs text-center">{mode.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-6">
                  <Button 
                    onClick={generateMealPlan} 
                    disabled={isProcessing || !userProfile.age || !userProfile.gender || !userProfile.height || !userProfile.weight || !userProfile.primaryGoal || !userProfile.activityLevel || !userProfile.dietType}
                    className="btn-medical text-white w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Creating Your Personalized Plan...' : 'Generate My AI Meal Plan'}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">AI Processing Your Profile...</span>
                        <span className="text-primary font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="medical-progress" />
                    </div>
                  )}

                  {error && (
                    <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded mb-4 text-sm mt-4">
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Display - Full Width */}
        {mealPlan.length > 0 && (
          <div className="max-w-7xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Personalized Meal Plan</h2>
              <Button variant="outline" onClick={() => { setMealPlan([]); }}>
                Create New Plan
              </Button>
            </div>
            <div className="space-y-6 animate-fade-in">
                  {/* Visual Dashboard */}
                  <div className="rounded-2xl border p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Your Personalized Nutrition Dashboard
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {/* Calories Chart */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-orange-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${(mealPlan[0].nutritionalBreakdown.calories / 2000) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Flame className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mealPlan[0].nutritionalBreakdown.calories}</p>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="text-xs text-gray-500 mt-1">Target: 2000</p>
                  </div>

                  {/* Protein */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${(mealPlan[0].nutritionalBreakdown.protein / 120) * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-500">P</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mealPlan[0].nutritionalBreakdown.protein}g</p>
                    <p className="text-sm text-gray-600">Protein</p>
                    <p className="text-xs text-gray-500 mt-1">Target: 120g</p>
                  </div>

                  {/* Hydration Score */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-cyan-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${mealPlan[0].nutritionalBreakdown.hydrationScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="w-8 h-8 text-cyan-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mealPlan[0].nutritionalBreakdown.hydrationScore}%</p>
                    <p className="text-sm text-gray-600">Hydration</p>
                    <p className="text-xs text-gray-500 mt-1">Great!</p>
                  </div>

                  {/* Gut Health Score */}
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-green-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${mealPlan[0].nutritionalBreakdown.gutHealthScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{mealPlan[0].nutritionalBreakdown.gutHealthScore}%</p>
                    <p className="text-sm text-gray-600">Gut Health</p>
                    <p className="text-xs text-gray-500 mt-1">Excellent!</p>
                  </div>
                </div>

                    {/* Macros Breakdown */}
                    <div className="mt-6 p-4 bg-accent/10 rounded-xl border">
                      <h4 className="font-semibold text-foreground mb-4">Daily Macronutrient Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{mealPlan[0].nutritionalBreakdown.carbs}g</p>
                          <p className="text-sm text-muted-foreground">Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{mealPlan[0].nutritionalBreakdown.fats}g</p>
                          <p className="text-sm text-muted-foreground">Fats</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{mealPlan[0].nutritionalBreakdown.fiber}g</p>
                          <p className="text-sm text-muted-foreground">Fiber</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{mealPlan[0].nutritionalBreakdown.iron}mg</p>
                          <p className="text-sm text-muted-foreground">Iron</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Meal Plan */}
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      Your Daily Meal Plan - {mealPlan[0].day}
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(mealPlan[0].meals).map(([mealType, meal]) => (
                        <div key={mealType} className="rounded-lg border p-4 bg-background/60 hover:bg-background transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{meal.emoji}</span>
                          <div>
                            <h4 className="text-lg font-semibold capitalize text-foreground">
                              {mealType.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <h5 className="text-base font-medium text-foreground">{meal.name}</h5>
                            <p className="text-sm text-muted-foreground">Portion: {meal.portionSize}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-orange-100 text-orange-800">
                            {meal.calories} cal
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-3">Cooking Instructions:</h6>
                          <ol className="space-y-2">
                            {meal.cookingInstructions.map((instruction, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <h6 className="font-semibold text-gray-800 mb-3">Health Benefits:</h6>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {meal.benefits.map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                                {benefit}
                              </Badge>
                            ))}
                          </div>

                          <h6 className="font-semibold text-gray-800 mb-2">Don't like this? Try:</h6>
                          <div className="space-y-1">
                            {meal.alternatives.map((alt, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="mr-2 mb-2 text-xs"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {alt}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>

                  {/* Unique Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hydration Reminder */}
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-800">
                    <Droplets className="w-5 h-5" />
                    Hydration Reminder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-cyan-700 mb-3">
                    {mealPlan[0].uniqueFeatures.hydrationReminder}
                  </p>
                  <Progress value={mealPlan[0].nutritionalBreakdown.hydrationScore} className="h-2 mb-2" />
                  <p className="text-xs text-cyan-600">
                    {mealPlan[0].nutritionalBreakdown.hydrationScore}% of daily goal
                  </p>
                </CardContent>
              </Card>

              {/* Food-Mood Connection */}
              <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-800">
                    <Smile className="w-5 h-5" />
                    Food-Mood Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-pink-700 mb-3">
                    {mealPlan[0].uniqueFeatures.moodConnection}
                  </p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span className="text-xs text-pink-600">Mood-boosting nutrients included!</span>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Progress Tracker */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-5 h-5" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-3">
                    {mealPlan[0].uniqueFeatures.weeklyProgress}
                  </p>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">On track to meet your goals!</span>
                  </div>
                </CardContent>
              </Card>
            </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Meal Plan
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Plan
              </Button>
              <Button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RefreshCw className="w-4 h-4" />
                Create New Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanGenerator; 
