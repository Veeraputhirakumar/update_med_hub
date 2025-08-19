import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left: Copyright */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Activity className="w-5 h-5" />
            <span className="text-sm">
              © {currentYear} AI Health Hub. All rights reserved.
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <Link 
              to="/terms" 
              className="text-sm hover:text-primary-glow transition-colors"
            >
              Terms
            </Link>
            <span className="text-secondary-foreground/50">|</span>
            <Link 
              to="/privacy" 
              className="text-sm hover:text-primary-glow transition-colors"
            >
              Privacy
            </Link>
            <span className="text-secondary-foreground/50">|</span>
            <Link 
              to="/disclaimer" 
              className="text-sm hover:text-primary-glow transition-colors"
            >
              Disclaimer
            </Link>
          </div>

          {/* Right: Powered by */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">Powered by Advanced AI</span>
            <div className="w-6 h-6 rounded-lg bg-primary-glow/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-primary-glow" />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-secondary-foreground/20 mt-6 pt-6">
          <p className="text-xs text-secondary-foreground/70 text-center max-w-4xl mx-auto">
            <strong>Medical Disclaimer:</strong> AI Health Hub is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
            Always consult with qualified healthcare providers for medical decisions. The AI tools provided are not medical devices and should not be used for emergency situations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;