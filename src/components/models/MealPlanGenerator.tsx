import { useState, useEffect } from 'react';
import { 
  Utensils, User, Target, Heart, Clock, DollarSign, Stethoscope, 
  Calendar, ChefHat, TrendingUp, Activity, AlertTriangle, CheckCircle, 
  ArrowRight, ArrowLeft, Brain, Shield, FlaskConical, Plus, Minus,
  Search, Filter, Download, Share2, Settings, Zap, Leaf, Apple, Smile,
  Frown, Coffee, Moon, Sun, Sparkles, Gift, Trophy, Star, ShoppingCart,
  Droplets, Flame, Award, RefreshCw, Camera, Instagram, Gamepad2,
  PieChart, BarChart3, Waves, Lightbulb, Crown, Gem, Home, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import SubModelPanel from '../common/SubModelPanel';
import ShoppingListGenerator from './ShoppingListGenerator';
import NutritionGameSystem from './NutritionGameSystem';

// Enhanced interfaces for premium features
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
  medications: string[];
  
  // Lifestyle
  activityLevel: string;
  sleepHours: number;
  sleepQuality: string;
  stressLevel: number;
  
  // Preferences
  dietType: string;
  cookingSkills: string;
  cuisinePreferences: string[];
  
  // Goals
  primaryGoal: string;
  specificGoals: string[];
  
  // Unique Engagement
  currentMood: string;
  budget: string;
  mealTiming: string;
  foodDislikes: string[];
  availableIngredients: string[];
  culturalMode: string;
  planDuration: number;
}



interface GameProgress {
  totalPoints: number;
  currentStreak: number;
  badges: string[];
  level: number;
  nextLevelPoints: number;
}

interface PremiumMealPlan {
  day: string;
  meals: {
    breakfast: PremiumMeal;
    morningSnack: PremiumMeal;
    lunch: PremiumMeal;
    eveningSnack: PremiumMeal;
    dinner: PremiumMeal;
  };
  dailyStats: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    hydration: number;
    moodScore: number;
    gutHealthScore: number;
    skinGlowRating: number;
  };
  specialFeatures: {
    moodBooster: string;
    culturalTouch: string;
    budgetFriendly: boolean;
    quickPrep: boolean;
  };
}

interface PremiumMeal {
  name: string;
  emoji: string;
  calories: number;
  prepTime: string;
  difficulty: string;
  cost: string;
  ingredients: string[];
  instructions: string[];
  nutritionScore: number;
  benefits: string[];
  swapOptions: string[];
  moodConnection: string;
  culturalOrigin: string;
  instagramReady: boolean;
}

