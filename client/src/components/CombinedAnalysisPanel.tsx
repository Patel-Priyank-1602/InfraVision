import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Leaf, Factory, Zap, BarChart3, Target } from "lucide-react";
import type { SiteAnalysis } from "@/types/hydrogen";
import type { HydrogenSite } from "@/types/hydrogen";

interface CombinedAnalysisPanelProps {
  analysis?: SiteAnalysis;
  site?: HydrogenSite;
  onClose: () => void;
  defaultTab?: "suitability" | "sustainability";
}

export default function CombinedAnalysisPanel({ 
  analysis, 
  site, 
  onClose, 
  defaultTab = "suitability" 
}: CombinedAnalysisPanelProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);

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

  // Chart setup for sustainability tab
  useEffect(() => {
    if (activeTab !== "sustainability" || !site || !chartRef.current) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then((Chart) => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current;
      if (!ctx) return;

      chartInstanceRef.current = new Chart.default(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Wind Energy', 'Solar Energy', 'Grid Power'],
          datasets: [{
            data: [
              site.renewableUtilization ? Math.floor(site.renewableUtilization * 0.65) : 45,
              site.renewableUtilization ? Math.floor(site.renewableUtilization * 0.35) : 25,
              site.renewableUtilization ? 100 - site.renewableUtilization : 30
            ],
            backgroundColor: [
              'hsl(158 64% 52%)',
              'hsl(48 96% 53%)',
              'hsl(240 5.9% 90%)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [site, activeTab]);

  if (!analysis && !site) return null;

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-96 max-w-[calc(100vw-2rem)] bg-card border border-border shadow-lg md:w-96 sm:w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Site Suitability</h3>
            {site && (
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-site-name">
                {site.name}
              </p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6"
            data-testid="button-close-analysis-panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "suitability" | "sustainability")}>
          {/* <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="suitability" className="flex items-center space-x-2" data-testid="tab-suitability">
              <Target className="w-4 h-4" />
              <span>Suitability</span>
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="flex items-center space-x-2" data-testid="tab-sustainability">
              <Leaf className="w-4 h-4" />
              <span>Impact</span>
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="suitability" className="space-y-4">
            {analysis && (
              <>
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

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Recommendations:</p>
                    <ul className="text-xs space-y-1">
                      {analysis.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="sustainability" className="space-y-4">
            {site && (
              <>
                {/* CO2 Savings */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">CO₂ Saved Annually</span>
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary" data-testid="text-co2-annual">
                    {site.co2SavedAnnually ? (site.co2SavedAnnually / 1000).toFixed(0) : '25'}k
                  </div>
                  <div className="text-xs text-muted-foreground">tons per year</div>
                </div>
                
                {/* Industries Supported */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Industries Supported</span>
                    <Factory className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-secondary" data-testid="text-industries-count">
                    {site.industriesSupported || 8}
                  </div>
                  <div className="text-xs text-muted-foreground">steel, transport, chemical</div>
                </div>
                
                {/* Renewable Utilization */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Renewable Utilization</span>
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent" data-testid="text-renewable-percent">
                    {site.renewableUtilization || 75}%
                  </div>
                  <div className="text-xs text-muted-foreground">wind + solar mix</div>
                </div>
                
                {/* Chart Container */}
                <div className="h-32 bg-muted rounded-lg p-3">
                  <canvas ref={chartRef} data-testid="chart-energy-mix"></canvas>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground" data-testid="text-suitability-score">
                      {site.suitabilityScore}/100
                    </div>
                    <div className="text-xs text-muted-foreground">Suitability Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground" data-testid="text-economic-impact">
                      $2.5M
                    </div>
                    <div className="text-xs text-muted-foreground">Economic Impact</div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}