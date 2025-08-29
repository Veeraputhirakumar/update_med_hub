import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { features } from '@/data/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeatureDetail = () => {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = features.find(f => f.id === featureId);

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Feature not found</h1>
          <Link to="/">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = feature.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{feature.title}</span>
        </div>

        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Feature Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="medical-icon-lg mx-auto mb-6">
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {feature.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            {feature.description}
          </p>
          <Badge variant="secondary" className="text-sm">
            {feature.subModels.length} AI Models Available
          </Badge>
        </div>

        {/* Sub-Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feature.subModels.map((subModel, index) => (
            <Card 
              key={subModel.id} 
              className="medical-card cursor-pointer group h-full hover:border-primary/30 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => {
                // Navigate to the specific model interface
                navigate(`/model/${subModel.id}`);
              }}
            >
              <CardContent className="p-6 h-full">
                <div className="flex flex-col h-full">
                  {/* Icon and Title */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-4xl">{subModel.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {subModel.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="text-xs mb-2 capitalize"
                      >
                        {subModel.inputType} Input
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {subModel.description}
                  </p>

                  {/* Mock Output Preview */}
                  {subModel.mockOutput && (
                    <div className="bg-accent/30 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Sample Output
                      </h4>
                      <div className="text-xs text-foreground">
                        {Array.isArray(subModel.mockOutput.diseases) && (
                          <div>Top prediction: {subModel.mockOutput.diseases[0]?.name} ({subModel.mockOutput.diseases[0]?.probability}%)</div>
                        )}
                        {subModel.mockOutput.classification && (
                          <div>Classification: {subModel.mockOutput.classification}</div>
                        )}
                        {subModel.mockOutput.sentiment && (
                          <div>Sentiment: {subModel.mockOutput.sentiment}</div>
                        )}
                        {subModel.mockOutput.fallRisk && (
                          <div>Risk Level: {subModel.mockOutput.fallRisk}</div>
                        )}
                        {!subModel.mockOutput.diseases && !subModel.mockOutput.classification && 
                         !subModel.mockOutput.sentiment && !subModel.mockOutput.fallRisk && (
                          <div>Interactive analysis available</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      AI Model
                    </span>
                    <div className="flex items-center text-primary group-hover:text-primary-glow transition-colors">
                      <span className="text-sm font-medium mr-1">Open Model</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="medical-card p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Need Help Choosing?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Each AI model is specialized for different types of healthcare analysis. 
                Start with the model that best matches your current needs, or explore 
                multiple models for comprehensive insights.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="btn-medical text-white">
                  Get Recommendations
                </Button>
                <Link to="/">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Explore Other Features
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;