const MealPlanGenerator = () => {
  console.log('🍽️ Premium AI Meal Plan Generator loaded!');

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mealPlan, setMealPlan] = useState<PremiumMealPlan[]>([]);
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    totalPoints: 1250,
    currentStreak: 7,
    badges: [],
    level: 3,
    nextLevelPoints: 1500
  });
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(true);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showGameSystem, setShowGameSystem] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Enhanced user profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: '28',
    gender: 'female',
    height: '165',
    weight: '65',
    bmi: 23.9,
    medicalConditions: [],
    allergies: [],
    medications: [],
    activityLevel: 'moderate',
    sleepHours: 7,
    sleepQuality: 'good',
    stressLevel: 4,
    dietType: 'veg',
    cookingSkills: 'intermediate',
    cuisinePreferences: ['indian', 'mediterranean', 'asian'],
    primaryGoal: 'balanced_health',
    specificGoals: ['glowing_skin', 'gut_health'],
    currentMood: 'energetic',
    budget: 'moderate',
    mealTiming: '5_meals',
    foodDislikes: [],
    availableIngredients: [],
    culturalMode: 'none',
    planDuration: 7
  });



  // Cultural/Festival modes
  const culturalModes = [
    { id: 'none', name: 'Regular', icon: '🍽️' },
    { id: 'navratri', name: 'Navratri Fasting', icon: '🕉️' },
    { id: 'ramadan', name: 'Ramadan', icon: '🌙' },
    { id: 'christmas', name: 'Christmas Prep', icon: '🎄' },
    { id: 'wedding', name: 'Wedding Prep', icon: '💒' },
    { id: 'diwali', name: 'Diwali Special', icon: '🪔' },
    { id: 'karva_chauth', name: 'Karva Chauth', icon: '🌕' }
  ];

  // Available ingredients for smart suggestions
  const commonIngredients = [
    'Rice', 'Wheat flour', 'Lentils', 'Chickpeas', 'Onions', 'Tomatoes',
    'Potatoes', 'Spinach', 'Carrots', 'Ginger', 'Garlic', 'Turmeric',
    'Cumin', 'Coriander', 'Coconut oil', 'Ghee', 'Yogurt', 'Milk',
    'Eggs', 'Chicken', 'Paneer', 'Green chilies', 'Curry leaves'
  ];

  // Calculate BMI automatically
  useEffect(() => {
    if (userProfile.height && userProfile.weight) {
      const heightInM = parseInt(userProfile.height) / 100;
      const weightInKg = parseInt(userProfile.weight);
      const calculatedBMI = weightInKg / (heightInM * heightInM);
      setUserProfile(prev => ({ ...prev, bmi: Math.round(calculatedBMI * 10) / 10 }));
    }
  }, [userProfile.height, userProfile.weight]);

  const generatePremiumMealPlan = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      setProgress(20);
      
      // Create comprehensive user profile text for Gemini
      const userProfileText = `
User Profile for AI Meal Plan Generation:

BASIC INFORMATION:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Height: ${userProfile.height} cm
- Weight: ${userProfile.weight} kg
- BMI: ${userProfile.bmi}

MEDICAL CONSIDERATIONS:
- Medical Conditions: ${userProfile.medicalConditions.join(', ') || 'None'}
- Allergies: ${userProfile.allergies.join(', ') || 'None'}
- Medications: ${userProfile.medications.join(', ') || 'None'}

LIFESTYLE & PREFERENCES:
- Activity Level: ${userProfile.activityLevel}
- Sleep Hours: ${userProfile.sleepHours}
- Sleep Quality: ${userProfile.sleepQuality}
- Stress Level: ${userProfile.stressLevel}/10

DIETARY PREFERENCES:
- Diet Type: ${userProfile.dietType}
- Cooking Skills: ${userProfile.cookingSkills}
- Favorite Cuisines: ${userProfile.cuisinePreferences.join(', ')}
- Food Dislikes: ${userProfile.foodDislikes.join(', ') || 'None'}

HEALTH GOALS:
- Primary Goal: ${userProfile.primaryGoal}
- Specific Goals: ${userProfile.specificGoals.join(', ')}

CULTURAL & LIFESTYLE:
- Cultural Mode: ${userProfile.culturalMode}
- Budget: ${userProfile.budget}
- Meal Timing: ${userProfile.mealTiming}
- Available Ingredients: ${userProfile.availableIngredients.join(', ') || 'Any'}

PLAN DURATION: ${userProfile.planDuration} days
      `;

      setProgress(40);
      
      // Call Gemini API
      const mealPlanData = await callGeminiForMealPlan(userProfileText);
      
      setProgress(80);
      
      // Process and set the meal plan
      if (mealPlanData) {
        setMealPlan(mealPlanData);
        
        // Add points for generating plan
        setGameProgress(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + 50
        }));
      } else {
        throw new Error('Failed to generate meal plan with AI');
      }
      
      setProgress(100);
      
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      setError(error.message || 'Failed to generate meal plan. Please try again.');
      
      // Fallback to mock data if AI fails
      generateMockPremiumPlan();
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const generateMockPremiumPlan = () => {
    // Get current date and create plan for selected duration
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const mockPlan: PremiumMealPlan[] = [];
    
    for (let i = 0; i < userProfile.planDuration; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayName = dayNames[currentDate.getDay()];
      
      mockPlan.push({
        day: dayName,
        meals: {
        breakfast: {
            name: 'Golden Turmeric Smoothie Bowl',
            emoji: '🥣',
            calories: 320,
            prepTime: '8 min',
            difficulty: 'Easy',
            cost: '₹45',
            ingredients: ['Mango', 'Banana', 'Turmeric', 'Coconut milk', 'Chia seeds', 'Honey'],
            instructions: ['Blend fruits with coconut milk', 'Add turmeric and honey', 'Top with chia seeds'],
            nutritionScore: 95,
            benefits: ['Anti-inflammatory', 'Boosts immunity', 'Glowing skin'],
            swapOptions: ['Papaya bowl', 'Oats smoothie bowl'],
            moodConnection: 'Energizing start to boost your mood! 🌟',
            culturalOrigin: 'Indian Ayurvedic',
            instagramReady: true
          },
          morningSnack: {
            name: 'Stress-Busting Almond Trail Mix',
            emoji: '🥜',
            calories: 150,
            prepTime: '2 min',
            difficulty: 'No-cook',
            cost: '₹25',
            ingredients: ['Almonds', 'Walnuts', 'Dark chocolate chips', 'Pumpkin seeds'],
            instructions: ['Mix all ingredients', 'Store in airtight container'],
            nutritionScore: 88,
            benefits: ['Reduces stress hormones', 'Brain food', 'Sustained energy'],
            swapOptions: ['Roasted chickpeas', 'Fruit & nut bar'],
            moodConnection: 'Perfect for managing stress levels! 🧘‍♀️',
            culturalOrigin: 'Mediterranean',
            instagramReady: false
          },
        lunch: {
            name: 'Rainbow Buddha Bowl',
            emoji: '🌈',
            calories: 450,
            prepTime: '20 min',
            difficulty: 'Medium',
            cost: '₹85',
            ingredients: ['Quinoa', 'Roasted vegetables', 'Chickpeas', 'Avocado', 'Tahini dressing'],
            instructions: ['Cook quinoa', 'Roast vegetables', 'Assemble bowl', 'Drizzle dressing'],
            nutritionScore: 92,
            benefits: ['Complete protein', 'Fiber-rich', 'Gut health'],
            swapOptions: ['Brown rice bowl', 'Millet bowl'],
            moodConnection: 'Colorful foods boost happiness! 🌈',
            culturalOrigin: 'Global fusion',
            instagramReady: true
          },
          eveningSnack: {
            name: 'Mood-Lifting Green Tea & Dates',
            emoji: '🍵',
            calories: 80,
            prepTime: '5 min',
            difficulty: 'Easy',
            cost: '₹15',
            ingredients: ['Green tea', 'Medjool dates', 'Mint leaves'],
            instructions: ['Steep green tea', 'Add mint', 'Serve with dates'],
            nutritionScore: 85,
            benefits: ['Antioxidants', 'Natural sweetness', 'Calm energy'],
            swapOptions: ['Herbal tea & figs', 'Matcha latte'],
            moodConnection: 'Zen moment for inner peace! 🕯️',
            culturalOrigin: 'Asian wellness',
            instagramReady: false
          },
        dinner: {
            name: 'Spiced Salmon with Cauliflower Rice',
            emoji: '🐟',
            calories: 420,
            prepTime: '25 min',
            difficulty: 'Medium',
            cost: '₹180',
            ingredients: ['Salmon fillet', 'Cauliflower', 'Indian spices', 'Coconut oil', 'Lemon'],
            instructions: ['Season salmon', 'Grill to perfection', 'Prepare cauliflower rice', 'Serve with lemon'],
            nutritionScore: 96,
            benefits: ['Omega-3 fatty acids', 'High protein', 'Heart healthy'],
            swapOptions: ['Paneer tikka', 'Grilled chicken'],
            moodConnection: 'Omega-3s for brain health and mood! 🧠',
            culturalOrigin: 'Indo-Mediterranean',
            instagramReady: true
          }
        },
        dailyStats: {
          calories: 1420,
          protein: 95,
          carbs: 125,
          fat: 65,
          fiber: 35,
          hydration: 85,
          moodScore: 92,
          gutHealthScore: 88,
          skinGlowRating: 94
        },
        specialFeatures: {
          moodBooster: 'High in mood-enhancing nutrients like omega-3s and magnesium',
          culturalTouch: 'Indian spices for authentic flavors and health benefits',
          budgetFriendly: false,
          quickPrep: true
        }
      });
    }
    
    setMealPlan(mockPlan);
    
    // Add points for generating plan
    setGameProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + 50
    }));
  };

  const getBudgetColor = (budget: string) => {
    const colors: Record<string, string> = {
      economical: 'bg-green-100 text-green-800',
      moderate: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return colors[budget] || 'bg-gray-100 text-gray-800';
  };

  // Gemini API integration for meal plan generation
  const callGeminiForMealPlan = async (userProfileText: string): Promise<PremiumMealPlan[]> => {
    const GEMINI_API_KEY = 'AIzaSyBUIwW1exVkPrqPT_jLtIRG1wiivEnRn9I';
    
    const prompt = `You are an expert nutritionist and meal planner. Create a personalized meal plan based on the user's profile.

Please generate a meal plan in the following JSON format:

{
  "mealPlan": [
    {
      "day": "Day name (e.g., Monday)",
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "emoji": "🍽️",
          "calories": 300,
          "prepTime": "10 min",
          "difficulty": "Easy",
          "cost": "₹50",
          "ingredients": ["ingredient1", "ingredient2"],
          "instructions": ["step1", "step2"],
          "nutritionScore": 85,
          "benefits": ["benefit1", "benefit2"],
          "swapOptions": ["alternative1", "alternative2"],
          "moodConnection": "How this meal affects mood",
          "culturalOrigin": "Cultural background",
          "instagramReady": true
        },
        "morningSnack": { /* same structure */ },
        "lunch": { /* same structure */ },
        "eveningSnack": { /* same structure */ },
        "dinner": { /* same structure */ }
      },
      "dailyStats": {
        "calories": 1800,
        "protein": 120,
        "carbs": 200,
        "fat": 60,
        "fiber": 30,
        "hydration": 80,
        "moodScore": 85,
        "gutHealthScore": 90,
        "skinGlowRating": 88
      },
      "specialFeatures": {
        "moodBooster": "Description of mood-boosting features",
        "culturalTouch": "Cultural elements included",
        "budgetFriendly": true,
        "quickPrep": false
      }
    }
  ]
}

IMPORTANT GUIDELINES:
1. Create exactly ${userProfile.planDuration} days of meal plans
2. Start from today's date and use real day names
3. Consider the user's diet type: ${userProfile.dietType}
4. Include their favorite cuisines: ${userProfile.cuisinePreferences.join(', ')}
5. Avoid foods they dislike: ${userProfile.foodDislikes.join(', ') || 'None'}
6. Focus on their primary goal: ${userProfile.primaryGoal}
7. Consider their activity level: ${userProfile.activityLevel}
8. Respect their budget: ${userProfile.budget}
9. Include cultural elements: ${userProfile.culturalMode}
10. Ensure meals are appropriate for their cooking skills: ${userProfile.cookingSkills}

Make the meals realistic, nutritious, and personalized to their profile. Ensure the JSON is valid and complete.

User Profile:
${userProfileText}

Generate the meal plan now:`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Nutrition Tools
            </Button>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-primary rounded-2xl">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              🍽️ AI Meal Plan Generator
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Create personalized meal plans based on your health goals, dietary preferences, and cultural requirements. 
              Get AI-powered nutrition recommendations with detailed recipes and smart shopping lists.
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Premium personalized nutrition planning</span>
              </div>
            </div>
            
            {/* Game Progress */}
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Level {gameProgress.level}</p>
                    <p className="font-semibold">{gameProgress.totalPoints} pts</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={(gameProgress.totalPoints / gameProgress.nextLevelPoints) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {gameProgress.nextLevelPoints - gameProgress.totalPoints} pts to next level
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="font-semibold">{gameProgress.currentStreak} days</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowShoppingList(true)}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shopping List
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowGameSystem(true)}>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Achievements
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${mealPlan.length === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          {/* Center Configuration - Made Bigger - Hidden when results available */}
          {mealPlan.length === 0 && (
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Smart Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Basic Info with BMI Calculator */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="28"
                        className="medical-input mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                      <Select value={userProfile.gender} onValueChange={(value) => setUserProfile(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger className="medical-input mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={userProfile.height}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="165"
                        className="medical-input mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={userProfile.weight}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="65"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {userProfile.bmi && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">BMI</span>
                        <Badge className={`${userProfile.bmi < 18.5 ? 'bg-yellow-100 text-yellow-800' : 
                          userProfile.bmi < 25 ? 'bg-green-100 text-green-800' : 
                          userProfile.bmi < 30 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                          {userProfile.bmi}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Food Preferences */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Food Preferences
                  </h3>
                  
                  <div>
                    <Label>Diet Type</Label>
                    <Select value={userProfile.dietType} onValueChange={(value) => setUserProfile(prev => ({ ...prev, dietType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                        <SelectItem value="vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="keto">🥑 Keto</SelectItem>
                        <SelectItem value="low-carb">🥩 Low-Carb</SelectItem>
                        <SelectItem value="gluten-free">🌾 Gluten-Free</SelectItem>
                        <SelectItem value="jain">🙏 Jain</SelectItem>
                        <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                        <SelectItem value="paleo">🦴 Paleo</SelectItem>
                        <SelectItem value="mediterranean">🫒 Mediterranean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Favorite Cuisines</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {[
                        { id: 'indian', name: 'Indian', emoji: '🍛' },
                        { id: 'mediterranean', name: 'Mediterranean', emoji: '🫒' },
                        { id: 'asian', name: 'Asian', emoji: '🍜' },
                        { id: 'continental', name: 'Continental', emoji: '🍝' },
                        { id: 'mexican', name: 'Mexican', emoji: '🌮' },
                        { id: 'middle-eastern', name: 'Middle Eastern', emoji: '🥙' }
                      ].map((cuisine) => (
                        <Button
                          key={cuisine.id}
                          variant={userProfile.cuisinePreferences.includes(cuisine.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const isSelected = userProfile.cuisinePreferences.includes(cuisine.id);
                            setUserProfile(prev => ({
                              ...prev,
                              cuisinePreferences: isSelected 
                                ? prev.cuisinePreferences.filter(c => c !== cuisine.id)
                                : [...prev.cuisinePreferences, cuisine.id]
                            }));
                          }}
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

                {/* Health Goals */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Health Goals
                  </h3>
                  
                  <div>
                    <Label>Primary Goal</Label>
                    <Select value={userProfile.primaryGoal} onValueChange={(value) => setUserProfile(prev => ({ ...prev, primaryGoal: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">📉 Weight Loss</SelectItem>
                        <SelectItem value="weight_gain">📈 Weight Gain</SelectItem>
                        <SelectItem value="muscle_gain">💪 Muscle Gain</SelectItem>
                        <SelectItem value="balanced_health">⚖️ Balanced Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Specific Goals (Select multiple)</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        { id: 'gut_health', name: 'Gut Health', emoji: '🦠' },
                        { id: 'glowing_skin', name: 'Glowing Skin', emoji: '✨' },
                        { id: 'hormonal_balance', name: 'Hormonal Balance', emoji: '⚖️' },
                        { id: 'heart_health', name: 'Heart Health', emoji: '❤️' },
                        { id: 'anti_aging', name: 'Anti-Aging', emoji: '🧬' }
                      ].map((goal) => (
                        <Button
                          key={goal.id}
                          variant={userProfile.specificGoals.includes(goal.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const isSelected = userProfile.specificGoals.includes(goal.id);
                            setUserProfile(prev => ({
                              ...prev,
                              specificGoals: isSelected 
                                ? prev.specificGoals.filter(g => g !== goal.id)
                                : [...prev.specificGoals, goal.id]
                            }));
                          }}
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

                {/* Food Dislikes */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Food Dislikes
                  </h3>
                  
                  <div>
                    <Label className="text-sm font-medium">Select foods you want to avoid</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                      {[
                        'Mushrooms', 'Olives', 'Seafood', 'Spicy Food', 
                        'Dairy', 'Nuts', 'Eggs', 'Onions',
                        'Garlic', 'Cilantro', 'Coconut', 'Tomatoes'
                      ].map((food) => (
                        <Button
                          key={food}
                          variant={userProfile.foodDislikes.includes(food.toLowerCase()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const foodLower = food.toLowerCase();
                            const isSelected = userProfile.foodDislikes.includes(foodLower);
                            setUserProfile(prev => ({
                              ...prev,
                              foodDislikes: isSelected 
                                ? prev.foodDislikes.filter(f => f !== foodLower)
                                : [...prev.foodDislikes, foodLower]
                            }));
                          }}
                          className="text-xs"
                        >
                          {food}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cultural/Festival Mode */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Cultural/Festival Mode
                  </h3>
                  
                  <div>
                    <Label>Special Dietary Mode</Label>
                    <Select value={userProfile.culturalMode} onValueChange={(value) => setUserProfile(prev => ({ ...prev, culturalMode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {culturalModes.map((mode) => (
                          <SelectItem key={mode.id} value={mode.id}>
                            <span className="flex items-center gap-2">
                              <span>{mode.icon}</span>
                              {mode.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Plan Duration */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Plan Duration
                  </h3>
                  
                  <div>
                    <Label className="text-sm font-medium">How many days do you want meal plan?</Label>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      {[3, 7, 14].map((days) => (
                        <Button
                          key={days}
                          variant={userProfile.planDuration === days ? "default" : "outline"}
                          size="lg"
                          onClick={() => setUserProfile(prev => ({ ...prev, planDuration: days }))}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                        >
                          <Calendar className="w-5 h-5" />
                          <span className="font-semibold">{days} days</span>
                          <span className="text-xs opacity-75">
                            {days === 3 ? 'Quick Start' : days === 7 ? 'One Week' : 'Two Weeks'}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={generatePremiumMealPlan} 
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Premium Plan
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>AI Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          )}

          {/* Results Section - Full width when configuration hidden */}
          <div className={`${mealPlan.length === 0 ? 'lg:col-span-1 order-1 lg:order-2' : 'lg:col-span-1'} space-y-8`}>
            


            {/* Premium Dashboard */}
            {mealPlan.length > 0 && (
              <>
                {/* Daily Stats Overview */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Today's Nutrition Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {/* Calories */}
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                              strokeDasharray={`${(mealPlan[0].dailyStats.calories / 2000) * 100}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-orange-500" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{mealPlan[0].dailyStats.calories}</p>
                        <p className="text-sm text-gray-600">Calories</p>
                      </div>

                      {/* Mood Score */}
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-pink-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${mealPlan[0].dailyStats.moodScore}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Smile className="w-6 h-6 text-pink-500" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{mealPlan[0].dailyStats.moodScore}</p>
                        <p className="text-sm text-gray-600">Mood Score</p>
                      </div>

                      {/* Gut Health */}
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                              strokeDasharray={`${mealPlan[0].dailyStats.gutHealthScore}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-green-500" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{mealPlan[0].dailyStats.gutHealthScore}</p>
                        <p className="text-sm text-gray-600">Gut Health</p>
                      </div>

                      {/* Skin Glow */}
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-yellow-500"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${mealPlan[0].dailyStats.skinGlowRating}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold">{mealPlan[0].dailyStats.skinGlowRating}</p>
                        <p className="text-sm text-gray-600">Skin Glow</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Meal Plan */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Your Premium Meal Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="monday" className="w-full">
                      <TabsList className="grid w-full grid-cols-7 mb-6">
                        {mealPlan.map((day, index) => (
                          <TabsTrigger key={day.day} value={day.day.toLowerCase()}>
                            {day.day.slice(0, 3)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {mealPlan.map((day) => (
                        <TabsContent key={day.day} value={day.day.toLowerCase()} className="space-y-6">
                          
                          {/* Special Features Alert */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-blue-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-blue-900 mb-2">Today's Special Touch</h4>
                                <div className="space-y-1 text-sm text-blue-800">
                                  <p>🎭 {day.specialFeatures.moodBooster}</p>
                                  <p>🌍 {day.specialFeatures.culturalTouch}</p>
                                  {day.specialFeatures.budgetFriendly && <p>💰 Budget-friendly options included</p>}
                                  {day.specialFeatures.quickPrep && <p>⚡ Quick prep meals for busy schedule</p>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Meals Grid */}
                          <div className="space-y-4">
                            {Object.entries(day.meals).map(([mealType, meal]) => (
                              <div key={mealType} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-lg">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <span className="text-3xl">{meal.emoji}</span>
                                    <div>
                                      <h4 className="font-semibold text-lg capitalize">{mealType.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                      <h5 className="font-medium text-gray-900">{meal.name}</h5>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                      Score: {meal.nutritionScore}
                                    </Badge>
                                    <Badge className={getBudgetColor(userProfile.budget)}>
                                      {meal.cost}
                                    </Badge>
                                    {meal.instagramReady && (
                                      <Badge className="bg-pink-100 text-pink-800">
                                        <Instagram className="w-3 h-3 mr-1" />
                                        Insta-Ready
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <div className="flex gap-4 mb-3">
                                      <span className="text-sm text-gray-600">{meal.calories} cal</span>
                                      <span className="text-sm text-gray-600">{meal.prepTime}</span>
                                      <span className="text-sm text-gray-600">{meal.difficulty}</span>
                                    </div>
                                    
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-purple-700 mb-1">
                                        💜 {meal.moodConnection}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        🌍 Origin: {meal.culturalOrigin}
                                      </p>
                                    </div>

                                    <div className="mb-3">
                                      <h6 className="font-medium text-sm text-gray-700 mb-1">Health Benefits:</h6>
                                      <div className="flex flex-wrap gap-1">
                                        {meal.benefits.map((benefit, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {benefit}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h6 className="font-medium text-sm text-gray-700 mb-2">Ingredients:</h6>
                                    <div className="grid grid-cols-2 gap-1 mb-3">
                                      {meal.ingredients.map((ingredient, index) => (
                                        <span key={index} className="text-xs text-gray-600">• {ingredient}</span>
                                      ))}
                                    </div>

                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="flex-1">
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Smart Swap
                                      </Button>
                                      <Button size="sm" variant="outline" className="flex-1">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        Add to List
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Hydration Reminder */}
                          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <Droplets className="w-6 h-6 text-blue-600" />
                              <div>
                                <h4 className="font-semibold text-blue-900">Hydration Goal</h4>
                                <p className="text-sm text-blue-800">
                                  Target: 2.5L water • Try: Cucumber mint water, Lemon ginger detox
                                </p>
                              </div>
                            </div>
                            <Progress value={day.dailyStats.hydration} className="mt-2 h-2" />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}

            {/* No Plan Generated Yet */}
            {mealPlan.length === 0 && !isProcessing && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardContent className="text-center py-16">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Analysed Result</h3>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-sm font-medium text-red-800">Error</p>
                      </div>
                      <p className="text-sm text-red-700">{error}</p>
                      <Button 
                        onClick={() => setError(null)} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <ShoppingListGenerator 
              mealPlan={mealPlan}
              budget={userProfile.budget}
              onClose={() => setShowShoppingList(false)}
            />
          </div>
        </div>
      )}

      {/* Game System Modal */}
      {showGameSystem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nutrition Achievement System</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowGameSystem(false)}>
                ✕
              </Button>
            </div>
            <div className="p-6">
              <NutritionGameSystem />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanGenerator;