import { useState, useEffect } from 'react';
import { 
  Utensils, User, Target, Heart, Clock, Activity, AlertTriangle, CheckCircle, 
  ArrowRight, ArrowLeft, Brain, Sparkles, Gift, Calendar, ChefHat, TrendingUp,
  Droplets, Flame, Award, RefreshCw, Smile, BarChart3, Lightbulb,
  Crown, Gem, Settings, Download, Share2, Camera, Star, Zap, Leaf, Sun, Moon
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
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

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
  ingredients: string[];
  cookingInstructions: string[];
  alternatives: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  benefits: string[];
}

const MealPlanGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCookingInstructions, setShowCookingInstructions] = useState<{[key: string]: boolean}>({});
  const [isSwapping, setIsSwapping] = useState<{[key: string]: boolean}>({});
  const [selectedMealImage, setSelectedMealImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [mealProgress, setMealProgress] = useState<{[key: string]: number}>({});
  const [showNutritionalChart, setShowNutritionalChart] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [showAutoGenNotification, setShowAutoGenNotification] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showCharts, setShowCharts] = useState(true);

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

  // New state for meal plan duration
  const [mealPlanDays, setMealPlanDays] = useState<number>(7);

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
    
    const prompt = `You are an expert nutritionist and meal planner. Create a comprehensive 7-day personalized meal plan based on the user's profile.

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
          "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
          "cookingInstructions": ["Step 1", "Step 2", "Step 3"],
          "alternatives": ["Alternative 1", "Alternative 2"],
          "calories": 300,
          "protein": 15,
          "carbs": 45,
          "fats": 8,
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
1. Create exactly ${mealPlanDays} days of meal plans starting from Monday
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
13. Provide detailed ingredients list for each meal
14. Include accurate nutritional information (calories, protein, carbs, fats) for each meal
15. Ensure all meals are suitable for the user's diet type and preferences
16. Generate meal plans for ${mealPlanDays} days total

User Profile:
${userProfileText}

Meal Plan Duration: ${mealPlanDays} days

Generate the complete ${mealPlanDays}-day meal plan now:`;

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
            ingredients: [
              '1 ripe mango',
              '1 banana',
              '200ml coconut milk',
              '1/2 tsp turmeric powder',
              '1 tbsp honey',
              '1 tbsp chia seeds',
              'Mixed berries'
            ],
            cookingInstructions: [
              'Blend 1 mango, 1 banana with 200ml coconut milk',
              'Add 1/2 tsp turmeric and 1 tbsp honey',
              'Pour into bowl and top with chia seeds and berries'
            ],
            alternatives: ['Papaya Smoothie Bowl', 'Oats Smoothie Bowl'],
            calories: 320,
            protein: 8,
            carbs: 52,
            fats: 12,
            benefits: ['Anti-inflammatory', 'Boosts immunity', 'Glowing skin']
          },
          morningSnack: {
            name: 'Stress-Busting Almond Mix',
            emoji: '🥜',
            portionSize: '30g (small handful)',
            ingredients: [
              '10 almonds',
              '5 walnuts',
              '1 tbsp pumpkin seeds',
              '2-3 dark chocolate chips'
            ],
            cookingInstructions: [
              'Mix 10 almonds, 5 walnuts, and 1 tbsp pumpkin seeds',
              'Add 2-3 dark chocolate chips',
              'Store in airtight container'
            ],
            alternatives: ['Roasted Chickpeas', 'Fruit & Nut Bar'],
            calories: 150,
            protein: 6,
            carbs: 8,
            fats: 12,
            benefits: ['Reduces stress hormones', 'Brain food', 'Sustained energy']
          },
          lunch: {
            name: 'Rainbow Buddha Bowl',
            emoji: '🌈',
            portionSize: '1 large bowl (400g)',
            ingredients: [
              '1/2 cup quinoa',
              '1 cup mixed vegetables (bell peppers, carrots, broccoli)',
              '1/2 cup cooked chickpeas',
              '1/2 avocado',
              '2 tbsp tahini',
              '1 tbsp olive oil',
              'Salt and pepper to taste'
            ],
            cookingInstructions: [
              'Cook 1/2 cup quinoa in vegetable broth',
              'Roast mixed vegetables (bell peppers, carrots, broccoli)',
              'Add 1/2 cup cooked chickpeas and sliced avocado',
              'Drizzle with tahini dressing'
            ],
            alternatives: ['Brown Rice Bowl', 'Millet Power Bowl'],
            calories: 450,
            protein: 18,
            carbs: 65,
            fats: 15,
            benefits: ['Complete protein', 'Fiber-rich', 'Gut health', 'Colorful antioxidants']
          },
          eveningSnack: {
            name: 'Mood-Lifting Green Tea & Dates',
            emoji: '🍵',
            portionSize: '1 cup tea + 2 dates',
            ingredients: [
              '1 green tea bag',
              '1 cup hot water',
              '2 fresh mint leaves',
              '2 Medjool dates'
            ],
            cookingInstructions: [
              'Steep green tea bag in hot water for 3 minutes',
              'Add fresh mint leaves',
              'Serve with 2 Medjool dates'
            ],
            alternatives: ['Herbal Tea & Figs', 'Matcha Latte'],
            calories: 80,
            protein: 1,
            carbs: 18,
            fats: 0,
            benefits: ['Antioxidants', 'Natural sweetness', 'Calm energy']
          },
          dinner: {
            name: 'Spiced Paneer with Cauliflower Rice',
            emoji: '🧀',
            portionSize: '150g paneer + 200g cauliflower rice',
            ingredients: [
              '150g paneer cubes',
              '1 cup cauliflower florets',
              '2 tbsp yogurt',
              '1 tsp cumin powder',
              '1/2 tsp turmeric powder',
              '1 tbsp olive oil',
              'Salt and pepper to taste',
              '1 lemon wedge'
            ],
            cookingInstructions: [
              'Marinate paneer cubes in yogurt and spices for 30 minutes',
              'Grill paneer until golden',
              'Pulse cauliflower in food processor to make rice',
              'Sauté cauliflower rice with cumin and turmeric',
              'Serve with lemon wedge'
            ],
            alternatives: ['Grilled Tofu', 'Chickpea Curry'],
            calories: 420,
            protein: 25,
            carbs: 12,
            fats: 28,
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
    
    // Generate additional days based on selected plan duration
    const allDays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const selectedDays = allDays.slice(0, mealPlanDays - 1); // -1 because Monday is already included
    
    selectedDays.forEach((day, index) => {
      mockPlan.push({
        ...mockPlan[0],
        day: day,
        nutritionalBreakdown: {
          ...mockPlan[0].nutritionalBreakdown,
          calories: 1420 + (index * 50), // Slight variations
          gutHealthScore: Math.min(85 + index, 100),
          hydrationScore: Math.min(80 + index, 100)
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

  const generateMealImage = async (mealName: string) => {
    try {
      const imagePrompt = `A beautiful, appetizing food photography of ${mealName}. Professional food photography style, high quality, well-lit, on a clean white background. The dish should look delicious and Instagram-worthy.`;
      
      // Using Unsplash API for food images (free alternative to AI image generation)
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(mealName + ' food')}&per_page=1&orientation=landscape`, {
        headers: {
          'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY' // You can get a free key from unsplash.com
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular;
        }
      }
      
      // Fallback to a placeholder image
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(mealName + ' food')}`;
    } catch (error) {
      console.error('Error generating meal image:', error);
      return `https://source.unsplash.com/400x300/?${encodeURIComponent(mealName + ' food')}`;
    }
  };

  const markMealComplete = (mealType: string) => {
    setMealProgress(prev => ({
      ...prev,
      [mealType]: Math.min((prev[mealType] || 0) + 25, 100)
    }));
  };

  const resetMealProgress = () => {
    setMealProgress({});
  };

  const clearProfile = () => {
    setUserProfile({
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
    setMealPlanDays(7);
    setError(null);
  };

  const autoGenerateProfile = () => {
    const sampleProfiles = [
      {
        age: '28',
        gender: 'female',
        height: '165',
        weight: '60',
        primaryGoal: 'weight_loss',
        activityLevel: 'moderate',
        dietType: 'balanced',
        medicalConditions: ['Diabetes'],
        allergies: ['Nuts'],
        specificGoals: ['gut_health', 'glowing_skin'],
        cuisinePreferences: ['indian', 'mediterranean'],
        foodDislikes: ['mushrooms', 'spicy food'],
        culturalMode: 'none',
        mealTiming: '3_meals',
        sleepHours: 7.5,
        sleepQuality: 'good'
      },
      {
        age: '35',
        gender: 'male',
        height: '175',
        weight: '75',
        primaryGoal: 'muscle_gain',
        activityLevel: 'active',
        dietType: 'veg',
        medicalConditions: ['Hypertension'],
        allergies: ['Dairy'],
        specificGoals: ['heart_health', 'anti_aging'],
        cuisinePreferences: ['asian', 'continental'],
        foodDislikes: ['olives', 'seafood'],
        culturalMode: 'none',
        mealTiming: '5_meals',
        sleepHours: 8,
        sleepQuality: 'excellent'
      },
      {
        age: '42',
        gender: 'female',
        height: '160',
        weight: '68',
        primaryGoal: 'balanced_health',
        activityLevel: 'sedentary',
        dietType: 'keto',
        medicalConditions: ['PCOS', 'Thyroid Issues'],
        allergies: ['Gluten'],
        specificGoals: ['hormonal_balance', 'heart_health'],
        cuisinePreferences: ['mediterranean', 'middle-eastern'],
        foodDislikes: ['garlic', 'onions'],
        culturalMode: 'none',
        mealTiming: 'intermittent_16_8',
        sleepHours: 6.5,
        sleepQuality: 'fair'
      },
      {
        age: '25',
        gender: 'male',
        height: '180',
        weight: '55',
        primaryGoal: 'weight_gain',
        activityLevel: 'athlete',
        dietType: 'vegan',
        medicalConditions: [],
        allergies: [],
        specificGoals: ['gut_health', 'anti_aging'],
        cuisinePreferences: ['indian', 'mexican'],
        foodDislikes: ['cilantro', 'coconut'],
        culturalMode: 'none',
        mealTiming: '5_meals',
        sleepHours: 8.5,
        sleepQuality: 'excellent'
      }
    ];

    const randomProfile = sampleProfiles[Math.floor(Math.random() * sampleProfiles.length)];
    
    setUserProfile(prev => ({
      ...prev,
      ...randomProfile,
      bmi: 0 // Will be auto-calculated
    }));

    // Show a notification
    setError(null);
    setShowAutoGenNotification(true);
    setTimeout(() => {
      setShowAutoGenNotification(false);
    }, 3000);
    
    setTimeout(() => {
      const heightInM = parseInt(randomProfile.height) / 100;
      const weightInKg = parseInt(randomProfile.weight);
      const calculatedBMI = weightInKg / (heightInM * heightInM);
      setUserProfile(prev => ({ ...prev, bmi: Math.round(calculatedBMI * 10) / 10 }));
    }, 100);
  };

  const swapFood = async (mealType: string, currentMeal: Meal, alternative: string) => {
    const mealKey = `${mealPlan[0].day}-${mealType}`;
    setIsSwapping(prev => ({ ...prev, [mealKey]: true }));
    
    try {
      const swapPrompt = `Generate a new meal to replace "${currentMeal.name}" with the alternative "${alternative}". 
      
      The new meal should be similar in nutritional profile and meal type (${mealType}).
      
      User Profile:
      - Diet Type: ${userProfile.dietType}
      - Primary Goal: ${userProfile.primaryGoal}
      - Activity Level: ${userProfile.activityLevel}
      - Food Dislikes: ${userProfile.foodDislikes.join(', ') || 'None'}
      
      Please return the meal in this exact JSON format:
      {
        "name": "New meal name",
        "emoji": "🍽️",
        "portionSize": "portion description",
        "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
        "cookingInstructions": ["step 1", "step 2", "step 3"],
        "calories": 300,
        "protein": 15,
        "carbs": 45,
        "fats": 8,
        "benefits": ["benefit 1", "benefit 2"]
      }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBUIwW1exVkPrqPT_jLtIRG1wiivEnRn9I`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: swapPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to swap food');
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      
      const newMeal = JSON.parse(jsonString);
      
      // Update the meal plan with the new meal
      setMealPlan(prev => prev.map(day => ({
        ...day,
        meals: {
          ...day.meals,
          [mealType]: {
            ...newMeal,
            alternatives: currentMeal.alternatives
          }
        }
      })));
      
    } catch (error) {
      console.error('Error swapping food:', error);
      setError('Failed to swap food. Please try again.');
    } finally {
      setIsSwapping(prev => ({ ...prev, [mealKey]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <Button variant="ghost" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 group p-0 h-auto font-normal">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform" />
              Back to Nutrition Tools
            </Button>
          </div>

          <div className="text-center">
            <div className="relative mb-6">
              <div className="text-6xl mb-4 animate-bounce">🍽️</div>
              <div className="absolute -top-2 -right-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInteractiveMode(!interactiveMode)}
                  className={`transition-all duration-300 ${interactiveMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' : ''}`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {interactiveMode ? 'Interactive Mode ON' : 'Interactive Mode'}
                </Button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Meal Plan Generator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create personalized, interactive meal plans with AI-powered nutrition insights, 
              mood-boosting recipes, and beautiful visual dashboards tailored to your health goals.
            </p>
            {interactiveMode && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                  <Sparkles className="w-4 h-4" />
                  Interactive features enabled! Track progress, view images, and explore nutritional insights.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${!mealPlan.length ? 'lg:grid-cols-1 max-w-4xl mx-auto' : ''} gap-8`}>
          {/* Input Panel */}
          {!mealPlan.length && (
            <Card className="medical-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Interactive Health & Preference Profile</span>
                </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearProfile}
                      className="flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all duration-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={autoGenerateProfile}
                      className="flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto Fill
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        autoGenerateProfile();
                        setTimeout(() => {
                          generateMealPlan();
                        }, 500);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    >
                      <Zap className="w-4 h-4" />
                      Quick Demo
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Need help getting started? Click "Auto Generate" to fill in sample data and see how it works!
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Auto Generation Notification */}
                {showAutoGenNotification && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Profile Auto-Generated Successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Sample data has been filled in. You can modify any field or generate your meal plan directly.
                    </p>
                  </div>
                )}
                
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
                    <label className="block text-sm font-medium text-foreground mb-2">Meal Plan Duration</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                        <Button
                          key={days}
                          variant={mealPlanDays === days ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMealPlanDays(days)}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                        >
                          <span className="text-lg">{days === 1 ? '📅' : days <= 3 ? '📋' : days <= 5 ? '📆' : '🗓️'}</span>
                          <span className="text-xs text-center">{days} {days === 1 ? 'Day' : 'Days'}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Select how many days of meal plans you want to generate (1-7 days)
                    </p>
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
          )}

          {/* Output Panel */}
          {mealPlan.length > 0 && (
          <Card className="medical-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Your Personalized Meal Plan</span>
                </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => { setMealPlan([]); setCurrentStep(1); }}>
                    Edit Input
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6 animate-fade-in">
                  {/* Enhanced Visual Dashboard */}
                  <div className="rounded-3xl border-2 border-gradient p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl"></div>
                </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-purple-800">
                              Your Nutrition Dashboard
                    </h3>
                            <p className="text-sm text-gray-600">Personalized health insights at a glance</p>
                      </div>
                    </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Live Data</span>
                        </div>
                  </div>

                      {/* Enhanced Interactive Metric Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                                {/* Calories Card - Hydration Style */}
                        <div className="group relative bg-gradient-to-br from-cyan-200 via-teal-100 to-blue-100 rounded-2xl p-3 border-2 border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Flame className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                              <div className="text-right">
                                <div className="text-xs text-cyan-700 font-bold bg-cyan-100 px-1.5 py-0.5 rounded-full">DAILY TARGET</div>
                                <div className="text-xs text-cyan-600 font-medium">2000 kcal</div>
                    </div>
                            </div>
                            <div className="mb-2">
                              <div className="text-xl font-black text-cyan-800 group-hover:text-cyan-900 transition-colors duration-300">{mealPlan[currentDayIndex].nutritionalBreakdown.calories}</div>
                              <div className="text-xs font-semibold text-cyan-700">Calories</div>
                            </div>
                            <div className="w-full bg-cyan-200 rounded-full h-2 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 h-2 rounded-full transition-all duration-1500 ease-out shadow-md"
                                style={{ width: `${Math.min((mealPlan[currentDayIndex].nutritionalBreakdown.calories / 2000) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs font-bold text-cyan-700 mt-1 bg-cyan-100 px-1.5 py-0.5 rounded-full inline-block">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.calories / 2000) * 100)}% of target
                            </div>
                          </div>
                  </div>

                        {/* Protein Card - Hydration Style */}
                        <div className="group relative bg-gradient-to-br from-cyan-200 via-teal-100 to-blue-100 rounded-2xl p-3 border-2 border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Zap className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                              <div className="text-right">
                                <div className="text-xs text-cyan-700 font-bold bg-cyan-100 px-1.5 py-0.5 rounded-full">DAILY TARGET</div>
                                <div className="text-xs text-cyan-600 font-medium">120g</div>
                    </div>
                            </div>
                            <div className="mb-2">
                              <div className="text-xl font-black text-cyan-800 group-hover:text-cyan-900 transition-colors duration-300">{mealPlan[currentDayIndex].nutritionalBreakdown.protein}g</div>
                              <div className="text-xs font-semibold text-cyan-700">Protein</div>
                            </div>
                            <div className="w-full bg-cyan-200 rounded-full h-2 shadow-inner">
                              <div 
                                className="bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 h-2 rounded-full transition-all duration-1500 ease-out shadow-md"
                                style={{ width: `${Math.min((mealPlan[currentDayIndex].nutritionalBreakdown.protein / 120) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs font-bold text-cyan-700 mt-1 bg-cyan-100 px-1.5 py-0.5 rounded-full inline-block">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.protein / 120) * 100)}% of target
                            </div>
                          </div>
                  </div>

                        {/* Hydration Card - Standard Style */}
                        <div className="group relative bg-gradient-to-br from-cyan-200 via-teal-100 to-blue-100 rounded-2xl p-3 border-2 border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Droplets className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                              <div className="text-right">
                                <div className="text-xs text-cyan-700 font-bold bg-cyan-100 px-1.5 py-0.5 rounded-full">OPTIMAL</div>
                                <div className="text-xs text-cyan-600 font-medium">100%</div>
                    </div>
                            </div>
                            <div className="mb-2">
                              <div className="text-xl font-black text-cyan-800 group-hover:text-cyan-900 transition-colors duration-300">{mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore}%</div>
                              <div className="text-xs font-semibold text-cyan-700">Hydration</div>
                            </div>
                            <div className="w-full bg-cyan-200 rounded-full h-2 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 h-2 rounded-full transition-all duration-1500 ease-out shadow-md"
                                style={{ width: `${mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore}%` }}
                              ></div>
                            </div>
                            <div className="text-xs font-bold text-cyan-700 mt-1 bg-cyan-100 px-1.5 py-0.5 rounded-full inline-block">
                              {mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore >= 80 ? 'Excellent!' : mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore >= 60 ? 'Good' : 'Needs improvement'}
                            </div>
                  </div>
                </div>

                        {/* Gut Health Card - Hydration Style */}
                        <div className="group relative bg-gradient-to-br from-cyan-200 via-teal-100 to-blue-100 rounded-2xl p-3 border-2 border-cyan-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                <Heart className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                              <div className="text-right">
                                <div className="text-xs text-cyan-700 font-bold bg-cyan-100 px-1.5 py-0.5 rounded-full">OPTIMAL</div>
                                <div className="text-xs text-cyan-600 font-medium">100%</div>
                        </div>
                        </div>
                            <div className="mb-2">
                              <div className="text-xl font-bold text-cyan-800 group-hover:text-cyan-900 transition-colors duration-300">{mealPlan[currentDayIndex].nutritionalBreakdown.gutHealthScore}%</div>
                              <div className="text-xs font-semibold text-cyan-700">Gut Health</div>
                        </div>
                            <div className="w-full bg-cyan-200 rounded-full h-2 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 h-2 rounded-full transition-all duration-1500 ease-out shadow-md"
                                style={{ width: `${mealPlan[currentDayIndex].nutritionalBreakdown.gutHealthScore}%` }}
                              ></div>
                            </div>
                            <div className="text-xs font-bold text-cyan-700 mt-1 bg-cyan-100 px-1.5 py-0.5 rounded-full inline-block">
                              {mealPlan[currentDayIndex].nutritionalBreakdown.gutHealthScore >= 85 ? 'Excellent!' : mealPlan[currentDayIndex].nutritionalBreakdown.gutHealthScore >= 70 ? 'Good' : 'Needs attention'}
                            </div>
                      </div>
                    </div>
                  </div>

                </div>

                      {/* Enhanced Macronutrient Visualization */}
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-gray-800">Macronutrient Distribution</h4>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Today's Intake
                          </div>
                        </div>
                        
                        {/* Interactive Macro Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-xs font-medium text-yellow-700">CARBS</span>
                            </div>
                            <div className="text-xl font-bold text-yellow-800">{mealPlan[currentDayIndex].nutritionalBreakdown.carbs}g</div>
                            <div className="text-xs text-yellow-600 mt-1">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.carbs * 4 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100)}% of calories
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-xs font-medium text-purple-700">FATS</span>
                            </div>
                            <div className="text-xl font-bold text-purple-800">{mealPlan[currentDayIndex].nutritionalBreakdown.fats}g</div>
                            <div className="text-xs text-purple-600 mt-1">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.fats * 9 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100)}% of calories
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                              <span className="text-xs font-medium text-emerald-700">FIBER</span>
                            </div>
                            <div className="text-xl font-bold text-emerald-800">{mealPlan[currentDayIndex].nutritionalBreakdown.fiber}g</div>
                            <div className="text-xs text-emerald-600 mt-1">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.fiber / 25) * 100)}% of daily need
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-medium text-red-700">IRON</span>
                            </div>
                            <div className="text-xl font-bold text-red-800">{mealPlan[currentDayIndex].nutritionalBreakdown.iron}mg</div>
                            <div className="text-xs text-red-600 mt-1">
                              {Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.iron / 18) * 100)}% of daily need
                            </div>
                          </div>
                        </div>

                        {/* Visual Macro Distribution */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm font-medium text-gray-700 mb-3">Calorie Distribution</div>
                          <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000"
                              style={{ width: `${(mealPlan[currentDayIndex].nutritionalBreakdown.carbs * 4 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-1000"
                              style={{ width: `${(mealPlan[currentDayIndex].nutritionalBreakdown.protein * 4 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100}%` }}
                            ></div>
                            <div 
                              className="bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-1000"
                              style={{ width: `${(mealPlan[currentDayIndex].nutritionalBreakdown.fats * 9 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-2">
                            <span>Carbs ({Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.carbs * 4 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100)}%)</span>
                            <span>Protein ({Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.protein * 4 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100)}%)</span>
                            <span>Fats ({Math.round((mealPlan[currentDayIndex].nutritionalBreakdown.fats * 9 / mealPlan[currentDayIndex].nutritionalBreakdown.calories) * 100)}%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Toggle Button */}
                  <div className="flex justify-center mb-6">
                    <Button
                      onClick={() => setShowCharts(!showCharts)}
                      variant="outline"
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-300"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {showCharts ? 'Hide Charts' : 'Show Charts'}
                    </Button>
                  </div>

                  {/* Nutritional Charts Section */}
                  {showCharts && (
                  <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Weekly Nutritional Trends */}
                    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-800 text-lg font-bold">
                          <TrendingUp className="w-5 h-5" />
                          Weekly Nutritional Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            protein: {
                              label: "Protein (g)",
                              color: "#8B5CF6"
                            },
                            carbs: {
                              label: "Carbs (g)",
                              color: "#06B6D4"
                            },
                            fats: {
                              label: "Fats (g)",
                              color: "#F59E0B"
                            }
                          }}
                          className="h-[250px]"
                        >
                          <LineChart
                            data={mealPlan.map((day, index) => ({
                              day: day.day.substring(0, 3),
                              protein: day.nutritionalBreakdown.protein,
                              carbs: day.nutritionalBreakdown.carbs,
                              fats: day.nutritionalBreakdown.fats
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey="protein" 
                              stroke="#8B5CF6" 
                              strokeWidth={3}
                              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="carbs" 
                              stroke="#06B6D4" 
                              strokeWidth={3}
                              dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="fats" 
                              stroke="#F59E0B" 
                              strokeWidth={3}
                              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Energy Wave Chart */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 relative overflow-hidden">
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100/20 to-purple-100/20"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"></div>
                        <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-lg"></div>
                      </div>
                      <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-indigo-800 text-lg font-bold">
                          <Activity className="w-5 h-5" />
                          Energy Wave Pattern
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <ChartContainer
                          config={{
                            calories: {
                              label: "Energy Level",
                              color: "#6366F1"
                            },
                            target: {
                              label: "Target Range",
                              color: "#8B5CF6"
                            }
                          }}
                          className="h-[220px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={mealPlan.map((day, index) => ({
                                day: day.day.substring(0, 3),
                                calories: day.nutritionalBreakdown.calories,
                                target: 2000,
                                isToday: index === currentDayIndex,
                                energyLevel: Math.min(100, (day.nutritionalBreakdown.calories / 2000) * 100)
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8}/>
                                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis 
                                dataKey="day" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                              />
                              <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                              />
                              <ChartTooltip 
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-white p-4 border rounded-lg shadow-lg">
                                        <p className="font-semibold text-indigo-800">{label}</p>
                                        <p className="text-sm text-gray-600">Calories: {payload[0].value}</p>
                                        <p className="text-sm text-gray-600">Energy: {Math.round((payload[0].value / 2000) * 100)}%</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="calories" 
                                stroke="#6366F1"
                                strokeWidth={4}
                                fill="url(#energyGradient)"
                                dot={{ fill: '#6366F1', strokeWidth: 3, r: 6, stroke: '#fff' }}
                                activeDot={{ r: 8, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="target" 
                                stroke="#9CA3AF"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center mt-2 space-x-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span className="text-gray-600">Daily Energy</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-600">Target (2000 cal)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>


                  </>
                  )}



                  {/* Daily Meal Plan */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">Your {mealPlanDays}-Day Meal Plan</h3>
                          <p className="text-sm text-gray-600">{mealPlan[currentDayIndex].day} - Day {currentDayIndex + 1} of {mealPlanDays}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">{mealPlan[currentDayIndex].nutritionalBreakdown.calories} kcal</div>
                          <div className="text-xs text-gray-600">Total for {mealPlan[currentDayIndex].day}</div>
                        </div>
                      </div>
                    </div>

                    {/* Day Navigation */}
                    {mealPlan.length > 1 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Navigate Days:</h4>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
                              disabled={currentDayIndex === 0}
                              className="flex items-center gap-1"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentDayIndex(Math.min(mealPlan.length - 1, currentDayIndex + 1))}
                              disabled={currentDayIndex === mealPlan.length - 1}
                              className="flex items-center gap-1"
                            >
                              Next
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {mealPlan.map((day, index) => (
                            <Button
                              key={index}
                              variant={currentDayIndex === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentDayIndex(index)}
                              className="flex-shrink-0 text-xs"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {day.day}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-8">
                      {Object.entries(mealPlan[currentDayIndex].meals).map(([mealType, meal]) => (
                        <div key={mealType} className="rounded-lg border border-gray-200 p-6 bg-white">
                          {/* Interactive Progress Bar */}
                          {interactiveMode && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                <span>Meal Progress</span>
                                <span>{mealProgress[mealType] || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mealProgress[mealType] || 0}%` }}
                                ></div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markMealComplete(mealType)}
                                  className="text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedMealImage(`https://source.unsplash.com/400x300/?${encodeURIComponent(meal.name + ' food')}`)}
                                  className="text-xs"
                                >
                                  <Camera className="w-3 h-3 mr-1" />
                                  View Image
                                </Button>
                              </div>
                            </div>
                          )}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{meal.emoji}</span>
                          <div>
                            <h4 className="text-lg font-bold capitalize text-gray-900 leading-tight mb-2">
                              {mealType.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <h5 className="text-base font-semibold text-gray-800 leading-relaxed mb-2">{meal.name}</h5>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">Portion: {meal.portionSize}</p>
                          </div>
                        </div>
                          <div className="flex flex-col gap-3 text-right">
                          <Badge className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1">
                            {meal.calories} cal
                          </Badge>
                            <div className="text-xs text-gray-700 font-medium space-y-1">
                              <div>P: {meal.protein}g</div>
                              <div>C: {meal.carbs}g</div>
                              <div>F: {meal.fats}g</div>
                            </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h6 className="text-base font-bold text-emerald-600 mb-3 leading-tight uppercase">Ingredients:</h6>
                          <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
                            {meal.ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                                <span className="font-medium">{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-xs font-semibold"
                            onClick={() => setShowCookingInstructions(prev => ({ 
                              ...prev, 
                              [`${mealPlan[currentDayIndex].day}-${mealType}`]: !prev[`${mealPlan[currentDayIndex].day}-${mealType}`] 
                            }))}
                          >
                            {showCookingInstructions[`${mealPlan[currentDayIndex].day}-${mealType}`] ? 'Hide' : 'Show'} Cooking Instructions
                          </Button>
                          
                          {showCookingInstructions[`${mealPlan[currentDayIndex].day}-${mealType}`] && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h6 className="text-base font-bold text-blue-600 mb-3 leading-tight uppercase">Cooking Instructions:</h6>
                          <ol className="space-y-3">
                            {meal.cookingInstructions.map((instruction, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-3 leading-relaxed">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{instruction}</span>
                              </li>
                            ))}
                          </ol>
                            </div>
                          )}
                        </div>

                        <div>
                          <h6 className="text-base font-bold text-green-600 mb-3 leading-tight uppercase">Health Benefits:</h6>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {meal.benefits.map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 leading-relaxed font-medium px-2 py-1">
                                {benefit}
                              </Badge>
                            ))}
                          </div>

                          <h6 className="text-base font-bold text-orange-600 mb-3 leading-tight uppercase">Don't like this? Try:</h6>
                          <div className="space-y-2">
                            {meal.alternatives.map((alt, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="mr-2 mb-2 text-xs leading-relaxed font-medium"
                                onClick={() => swapFood(mealType, meal, alt)}
                                disabled={isSwapping[`${mealPlan[currentDayIndex].day}-${mealType}`]}
                              >
                                <RefreshCw className={`w-3 h-3 mr-1 ${isSwapping[`${mealPlan[currentDayIndex].day}-${mealType}`] ? 'animate-spin' : ''}`} />
                                {isSwapping[`${mealPlan[currentDayIndex].day}-${mealType}`] ? 'Swapping...' : alt}
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
                  <CardTitle className="flex items-center gap-2 text-cyan-800 text-base font-bold">
                    <Droplets className="w-4 h-4" />
                    Hydration Reminder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-cyan-700 mb-3 font-medium leading-relaxed">
                    {mealPlan[currentDayIndex].uniqueFeatures.hydrationReminder}
                  </p>
                  <Progress value={mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore} className="h-2 mb-2" />
                  <p className="text-xs text-cyan-600">
                    {mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore}% of daily goal
                  </p>
                </CardContent>
              </Card>

              {/* Food-Mood Connection */}
              <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-800 text-base font-bold">
                    <Smile className="w-4 h-4" />
                    Food-Mood Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-pink-700 mb-3 font-medium leading-relaxed">
                    {mealPlan[currentDayIndex].uniqueFeatures.moodConnection}
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
                  <CardTitle className="flex items-center gap-2 text-green-800 text-base font-bold">
                    <TrendingUp className="w-4 h-4" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-3 font-medium leading-relaxed">
                    {mealPlan[currentDayIndex].uniqueFeatures.weeklyProgress}
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
              {interactiveMode && (
                <Button 
                  variant="outline"
                  onClick={() => setShowNutritionalChart(true)}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <BarChart3 className="w-4 h-4" />
                  Nutritional Insights
                </Button>
              )}
              <Button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RefreshCw className="w-4 h-4" />
                Create New Plan
                  </Button>
                  </div>
            </CardContent>
          </Card>
      )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedMealImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Meal Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMealImage(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <img 
                src={selectedMealImage} 
                alt="Meal" 
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Nutritional Chart */}
      {interactiveMode && showNutritionalChart && mealPlan.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Interactive Nutritional Analysis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNutritionalChart(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Progress */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Daily Progress</h4>
                  <div className="space-y-3">
                    {Object.entries(mealPlan[currentDayIndex].meals).map(([mealType, meal]) => (
                      <div key={mealType} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                          {mealType.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{mealType.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span>{mealProgress[mealType] || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${mealProgress[mealType] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutritional Insights */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Nutritional Insights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold">Calories</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{mealPlan[currentDayIndex].nutritionalBreakdown.calories}</p>
                      <p className="text-xs text-orange-600">Target: 2000</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Protein</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{mealPlan[currentDayIndex].nutritionalBreakdown.protein}g</p>
                      <p className="text-xs text-blue-600">Target: 120g</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">Hydration</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{mealPlan[currentDayIndex].nutritionalBreakdown.hydrationScore}%</p>
                      <p className="text-xs text-green-600">Daily Goal</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">Gut Health</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{mealPlan[currentDayIndex].nutritionalBreakdown.gutHealthScore}%</p>
                      <p className="text-xs text-purple-600">Health Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanGenerator; 