import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Factory, 
  Download, 
  Calculator, 
  Share, 
  Plus,
  FileText,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  onAddPlant: () => void;
}

export default function QuickActions({ onAddPlant }: QuickActionsProps) {
  const { toast } = useToast();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleExportPDF = () => {
    // Generate PDF report
    toast({
      title: "Export PDF",
      description: "Generating comprehensive hydrogen infrastructure report...",
    });
    
    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "Your Indian Green Hydrogen Infrastructure Report has been generated.",
      });
      
      // Create a mock PDF download
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,'; // Mock PDF data
      link.download = 'India_Hydrogen_Infrastructure_Report.pdf';
      link.click();
    }, 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'InfraVision - Green Hydrogen Infrastructure Planning',
      text: 'Check out this interactive map for planning green hydrogen infrastructure across India',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Project link has been copied to clipboard.",
        });
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Project link has been copied to clipboard.",
      });
    }
  };

  const openCalculator = () => {
    setIsCalculatorOpen(true);
    toast({
      title: "H2 Calculator",
      description: "Opening hydrogen production and cost calculator...",
    });
    
    // Open calculator in new window/modal
    window.open(
      '/calculator', 
      'h2calculator', 
      'width=800,height=600,resizable=yes,scrollbars=yes'
    );
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex flex-col gap-2">
        {/* Add Plant Button */}
        <Button
          size="icon"
          className="w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg"
          onClick={onAddPlant}
          data-testid="button-add-plant"
        >
          <Plus className="w-5 h-5" />
        </Button>
        
        {/* Export PDF Button */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 bg-card border-border shadow-lg hover:bg-muted"
          onClick={handleExportPDF}
          data-testid="button-export-pdf"
        >
          <Download className="w-5 h-5" />
        </Button>
        
        {/* Calculator Button */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 bg-card border-border shadow-lg hover:bg-muted"
          onClick={openCalculator}
          data-testid="button-calculator"
        >
          <Calculator className="w-5 h-5" />
        </Button>
        
        {/* Share Button */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 bg-card border-border shadow-lg hover:bg-muted"
          onClick={handleShare}
          data-testid="button-share"
        >
          <Share className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}