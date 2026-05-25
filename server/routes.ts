import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAssistant, type ChatMessage } from "./groq";

export async function registerRoutes(app: Express): Promise<Server> {
  // Hydrogen sites routes
  app.post('/api/hydrogen-sites', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const { name, latitude, longitude } = req.body;

      if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: "Name, latitude, and longitude are required" });
      }

      // Get nearby infrastructure for analysis
      const renewables = storage.getRenewableSources();
      const demandCenters = storage.getDemandCenters();
      
      // Calculate distances and find nearby infrastructure
      const nearbyRenewables = renewables
        .map(r => ({
          type: r.type,
          distance: calculateDistance(
            parseFloat(latitude), 
            parseFloat(longitude),
            parseFloat(r.latitude), 
            parseFloat(r.longitude)
          ),
          capacity: r.capacity || 100
        }))
        .filter(r => r.distance < 100)
        .slice(0, 5);

      const nearbyDemand = demandCenters
        .map(d => ({
          type: d.type,
          distance: calculateDistance(
            parseFloat(latitude), 
            parseFloat(longitude),
            parseFloat(d.latitude), 
            parseFloat(d.longitude)
          ),
          level: d.demandLevel
        }))
        .filter(d => d.distance < 150)
        .slice(0, 5);

      // Calculate location-based analysis
      const analysis = calculateLocationSuitability(
        parseFloat(latitude),
        parseFloat(longitude),
        nearbyRenewables,
        nearbyDemand
      );

      // Create site with calculated values
      const site = storage.createHydrogenSite({
        userId,
        name,
        latitude,
        longitude,
        suitabilityScore: analysis.suitabilityScore,
        isAiSuggested: false,
        co2SavedAnnually: analysis.co2SavedAnnually,
        industriesSupported: analysis.industriesSupported,
        renewableUtilization: analysis.renewableUtilization
      });

      res.json({ site, analysis });
    } catch (error) {
      console.error("Error creating hydrogen site:", error);
      res.status(500).json({ message: "Failed to create hydrogen site" });
    }
  });

  app.get('/api/hydrogen-sites', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const sites = storage.getHydrogenSites(userId);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching hydrogen sites:", error);
      res.status(500).json({ message: "Failed to fetch hydrogen sites" });
    }
  });

  app.delete('/api/hydrogen-sites/:id', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const siteId = req.params.id;
      storage.deleteHydrogenSite(siteId, userId);
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      console.error("Error deleting hydrogen site:", error);
      res.status(500).json({ message: "Failed to delete hydrogen site" });
    }
  });

  // AI suggestions route
  app.get('/api/ai-suggestions', async (req, res) => {
    try {
      const aiSites = storage.getAiSuggestedSites();
      res.json(aiSites);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Infrastructure data routes
  app.get('/api/renewable-sources', async (req, res) => {
    try {
      const sources = storage.getRenewableSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching renewable sources:", error);
      res.status(500).json({ message: "Failed to fetch renewable sources" });
    }
  });

  app.get('/api/demand-centers', async (req, res) => {
    try {
      const centers = storage.getDemandCenters();
      res.json(centers);
    } catch (error) {
      console.error("Error fetching demand centers:", error);
      res.status(500).json({ message: "Failed to fetch demand centers" });
    }
  });

  // Chatbot route (uses Groq API)
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages }: { messages: ChatMessage[] } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const response = await chatWithAssistant(messages);
      res.json({ response });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  // Site analysis route
  app.post('/api/analyze-site', async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      // Get nearby infrastructure
      const renewables = storage.getRenewableSources();
      const demandCenters = storage.getDemandCenters();
      
      const nearbyRenewables = renewables
        .map(r => ({
          type: r.type,
          distance: calculateDistance(latitude, longitude, parseFloat(r.latitude), parseFloat(r.longitude)),
          capacity: r.capacity || 100
        }))
        .filter(r => r.distance < 100)
        .slice(0, 5);

      const nearbyDemand = demandCenters
        .map(d => ({
          type: d.type,
          distance: calculateDistance(latitude, longitude, parseFloat(d.latitude), parseFloat(d.longitude)),
          level: d.demandLevel
        }))
        .filter(d => d.distance < 150)
        .slice(0, 5);

      // Calculate location-based suitability score
      const analysis = calculateLocationSuitability(latitude, longitude, nearbyRenewables, nearbyDemand);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing site:", error);
      res.status(500).json({ message: "Failed to analyze site" });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Calculate location-based suitability score
function calculateLocationSuitability(
  latitude: number, 
  longitude: number, 
  nearbyRenewables: Array<{ type: string; distance: number; capacity: number }>,
  nearbyDemand: Array<{ type: string; distance: number; level: string }>
): any {
  let score = 30; // Base score for any location in India
  
  // Renewable energy proximity bonus (0-30 points)
  if (nearbyRenewables.length > 0) {
    const closestRenewable = nearbyRenewables[0];
    if (closestRenewable.distance < 10) score += 30;
    else if (closestRenewable.distance < 25) score += 25;
    else if (closestRenewable.distance < 50) score += 20;
    else if (closestRenewable.distance < 100) score += 15;
    else score += 10;
    
    // Bonus for high capacity renewable sources
    const totalCapacity = nearbyRenewables.reduce((sum, r) => sum + r.capacity, 0);
    if (totalCapacity > 1000) score += 8;
    else if (totalCapacity > 500) score += 5;
  }
  
  // Demand center proximity bonus (0-25 points)
  if (nearbyDemand.length > 0) {
    const highDemandNearby = nearbyDemand.filter(d => d.level === 'High' && d.distance < 100);
    const mediumDemandNearby = nearbyDemand.filter(d => d.level === 'Medium' && d.distance < 150);
    
    score += highDemandNearby.length * 8;
    score += mediumDemandNearby.length * 4;
    
    // Bonus for diverse demand types
    const demandTypes = new Set(nearbyDemand.map(d => d.type));
    score += demandTypes.size * 2;
  }
  
  // Geographic bonus for optimal regions in India (0-15 points)
  if ((latitude >= 20 && latitude <= 24 && longitude >= 68 && longitude <= 74) ||
      (latitude >= 24 && latitude <= 30 && longitude >= 69 && longitude <= 78) ||
      (latitude >= 16 && latitude <= 21 && longitude >= 72 && longitude <= 80)) {
    score += 15;
  }
  else if ((latitude >= 8 && latitude <= 15 && longitude >= 76 && longitude <= 82) ||
           (latitude >= 11 && latitude <= 16 && longitude >= 74 && longitude <= 78)) {
    score += 12;
  }
  else {
    score += 8;
  }
  
  // Cap score at 100
  score = Math.min(100, score);
  
  // Calculate other metrics based on score
  const renewableAccess = nearbyRenewables.length > 0 ? 
    Math.min(10, 10 - (nearbyRenewables[0].distance / 10)) : 3;
  
  const co2Savings = Math.floor(score * 2500 + Math.random() * 5000);
  const industries = Math.floor(score / 10) + nearbyDemand.length;
  const renewableUtil = Math.min(95, score + Math.floor(Math.random() * 10));
  
  return {
    suitabilityScore: score,
    factors: {
      renewableAccess: Math.round(renewableAccess),
      transportCost: nearbyDemand.length > 2 ? "Low" : nearbyDemand.length > 0 ? "Medium" : "High",
      demandProximity: nearbyDemand.length > 1 ? "Excellent" : nearbyDemand.length > 0 ? "Good" : "Fair",
      waterAvailability: latitude < 15 ? "Excellent" : latitude > 25 ? "Good" : "Very Good",
      regulatorySupport: "Strong"
    },
    recommendations: [
      nearbyRenewables.length === 0 ? "Consider renewable energy integration" : "Excellent renewable proximity",
      nearbyDemand.length === 0 ? "Evaluate transport infrastructure" : "Good demand center access",
      "Leverage India's National Green Hydrogen Mission incentives"
    ],
    co2SavedAnnually: co2Savings,
    industriesSupported: industries,
    renewableUtilization: renewableUtil
  };
}
