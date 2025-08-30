import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";
import ImpactPanel from "@/components/ImpactPanel";
import PlantsDashboard from "@/components/PlantsDashboard";
import Chatbot from "@/components/Chatbot";
import PlanDetailsPanel from "@/components/PlanDetailsPanel";
import type { HydrogenSite, SiteAnalysis } from "@/types/hydrogen";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<HydrogenSite | null>(null);
  const [showImpactPanel, setShowImpactPanel] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentScore, setCurrentScore] = useState<SiteAnalysis | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<{ [key: string]: boolean }>({
    renewable: true,
    demand: true,
    hydrogen: true,
    aiSuggestions: true
  });
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<HydrogenSite | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const handleSiteSelect = (site: HydrogenSite) => {
    setSelectedSite(site);
    if (site.isAiSuggested) {
      // If it's an AI suggested site (Indian hydrogen plan), show detailed plan panel
      setSelectedPlan(site);
      setShowPlanDetails(true);
    } else {
      // If it's a user-created site, show the impact panel
      setShowImpactPanel(true);
    }
  };

  const handleScoreUpdate = (analysis: SiteAnalysis) => {
    setCurrentScore(analysis);
    setShowScore(true);
  };

  const handleCloseScore = () => {
    setShowScore(false);
    setCurrentScore(null);
  };

  const handleLayerToggle = (layerType: string, enabled: boolean) => {
    setEnabledLayers(prev => ({ ...prev, [layerType]: enabled }));
  };

  const handleSiteNavigate = (lat: number, lng: number) => {
    if (mapInstance) {
      mapInstance.setView([lat, lng], 12);
    }
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        onDashboardToggle={() => setShowDashboard(!showDashboard)}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSiteSelect={handleSiteSelect}
          onDashboardToggle={() => setShowDashboard(!showDashboard)}
          onLayerToggle={handleLayerToggle}
          enabledLayers={enabledLayers}
          onSiteNavigate={handleSiteNavigate}
        />
        
        <main className="flex-1 relative">
          <MapView 
            onSiteSelect={handleSiteSelect}
            onScoreUpdate={handleScoreUpdate}
            sidebarOpen={isSidebarOpen}
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            enabledLayers={enabledLayers}
            onMapReady={setMapInstance}
          />
          
          
          {showImpactPanel && selectedSite && (
            <ImpactPanel 
              site={selectedSite}
              onClose={() => setShowImpactPanel(false)}
            />
          )}

          {showDashboard && (
            <PlantsDashboard 
              onClose={() => setShowDashboard(false)}
            />
          )}

          {showPlanDetails && (
            <PlanDetailsPanel
              plan={selectedPlan}
              onClose={() => {
                setShowPlanDetails(false);
                setSelectedPlan(null);
              }}
            />
          )}
          
        </main>
      </div>
      
      {isChatOpen && (
        <Chatbot onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}
