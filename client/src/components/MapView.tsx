import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, TrendingUp, Download, Share2 } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { HydrogenSite, RenewableSource, DemandCenter, SiteAnalysis } from "@/types/hydrogen";
import SiteAnalysisPanel from "./SiteAnalysisPanel";
import html2canvas from "html2canvas";

// Import Leaflet statically
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  onSiteSelect: (site: HydrogenSite) => void;
  onScoreUpdate: (analysis: SiteAnalysis) => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  enabledLayers: { [key: string]: boolean };
  onMapReady: (map: any) => void;
}

export default function MapView({ onSiteSelect, onScoreUpdate, sidebarOpen, onSidebarToggle, enabledLayers, onMapReady }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const dragMarkerRef = useRef<any>(null);
  const layerGroupsRef = useRef<{ [key: string]: any }>({});
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // State for analytics panel
  const [currentAnalysis, setCurrentAnalysis] = useState<SiteAnalysis | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch hydrogen sites
  const { data: hydrogenSites = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/hydrogen-sites'],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch AI suggestions
  const { data: aiSuggestions = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/ai-suggestions'],
    refetchOnWindowFocus: false,
  });

  // Fetch renewable sources
  const { data: renewableSources = [] } = useQuery<RenewableSource[]>({
    queryKey: ['/api/renewable-sources'],
    refetchOnWindowFocus: false,
  });

  // Fetch demand centers
  const { data: demandCenters = [] } = useQuery<DemandCenter[]>({
    queryKey: ['/api/demand-centers'],
    refetchOnWindowFocus: false,
  });

  // Create hydrogen site mutation
  const createSiteMutation = useMutation({
    mutationFn: async (siteData: { name: string; latitude: string; longitude: string }) => {
      return await apiRequest('POST', '/api/hydrogen-sites', siteData);
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/hydrogen-sites'] });
      const data = await response.json();
      if (data.analysis) {
        onScoreUpdate(data.analysis);
        setCurrentAnalysis(data.analysis);
        setShowAnalytics(true);
      }
      toast({
        title: "Site Created",
        description: "Hydrogen plant site has been added successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create hydrogen site. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Analyze site mutation
  const analyzeSiteMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const response = await apiRequest('POST', '/api/analyze-site', { latitude, longitude });
      return await response.json();
    },
    onSuccess: (analysis: SiteAnalysis) => {
      onScoreUpdate(analysis);
      setCurrentAnalysis(analysis);
      setShowAnalytics(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Site analysis error:", error);
    },
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles with India focus
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      minZoom: 4,
      maxZoom: 18
    }).addTo(map);

    // Add multiple map layer options
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap'
    });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    });

    // Create layer groups for different data types
    const renewableLayerGroup = L.layerGroup();
    const demandLayerGroup = L.layerGroup();
    const hydrogenLayerGroup = L.layerGroup();
    const aiSuggestionsLayerGroup = L.layerGroup();

    // Store layer groups for management
    layerGroupsRef.current = {
      renewable: renewableLayerGroup,
      demand: demandLayerGroup,
      hydrogen: hydrogenLayerGroup,
      aiSuggestions: aiSuggestionsLayerGroup
    };

    // Add layer groups based on enabled state
    if (enabledLayers.renewable) renewableLayerGroup.addTo(map);
    if (enabledLayers.demand) demandLayerGroup.addTo(map);
    if (enabledLayers.hydrogen) hydrogenLayerGroup.addTo(map);
    if (enabledLayers.aiSuggestions) aiSuggestionsLayerGroup.addTo(map);

    const baseLayers = {
      "Street Map": osmLayer,
      "Satellite": satelliteLayer,
      "Terrain": terrainLayer,
      "Dark Mode": darkLayer
    };

    // Create pipeline network layer (simulated major industrial corridors)
    const pipelineLayerGroup = L.layerGroup();
    const majorPipelines = [
      // Delhi-Mumbai Industrial Corridor
      [[28.6139, 77.2090], [19.0760, 72.8777]],
      // Chennai-Bangalore Corridor
      [[13.0827, 80.2707], [12.9716, 77.5946]],
      // Kolkata-Delhi Corridor
      [[22.5726, 88.3639], [28.6139, 77.2090]],
      // Gujarat-Rajasthan Corridor
      [[23.0225, 72.5714], [26.9124, 75.7873]]
    ];

    majorPipelines.forEach((pipeline, index) => {
      const polyline = L.polyline(pipeline as [number, number][], {
        color: '#9333ea',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(pipelineLayerGroup);
      
      polyline.bindPopup(`Pipeline Corridor ${index + 1}<br/>Planned H₂ Infrastructure`);
    });

    // Create regulatory zones layer (key policy zones)
    const regulatoryLayerGroup = L.layerGroup();
    const policyZones = [
      { name: "Gujarat Green Hydrogen Hub", lat: 23.0225, lng: 72.5714, radius: 80000 },
      { name: "Rajasthan Renewable Zone", lat: 26.9124, lng: 75.7873, radius: 70000 },
      { name: "Ladakh Solar Zone", lat: 34.1526, lng: 77.5771, radius: 50000 },
      { name: "Tamil Nadu Wind Corridor", lat: 11.1271, lng: 78.6569, radius: 60000 }
    ];

    policyZones.forEach(zone => {
      const circle = L.circle([zone.lat, zone.lng], {
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.1,
        radius: zone.radius,
        weight: 2
      }).addTo(regulatoryLayerGroup);
      
      circle.bindPopup(`<strong>${zone.name}</strong><br/>Special Economic Zone<br/>Enhanced Policy Support`);
    });

    const overlayLayers = {
      "Existing H₂ Plants": hydrogenLayerGroup,
      "Renewable Sources": renewableLayerGroup,
      "Demand Centers": demandLayerGroup,
      "Pipeline Network": pipelineLayerGroup,
      "Regulatory Zones": regulatoryLayerGroup,
      "AI Suggested Sites": aiSuggestionsLayerGroup
    };

    L.control.layers(baseLayers, overlayLayers, {
      position: 'topright',
      collapsed: false
    }).addTo(map);

    mapInstanceRef.current = map;
    onMapReady(map);

    // Map click handler for creating new sites
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      // Remove existing drag marker
      if (dragMarkerRef.current) {
        map.removeLayer(dragMarkerRef.current);
      }

      // Create new draggable marker
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          html: `<div style="background: hsl(158 64% 52%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-industry" style="color: white; font-size: 10px;"></i>
          </div>`,
          iconSize: [24, 24],
          className: 'hydrogen-plant-marker'
        })
      }).addTo(map);

      dragMarkerRef.current = marker;

      // Analyze site on placement
      analyzeSiteMutation.mutate({ latitude: lat, longitude: lng });

      marker.on('dragend', (dragEvent: any) => {
        const newPos = dragEvent.target.getLatLng();
        analyzeSiteMutation.mutate({ latitude: newPos.lat, longitude: newPos.lng });
      });

      // Double-click to create permanent site with Indian naming
      marker.on('dblclick', () => {
        const position = marker.getLatLng();

        // Generate Indian-style site names based on geographical location
        const getIndianLocationName = (lat: number, lng: number) => {
          // Rough geographical divisions for India
          if (lat > 30) return 'Punjab'; // Northern regions
          if (lat > 26 && lng < 77) return 'Rajasthan'; // Western desert
          if (lat > 23 && lng > 82) return 'West Bengal'; // Eastern regions
          if (lat < 15 && lng > 77) return 'Tamil Nadu'; // Southern regions
          if (lat < 20 && lng < 75) return 'Karnataka'; // South-western
          if (lng < 73) return 'Gujarat'; // Western coast
          if (lng > 80) return 'Odisha'; // Eastern coast
          return 'Maharashtra'; // Central regions
        };

        const stateName = getIndianLocationName(position.lat, position.lng);
        const siteName = `${stateName} Green H2 Hub ${Math.floor(Math.random() * 100 + 1)}`;

        createSiteMutation.mutate({
          name: siteName,
          latitude: position.lat.toString(),
          longitude: position.lng.toString()
        });

        map.removeLayer(marker);
        dragMarkerRef.current = null;
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers for existing hydrogen sites
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers (except drag marker)
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isHydrogenSite) {
        map.removeLayer(layer);
      }
    });

    // Add user hydrogen sites to layer group
    hydrogenSites.forEach((site) => {
      const marker = L.marker([parseFloat(site.latitude), parseFloat(site.longitude)], {
        icon: L.divIcon({
          html: `<div style="background: hsl(203 88% 53%); width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>`,
          iconSize: [20, 20]
        })
      }).addTo(layerGroupsRef.current.hydrogen);
      
      (marker as any).isHydrogenSite = true;

      marker.bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 6px 0; font-weight: 600; color: #1a1a1a;">${site.name}</h3>
          <div style="margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: hsl(203 88% 53%); border-radius: 50%;"></span>
            <span style="font-size: 12px; color: #666;">User Created Site</span>
          </div>
          <div style="margin: 0 0 6px 0; padding: 4px 8px; background: #f0f9ff; border-radius: 4px; border-left: 3px solid hsl(203 88% 53%);">
            <span style="font-size: 12px; font-weight: 600;">Suitability Score: ${site.suitabilityScore}/100</span>
          </div>
          <div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px;">
            📍 ${parseFloat(site.latitude).toFixed(4)}, ${parseFloat(site.longitude).toFixed(4)}
          </div>
        </div>
      `);

      marker.on('click', () => onSiteSelect(site));
    });

    // Add AI suggested sites to layer group with glow effect
    aiSuggestions.forEach((site) => {
      const marker = L.marker([parseFloat(site.latitude), parseFloat(site.longitude)], {
        icon: L.divIcon({
          className: 'ai-glow-marker',
          html: `<div style="background: hsl(158 64% 52%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px hsl(158 64% 52%), 0 2px 6px rgba(0,0,0,0.2); animation: pulse 2s infinite;"></div>`,
          iconSize: [20, 20]
        })
      }).addTo(layerGroupsRef.current.aiSuggestions);
      
      (marker as any).isHydrogenSite = true;

      marker.bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 6px 0; font-weight: 600; color: #1a1a1a;">${site.name}</h3>
          <div style="margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: hsl(158 64% 52%); border-radius: 50%; box-shadow: 0 0 6px hsl(158 64% 52%);"></span>
            <span style="font-size: 12px; color: #10b981; font-weight: 500;">AI Recommended Site</span>
          </div>
          <div style="margin: 0 0 6px 0; padding: 4px 8px; background: #f0fdf4; border-radius: 4px; border-left: 3px solid hsl(158 64% 52%);">
            <span style="font-size: 12px; font-weight: 600;">Suitability Score: ${site.suitabilityScore}/100</span>
          </div>
          <div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px;">
            🤖 AI Analysis • 📍 ${parseFloat(site.latitude).toFixed(4)}, ${parseFloat(site.longitude).toFixed(4)}
          </div>
        </div>
      `);

      marker.on('click', () => onSiteSelect(site));
    });
  }, [hydrogenSites, aiSuggestions, onSiteSelect]);

  // Add renewable energy sources
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing renewable markers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isRenewableSource) {
        map.removeLayer(layer);
      }
    });

    renewableSources.forEach((source) => {
      const getIconAndColor = (type: string) => {
        if (type.toLowerCase().includes('wind')) return { icon: '🌪️', color: '#10b981' };
        if (type.toLowerCase().includes('solar')) return { icon: '☀️', color: '#f59e0b' };
        return { icon: '⚡', color: '#3b82f6' };
      };
      
      const { icon, color } = getIconAndColor(source.type);

      const marker = L.marker([parseFloat(source.latitude), parseFloat(source.longitude)], {
        icon: L.divIcon({
          html: `<div style="font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${icon}</div>`,
          iconSize: [20, 20],
          className: 'renewable-marker'
        })
      }).addTo(layerGroupsRef.current.renewable);
      
      (marker as any).isRenewableSource = true;

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600;">${source.name}</h3>
          <p style="margin: 0; font-size: 12px; color: ${color};">${source.type.charAt(0).toUpperCase() + source.type.slice(1)} Energy</p>
          ${source.capacity ? `<p style="margin: 4px 0 0 0; font-size: 12px;">Capacity: ${source.capacity}MW</p>` : ''}
        </div>
      `);
    });
  }, [renewableSources]);

  // Add demand centers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing demand markers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isDemandCenter) {
        map.removeLayer(layer);
      }
    });

    demandCenters.forEach((center) => {
      const getIconAndColor = (type: string, level: string) => {
        const icons = {
          'steel': '🏭',
          'transport': '🚛',
          'chemical': '🧪',
          'refinery': '🛢️',
          'port': '🚢'
        };
        const colors = {
          'High': '#ef4444',
          'Medium': '#f59e0b',
          'Low': '#10b981'
        };
        return {
          icon: icons[type.toLowerCase().split(' ')[0] as keyof typeof icons] || '🏢',
          color: colors[level as keyof typeof colors] || '#6b7280'
        };
      };
      
      const { icon, color } = getIconAndColor(center.type, center.demandLevel);

      const marker = L.marker([parseFloat(center.latitude), parseFloat(center.longitude)], {
        icon: L.divIcon({
          html: `<div style="font-size: 14px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${icon}</div>`,
          iconSize: [18, 18],
          className: 'demand-marker'
        })
      }).addTo(layerGroupsRef.current.demand);
      
      (marker as any).isDemandCenter = true;

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600;">${center.name}</h3>
          <p style="margin: 0; font-size: 12px; color: ${color};">${center.type.charAt(0).toUpperCase() + center.type.slice(1)} Industry</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Demand: ${center.demandLevel.charAt(0).toUpperCase() + center.demandLevel.slice(1)}</p>
        </div>
      `);
    });
  }, [demandCenters]);

  // Handle layer visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroups = layerGroupsRef.current;

    Object.keys(enabledLayers).forEach(layerType => {
      const layerGroup = layerGroups[layerType];
      if (layerGroup) {
        if (enabledLayers[layerType]) {
          if (!map.hasLayer(layerGroup)) {
            layerGroup.addTo(map);
          }
        } else {
          if (map.hasLayer(layerGroup)) {
            map.removeLayer(layerGroup);
          }
        }
      }
    });
  }, [enabledLayers]);


  // Export map as PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const mapElement = mapRef.current;
      if (mapElement) {
        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          scale: 2,
          width: mapElement.offsetWidth,
          height: mapElement.offsetHeight
        });
        
        const link = document.createElement('a');
        link.download = `infravision-map-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Map Exported",
          description: "Your map has been saved as a PNG file.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Share map
  const handleShareMap = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'InfraVision - Green Hydrogen Infrastructure Plan',
          text: 'Check out this hydrogen infrastructure planning map!',
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Map link has been copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share map. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" data-testid="map-container" />

      {/* Combined Site Analysis Panel */}
      {showAnalytics && currentAnalysis && (
        <SiteAnalysisPanel 
          analysis={currentAnalysis}
          onClose={() => setShowAnalytics(false)}
          isLoading={analyzeSiteMutation.isPending}
        />
      )}

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {!sidebarOpen && (
          <Button
            size="icon"
            variant="outline"
            onClick={onSidebarToggle}
            className="w-10 h-10 bg-card border border-border shadow-lg hover:bg-muted"
            data-testid="button-sidebar-toggle"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Export and Share Controls */}
      <div className="absolute bottom-4 right-4 z-[1000] space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="bg-card border border-border shadow-lg hover:bg-muted gap-2"
          data-testid="button-export-pdf"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export Image"}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleShareMap}
          className="bg-card border border-border shadow-lg hover:bg-muted gap-2"
          data-testid="button-share-map"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Enhanced Instructions with Indian Context */}
      <div className="absolute bottom-4 left-4 z-[999] bg-card border border-border rounded-lg p-3 md:p-4 shadow-lg max-w-xs md:max-w-sm hidden lg:block">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <p className="text-xs text-muted-foreground">
              <strong>Click</strong> anywhere in India to place hydrogen plant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <p className="text-xs text-muted-foreground">
              <strong>Drag</strong> marker to find optimal location
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="text-xs text-muted-foreground">
              <strong>Double-click</strong> to create permanent site
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Toggle Button (when panel is hidden) */}
      {!showAnalytics && currentAnalysis && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAnalytics(true)}
            className="bg-card border border-border shadow-lg hover:bg-muted flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Show Analysis</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(currentAnalysis.suitabilityScore)}`}>
              {currentAnalysis.suitabilityScore}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}