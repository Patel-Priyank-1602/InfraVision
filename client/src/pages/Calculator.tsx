import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Zap, Factory, Truck, IndianRupee } from "lucide-react";

export default function HydrogenCalculator() {
  const [productionCapacity, setProductionCapacity] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [electricityPrice, setElectricityPrice] = useState('');
  const [operatingHours, setOperatingHours] = useState('8760'); // Hours per year
  const [plantType, setPlantType] = useState('');
  
  // Calculation results
  const [results, setResults] = useState({
    annualProduction: 0,
    energyRequired: 0,
    operatingCost: 0,
    capitalCost: 0,
    co2Saved: 0,
    paybackPeriod: 0
  });

  const calculateHydrogen = () => {
    const capacity = parseFloat(productionCapacity);
    const hours = parseFloat(operatingHours);
    const price = parseFloat(electricityPrice);
    
    if (!capacity || !hours || !price) return;
    
    // Indian context calculations
    const energyPerKg = 50; // kWh per kg H2 (typical for electrolysis)
    const annualProd = capacity * hours / 1000; // Convert to tonnes
    const energyReq = annualProd * 1000 * energyPerKg; // Total kWh
    const opCost = (energyReq * price) / 100000; // In lakhs INR
    
    // Capital cost estimates for India (in lakhs INR)
    const capCostPerKW = plantType === 'small' ? 8 : plantType === 'medium' ? 6 : 4;
    const capCost = (capacity * capCostPerKW) / 100000;
    
    // CO2 savings (Indian grid emission factor: 0.82 kg CO2/kWh)
    const co2Saved = (annualProd * 1000 * 9.3) / 1000; // tonnes CO2 per year
    
    // Simple payback calculation
    const hydrogenPrice = 300; // INR per kg (current Indian market)
    const revenue = (annualProd * 1000 * hydrogenPrice) / 100000; // In lakhs
    const payback = capCost / (revenue - opCost);
    
    setResults({
      annualProduction: Math.round(annualProd),
      energyRequired: Math.round(energyReq),
      operatingCost: Math.round(opCost * 100) / 100,
      capitalCost: Math.round(capCost * 100) / 100,
      co2Saved: Math.round(co2Saved),
      paybackPeriod: Math.round(payback * 10) / 10
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Green Hydrogen Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate production costs, energy requirements, and environmental impact for hydrogen plants in India
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Plant Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Production Capacity (kg/day)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="e.g., 1000"
                      value={productionCapacity}
                      onChange={(e) => setProductionCapacity(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plant-type">Plant Scale</Label>
                    <Select value={plantType} onValueChange={setPowerSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plant scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small Scale (&lt; 1 MW)</SelectItem>
                        <SelectItem value="medium">Medium Scale (1-10 MW)</SelectItem>
                        <SelectItem value="large">Large Scale (&gt; 10 MW)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="power-source">Power Source</Label>
                    <Select value={powerSource} onValueChange={setPowerSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solar">Solar PV</SelectItem>
                        <SelectItem value="wind">Wind Energy</SelectItem>
                        <SelectItem value="grid">Grid Power</SelectItem>
                        <SelectItem value="hybrid">Solar + Wind Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricity-price">Electricity Price (INR/kWh)</Label>
                    <Input
                      id="electricity-price"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 4.5"
                      value={electricityPrice}
                      onChange={(e) => setElectricityPrice(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="operating-hours">Operating Hours/Year</Label>
                    <Input
                      id="operating-hours"
                      type="number"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Electrolyzer Efficiency (%)</Label>
                    <Input type="number" placeholder="75" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Water Cost (INR/m³)</Label>
                    <Input type="number" placeholder="20" />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={calculateHydrogen} 
                className="w-full"
                disabled={!productionCapacity || !electricityPrice}
              >
                Calculate Economics
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Economic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Factory className="w-4 h-4" />
                    Annual Production
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {results.annualProduction} tonnes
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    Energy Required
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(results.energyRequired / 1000000).toFixed(1)} GWh
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    Operating Cost
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{results.operatingCost} L/year
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Factory className="w-4 h-4" />
                    Capital Cost
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{results.capitalCost} L
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    CO₂ Saved
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.co2Saved} tonnes/year
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calculator className="w-4 h-4" />
                    Payback Period
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {results.paybackPeriod} years
                  </div>
                </div>
              </div>
              
              {/* Key Assumptions */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Key Assumptions (India Context)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Electrolyzer efficiency: 75%</li>
                  <li>• Grid emission factor: 0.82 kg CO₂/kWh</li>
                  <li>• Hydrogen price: ₹300/kg</li>
                  <li>• Plant life: 20 years</li>
                  <li>• CAPEX includes electrolyzer, balance of plant, installation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}