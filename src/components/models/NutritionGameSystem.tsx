import { useState, useEffect } from 'react';
import { 
  Trophy, Star, Zap, Target, Award, Crown, Gem, Flame,
  TrendingUp, Calendar, CheckCircle, Medal, Gift, Sparkles,
  Heart, Brain, Shield, Activity, Users, Clock, Leaf, Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'nutrition' | 'consistency' | 'variety' | 'health' | 'social';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  duration: number; // days
  reward: number; // points
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  active: boolean;
  progress: number;
  maxProgress: number;
  endDate: Date;
}

interface UserStats {
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  mealsCompleted: number;
  healthyChoices: number;
  varietyScore: number;
  consistencyScore: number;
}

const NutritionGameSystem = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 7,
    totalPoints: 2840,
    currentStreak: 12,
    longestStreak: 28,
    mealsCompleted: 156,
    healthyChoices: 234,
    varietyScore: 85,
    consistencyScore: 92
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Protein Champion',
      description: 'Hit your protein target for 7 consecutive days',
      icon: Trophy,
      points: 100,
      rarity: 'rare',
      category: 'nutrition',
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      unlockedDate: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Fiber Hero',
      description: 'Consume 30g+ fiber for 5 days',
      icon: Leaf,
      points: 75,
      rarity: 'common',
      category: 'nutrition',
      unlocked: true,
      progress: 5,
      maxProgress: 5,
      unlockedDate: new Date('2024-01-10')
    },
    {
      id: '3',
      title: 'Rainbow Warrior',
      description: 'Eat 7 different colored foods in one day',
      icon: Sparkles,
      points: 50,
      rarity: 'common',
      category: 'variety',
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      unlockedDate: new Date('2024-01-08')
    },
    {
      id: '4',
      title: 'Consistency King',
      description: 'Log meals for 30 consecutive days',
      icon: Crown,
      points: 200,
      rarity: 'epic',
      category: 'consistency',
      unlocked: false,
      progress: 12,
      maxProgress: 30
    },
    {
      id: '5',
      title: 'Hydration Master',
      description: 'Drink 8+ glasses of water for 10 days',
      icon: Droplets,
      points: 80,
      rarity: 'rare',
      category: 'health',
      unlocked: false,
      progress: 3,
      maxProgress: 10
    },
    {
      id: '6',
      title: 'Omega-3 Oracle',
      description: 'Include omega-3 rich foods 3 times this week',
      icon: Brain,
      points: 60,
      rarity: 'common',
      category: 'nutrition',
      unlocked: false,
      progress: 1,
      maxProgress: 3
    }
  ]);

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Green Week Challenge',
      description: 'Include green vegetables in every meal for 7 days',
      icon: Leaf,
      duration: 7,
      reward: 150,
      difficulty: 'medium',
      category: 'nutrition',
      active: true,
      progress: 4,
      maxProgress: 21, // 3 meals x 7 days
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'No Sugar Weekend',
      description: 'Avoid added sugars for the entire weekend',
      icon: Shield,
      duration: 2,
      reward: 100,
      difficulty: 'hard',
      category: 'health',
      active: true,
      progress: 0,
      maxProgress: 2,
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  ]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity as keyof typeof colors];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const getNextLevelPoints = () => {
    return userStats.level * 500; // Points needed for next level
  };

  const getCurrentLevelProgress = () => {
    const currentLevelPoints = (userStats.level - 1) * 500;
    const nextLevelPoints = getNextLevelPoints();
    const progressPoints = userStats.totalPoints - currentLevelPoints;
    return (progressPoints / (nextLevelPoints - currentLevelPoints)) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Stats Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">Level {userStats.level}</span>
              </div>
              <Progress value={getCurrentLevelProgress()} className="h-3 bg-white/20" />
              <p className="text-sm mt-1 opacity-90">
                {getNextLevelPoints() - userStats.totalPoints} pts to next level
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{userStats.totalPoints}</span>
              </div>
              <p className="text-sm opacity-90">Total Points</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{userStats.currentStreak}</span>
              </div>
              <p className="text-sm opacity-90">Day Streak</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{achievements.filter(a => a.unlocked).length}</span>
              </div>
              <p className="text-sm opacity-90">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden ${achievement.unlocked ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${getRarityColor(achievement.rarity)} opacity-20`}></div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} ${achievement.unlocked ? '' : 'grayscale'}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                              {achievement.points} pts
                            </Badge>
                            {achievement.unlocked && (
                              <CheckCircle className="w-5 h-5 text-green-500 mt-2" />
                            )}
                          </div>
                        </div>
                        
                        {!achievement.unlocked && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        {achievement.unlockedDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Unlocked {achievement.unlockedDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => {
              const IconComponent = challenge.icon;
              const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={challenge.id} className="bg-gradient-to-br from-white to-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                            <p className="text-sm text-gray-600">{challenge.description}</p>
                          </div>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{challenge.progress}/{challenge.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(challenge.progress / challenge.maxProgress) * 100} 
                            className="h-2"
                          />
                          
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{daysLeft} days left</span>
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 font-medium">
                              <Gem className="w-4 h-4" />
                              <span>{challenge.reward} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Available Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Available Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Antioxidant Week', description: 'Include berries in daily meals', reward: 120, difficulty: 'easy' },
                  { title: 'Plant Power', description: 'Go vegetarian for 3 days', reward: 180, difficulty: 'medium' },
                  { title: 'Mindful Eating', description: 'Practice mindful eating for 1 week', reward: 200, difficulty: 'hard' }
                ].map((challenge, index) => (
                  <div key={index} className="border rounded-lg p-4 text-center">
                    <h4 className="font-medium text-gray-900 mb-2">{challenge.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      <span className="text-sm font-medium text-purple-600">{challenge.reward} pts</span>
                    </div>
                    <Button size="sm" className="w-full">
                      Accept Challenge
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'You', points: 2840, streak: 12, avatar: '👑' },
                  { rank: 2, name: 'Sarah M.', points: 2750, streak: 8, avatar: '🌟' },
                  { rank: 3, name: 'Mike R.', points: 2680, streak: 15, avatar: '💪' },
                  { rank: 4, name: 'Lisa K.', points: 2590, streak: 6, avatar: '🥗' },
                  { rank: 5, name: 'John D.', points: 2480, streak: 11, avatar: '🏃' }
                ].map((user) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      user.name === 'You' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.rank === 1 ? 'bg-yellow-500 text-white' :
                      user.rank === 2 ? 'bg-gray-400 text-white' :
                      user.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {user.rank}
                    </div>
                    
                    <div className="text-2xl">{user.avatar}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${user.name === 'You' ? 'text-orange-700' : 'text-gray-900'}`}>
                          {user.name}
                        </span>
                        {user.name === 'You' && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.streak} day streak
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{user.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Premium Recipe Book', cost: 500, description: '50+ exclusive healthy recipes', icon: '📚', available: true },
              { title: 'Nutrition Consultation', cost: 1000, description: '30-min session with nutritionist', icon: '👨‍⚕️', available: true },
              { title: 'Meal Prep Kit', cost: 800, description: 'Complete meal prep containers set', icon: '🥡', available: true },
              { title: 'Fitness Tracker', cost: 2000, description: 'Smart fitness tracking device', icon: '⌚', available: false },
              { title: 'Organic Grocery Voucher', cost: 1200, description: '₹500 voucher for organic foods', icon: '🛒', available: true },
              { title: 'Cooking Class Access', cost: 1500, description: 'Online cooking masterclass', icon: '👨‍🍳', available: false }
            ].map((reward, index) => (
              <Card key={index} className={`${reward.available ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-3">{reward.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <Badge className="bg-purple-100 text-purple-800">
                      {reward.cost} pts
                    </Badge>
                    {userStats.totalPoints >= reward.cost && reward.available && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    disabled={!reward.available || userStats.totalPoints < reward.cost}
                  >
                    {reward.available ? 'Redeem' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionGameSystem;
