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

export default function Sidebar({ isOpen, onSiteSelect, onDashboardToggle, onLayerToggle, enabledLayers, onSiteNavigate }: SidebarProps) {
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

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-card border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* AI Suggestions - Indian Hydrogen Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Brain className="w-4 h-4 text-primary" />
              <span>Hydrogen Plans</span>
            </h2>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
              {aiSuggestions.length} Projects
            </span>
          </div>

          <div className="space-y-3">
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
                  className="p-4 border border-border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => {
                    onSiteSelect(suggestion);
                    onSiteNavigate(parseFloat(suggestion.latitude), parseFloat(suggestion.longitude));
                  }}
                  data-testid={`card-ai-suggestion-${suggestion.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground text-sm leading-tight">
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

        {/* Dashboard Access */}
        <div className="space-y-4">
          <Button 
            onClick={onDashboardToggle}
            className="w-full justify-start gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            data-testid="button-dashboard"
          >
            <BarChart3 className="w-4 h-4" />
            Plants Dashboard
          </Button>
        </div>
      </div>
    </aside>
  );
}
