import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";
import CombinedAnalysisPanel from "@/components/CombinedAnalysisPanel";
import { Chatbot } from "@/components/Chatbot";
import QuickActions from "@/components/QuickActions";
import type { HydrogenSite, SiteAnalysis } from "@/types/hydrogen";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<HydrogenSite | null>(null);
  const [currentScore, setCurrentScore] = useState<SiteAnalysis | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisTab, setAnalysisTab] = useState<"suitability" | "sustainability">("suitability");

  const handleSiteSelect = (site: HydrogenSite) => {
    setSelectedSite(site);
    setAnalysisTab("sustainability");
    setShowAnalysisPanel(true);
  };

  const handleScoreUpdate = (analysis: SiteAnalysis) => {
    setCurrentScore(analysis);
    setAnalysisTab("suitability");
    setShowAnalysisPanel(true);
  };

  const handleCloseAnalysisPanel = () => {
    setShowAnalysisPanel(false);
    setCurrentScore(null);
    setSelectedSite(null);
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
      />
      
      <div className="flex h-[calc(100vh-4rem)] relative">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSiteSelect={handleSiteSelect}
        />
        
        <main className="flex-1 relative overflow-hidden">
          <MapView 
            onSiteSelect={handleSiteSelect}
            onScoreUpdate={handleScoreUpdate}
            sidebarOpen={isSidebarOpen}
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          {showAnalysisPanel && (currentScore || selectedSite) && (
            <CombinedAnalysisPanel 
              analysis={currentScore || undefined}
              site={selectedSite || undefined}
              defaultTab={analysisTab}
              onClose={handleCloseAnalysisPanel}
            />
          )}
          
          <QuickActions />
        </main>
      </div>
      
      <Chatbot 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}
