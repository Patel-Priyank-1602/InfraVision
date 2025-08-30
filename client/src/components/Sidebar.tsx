import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Layers, Zap, Plus, Download, Calculator, Share, Wind, Sun, Building2, Factory, Truck, Zap as ZapIcon } from "lucide-react";
import type { HydrogenSite, RenewableSource, DemandCenter } from "@/types/hydrogen";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSiteSelect: (site: HydrogenSite) => void;
}

export default function Sidebar({ isOpen, onSiteSelect }: SidebarProps) {
  const { data: aiSuggestions = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/ai-suggestions'],
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
      case 'wind': return <Wind className="w-3 h-3" />;
      case 'solar': return <Sun className="w-3 h-3" />;
      default: return <ZapIcon className="w-3 h-3" />;
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-card border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* AI Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Brain className="w-4 h-4 text-primary" />
              <span>AI Suggestions</span>
            </h2>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
              {aiSuggestions.length} Sites
            </span>
          </div>

          <div className="space-y-3">
            {aiSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No AI suggestions available</p>
                <p className="text-xs">AI will analyze optimal locations based on your activity</p>
              </div>
            ) : (
              aiSuggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id}
                  className="p-4 border border-border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => onSiteSelect(suggestion)}
                  data-testid={`card-ai-suggestion-${suggestion.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{suggestion.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(suggestion.suitabilityScore)} bg-muted`}>
                      Score: {suggestion.suitabilityScore}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getScoreLabel(suggestion.suitabilityScore)} site for hydrogen production
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="flex items-center space-x-1 text-primary">
                      {getRenewableIcon('wind')}
                      <span>Renewable: {suggestion.renewableUtilization || 0}%</span>
                    </span>
                    {suggestion.co2SavedAnnually && (
                      <span className="flex items-center space-x-1 text-accent">
                        <Building2 className="w-3 h-3" />
                        <span>CO₂: {(suggestion.co2SavedAnnually / 1000).toFixed(0)}kt/yr</span>
                      </span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Map Layers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Layers className="w-4 h-4 text-secondary" />
            <span>Map Layers</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox defaultChecked data-testid="checkbox-existing-plants" />
              <span className="text-sm text-foreground">Existing H₂ Plants</span>
              <Factory className="w-3 h-3 text-primary ml-auto" />
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox defaultChecked data-testid="checkbox-renewable-sources" />
              <span className="text-sm text-foreground">Renewable Sources</span>
              <ZapIcon className="w-3 h-3 text-accent ml-auto" />
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox defaultChecked data-testid="checkbox-demand-centers" />
              <span className="text-sm text-foreground">Demand Centers</span>
              <Building2 className="w-3 h-3 text-secondary ml-auto" />
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox data-testid="checkbox-pipeline-network" />
              <span className="text-sm text-foreground">Pipeline Network</span>
              <Truck className="w-3 h-3 text-muted-foreground ml-auto" />
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox data-testid="checkbox-regulatory-zones" />
              <span className="text-sm text-foreground">Regulatory Zones</span>
              <Building2 className="w-3 h-3 text-muted-foreground ml-auto" />
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Zap className="w-4 h-4 text-accent" />
            <span>Quick Actions</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium h-auto flex-col"
              data-testid="button-add-plant"
            >
              <Plus className="w-4 h-4 mb-1" />
              Add Plant
            </Button>
            <Button 
              variant="secondary"
              className="p-3 hover:bg-secondary/90 transition-colors text-sm font-medium h-auto flex-col"
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mb-1" />
              Export Data
            </Button>
            <Button 
              variant="outline"
              className="p-3 hover:bg-muted/90 transition-colors text-sm font-medium h-auto flex-col"
              data-testid="button-calculator"
            >
              <Calculator className="w-4 h-4 mb-1" />
              Calculator
            </Button>
            <Button 
              variant="outline"
              className="p-3 hover:bg-muted/90 transition-colors text-sm font-medium h-auto flex-col"
              data-testid="button-share"
            >
              <Share className="w-4 h-4 mb-1" />
              Share
            </Button>
          </div>
        </div> */}
      </div>
    </aside>
  );
}
