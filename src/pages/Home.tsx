import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { features } from '@/data/features';
import FeatureCard from '@/components/features/FeatureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const stats = [
    { icon: TrendingUp, label: 'AI Models', value: '50+', color: 'text-primary' },
    { icon: Users, label: 'Healthcare Areas', value: '10', color: 'text-success' },
    { icon: Award, label: 'Accuracy Rate', value: '94%', color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="medical-icon-lg mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">
                Welcome to AI Health Hub
              </h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                AI Health Hub is for informational purposes only and should not replace 
                professional medical advice, diagnosis, or treatment. Always consult with 
                qualified healthcare providers for medical decisions.
              </p>
              <Button 
                onClick={handleAcceptDisclaimer}
                className="btn-medical w-full text-white"
              >
                I Understand - Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="medical-icon-lg mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Advanced Healthcare
            <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Unified platform for cutting-edge healthcare AI tools. From diagnosis assistance 
            to personalized nutrition planning, unlock the power of artificial intelligence 
            for better health outcomes.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <div className="medical-icon">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Explore AI Healthcare Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive suite of AI-powered healthcare tools, 
              each containing multiple specialized models for specific medical applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard feature={feature} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Models Section */}
        <div className="text-center">
          <Card className="medical-card p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Begin your AI-powered healthcare journey by exploring any of our 
                advanced features. Each tool is designed to provide accurate, 
                reliable insights to support your health decisions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="btn-medical text-white">
                  Start with Diagnosis Tools
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  View All Models
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;