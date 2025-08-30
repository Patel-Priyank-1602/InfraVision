import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed Replit Auth - using Supabase instead
import { chatWithAssistant, analyzeSiteLocation, type ChatMessage } from "./openai";
import { insertHydrogenSiteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Since we're using Supabase for auth, we don't need server-side auth routes

  // Hydrogen sites routes
  app.post('/api/hydrogen-sites', async (req: any, res) => {
    try {
      // For demo purposes, we'll use a default user ID
      const userId = "demo-user";
      const siteData = insertHydrogenSiteSchema.parse({
        ...req.body,
        userId
      });

      // Get nearby infrastructure for AI analysis
      const renewables = await storage.getRenewableSources();
      const demandCenters = await storage.getDemandCenters();
      
      // Calculate distances and find nearby infrastructure
      const nearbyRenewables = renewables
        .map(r => ({
          type: r.type,
          distance: calculateDistance(
            parseFloat(siteData.latitude), 
            parseFloat(siteData.longitude),
            parseFloat(r.latitude), 
            parseFloat(r.longitude)
          ),
          capacity: r.capacity || 100
        }))
        .filter(r => r.distance < 100) // Within 100km
        .slice(0, 5);

      const nearbyDemand = demandCenters
        .map(d => ({
          type: d.type,
          distance: calculateDistance(
            parseFloat(siteData.latitude), 
            parseFloat(siteData.longitude),
            parseFloat(d.latitude), 
            parseFloat(d.longitude)
          ),
          level: d.demandLevel
        }))
        .filter(d => d.distance < 150) // Within 150km
        .slice(0, 5);

      // Calculate location-based analysis
      const analysis = calculateLocationSuitability(
        parseFloat(siteData.latitude),
        parseFloat(siteData.longitude),
        nearbyRenewables,
        nearbyDemand
      );

      // Create site with AI-calculated values
      const site = await storage.createHydrogenSite({
        ...siteData,
        suitabilityScore: analysis.suitabilityScore,
        co2SavedAnnually: analysis.co2SavedAnnually,
        industriesSupported: analysis.industriesSupported,
        renewableUtilization: analysis.renewableUtilization
      });

      res.json({ site, analysis });
    } catch (error) {
      console.error("Error creating hydrogen site:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid site data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create hydrogen site" });
    }
  });

  app.get('/api/hydrogen-sites', async (req: any, res) => {
    try {
      // For demo purposes, use default user ID
      const userId = "demo-user";
      const sites = await storage.getHydrogenSites(userId);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching hydrogen sites:", error);
      res.status(500).json({ message: "Failed to fetch hydrogen sites" });
    }
  });

  app.delete('/api/hydrogen-sites/:id', async (req: any, res) => {
    try {
      // For demo purposes, use default user ID
      const userId = "demo-user";
      const siteId = req.params.id;
      await storage.deleteHydrogenSite(siteId, userId);
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      console.error("Error deleting hydrogen site:", error);
      res.status(500).json({ message: "Failed to delete hydrogen site" });
    }
  });

  // AI suggestions route
  app.get('/api/ai-suggestions', async (req, res) => {
    try {
      const country = req.query.country as string;
      let aiSites = await storage.getAiSuggestedSites();
      
      // Filter by country if specified
      if (country && country.toLowerCase() !== 'india') {
        // For now, we only have Indian data, so return empty for other countries
        // In a real application, you would have data for other countries
        aiSites = [];
      }
      
      res.json(aiSites);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Infrastructure data routes with country filtering
  app.get('/api/renewable-sources', async (req, res) => {
    try {
      const country = req.query.country as string;
      let sources = await storage.getRenewableSources();
      
      // Filter by country if specified
      if (country && country.toLowerCase() !== 'india') {
        // For now, we only have Indian data
        sources = [];
      }
      
      res.json(sources);
    } catch (error) {
      console.error("Error fetching renewable sources:", error);
      res.status(500).json({ message: "Failed to fetch renewable sources" });
    }
  });

  app.get('/api/demand-centers', async (req, res) => {
    try {
      const country = req.query.country as string;
      let centers = await storage.getDemandCenters();
      
      // Filter by country if specified
      if (country && country.toLowerCase() !== 'india') {
        // For now, we only have Indian data
        centers = [];
      }
      
      res.json(centers);
    } catch (error) {
      console.error("Error fetching demand centers:", error);
      res.status(500).json({ message: "Failed to fetch demand centers" });
    }
  });

  // Chatbot route
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
      const renewables = await storage.getRenewableSources();
      const demandCenters = await storage.getDemandCenters();
      
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

      // Calculate location-based suitability score using real factors
      const analysis = calculateLocationSuitability(latitude, longitude, nearbyRenewables, nearbyDemand);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing site:", error);
      res.status(500).json({ message: "Failed to analyze site" });
    }
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
  const d = R * c; // Distance in kilometers
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
  // Gujarat, Rajasthan, Maharashtra - high renewable potential
  if ((latitude >= 20 && latitude <= 24 && longitude >= 68 && longitude <= 74) || // Gujarat
      (latitude >= 24 && latitude <= 30 && longitude >= 69 && longitude <= 78) || // Rajasthan
      (latitude >= 16 && latitude <= 21 && longitude >= 72 && longitude <= 80)) { // Maharashtra
    score += 15;
  }
  // Tamil Nadu, Karnataka - coastal advantage
  else if ((latitude >= 8 && latitude <= 15 && longitude >= 76 && longitude <= 82) || // Tamil Nadu/Karnataka
           (latitude >= 11 && latitude <= 16 && longitude >= 74 && longitude <= 78)) { // Karnataka
    score += 12;
  }
  // Other states with decent potential
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
      regulatorySupport: "Strong" // India has strong hydrogen policy support
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
