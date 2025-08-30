import { useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Leaf, Factory, Zap } from "lucide-react";
import type { HydrogenSite } from "@/types/hydrogen";

interface ImpactPanelProps {
  site: HydrogenSite;
  onClose: () => void;
}

export default function ImpactPanel({ site, onClose }: ImpactPanelProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

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
  }, [site]);

  return (
    <Card className="absolute bottom-4 right-4 w-96 bg-card border border-border shadow-lg overflow-hidden z-[1000]">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Sustainability Impact</h3>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-site-name">
              {site.name}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6"
            data-testid="button-close-impact-panel"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
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
        <div className="h-48 bg-muted rounded-lg p-3">
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
      </CardContent>
    </Card>
  );
}
