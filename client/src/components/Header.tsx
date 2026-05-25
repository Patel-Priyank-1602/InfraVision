import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import HelpForm from "@/components/HelpForm";
import { Leaf, Sun, Moon, Info, BarChart3, HelpCircle } from "lucide-react";

interface HeaderProps {
  onDashboardToggle?: () => void;
}

export default function Header({ onDashboardToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showHelpForm, setShowHelpForm] = useState(false);

  const handleHelpClick = () => {
    setShowHelpForm(true);
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">InfraVision</h1>
              <p className="text-xs text-muted-foreground">Green Hydrogen Planning</p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              {onDashboardToggle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={onDashboardToggle}
                  data-testid="button-dashboard-nav"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              
              <Link href="/about">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Info className="w-4 h-4" />
                  About
                </Button>
              </Link>

              <button 
                onClick={handleHelpClick}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-help-nav"
              >
                Help
              </button>
            </nav>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-accent" />
              ) : (
                <Sun className="w-4 h-4 text-accent" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Help Form Modal */}
      {showHelpForm && (
        <HelpForm onClose={() => setShowHelpForm(false)} />
      )}
    </header>
  );
}
