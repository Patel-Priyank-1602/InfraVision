import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  MapPin,
  TrendingUp,
  Users,
  Leaf,
  Factory,
  Zap,
  Building2,
  Target,
  Calendar,
  DollarSign,
  Truck,
  BarChart3,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { HydrogenSite } from "@/types/hydrogen";

interface PlanDetailsPanelProps {
  plan: HydrogenSite | null;
  onClose: () => void;
}

// USD to INR conversion rate
const USD_TO_INR = 83;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PlanDetailsPanel({ plan, onClose }: PlanDetailsPanelProps) {
  if (!plan) return null;

  // Generate comprehensive plan data based on the site information
  const generatePlanData = (site: HydrogenSite) => {
    const capacity = Math.round(site.suitabilityScore * 0.5 + Math.random() * 20); // MW capacity
    const investment = Math.round(capacity * 3.5 + Math.random() * 100); // Million USD
    const yearlyProduction = Math.round(capacity * 8760 * 0.4 / 1000); // Tons per year
    const jobsCreated = Math.round(capacity * 12 + Math.random() * 50);

    return {
      capacity,
      investment: investment * USD_TO_INR, // Convert to INR
      yearlyProduction,
      jobsCreated,
      operationalYear: site.name.includes('2024') ? 2024 : 
                     site.name.includes('Operational') ? 2023 : 
                     2025 + Math.floor(Math.random() * 3),
      projectType: site.name.includes('Ammonia') ? 'Green Ammonia' :
                  site.name.includes('Mobility') || site.name.includes('Corridor') ? 'Mobility' :
                  site.name.includes('Blending') ? 'Gas Blending' :
                  'Green Hydrogen',
      status: site.name.includes('Operational') ? 'Operational' :
             site.name.includes('Under') ? 'Under Construction' :
             'Planned'
    };
  };

  const planData = generatePlanData(plan);

  // Pie chart data for renewable energy mix
  const renewableEnergyMix = [
    { name: 'Solar', value: 60, color: '#FFBB28' },
    { name: 'Wind', value: 35, color: '#00C49F' },
    { name: 'Hybrid', value: 5, color: '#8884d8' },
  ];

  // Bar chart data for yearly impact
  const yearlyImpactData = [
    { year: '2024', production: planData.yearlyProduction * 0.3, co2Saved: (plan.co2SavedAnnually || 200000) / 1000 * 0.3 },
    { year: '2025', production: planData.yearlyProduction * 0.6, co2Saved: (plan.co2SavedAnnually || 200000) / 1000 * 0.6 },
    { year: '2026', production: planData.yearlyProduction * 0.9, co2Saved: (plan.co2SavedAnnually || 200000) / 1000 * 0.9 },
    { year: '2027', production: planData.yearlyProduction, co2Saved: (plan.co2SavedAnnually || 200000) / 1000 },
    { year: '2028', production: planData.yearlyProduction * 1.1, co2Saved: (plan.co2SavedAnnually || 200000) / 1000 * 1.1 },
  ];

  // Investment breakdown in INR
  const investmentBreakdown = [
    { name: 'Electrolyzer', value: 40, color: '#0088FE' },
    { name: 'Renewable Energy', value: 30, color: '#00C49F' },
    { name: 'Infrastructure', value: 20, color: '#FFBB28' },
    { name: 'Other', value: 10, color: '#FF8042' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 pr-4">
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {plan.name}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant={planData.status === 'Operational' ? 'default' : 'secondary'}>
                {planData.status}
              </Badge>
              <Badge variant="outline">{planData.projectType}</Badge>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{plan.latitude}°N, {plan.longitude}°E</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
            data-testid="button-close-plan-details"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Capacity</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{planData.capacity} MW</div>
            <div className="text-xs text-muted-foreground">Production Capacity</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Investment</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{(planData.investment * 1000000).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Investment</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Production</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{planData.yearlyProduction}</div>
            <div className="text-xs text-muted-foreground">Tons H₂/year</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Jobs</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{planData.jobsCreated}</div>
            <div className="text-xs text-muted-foreground">Direct & Indirect</div>
          </Card>
        </div>

        {/* Suitability Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Suitability Analysis</span>
            </h3>
            <span className={`text-2xl font-bold ${plan.suitabilityScore >= 80 ? 'text-green-600' : plan.suitabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {plan.suitabilityScore}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Renewable Energy Access</span>
              <span className="font-medium">{plan.renewableUtilization || 85}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Industrial Demand Proximity</span>
              <span className="font-medium">{Math.round(plan.suitabilityScore * 0.8)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Infrastructure Readiness</span>
              <span className="font-medium">{Math.round(plan.suitabilityScore * 0.9)}%</span>
            </div>
          </div>
        </Card>

        {/* Renewable Energy Mix Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <span>Renewable Energy Mix</span>
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={renewableEnergyMix}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {renewableEnergyMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Investment Breakdown Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Investment Breakdown</span>
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {investmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Yearly Impact Projection */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Yearly Impact Projection</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="production" fill="#8884d8" name="H₂ Production (tons)" />
                <Bar dataKey="co2Saved" fill="#82ca9d" name="CO₂ Saved (kt)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Environmental Impact */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-green-600" />
            <span>Environmental Impact</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((plan.co2SavedAnnually || 200000) / 1000).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">kt CO₂ saved/year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {plan.industriesSupported || 15}
              </div>
              <div className="text-sm text-muted-foreground">Industries supported</div>
            </div>
          </div>
        </Card>

        {/* Project Timeline */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Project Timeline</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Planning Phase Completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${planData.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
              <span className="text-sm">Construction {planData.status === 'Operational' ? 'Completed' : 'In Progress'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${planData.status === 'Operational' ? 'bg-green-500' : 'bg-gray-300'} rounded-full`}></div>
              <span className="text-sm">Operations {planData.status === 'Operational' ? 'Active' : `Starting ${planData.operationalYear}`}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
