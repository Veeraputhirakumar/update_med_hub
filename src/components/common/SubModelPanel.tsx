import { useState, ReactNode } from 'react';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SubModelPanelProps {
  title: string;
  description: string;
  backLink: string;
  backLinkText: string;
  icon: ReactNode;
  inputPanel: ReactNode;
  outputPanel: ReactNode;
  isAnalyzing: boolean;
  progress: number;
  onAnalyze: () => void;
  onReset: () => void;
  canAnalyze: boolean;
  disclaimer?: string;
  hideInputPanel?: boolean;
}

const SubModelPanel = ({
  title,
  description,
  backLink,
  backLinkText,
  icon,
  inputPanel,
  outputPanel,
  isAnalyzing,
  progress,
  onAnalyze,
  onReset,
  canAnalyze,
  disclaimer = "This AI tool is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.",
  hideInputPanel = false
}: SubModelPanelProps) => {
  const gridClass = hideInputPanel
    ? "grid grid-cols-1 gap-8"
    : "grid grid-cols-1 lg:grid-cols-2 gap-8";
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={backLink} 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {backLinkText}
          </Link>
          
          <div className="text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>
        </div>

        <div className={gridClass}>
          {/* Input Panel */}
          {!hideInputPanel && (
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Input Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {inputPanel}
                
                {/* Progress (kept for other models that use it) */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing...</span>
                      <span className="text-primary font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="medical-progress" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Output Panel */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outputPanel}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="medical-card mt-8 bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  Medical Disclaimer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {disclaimer}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubModelPanel;