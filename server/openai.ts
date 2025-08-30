import { GoogleGenAI } from "@google/genai";

// Using Gemini 2.5 Flash with proper API key
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
    const systemPrompt = `You are InfraVision AI Assistant, an expert in India's green hydrogen infrastructure planning. You specialize in:

1. India's National Green Hydrogen Mission and government initiatives
2. Optimal locations for hydrogen plants across Indian states
3. Real Indian projects like GAIL Guna, Adani Kutch, NTPC facilities
4. Suitability scoring based on renewable proximity, demand centers, and geography
5. Indian regulatory framework and incentives under SIGHT scheme
6. Environmental impact specific to Indian industrial needs

Context about India's hydrogen landscape:
- Mission target: 5 MMT green hydrogen production by 2030
- Key states: Gujarat, Rajasthan, Maharashtra, Tamil Nadu for renewable potential
- Major players: NTPC, Adani, GAIL, Reliance, Tata Power
- Focus sectors: Steel (Tata, JSW), refineries (IOCL), chemical plants, mobility

Provide helpful, India-specific advice about green hydrogen infrastructure. Keep responses practical and relevant to Indian context.`;

    // Use proper Gemini conversation format
    const conversationHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt
      }
    });
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't process your request at the moment. Please try asking about India's green hydrogen infrastructure or specific locations for hydrogen plants.";
    
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Provide intelligent fallback responses based on common queries
    const userQuery = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    if (userQuery.includes('location') || userQuery.includes('where') || userQuery.includes('best')) {
      return "Based on India's National Green Hydrogen Mission, the best locations for hydrogen plants are:\n\n1. **Gujarat** - Excellent solar/wind resources, strong industrial base\n2. **Rajasthan** - Abundant solar potential, good transport connectivity\n3. **Maharashtra** - Major industrial demand, renewable energy access\n4. **Tamil Nadu** - Coastal advantages, wind energy potential\n\nOur AI suggestions show real projects like GAIL Guna (operational), Adani Kutch, and NTPC facilities. Click on the green glowing markers to see these actual government-approved locations!";
    }
    
    if (userQuery.includes('score') || userQuery.includes('suitability') || userQuery.includes('rating')) {
      return "Our suitability scoring considers key factors for Indian locations:\n\n• **Renewable Access** (30 points) - Distance to solar/wind farms\n• **Demand Proximity** (25 points) - Nearby steel, chemical, refinery industries\n• **Geographic Advantage** (15 points) - Gujarat, Rajasthan get highest scores\n• **Transport Cost** - Based on industrial hub connectivity\n• **Regulatory Support** - India has strong hydrogen policies\n\nDrag and drop anywhere on the map to see real-time scoring!";
    }
    
    if (userQuery.includes('project') || userQuery.includes('government') || userQuery.includes('mission')) {
      return "India's National Green Hydrogen Mission (₹19,744 crore budget) includes:\n\n**Operational Projects:**\n• GAIL Guna - 4.3 tonnes/day (operational 2024)\n• Adani Kutch - 5MW off-grid facility\n• NTPC Kawas - H2 blending in natural gas\n\n**Major Upcoming:**\n• NTPC Rann of Kutch - 4,750MW renewable park\n• Green ammonia plants in Dhule, Sagar\n• 37 H2 vehicles across 10 routes\n\nTarget: 5 MMT production by 2030 with 125 GW renewable capacity!";
    }
    
    return "I'm your InfraVision AI assistant for India's green hydrogen infrastructure! I can help with:\n\n• Finding optimal plant locations across India\n• Understanding suitability scores and factors\n• Information about real government projects\n• Renewable energy integration strategies\n\nTry asking: 'Where are the best locations?' or 'Tell me about current projects' or just click anywhere on the map to analyze that location!";
  }
}

export async function analyzeSiteLocation(
  latitude: number,
  longitude: number,
  nearbyRenewables: Array<{ type: string; distance: number; capacity: number }>,
  nearbyDemand: Array<{ type: string; distance: number; level: string }>
): Promise<SiteAnalysis> {
  try {
    const prompt = `Analyze this hydrogen plant location:
Coordinates: ${latitude}, ${longitude}

Nearby Renewable Sources:
${nearbyRenewables.map(r => `- ${r.type}: ${r.distance}km away, ${r.capacity}MW capacity`).join('\n')}

Nearby Demand Centers:
${nearbyDemand.map(d => `- ${d.type}: ${d.distance}km away, ${d.level} demand`).join('\n')}

Provide a detailed analysis with:
1. Overall suitability score (0-100)
2. Factor ratings for renewable access, transport cost, demand proximity, water availability, regulatory support
3. Specific recommendations
4. Estimated annual CO2 savings (tons)
5. Number of industries that could be supported
6. Renewable energy utilization percentage

Return your analysis in JSON format with this exact structure:
{
  "suitabilityScore": number,
  "factors": {
    "renewableAccess": number,
    "transportCost": "string",
    "demandProximity": "string", 
    "waterAvailability": "string",
    "regulatorySupport": "string"
  },
  "recommendations": ["string array"],
  "co2SavedAnnually": number,
  "industriesSupported": number,
  "renewableUtilization": number
}`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const analysis = JSON.parse(responseText);
    
    return {
      suitabilityScore: Math.max(0, Math.min(100, analysis.suitabilityScore || 50)),
      factors: {
        renewableAccess: Math.max(0, Math.min(100, analysis.factors?.renewableAccess || 50)),
        transportCost: analysis.factors?.transportCost || "Medium",
        demandProximity: analysis.factors?.demandProximity || "Medium",
        waterAvailability: analysis.factors?.waterAvailability || "Good",
        regulatorySupport: analysis.factors?.regulatorySupport || "Moderate"
      },
      recommendations: analysis.recommendations || ["Consider local infrastructure development"],
      co2SavedAnnually: Math.max(0, analysis.co2SavedAnnually || 25000),
      industriesSupported: Math.max(0, analysis.industriesSupported || 5),
      renewableUtilization: Math.max(0, Math.min(100, analysis.renewableUtilization || 65))
    };
  } catch (error) {
    console.error("Site analysis error:", error);
    // Return fallback analysis
    return {
      suitabilityScore: 50,
      factors: {
        renewableAccess: 50,
        transportCost: "Medium",
        demandProximity: "Medium", 
        waterAvailability: "Good",
        regulatorySupport: "Moderate"
      },
      recommendations: ["Detailed site assessment recommended"],
      co2SavedAnnually: 25000,
      industriesSupported: 5,
      renewableUtilization: 65
    };
  }
}
