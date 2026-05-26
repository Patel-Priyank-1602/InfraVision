import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Brain,
  Layers,
  Zap,
  Plus,
  Download,
  Calculator,
  Share,
  BarChart3,
  Wind,
  Sun,
  Building2,
  Factory,
  Truck,
  Zap as ZapIcon,
  X
} from "lucide-react";
import type {
  HydrogenSite,
  RenewableSource,
  DemandCenter,
} from "@/types/hydrogen";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSiteSelect: (site: HydrogenSite) => void;
  onDashboardToggle: () => void;
  onLayerToggle: (layerType: string, enabled: boolean) => void;
  enabledLayers: { [key: string]: boolean };
  onSiteNavigate: (lat: number, lng: number) => void;
}

export default function Sidebar({ isOpen, onToggle, onSiteSelect, onDashboardToggle, onLayerToggle, enabledLayers, onSiteNavigate }: SidebarProps) {
  const { data: aiSuggestions = [] } = useQuery<HydrogenSite[]>({
    queryKey: ["/api/ai-suggestions"],
    refetchOnWindowFocus: false,
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Poor";
  };

  const getRenewableIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "wind":
        return <Wind className="w-3 h-3" />;
      case "solar":
        return <Sun className="w-3 h-3" />;
      default:
        return <ZapIcon className="w-3 h-3" />;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[40] md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside 
        className={`
          fixed bottom-0 left-0 right-0 z-[50] glass border-t border-border backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]
          transition-all duration-700 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        `}
      >
        <div className="p-2 md:p-3 flex items-center gap-2 md:gap-4 relative w-full overflow-hidden">
          {/* Close Button */}
          <div className="flex-shrink-0 pl-1 md:pl-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors bg-background/50 shadow-sm border border-border/50" 
              onClick={onToggle}
              title="Close Projects"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-3 overflow-x-auto py-2 flex-1 w-full snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {aiSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Loading hydrogen projects...</p>
                <p className="text-xs">
                  Real operational and planned projects across India
                </p>
              </div>
            ) : (
              aiSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="min-w-[220px] md:min-w-[260px] snap-center glass-card p-3 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer flex-shrink-0"
                  onClick={() => {
                    onSiteSelect(suggestion);
                    onSiteNavigate(parseFloat(suggestion.latitude), parseFloat(suggestion.longitude));
                  }}
                  data-testid={`card-ai-suggestion-${suggestion.id}`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-semibold text-foreground text-xs leading-tight">
                      {suggestion.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(suggestion.suitabilityScore)} bg-muted`}
                    >
                      {suggestion.suitabilityScore}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {getScoreLabel(suggestion.suitabilityScore)} suitability • Click to view details
                  </p>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1 text-primary">
                      {getRenewableIcon("wind")}
                      <span>
                        {suggestion.renewableUtilization || 0}%
                      </span>
                    </span>
                    {suggestion.co2SavedAnnually && (
                      <span className="flex items-center space-x-1 text-accent">
                        <Building2 className="w-3 h-3" />
                        <span>
                          {(suggestion.co2SavedAnnually / 1000).toFixed(0)}kt CO₂/yr
                        </span>
                      </span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
