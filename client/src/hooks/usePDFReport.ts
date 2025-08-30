import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { HydrogenSite, RenewableSource, DemandCenter } from '@/types/hydrogen';

interface ReportData {
  hydrogenSites: HydrogenSite[];
  renewableSources: RenewableSource[];
  demandCenters: DemandCenter[];
  aiSuggestions: HydrogenSite[];
}

export const usePDFReport = () => {
  // Fetch all data needed for the report
  const { data: hydrogenSites = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/hydrogen-sites'],
  });

  const { data: aiSuggestions = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/ai-suggestions'],
  });

  const { data: renewableSources = [] } = useQuery<RenewableSource[]>({
    queryKey: ['/api/renewable-sources'],
  });

  const { data: demandCenters = [] } = useQuery<DemandCenter[]>({
    queryKey: ['/api/demand-centers'],
  });

  const generateReport = useCallback(async () => {
    const reportData: ReportData = {
      hydrogenSites,
      renewableSources,
      demandCenters,
      aiSuggestions
    };

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('InfraVision Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Green Hydrogen Infrastructure Planning for India', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Report metadata
    pdf.setFontSize(12);
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
    yPosition += 10;
    pdf.text(`Total Sites Analyzed: ${hydrogenSites.length + aiSuggestions.length}`, margin, yPosition);
    yPosition += 10;
    pdf.text(`Renewable Sources Available: ${renewableSources.length}`, margin, yPosition);
    yPosition += 10;
    pdf.text(`Industrial Demand Centers: ${demandCenters.length}`, margin, yPosition);
    yPosition += 20;

    // Executive Summary
    checkPageBreak(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const summaryText = `This report provides a comprehensive analysis of green hydrogen infrastructure opportunities across India. The analysis includes ${hydrogenSites.length} user-created sites and ${aiSuggestions.length} AI-recommended locations, considering proximity to ${renewableSources.length} renewable energy sources and ${demandCenters.length} industrial demand centers.`;
    
    const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
    pdf.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 15;

    // Key Metrics
    checkPageBreak(60);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Metrics', margin, yPosition);
    yPosition += 15;

    // Calculate metrics
    const avgSuitabilityScore = hydrogenSites.length > 0 
      ? Math.round(hydrogenSites.reduce((sum, site) => sum + site.suitabilityScore, 0) / hydrogenSites.length)
      : 0;
    
    const totalCO2Savings = hydrogenSites.reduce((sum, site) => sum + (site.co2SavedAnnually || 0), 0);
    const totalIndustries = hydrogenSites.reduce((sum, site) => sum + (site.industriesSupported || 0), 0);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Average Site Suitability Score: ${avgSuitabilityScore}/100`, margin, yPosition);
    yPosition += 8;
    pdf.text(`• Total CO₂ Savings Potential: ${(totalCO2Savings / 1000).toFixed(0)}k tons/year`, margin, yPosition);
    yPosition += 8;
    pdf.text(`• Industries Supported: ${totalIndustries}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`• Wind Energy Sources: ${renewableSources.filter(s => s.type === 'wind').length}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`• Solar Energy Sources: ${renewableSources.filter(s => s.type === 'solar').length}`, margin, yPosition);
    yPosition += 20;

    // Site Analysis Section
    if (hydrogenSites.length > 0) {
      checkPageBreak(50);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('User-Created Sites', margin, yPosition);
      yPosition += 15;

      hydrogenSites.forEach((site, index) => {
        checkPageBreak(25);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${site.name}`, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Coordinates: ${parseFloat(site.latitude).toFixed(4)}, ${parseFloat(site.longitude).toFixed(4)}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Suitability Score: ${site.suitabilityScore}/100`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`CO₂ Savings: ${site.co2SavedAnnually ? (site.co2SavedAnnually / 1000).toFixed(0) : 0}k tons/year`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Industries Supported: ${site.industriesSupported || 0}`, margin + 5, yPosition);
        yPosition += 10;
      });
    }

    // AI Suggestions Section
    if (aiSuggestions.length > 0) {
      checkPageBreak(50);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI-Recommended Sites', margin, yPosition);
      yPosition += 15;

      aiSuggestions.slice(0, 5).forEach((site, index) => {
        checkPageBreak(25);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${site.name}`, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Coordinates: ${parseFloat(site.latitude).toFixed(4)}, ${parseFloat(site.longitude).toFixed(4)}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`AI Suitability Score: ${site.suitabilityScore}/100`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Estimated CO₂ Savings: ${site.co2SavedAnnually ? (site.co2SavedAnnually / 1000).toFixed(0) : 25}k tons/year`, margin + 5, yPosition);
        yPosition += 10;
      });
    }

    // Infrastructure Analysis
    checkPageBreak(50);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Infrastructure Analysis', margin, yPosition);
    yPosition += 15;

    // Renewable Sources by State
    const renewableByState = renewableSources.reduce((acc, source) => {
      const state = source.name.split(' ')[0]; // First word as state approximation
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Renewable Energy Distribution:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    Object.entries(renewableByState).slice(0, 8).forEach(([state, count]) => {
      pdf.text(`• ${state}: ${count} renewable sources`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Demand Centers by Type
    const demandByType = demandCenters.reduce((acc, center) => {
      acc[center.type] = (acc[center.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Industrial Demand by Sector:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    Object.entries(demandByType).forEach(([type, count]) => {
      pdf.text(`• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} facilities`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Recommendations
    checkPageBreak(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const recommendations = [
      '• Focus development in regions with high renewable energy density',
      '• Prioritize sites with suitability scores above 70 for immediate development',
      '• Consider transportation infrastructure when finalizing site locations',
      '• Develop partnerships with local industrial demand centers',
      '• Implement phased development approach starting with highest-scoring sites'
    ];

    recommendations.forEach(rec => {
      checkPageBreak(8);
      pdf.text(rec, margin, yPosition);
      yPosition += 8;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by InfraVision - Green Hydrogen Infrastructure Planning Platform', 
             pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const filename = `InfraVision_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return filename;
  }, [hydrogenSites, renewableSources, demandCenters, aiSuggestions]);

  return {
    generateReport,
    isDataLoaded: hydrogenSites.length >= 0 && renewableSources.length > 0 && demandCenters.length > 0
  };
};