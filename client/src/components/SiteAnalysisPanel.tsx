import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, BarChart3 } from "lucide-react";
import type { SiteAnalysis } from "@/types/hydrogen";

interface SiteAnalysisPanelProps {
  analysis: SiteAnalysis;
  onClose: () => void;
  isLoading?: boolean;
}

export default function SiteAnalysisPanel({ analysis, onClose, isLoading }: SiteAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'suitability' | 'analysis'>('suitability');

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Site 🌟";
    if (score >= 60) return "Good Site ✅";
    return "Poor Site ❌";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20 border-green-200";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200";
    return "bg-red-100 dark:bg-red-900/20 border-red-200";
  };

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-72 md:w-80 lg:w-96 max-w-[calc(100vw-2rem)] bg-card border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Site Assessment</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6"
            data-testid="button-close-analysis"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === 'suitability' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('suitability')}
            className="flex-1 text-xs h-8"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Suitability
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('analysis')}
            className="flex-1 text-xs h-8"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Analysis
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeTab === 'suitability' && (
          <>
            {/* Score Display */}
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getScoreBgColor(analysis.suitabilityScore)}`}>
                <span className={`font-bold text-lg ${getScoreColor(analysis.suitabilityScore)}`} data-testid="text-score-value">
                  {analysis.suitabilityScore}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${getScoreColor(analysis.suitabilityScore)}`} data-testid="text-score-label">
                  {getScoreLabel(analysis.suitabilityScore)}
                </p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  analysis.suitabilityScore >= 80 ? 'bg-green-500' :
                  analysis.suitabilityScore >= 60 ? 'bg-yellow-500' :
                  analysis.suitabilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.suitabilityScore}%` }}
              ></div>
            </div>

            {/* Quick Impact Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-sm font-bold text-green-600 dark:text-green-400" data-testid="text-co2-savings">
                  {(analysis.co2SavedAnnually / 1000).toFixed(0)}kt
                </div>
                <div className="text-xs text-muted-foreground">CO₂ Saved/Year</div>
              </div>
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-sm font-bold text-secondary" data-testid="text-industries-supported">
                  {analysis.industriesSupported}
                </div>
                <div className="text-xs text-muted-foreground">Industries</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <>
            {/* Key Factors */}
            {analysis.factors && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Factors</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.factors).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-xs bg-muted rounded p-2">
                      <span className="font-medium text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {typeof value === 'number' ? `${value}/10` : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recommendations</h4>
                <ul className="text-xs space-y-1">
                  {analysis.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-foreground flex items-start">
                      <span className="text-primary mr-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
              <div className="bg-muted rounded p-2 text-center">
                <div className="font-bold text-accent" data-testid="text-renewable-utilization">
                  {analysis.renewableUtilization}%
                </div>
                <div className="text-muted-foreground">Renewable Use</div>
              </div>
              <div className="bg-muted rounded p-2 text-center">
                <div className="font-bold text-primary">
                  Strong
                </div>
                <div className="text-muted-foreground">Policy Support</div>
              </div>
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-primary">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Analyzing location...
          </div>
        )}

        {/* Coordinates */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            📍 Current assessment location
          </div>
        </div>
      </CardContent>
    </Card>
  );
}