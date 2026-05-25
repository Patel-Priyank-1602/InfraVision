// In-memory storage - no database required

export interface HydrogenSite {
  id: string;
  userId: string;
  name: string;
  latitude: string;
  longitude: string;
  suitabilityScore: number;
  isAiSuggested: boolean;
  co2SavedAnnually: number | null;
  industriesSupported: number | null;
  renewableUtilization: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenewableSource {
  id: string;
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  capacity: number | null;
  createdAt: Date;
}

export interface DemandCenter {
  id: string;
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  demandLevel: string;
  createdAt: Date;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

class InMemoryStorage {
  private hydrogenSites: HydrogenSite[] = [];
  private renewableSources: RenewableSource[] = [];
  private demandCenters: DemandCenter[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed renewable sources
    this.renewableSources = [
      { id: generateId(), name: 'Gujarat Solar Park', type: 'solar', latitude: '23.0225', longitude: '72.5714', capacity: 750, createdAt: new Date() },
      { id: generateId(), name: 'Muppandal Wind Farm', type: 'wind', latitude: '8.7642', longitude: '77.7520', capacity: 1500, createdAt: new Date() },
      { id: generateId(), name: 'Bhuj Wind Farm', type: 'wind', latitude: '23.2420', longitude: '69.6669', capacity: 300, createdAt: new Date() },
      { id: generateId(), name: 'Rajasthan Solar Park', type: 'solar', latitude: '27.5530', longitude: '73.0114', capacity: 2255, createdAt: new Date() },
      { id: generateId(), name: 'Jaisalmer Wind Park', type: 'wind', latitude: '26.9157', longitude: '70.9083', capacity: 1064, createdAt: new Date() },
      { id: generateId(), name: 'Tamil Nadu Wind Farm', type: 'wind', latitude: '9.9252', longitude: '78.1198', capacity: 400, createdAt: new Date() },
      { id: generateId(), name: 'Maharashtra Solar Plant', type: 'solar', latitude: '19.7515', longitude: '75.7139', capacity: 500, createdAt: new Date() },
      { id: generateId(), name: 'Andhra Pradesh Wind Farm', type: 'wind', latitude: '15.9129', longitude: '79.7400', capacity: 600, createdAt: new Date() },
    ];

    // Seed demand centers
    this.demandCenters = [
      { id: generateId(), name: 'Tata Steel Jamshedpur', type: 'steel', latitude: '22.8046', longitude: '86.2029', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'Mumbai Port', type: 'transport', latitude: '18.9388', longitude: '72.8354', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'IOCL Mathura', type: 'chemical', latitude: '27.4924', longitude: '77.6737', demandLevel: 'Medium', createdAt: new Date() },
      { id: generateId(), name: 'NTPC Vindhyachal', type: 'power', latitude: '24.3006', longitude: '82.6537', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'Jindal Steel Angul', type: 'steel', latitude: '20.8397', longitude: '85.1012', demandLevel: 'Medium', createdAt: new Date() },
      { id: generateId(), name: 'Chennai Port', type: 'transport', latitude: '13.1067', longitude: '80.3314', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'Reliance Jamnagar', type: 'chemical', latitude: '22.4707', longitude: '70.0577', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'BHEL Trichy', type: 'power', latitude: '10.7905', longitude: '78.7047', demandLevel: 'Medium', createdAt: new Date() },
      { id: generateId(), name: 'Visakhapatnam Steel', type: 'steel', latitude: '17.6868', longitude: '83.2185', demandLevel: 'High', createdAt: new Date() },
      { id: generateId(), name: 'Kandla Port', type: 'transport', latitude: '23.0330', longitude: '70.2231', demandLevel: 'Medium', createdAt: new Date() },
    ];

    // Seed AI suggested hydrogen sites
    this.hydrogenSites = [
      { id: generateId(), userId: 'demo-user', name: 'Gujarat Green Hydrogen Hub', latitude: '22.9734', longitude: '70.9244', suitabilityScore: 95, isAiSuggested: true, co2SavedAnnually: 850000, industriesSupported: 12, renewableUtilization: 92, createdAt: new Date(), updatedAt: new Date() },
      { id: generateId(), userId: 'demo-user', name: 'Rajasthan Solar H2 Plant', latitude: '26.2389', longitude: '73.0243', suitabilityScore: 88, isAiSuggested: true, co2SavedAnnually: 720000, industriesSupported: 8, renewableUtilization: 85, createdAt: new Date(), updatedAt: new Date() },
      { id: generateId(), userId: 'demo-user', name: 'Tamil Nadu Wind H2 Facility', latitude: '9.9252', longitude: '78.1198', suitabilityScore: 82, isAiSuggested: true, co2SavedAnnually: 650000, industriesSupported: 10, renewableUtilization: 88, createdAt: new Date(), updatedAt: new Date() },
      { id: generateId(), userId: 'demo-user', name: 'Maharashtra Industrial H2 Center', latitude: '19.0330', longitude: '73.0297', suitabilityScore: 78, isAiSuggested: true, co2SavedAnnually: 580000, industriesSupported: 15, renewableUtilization: 75, createdAt: new Date(), updatedAt: new Date() },
      { id: generateId(), userId: 'demo-user', name: 'Andhra Coastal H2 Terminal', latitude: '15.8281', longitude: '80.2707', suitabilityScore: 85, isAiSuggested: true, co2SavedAnnually: 690000, industriesSupported: 9, renewableUtilization: 82, createdAt: new Date(), updatedAt: new Date() },
      { id: generateId(), userId: 'demo-user', name: 'Karnataka Tech H2 Park', latitude: '15.3173', longitude: '75.7139', suitabilityScore: 80, isAiSuggested: true, co2SavedAnnually: 620000, industriesSupported: 11, renewableUtilization: 79, createdAt: new Date(), updatedAt: new Date() },
    ];
  }

  // Hydrogen site operations
  createHydrogenSite(site: Omit<HydrogenSite, 'id' | 'createdAt' | 'updatedAt'>): HydrogenSite {
    const newSite: HydrogenSite = {
      ...site,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.hydrogenSites.push(newSite);
    return newSite;
  }

  getHydrogenSites(userId: string): HydrogenSite[] {
    return this.hydrogenSites
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAiSuggestedSites(): HydrogenSite[] {
    return this.hydrogenSites
      .filter(s => s.isAiSuggested)
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  deleteHydrogenSite(id: string, userId: string): void {
    this.hydrogenSites = this.hydrogenSites.filter(
      s => !(s.id === id && s.userId === userId)
    );
  }

  // Infrastructure data
  getRenewableSources(): RenewableSource[] {
    return this.renewableSources;
  }

  getDemandCenters(): DemandCenter[] {
    return this.demandCenters;
  }
}

export const storage = new InMemoryStorage();
