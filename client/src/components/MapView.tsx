import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, TrendingUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { HydrogenSite, RenewableSource, DemandCenter, SiteAnalysis } from "@/types/hydrogen";

// Import Leaflet statically
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  onSiteSelect: (site: HydrogenSite) => void;
  onScoreUpdate: (analysis: SiteAnalysis) => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

// Helper function to safely parse coordinates
const parseCoordinate = (value: string | number | undefined | null): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};

// Helper function to validate coordinates
const isValidCoordinates = (lat: number | null, lng: number | null): boolean => {
  return lat !== null && lng !== null && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
};

export default function MapView({ onSiteSelect, onScoreUpdate, sidebarOpen, onSidebarToggle }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const dragMarkerRef = useRef<any>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // State for analytics panel
  const [currentAnalysis, setCurrentAnalysis] = useState<SiteAnalysis | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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

    // Add layer controls
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    });

    const baseLayers = {
      "Street Map": osmLayer,
      "Satellite": satelliteLayer
    };

    L.control.layers(baseLayers).addTo(map);

    mapInstanceRef.current = map;

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

  // Add markers for existing hydrogen sites with coordinate validation
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers (except drag marker)
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isHydrogenSite) {
        map.removeLayer(layer);
      }
    });

    // Add user hydrogen sites with validation
    hydrogenSites.forEach((site) => {
      const lat = parseCoordinate(site.latitude);
      const lng = parseCoordinate(site.longitude);

      if (!isValidCoordinates(lat, lng)) {
        console.warn(`Invalid coordinates for hydrogen site ${site.name}:`, { 
          latitude: site.latitude, 
          longitude: site.longitude 
        });
        return;
      }

      const marker = L.marker([lat!, lng!], {
        isHydrogenSite: true,
        icon: L.divIcon({
          html: `<div style="background: hsl(203 88% 53%); width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>`,
          iconSize: [20, 20]
        })
      }).addTo(map);

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
            📍 ${lat!.toFixed(4)}, ${lng!.toFixed(4)}
          </div>
        </div>
      `);

      marker.on('click', () => onSiteSelect(site));
    });

    // Add AI suggested sites with glow effect - WITH COORDINATE VALIDATION
    aiSuggestions.forEach((site) => {
      const lat = parseCoordinate(site.latitude);
      const lng = parseCoordinate(site.longitude);

      // Only create marker if coordinates are valid
      if (!isValidCoordinates(lat, lng)) {
        console.warn(`Invalid coordinates for AI suggestion ${site.name}:`, { 
          latitude: site.latitude, 
          longitude: site.longitude 
        });
        return;
      }

      const marker = L.marker([lat!, lng!], {
        isHydrogenSite: true,
        icon: L.divIcon({
          className: 'ai-glow-marker',
          html: `<div style="background: hsl(158 64% 52%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px hsl(158 64% 52%), 0 2px 6px rgba(0,0,0,0.2); animation: pulse 2s infinite;"></div>`,
          iconSize: [20, 20]
        })
      }).addTo(map);

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
            🤖 AI Analysis • 📍 ${lat!.toFixed(4)}, ${lng!.toFixed(4)}
          </div>
        </div>
      `);

      marker.on('click', () => onSiteSelect(site));
    });
  }, [hydrogenSites, aiSuggestions, onSiteSelect]);

  // Add renewable energy sources with coordinate validation
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
      const lat = parseCoordinate(source.latitude);
      const lng = parseCoordinate(source.longitude);

      if (!isValidCoordinates(lat, lng)) {
        console.warn(`Invalid coordinates for renewable source ${source.name}:`, { 
          latitude: source.latitude, 
          longitude: source.longitude 
        });
        return;
      }

      const icon = source.type === 'wind' ? 'fa-wind' : source.type === 'solar' ? 'fa-sun' : 'fa-bolt';
      const color = source.type === 'wind' ? '#10b981' : source.type === 'solar' ? '#f59e0b' : '#3b82f6';

      const marker = L.marker([lat!, lng!], {
        isRenewableSource: true,
        icon: L.divIcon({
          html: `<i class="fas ${icon}" style="color: ${color}; font-size: 14px;"></i>`,
          iconSize: [14, 14],
          className: 'renewable-marker'
        })
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600;">${source.name}</h3>
          <p style="margin: 0; font-size: 12px; color: ${color};">${source.type.charAt(0).toUpperCase() + source.type.slice(1)} Energy</p>
          ${source.capacity ? `<p style="margin: 4px 0 0 0; font-size: 12px;">Capacity: ${source.capacity}MW</p>` : ''}
        </div>
      `);
    });
  }, [renewableSources]);

  // Add demand centers with coordinate validation
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
      const lat = parseCoordinate(center.latitude);
      const lng = parseCoordinate(center.longitude);

      if (!isValidCoordinates(lat, lng)) {
        console.warn(`Invalid coordinates for demand center ${center.name}:`, { 
          latitude: center.latitude, 
          longitude: center.longitude 
        });
        return;
      }

      const icon = center.type === 'steel' ? 'fa-industry' : 
                   center.type === 'transport' ? 'fa-truck' : 
                   center.type === 'chemical' ? 'fa-flask' : 'fa-building';
      const color = center.demandLevel === 'high' ? '#ef4444' : 
                    center.demandLevel === 'medium' ? '#f59e0b' : '#10b981';

      const marker = L.marker([lat!, lng!], {
        isDemandCenter: true,
        icon: L.divIcon({
          html: `<i class="fas ${icon}" style="color: ${color}; font-size: 12px;"></i>`,
          iconSize: [12, 12],
          className: 'demand-marker'
        })
      }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600;">${center.name}</h3>
          <p style="margin: 0; font-size: 12px; color: ${color};">${center.type.charAt(0).toUpperCase() + center.type.slice(1)} Industry</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Demand: ${center.demandLevel.charAt(0).toUpperCase() + center.demandLevel.slice(1)}</p>
        </div>
      `);
    });
  }, [demandCenters]);

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

      {/* Floating Analytics Panel */}
      {showAnalytics && currentAnalysis && (
        <div 
          className="absolute top-4 left-4 z-[1000] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{ 
            minWidth: '300px',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-900">Site Analysis</h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowAnalytics(false)}
              className="w-6 h-6 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Suitability Score */}
          <div className={`rounded-lg p-3 mb-3 border ${getScoreColor(currentAnalysis.suitabilityScore)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Suitability Score</span>
              <span className="text-lg font-bold">{currentAnalysis.suitabilityScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentAnalysis.suitabilityScore >= 80 ? 'bg-green-500' :
                  currentAnalysis.suitabilityScore >= 60 ? 'bg-yellow-500' :
                  currentAnalysis.suitabilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${currentAnalysis.suitabilityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Key Factors */}
          {currentAnalysis.factors && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Key Factors</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(currentAnalysis.factors).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded p-2">
                    <div className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-gray-600">{typeof value === 'number' ? `${value}/10` : value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Status */}
          {analyzeSiteMutation.isPending && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Analyzing location...
            </div>
          )}

          {/* Coordinates */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              📍 Current position being analyzed
            </div>
          </div>
        </div>
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
            <span className="text-sm">Show Analysis</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(currentAnalysis.suitabilityScore)}`}>
              {currentAnalysis.suitabilityScore}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}