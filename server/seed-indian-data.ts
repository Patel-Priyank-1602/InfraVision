import { db } from "./db";
import { renewableSources, demandCenters, hydrogenSites } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function seedIndianData() {
  try {
    console.log("Clearing existing data...");
    
    // Clear existing data
    await db.delete(renewableSources);
    await db.delete(demandCenters);
    await db.delete(hydrogenSites).where(eq(hydrogenSites.isAiSuggested, true));

    console.log("Seeding Indian renewable energy sources...");

    // Insert Indian renewable energy sources
    await db.insert(renewableSources).values([
      {
        name: "Delhi NCR Solar Park",
        type: "Solar Farm",
        latitude: "28.7041", // Delhi NCR
        longitude: "77.1025",
        capacity: 500
      },
      {
        name: "Mumbai Offshore Wind Farm",
        type: "Wind Farm",
        latitude: "19.0760", // Mumbai
        longitude: "72.8777",
        capacity: 600
      },
      {
        name: "Bangalore Tech Solar Park",
        type: "Solar Farm",
        latitude: "12.9716", // Bangalore
        longitude: "77.5946",
        capacity: 450
      },
      {
        name: "Tamil Nadu Coastal Wind Farm",
        type: "Wind Farm",
        latitude: "13.0827", // Chennai
        longitude: "80.2707",
        capacity: 380
      },
      {
        name: "West Bengal Solar Plant",
        type: "Solar Farm",
        latitude: "22.5726", // Kolkata
        longitude: "88.3639",
        capacity: 350
      },
      {
        name: "Gujarat Wind Energy Park",
        type: "Wind Farm",
        latitude: "23.0225", // Ahmedabad
        longitude: "72.5714",
        capacity: 420
      },
      {
        name: "Maharashtra Solar Grid",
        type: "Solar Farm",
        latitude: "18.5204", // Pune
        longitude: "73.8567",
        capacity: 300
      },
      {
        name: "Rajasthan Desert Wind Farm",
        type: "Wind Farm",
        latitude: "26.9124", // Jaipur
        longitude: "75.7873",
        capacity: 480
      }
    ]);

    console.log("Seeding Indian demand centers...");

    // Insert Indian demand centers
    await db.insert(demandCenters).values([
      {
        name: "Tata Steel Jamshedpur",
        type: "Steel Manufacturing",
        latitude: "22.2587", // Jamshedpur
        longitude: "84.8467",
        demandLevel: "High"
      },
      {
        name: "ONGC Vadodara Chemical Complex",
        type: "Chemical Plant",
        latitude: "21.1702", // Vadodara
        longitude: "72.8311",
        demandLevel: "High"
      },
      {
        name: "Mumbai Refinery Complex",
        type: "Refinery",
        latitude: "19.0176", // Mumbai Port
        longitude: "72.8562",
        demandLevel: "High"
      },
      {
        name: "Chennai Port Trust",
        type: "Port",
        latitude: "13.1068", // Chennai Port
        longitude: "80.3045",
        demandLevel: "Medium"
      },
      {
        name: "SAIL Bhilai Steel Plant",
        type: "Steel Manufacturing",
        latitude: "20.9517", // Bhilai
        longitude: "81.3860",
        demandLevel: "High"
      },
      {
        name: "Gurgaon Industrial Hub",
        type: "Chemical Plant",
        latitude: "28.4595", // Gurgaon Industrial
        longitude: "77.0266",
        demandLevel: "Medium"
      },
      {
        name: "Kandla Port Authority",
        type: "Port",
        latitude: "21.0376", // Kandla Port
        longitude: "70.2174",
        demandLevel: "Medium"
      },
      {
        name: "Indian Oil Vadodara Refinery",
        type: "Refinery",
        latitude: "22.3072", // Vadodara Refinery
        longitude: "73.1812",
        demandLevel: "High"
      }
    ]);

    console.log("Seeding Indian AI-suggested hydrogen sites...");

    // Insert Indian AI-suggested hydrogen sites based on real government projects
    await db.insert(hydrogenSites).values([
      // Real operational projects
      {
        name: "GAIL Guna Green Hydrogen Plant (Operational 2024)",
        latitude: "24.6536",
        longitude: "77.3136",
        suitabilityScore: 94,
        co2SavedAnnually: 280000,
        industriesSupported: 18,
        renewableUtilization: 92,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Adani Kutch Off-Grid Green H2 Plant (5MW)",
        latitude: "23.0225",
        longitude: "69.6669",
        suitabilityScore: 91,
        co2SavedAnnually: 260000,
        industriesSupported: 15,
        renewableUtilization: 89,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "NTPC Kawas Green H2 Blending Project",
        latitude: "21.4101",
        longitude: "72.6756",
        suitabilityScore: 88,
        co2SavedAnnually: 240000,
        industriesSupported: 12,
        renewableUtilization: 85,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "NTPC Rann of Kutch 4750MW RE Park",
        latitude: "23.7337",
        longitude: "69.0585",
        suitabilityScore: 96,
        co2SavedAnnually: 320000,
        industriesSupported: 22,
        renewableUtilization: 95,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "NTPC Leh Green H2 Fuelling Station",
        latitude: "34.1526",
        longitude: "77.5770",
        suitabilityScore: 85,
        co2SavedAnnually: 180000,
        industriesSupported: 8,
        renewableUtilization: 82,
        isAiSuggested: true,
        userId: "ai-system"
      },
      // SIGHT Scheme Green Ammonia Projects
      {
        name: "Madhya Bharat Agro Dhule (70,000 MT)",
        latitude: "20.9042",
        longitude: "74.7749",
        suitabilityScore: 87,
        co2SavedAnnually: 220000,
        industriesSupported: 14,
        renewableUtilization: 83,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Madhya Bharat Agro Sagar (60,000 MT)",
        latitude: "23.8388",
        longitude: "78.7378",
        suitabilityScore: 84,
        co2SavedAnnually: 200000,
        industriesSupported: 11,
        renewableUtilization: 80,
        isAiSuggested: true,
        userId: "ai-system"
      },
      // Mobility pilot project locations
      {
        name: "Greater Noida-Delhi-Agra H2 Corridor",
        latitude: "28.4744",
        longitude: "77.5040",
        suitabilityScore: 82,
        co2SavedAnnually: 190000,
        industriesSupported: 16,
        renewableUtilization: 78,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Bhubaneswar-Konark-Puri H2 Route",
        latitude: "20.2961",
        longitude: "85.8245",
        suitabilityScore: 79,
        co2SavedAnnually: 170000,
        industriesSupported: 9,
        renewableUtilization: 75,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Ahmedabad-Vadodara-Surat H2 Corridor",
        latitude: "22.3072",
        longitude: "73.1812",
        suitabilityScore: 90,
        co2SavedAnnually: 250000,
        industriesSupported: 17,
        renewableUtilization: 87,
        isAiSuggested: true,
        userId: "ai-system"
      }
    ]);

    console.log("✅ Indian data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding Indian data:", error);
  }
}

// Run seeding
seedIndianData().then(() => process.exit(0));