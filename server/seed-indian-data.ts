import { db } from "./db";
import { renewableSources, demandCenters, hydrogenSites, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function seedIndianData() {
  try {
    console.log("Clearing existing data...");
    
    // Clear existing data
    await db.delete(renewableSources);
    await db.delete(demandCenters);
    await db.delete(hydrogenSites).where(eq(hydrogenSites.isAiSuggested, true));

    console.log("Creating system user...");
    
    // Create system user for AI-suggested sites
    await db.insert(users).values({
      id: "ai-system",
      email: "ai-system@infravision.ai",
      firstName: "AI",
      lastName: "System"
    }).onConflictDoNothing();

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

    // Insert Indian AI-suggested hydrogen sites
    await db.insert(hydrogenSites).values([
      {
        name: "Gujarat Green Hydrogen Hub (Reliance Industries)",
        latitude: "21.7645",
        longitude: "72.6669",
        suitabilityScore: 92,
        co2SavedAnnually: 250000,
        industriesSupported: 15,
        renewableUtilization: 88,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Rajasthan Solar Hydrogen Park (Adani Green Energy)",
        latitude: "26.2389",
        longitude: "73.0243",
        suitabilityScore: 89,
        co2SavedAnnually: 220000,
        industriesSupported: 12,
        renewableUtilization: 85,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Tamil Nadu Coastal Hub (NTPC)",
        latitude: "11.1271",
        longitude: "78.6569",
        suitabilityScore: 86,
        co2SavedAnnually: 180000,
        industriesSupported: 10,
        renewableUtilization: 82,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Karnataka Tech Corridor (Tata Power)",
        latitude: "12.9716",
        longitude: "77.5946",
        suitabilityScore: 83,
        co2SavedAnnually: 160000,
        industriesSupported: 14,
        renewableUtilization: 79,
        isAiSuggested: true,
        userId: "ai-system"
      },
      {
        name: "Maharashtra Industrial Zone (JSW Energy)",
        latitude: "18.5204",
        longitude: "73.8567",
        suitabilityScore: 81,
        co2SavedAnnually: 140000,
        industriesSupported: 9,
        renewableUtilization: 76,
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