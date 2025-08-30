import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { SiteAnalysis } from "@/types/hydrogen";

interface SuitabilityScoreProps {
  analysis: SiteAnalysis;
  onClose: () => void;
}

export default function SuitabilityScore({ analysis, onClose }: SuitabilityScoreProps) {
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
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-80 bg-card border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Site Sustainability</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6"
            data-testid="button-close-score"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(analysis.suitabilityScore)}`}>
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

        {/* Factor Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Renewable Access</span>
            <span className="text-primary font-medium" data-testid="text-renewable-access">
              {analysis.factors.renewableAccess}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Transport Cost</span>
            <span className="text-accent font-medium" data-testid="text-transport-cost">
              {analysis.factors.transportCost}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Demand Proximity</span>
            <span className="text-secondary font-medium" data-testid="text-demand-proximity">
              {analysis.factors.demandProximity}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Water Availability</span>
            <span className="text-primary font-medium" data-testid="text-water-availability">
              {analysis.factors.waterAvailability}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Regulatory Support</span>
            <span className="text-muted-foreground font-medium" data-testid="text-regulatory-support">
              {analysis.factors.regulatorySupport}
            </span>
          </div>
        </div>

        {/* Quick Impact Metrics */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. CO₂ Savings</span>
            <span className="text-green-600 dark:text-green-400 font-medium" data-testid="text-co2-savings">
              {(analysis.co2SavedAnnually / 1000).toFixed(0)}kt/year
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Industries Supported</span>
            <span className="text-secondary font-medium" data-testid="text-industries-supported">
              {analysis.industriesSupported}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Renewable Utilization</span>
            <span className="text-accent font-medium" data-testid="text-renewable-utilization">
              {analysis.renewableUtilization}%
            </span>
          </div>
        </div>

        {/* Site Sustainability */}
        {analysis.recommendations.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Site Sustainability:</p>
            <ul className="text-xs space-y-1">
              {analysis.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="text-foreground">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}