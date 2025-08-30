import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Factory, 
  Download, 
  Calculator, 
  Share,
  FileText,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePDFReport } from "@/hooks/usePDFReport";

export default function QuickActions() {
  const { toast } = useToast();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { generateReport, isDataLoaded } = usePDFReport();

  const handleExportPDF = async () => {
    if (!isDataLoaded) {
      toast({
        title: "Data Loading",
        description: "Please wait for data to load before generating report.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating Report",
        description: "Creating comprehensive hydrogen infrastructure report...",
      });

      const filename = await generateReport();
      
      toast({
        title: "Report Generated",
        description: `Successfully generated ${filename}`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Export Failed", 
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="fixed bottom-4 right-4 z-50 md:bottom-20">
      <div className="flex flex-col gap-2">
        
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