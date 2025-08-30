import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, BarChart3, Leaf, Factory, Zap, Map } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { HydrogenSite } from "@/types/hydrogen";

interface PlantsDashboardProps {
  onClose: () => void;
}

const chartConfig = {
  suitability: {
    label: "Suitability Score",
  },
  co2Saved: {
    label: "CO₂ Saved (kt/year)",
  },
  renewable: {
    label: "Renewable %",
  },
};

export default function PlantsDashboard({ onClose }: PlantsDashboardProps) {
  // Fetch all hydrogen sites (user sites + AI suggestions)
  const { data: userSites = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/hydrogen-sites'],
    refetchOnWindowFocus: false,
  });

  const { data: aiSuggestions = [] } = useQuery<HydrogenSite[]>({
    queryKey: ['/api/ai-suggestions'],
    refetchOnWindowFocus: false,
  });

  const allSites = [...userSites, ...aiSuggestions];

  // Prepare chart data
  const suitabilityData = allSites.map(site => ({
    name: site.name.split(' ').slice(0, 2).join(' '),
    score: site.suitabilityScore,
    co2: site.co2SavedAnnually ? Math.floor(site.co2SavedAnnually / 1000) : 0,
    renewable: site.renewableUtilization || 0
  }));

  const typeDistribution = [
    { name: 'User Sites', value: userSites.length, color: '#3b82f6' },
    { name: 'AI Suggested', value: aiSuggestions.length, color: '#10b981' }
  ];

  const totalCO2Saved = allSites.reduce((sum, site) => sum + (site.co2SavedAnnually || 0), 0);
  const avgSuitability = allSites.length > 0 ? 
    Math.round(allSites.reduce((sum, site) => sum + site.suitabilityScore, 0) / allSites.length) : 0;
  const totalIndustries = allSites.reduce((sum, site) => sum + (site.industriesSupported || 0), 0);

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-[90vw] max-w-[600px] h-[85vh] max-h-[700px] bg-gradient-to-br from-card via-card to-muted/30 border-2 border-primary/20 shadow-2xl overflow-hidden backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Plants Dashboard</h3>
              <p className="text-sm text-muted-foreground">Analytics & Insights</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            data-testid="button-close-dashboard"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 h-[calc(100%-5rem)] overflow-y-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Map className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{allSites.length}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Plants</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-green-500/20">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{Math.floor(totalCO2Saved / 1000)}kt</div>
            <div className="text-sm text-muted-foreground font-medium">CO₂ Saved/Year</div>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-secondary/20">
                <Factory className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-secondary mb-1">{totalIndustries}</div>
            <div className="text-sm text-muted-foreground font-medium">Industries</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Type Distribution */}
          <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-accent/20">
                <BarChart3 className="w-4 h-4 text-accent" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Plant Distribution</h4>
            </div>
            <div className="h-40">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Key Metrics</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Avg. Suitability</span>
                </div>
                <div className="text-lg font-bold text-accent">{avgSuitability}/100</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Renewable Focus</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {allSites.length > 0 ? Math.round(
                    allSites.reduce((sum, site) => sum + (site.renewableUtilization || 0), 0) / allSites.length
                  ) : 0}%
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">Economic Impact</span>
                </div>
                <div className="text-lg font-bold text-secondary">₹{(allSites.length * 250).toLocaleString()}Cr</div>
              </div>
            </div>
          </div>
        </div>

        {/* Suitability Scores Chart */}
        {suitabilityData.length > 0 && (
          <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-secondary/20">
                <BarChart3 className="w-4 h-4 text-secondary" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Suitability Scores</h4>
            </div>
            <div className="h-48">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={suitabilityData.slice(0, 8)} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      domain={[0, 100]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {allSites.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-dashed border-muted-foreground/30">
            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
              <Map className="w-8 h-8 opacity-50" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No plants yet</h4>
            <p className="text-sm mb-1">Start exploring hydrogen infrastructure!</p>
            <p className="text-xs">Click on the map to place your first plant.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}