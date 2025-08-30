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

      // Get AI analysis
      const analysis = await analyzeSiteLocation(
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
      const aiSites = await storage.getAiSuggestedSites();
      res.json(aiSites);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Infrastructure data routes
  app.get('/api/renewable-sources', async (req, res) => {
    try {
      const sources = await storage.getRenewableSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching renewable sources:", error);
      res.status(500).json({ message: "Failed to fetch renewable sources" });
    }
  });

  app.get('/api/demand-centers', async (req, res) => {
    try {
      const centers = await storage.getDemandCenters();
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

      const analysis = await analyzeSiteLocation(latitude, longitude, nearbyRenewables, nearbyDemand);
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
