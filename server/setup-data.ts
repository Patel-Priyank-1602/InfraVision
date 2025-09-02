import { db } from './db';
import { users, hydrogenSites, renewableSources, demandCenters } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function setupInitialData() {
  try {
    console.log('Setting up initial data...');

    // Create demo user
    const existingUser = await db.select().from(users).where(eq(users.id, 'demo-user')).limit(1);
    if (existingUser.length === 0) {
      console.log('Creating demo user...');
      await db.insert(users).values({
        id: 'demo-user',
        email: 'demo@infravision.com',
        firstName: 'Demo',
        lastName: 'User'
      });
    }

    // Add renewable sources
    const existingRenewables = await db.select().from(renewableSources).limit(1);
    if (existingRenewables.length === 0) {
      console.log('Adding renewable sources...');
      await db.insert(renewableSources).values([
        { name: 'Gujarat Solar Park', type: 'solar', latitude: '23.0225', longitude: '72.5714', capacity: 750 },
        { name: 'Muppandal Wind Farm', type: 'wind', latitude: '8.7642', longitude: '77.7520', capacity: 1500 },
        { name: 'Bhuj Wind Farm', type: 'wind', latitude: '23.2420', longitude: '69.6669', capacity: 300 },
        { name: 'Rajasthan Solar Park', type: 'solar', latitude: '27.5530', longitude: '73.0114', capacity: 2255 },
        { name: 'Jaisalmer Wind Park', type: 'wind', latitude: '26.9157', longitude: '70.9083', capacity: 1064 },
        { name: 'Tamil Nadu Wind Farm', type: 'wind', latitude: '9.9252', longitude: '78.1198', capacity: 400 },
        { name: 'Maharashtra Solar Plant', type: 'solar', latitude: '19.7515', longitude: '75.7139', capacity: 500 },
        { name: 'Andhra Pradesh Wind Farm', type: 'wind', latitude: '15.9129', longitude: '79.7400', capacity: 600 }
      ]);
    }

    // Add demand centers
    const existingDemand = await db.select().from(demandCenters).limit(1);
    if (existingDemand.length === 0) {
      console.log('Adding demand centers...');
      await db.insert(demandCenters).values([
        { name: 'Tata Steel Jamshedpur', type: 'steel', latitude: '22.8046', longitude: '86.2029', demandLevel: 'high' },
        { name: 'Mumbai Port', type: 'transport', latitude: '18.9388', longitude: '72.8354', demandLevel: 'high' },
        { name: 'IOCL Mathura', type: 'chemical', latitude: '27.4924', longitude: '77.6737', demandLevel: 'medium' },
        { name: 'NTPC Vindhyachal', type: 'power', latitude: '24.3006', longitude: '82.6537', demandLevel: 'high' },
        { name: 'Jindal Steel Angul', type: 'steel', latitude: '20.8397', longitude: '85.1012', demandLevel: 'medium' },
        { name: 'Chennai Port', type: 'transport', latitude: '13.1067', longitude: '80.3314', demandLevel: 'high' },
        { name: 'Reliance Jamnagar', type: 'chemical', latitude: '22.4707', longitude: '70.0577', demandLevel: 'high' },
        { name: 'BHEL Trichy', type: 'power', latitude: '10.7905', longitude: '78.7047', demandLevel: 'medium' },
        { name: 'Visakhapatnam Steel', type: 'steel', latitude: '17.6868', longitude: '83.2185', demandLevel: 'high' },
        { name: 'Kandla Port', type: 'transport', latitude: '23.0330', longitude: '70.2231', demandLevel: 'medium' }
      ]);
    }

    // Add AI suggested hydrogen sites
    const existingHydrogen = await db.select().from(hydrogenSites).limit(1);
    if (existingHydrogen.length === 0) {
      console.log('Adding AI suggested hydrogen sites...');
      await db.insert(hydrogenSites).values([
        { userId: 'demo-user', name: 'Gujarat Green Hydrogen Hub', latitude: '22.9734', longitude: '70.9244', suitabilityScore: 95, isAiSuggested: true, co2SavedAnnually: 850000, industriesSupported: 12, renewableUtilization: 92 },
        { userId: 'demo-user', name: 'Rajasthan Solar H2 Plant', latitude: '26.2389', longitude: '73.0243', suitabilityScore: 88, isAiSuggested: true, co2SavedAnnually: 720000, industriesSupported: 8, renewableUtilization: 85 },
        { userId: 'demo-user', name: 'Tamil Nadu Wind H2 Facility', latitude: '9.9252', longitude: '78.1198', suitabilityScore: 82, isAiSuggested: true, co2SavedAnnually: 650000, industriesSupported: 10, renewableUtilization: 88 },
        { userId: 'demo-user', name: 'Maharashtra Industrial H2 Center', latitude: '19.0330', longitude: '73.0297', suitabilityScore: 78, isAiSuggested: true, co2SavedAnnually: 580000, industriesSupported: 15, renewableUtilization: 75 },
        { userId: 'demo-user', name: 'Andhra Coastal H2 Terminal', latitude: '15.8281', longitude: '80.2707', suitabilityScore: 85, isAiSuggested: true, co2SavedAnnually: 690000, industriesSupported: 9, renewableUtilization: 82 },
        { userId: 'demo-user', name: 'Karnataka Tech H2 Park', latitude: '15.3173', longitude: '75.7139', suitabilityScore: 80, isAiSuggested: true, co2SavedAnnually: 620000, industriesSupported: 11, renewableUtilization: 79 }
      ]);
    }

    console.log('Initial data setup completed successfully!');
  } catch (error) {
    console.error('Error setting up initial data:', error);
    throw error;
  }
}

export { setupInitialData };