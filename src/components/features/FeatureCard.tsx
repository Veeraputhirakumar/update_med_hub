import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Feature } from '@/data/features';

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const IconComponent = feature.icon;

  return (
    <Link to={`/feature/${feature.id}`} className="group block">
      <div className="feature-card h-full">
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div className="medical-icon-lg mx-auto">
            <IconComponent className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {feature.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {feature.subModels.length} AI Models
            </span>
            <div className="flex items-center text-primary group-hover:text-primary-glow transition-colors">
              <span className="text-sm font-medium mr-1">Explore</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;