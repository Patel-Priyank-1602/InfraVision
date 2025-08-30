import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { useState } from "react";
import { Sun, Moon, Leaf, Brain, BarChart3, MapPin, Zap, Building2, X } from "lucide-react";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSupabaseAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">InfraVision</h1>
                <p className="text-xs text-muted-foreground">Green Hydrogen Planning</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
              
              <Button onClick={handleGetStarted} data-testid="button-login">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Green Hydrogen
            <span className="text-primary block">InfraVision</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Play, Plan, and Prove Impact with AI-powered site suggestions, gamified drag-and-drop mapping, 
            and sustainability impact dashboards for green hydrogen infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-3"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
              data-testid="button-learn-more"
              onClick={() => {
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Gamified Optimization</h3>
              <p className="text-muted-foreground">
                Drag and drop hydrogen plant markers directly onto an interactive map. 
                Get instant suitability scores with color-coded feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI-Assisted Suggestions</h3>
              <p className="text-muted-foreground">
                Leverage artificial intelligence for proactive site recommendations. 
                Discover optimal locations with machine learning insights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Impact Dashboard</h3>
              <p className="text-muted-foreground">
                Quantify environmental and economic benefits with CO₂ savings, 
                industry support metrics, and renewable utilization charts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="bg-muted rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Why InfraVision?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Real-time Analysis</h3>
                  <p className="text-muted-foreground">
                    Instant suitability scoring based on proximity to renewable energy sources, 
                    industrial demand, and transport logistics.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Building2 className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Infrastructure Mapping</h3>
                  <p className="text-muted-foreground">
                    Visualize existing hydrogen plants, renewable sources, demand centers, 
                    and pipeline networks on interactive maps.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Brain className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">AI-Powered Insights</h3>
                  <p className="text-muted-foreground">
                    Machine learning algorithms analyze multiple factors to recommend 
                    optimal sites for hydrogen infrastructure development.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Leaf className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Sustainability Focus</h3>
                  <p className="text-muted-foreground">
                    Track CO₂ savings, renewable energy utilization, and industry support 
                    to ensure climate-positive investments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Hydrogen Infrastructure Planning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the future of coordinated, efficient green hydrogen development.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="text-lg px-12 py-4"
            data-testid="button-start-planning"
          >
            Start Planning Today
          </Button>
        </div>
      </main>
      
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Welcome to InfraVision</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAuth(false)}
                  data-testid="button-close-auth"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(158 64% 52%)',
                        brandAccent: 'hsl(158 64% 45%)',
                        defaultButtonBackground: theme === 'dark' ? 'hsl(217 32% 17%)' : 'hsl(0 0% 100%)',
                        defaultButtonBackgroundHover: theme === 'dark' ? 'hsl(217 32% 22%)' : 'hsl(0 0% 96%)',
                        defaultButtonBorder: 'hsl(var(--border))',
                        defaultButtonText: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222 84% 4.9%)',
                        inputBackground: theme === 'dark' ? 'hsl(217 32% 17%)' : 'hsl(0 0% 100%)',
                        inputBorder: 'hsl(var(--border))',
                        inputText: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222 84% 4.9%)',
                        inputPlaceholder: 'hsl(var(--muted-foreground))',
                        messageText: theme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(222 84% 4.9%)',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    input: 'auth-input',
                    label: theme === 'dark' ? 'auth-label-dark' : 'auth-label-light',
                    message: theme === 'dark' ? 'auth-message-dark' : 'auth-message-light',
                  },
                }}
                providers={['google']}
                redirectTo={window.location.origin}
                view="sign_in"
                additionalData={{
                  username: true
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
