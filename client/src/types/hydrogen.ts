export interface HydrogenSite {
  id: string;
  userId: string;
  name: string;
  latitude: string;
  longitude: string;
  suitabilityScore: number;
  isAiSuggested?: boolean;
  co2SavedAnnually?: number;
  industriesSupported?: number;
  renewableUtilization?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RenewableSource {
  id: string;
  name: string;
  type: string; // 'wind', 'solar', 'hydro'
  latitude: string;
  longitude: string;
  capacity?: number;
  createdAt?: string;
}

export interface DemandCenter {
  id: string;
  name: string;
  type: string; // 'steel', 'transport', 'chemical', 'power'
  latitude: string;
  longitude: string;
  demandLevel: string; // 'low', 'medium', 'high'
  createdAt?: string;
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
