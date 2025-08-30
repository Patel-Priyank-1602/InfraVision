import { GoogleGenAI } from "@google/genai";

// Using Gemini 1.5 Flash
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SiteAnalysis {
  suitabilityScore: number;
  factors: {
    renewableAccess: number;
    transportCost: string;
    demandProximity: string;
    waterAvailability: string;
    regulatorySupport: string;
  };
  recommendations: string[];
  co2SavedAnnually: number;
  industriesSupported: number;
  renewableUtilization: number;
}

export async function chatWithAssistant(messages: ChatMessage[]): Promise<string> {
  try {
    const systemPrompt = `You are InfraVision, an AI assistant specialized in green hydrogen infrastructure planning. You help users understand:

1. Optimal locations for hydrogen production plants
2. Suitability scoring factors and methodologies
3. Renewable energy integration strategies
4. Infrastructure planning best practices
5. Environmental and economic impact calculations

Provide helpful, accurate, and actionable advice about green hydrogen infrastructure. Keep responses concise but informative. Focus on practical insights that help with decision-making.`;

    // Convert messages to Gemini format and include system prompt
    const geminiMessages = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
    const fullPrompt = `${systemPrompt}\n\nConversation:\n${geminiMessages}\n\nAssistant:`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't process your request at the moment.";
    
    return text || "I apologize, but I couldn't process your request at the moment.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get response from AI assistant");
  }
}

export async function analyzeSiteLocation(
  latitude: number,
  longitude: number,
  nearbyRenewables: Array<{ type: string; distance: number; capacity: number }>,
  nearbyDemand: Array<{ type: string; distance: number; level: string }>
): Promise<SiteAnalysis> {
  // Calculate location-based scoring using actual data
  return calculateLocationSuitability(latitude, longitude, nearbyRenewables, nearbyDemand);
}

function calculateLocationSuitability(
  latitude: number,
  longitude: number,
  nearbyRenewables: Array<{ type: string; distance: number; capacity: number }>,
  nearbyDemand: Array<{ type: string; distance: number; level: string }>
): SiteAnalysis {
  
  // 1. Renewable Access Score (0-100)
  let renewableScore = 0;
  let totalCapacity = 0;
  let renewableUtilization = 0;
  
  if (nearbyRenewables.length > 0) {
    nearbyRenewables.forEach(r => {
      // Closer renewables get higher scores, with capacity weighting
      const distanceScore = Math.max(0, 100 - (r.distance * 2)); // 2 points per km
      const capacityBonus = Math.min(50, r.capacity / 10); // Up to 50 bonus for capacity
      renewableScore += (distanceScore + capacityBonus) / nearbyRenewables.length;
      totalCapacity += r.capacity;
    });
    renewableUtilization = Math.min(95, 40 + (totalCapacity / 50));
  } else {
    renewableScore = 20; // Base score for areas without nearby renewables
    renewableUtilization = 25;
  }
  
  // 2. Demand Proximity Score (0-100)
  let demandScore = 0;
  let industriesSupported = 0;
  
  if (nearbyDemand.length > 0) {
    nearbyDemand.forEach(d => {
      const distanceScore = Math.max(0, 100 - (d.distance * 1.5)); // 1.5 points per km
      const demandMultiplier = d.level === 'High' ? 1.5 : d.level === 'Medium' ? 1.2 : 1.0;
      demandScore += (distanceScore * demandMultiplier) / nearbyDemand.length;
      industriesSupported += d.level === 'High' ? 3 : d.level === 'Medium' ? 2 : 1;
    });
  } else {
    demandScore = 25; // Base score for areas without nearby demand
    industriesSupported = 2;
  }
  
  // 3. Location-based factors
  const isCoastal = latitude >= 8 && latitude <= 37 && (longitude <= 75 || longitude >= 80); // India coastal regions
  const isIndustrial = nearbyDemand.some(d => d.type.includes('Steel') || d.type.includes('Chemical') || d.type.includes('Refinery'));
  const isRenewableRich = totalCapacity > 400;
  
  // 4. Calculate overall suitability score
  const locationBonus = isCoastal ? 10 : 0;
  const industrialBonus = isIndustrial ? 15 : 0;
  const renewableBonus = isRenewableRich ? 10 : 0;
  
  const suitabilityScore = Math.min(100, Math.max(20, 
    (renewableScore * 0.4) + 
    (demandScore * 0.4) + 
    locationBonus + 
    industrialBonus + 
    renewableBonus
  ));
  
  // 5. Calculate environmental impact
  const baseC02Savings = 15000 + (suitabilityScore * 2000) + (totalCapacity * 100);
  const co2SavedAnnually = Math.round(baseC02Savings + (Math.random() * 5000)); // Add some variation
  
  // 6. Generate transport cost assessment
  const avgDistance = nearbyDemand.length > 0 ? 
    nearbyDemand.reduce((sum, d) => sum + d.distance, 0) / nearbyDemand.length : 100;
  const transportCost = avgDistance < 50 ? "Low" : avgDistance < 100 ? "Medium" : "High";
  
  // 7. Generate recommendations
  const recommendations = [];
  if (renewableScore < 40) recommendations.push("Consider establishing renewable energy partnerships or grid connections");
  if (demandScore < 40) recommendations.push("Identify and develop relationships with potential industrial customers");
  if (isCoastal) recommendations.push("Leverage coastal location for hydrogen export opportunities");
  if (isRenewableRich) recommendations.push("Maximize utilization of abundant renewable energy sources");
  if (recommendations.length === 0) recommendations.push("Site shows good potential for hydrogen infrastructure development");
  
  return {
    suitabilityScore: Math.round(suitabilityScore),
    factors: {
      renewableAccess: Math.round(renewableScore),
      transportCost,
      demandProximity: demandScore > 70 ? "Excellent" : demandScore > 50 ? "Good" : demandScore > 30 ? "Fair" : "Limited",
      waterAvailability: isCoastal ? "Excellent" : latitude > 15 && latitude < 30 ? "Good" : "Moderate",
      regulatorySupport: isIndustrial ? "Strong" : "Moderate"
    },
    recommendations,
    co2SavedAnnually,
    industriesSupported: Math.min(20, industriesSupported),
    renewableUtilization: Math.round(renewableUtilization)
  };
}
