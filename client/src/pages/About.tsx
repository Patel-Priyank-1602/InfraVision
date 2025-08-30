import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Zap, 
  Globe, 
  Award,
  Github,
  Linkedin,
  Mail,
  Video
} from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Patel Priyank",
      role: "Leader",
      description: "Full Stack Developer & Project Lead",
      icon: "👨‍💻"
    },
    {
      name: "Patel Yug",
      role: "Developer",
      description: "Backend Developer & Database Architect",
      icon: "🔧"
    },
    {
      name: "Patel Prince",
      role: "Developer", 
      description: "Frontend Developer & UI/UX Designer",
      icon: "🎨"
    },
    {
      name: "Maalav Patadiya",
      role: "Developer",
      description: "AI/ML Engineer & Data Scientist",
      icon: "🤖"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Interactive Map Planning",
      description: "Drag-and-drop hydrogen plant placement with real-time suitability scoring"
    },
    {
      icon: <Globe className="w-6 h-6 text-green-600" />,
      title: "AI-Powered Suggestions",
      description: "Machine learning algorithms analyze optimal locations based on infrastructure and resources"
    },
    {
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Impact Visualization",
      description: "Comprehensive sustainability metrics and CO₂ savings calculations"
    },
    {
      icon: <Award className="w-6 h-6 text-orange-600" />,
      title: "Gamified Experience",
      description: "Engaging scoring system makes infrastructure planning fun and educational"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">About InfraVision</h1>
              <p className="text-muted-foreground">Green Hydrogen Infrastructure Planning Platform</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Project Overview */}
        <div className="mb-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                InfraVision
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Revolutionizing green hydrogen infrastructure planning through gamification, 
                AI intelligence, and comprehensive impact visualization for a sustainable future.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">What is InfraVision?</h3>
                <p className="text-muted-foreground mb-4">
                  InfraVision is an interactive web-based platform designed to make green hydrogen 
                  infrastructure planning accessible, engaging, and data-driven. Our platform combines 
                  cutting-edge AI technology with intuitive gamification to help planners, developers, 
                  and policymakers make informed decisions about hydrogen plant locations.
                </p>
                <p className="text-muted-foreground">
                  Built specifically for India's National Green Hydrogen Mission, InfraVision helps 
                  accelerate the transition to clean energy by optimizing hydrogen production sites 
                  based on renewable energy availability, industrial demand, and economic factors.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* How to Use Video Tutorial */}
        <div className="mb-12">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Video className="w-6 h-6 text-red-600" />
                <h3 className="text-2xl font-bold">How to Use InfraVision</h3>
              </div>
              <p className="text-muted-foreground">
                Watch our quick tutorial to get started with hydrogen infrastructure planning
              </p>
            </div>
            
            <div className="aspect-video max-w-4xl mx-auto">
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src="https://www.youtube.com/embed/aYBGSfzaa4c?si=ozpfQr3kdL7j2hau"
                title="InfraVision Tutorial - How to Plan Green Hydrogen Infrastructure"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Learn how to place hydrogen plants, analyze suitability scores, and explore AI suggestions
              </p>
            </div>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold">Meet Team NPHard</h3>
              </div>
              <p className="text-muted-foreground">
                A passionate team committed to sustainable technology solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Priyank Patel */}
              <Card className="p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-3"></div>
                <h4 className="font-semibold text-lg mb-1">Priyank Patel</h4>
                <div className="text-sm font-medium text-primary mb-2">Leader, Developer</div>
              </Card>

              {/* Yug Patel */}
              <Card className="p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-3"></div>
                <h4 className="font-semibold text-lg mb-1">Yug Patel</h4>
                <div className="text-sm font-medium text-primary mb-2">Developer, Debugger</div>
              </Card>

              {/* Prince Patel */}
              <Card className="p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-3"></div>
                <h4 className="font-semibold text-lg mb-1">Prince Patel</h4>
                <div className="text-sm font-medium text-primary mb-2">Editor, Designer</div>
              </Card>

              {/* Maalav Patadiya */}
              <Card className="p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-3"></div>
                <h4 className="font-semibold text-lg mb-1">Maalav Patadiya</h4>
                <div className="text-sm font-medium text-primary mb-2">Editor</div>
              </Card>
            </div>
          </Card>
        </div>


        {/* Mission & Impact */}
        <div className="mb-8">
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-600">Our Mission</h3>
                <p className="text-muted-foreground mb-4">
                  To democratize green hydrogen infrastructure planning by making it accessible, 
                  engaging, and data-driven. We believe that the transition to clean energy should 
                  be guided by intelligent tools that consider both environmental impact and 
                  economic viability.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Accelerate India's National Green Hydrogen Mission
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Optimize renewable energy utilization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Support sustainable industrial development
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Technology Stack</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• React + TypeScript</li>
                      <li>• Leaflet.js Maps</li>
                      <li>• TailwindCSS</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Node.js + Express</li>
                      <li>• PostgreSQL </li>
                      <li>• Supabase </li>
                      <li>• Gemini API</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Auth & Map</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Supabase</li>
                      <li>• Leaflet.js Maps</li>
                      <li>• OSM Map</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact */}
        <div className="text-center">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
            <p className="text-muted-foreground mb-4">
              Interested in collaborating or learning more about our project?
            </p>
            <div className="flex justify-center gap-4">
              <a href="https://github.com/Patel-Priyank-1602/InfraVision" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </a>
              <a href="mailto:patelpriyank2526@gmail.com">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}