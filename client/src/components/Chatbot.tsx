import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your InfraVision assistant. I can help you find optimal hydrogen plant locations, explain suitability scores, and answer questions about green hydrogen infrastructure. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();

    if (input.includes('location') || input.includes('site') || input.includes('where')) {
      return "For optimal hydrogen plant locations, I analyze factors like renewable energy availability, water resources, transportation infrastructure, and regulatory environment. Key considerations include proximity to wind/solar farms, access to industrial consumers, and pipeline connectivity. Would you like me to explain any specific location criteria?";
    }

    if (input.includes('suitability') || input.includes('score') || input.includes('rating')) {
      return "Suitability scores are calculated using weighted factors: renewable energy potential (30%), water availability (25%), infrastructure access (20%), regulatory support (15%), and market proximity (10%). Scores range from 0-100, with 80+ being excellent locations. What specific scoring criteria would you like to explore?";
    }

    if (input.includes('cost') || input.includes('price') || input.includes('economic')) {
      return "Hydrogen production costs vary significantly by location and method. Green hydrogen currently costs $3-6/kg but is projected to reach $1-2/kg by 2030 in optimal locations. Key cost factors include electricity prices, capacity factors, and capital costs. Would you like cost analysis for a specific region?";
    }

    if (input.includes('renewable') || input.includes('solar') || input.includes('wind')) {
      return "Renewable energy integration is crucial for green hydrogen. Ideal locations have high solar irradiance (>1800 kWh/m²/year) or wind speeds (>7 m/s average). Co-location with renewables reduces transmission costs and improves economics. Which renewable resource are you most interested in?";
    }

    if (input.includes('water') || input.includes('consumption') || input.includes('supply')) {
      return "Water consumption for electrolysis is approximately 9-10 liters per kg of hydrogen produced. Locations need access to 1000+ m³/day for large-scale plants. Seawater desalination is viable in coastal areas. Water quality and treatment requirements vary by electrolyzer type. Need specifics on water planning?";
    }

    if (input.includes('transport') || input.includes('pipeline') || input.includes('distribution')) {
      return "Hydrogen transport options include pipelines (lowest cost for high volumes), compressed gas trucks, liquid hydrogen carriers, and ammonia conversion. Pipeline costs are ~$1M/km. Existing natural gas infrastructure may be retrofittable. What transport method interests you most?";
    }

    if (input.includes('regulation') || input.includes('policy') || input.includes('permit')) {
      return "Regulatory frameworks vary by region. Key permits include environmental assessments, zoning approvals, grid connections, and safety certifications. EU has the most developed hydrogen policies, while US is rapidly advancing through IRA incentives. Which regulatory aspect concerns you?";
    }

    if (input.includes('technology') || input.includes('electrolyzer') || input.includes('equipment')) {
      return "Main electrolyzer technologies are PEM (flexible, fast response), alkaline (mature, lower cost), and SOEC (highest efficiency). PEM is preferred for renewable integration due to rapid load following. Typical plant sizes range from 10MW to 1GW. What technology aspects interest you?";
    }

    if (input.includes('market') || input.includes('demand') || input.includes('customer')) {
      return "Key hydrogen markets include steel production, ammonia/fertilizers, refineries, and emerging applications like shipping fuel and power generation. Industrial clusters offer the best initial demand. Transport sector adoption is growing. Which market segment are you targeting?";
    }

    if (input.includes('environmental') || input.includes('emission') || input.includes('carbon')) {
      return "Green hydrogen offers 90%+ CO2 reduction vs. gray hydrogen. Life cycle emissions are primarily from renewable electricity generation. Environmental benefits include air quality improvement and industrial decarbonization. Environmental impact assessments cover land use, water, and biodiversity. Need environmental data for planning?";
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help with hydrogen infrastructure planning. I can assist with site selection, feasibility analysis, cost estimates, and technical requirements. What's your project focus?";
    }

    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! I'm here whenever you need insights on hydrogen infrastructure development. Feel free to ask about any technical, economic, or regulatory aspects of your project.";
    }

    if (input.includes('help') || input.includes('what can you do')) {
      return "I can help you with: 🔹 Optimal site selection for hydrogen plants 🔹 Suitability scoring and analysis 🔹 Cost estimation and economic modeling 🔹 Renewable energy integration 🔹 Regulatory and permitting guidance 🔹 Technology selection 🔹 Market analysis. What would you like to explore?";
    }

    const defaultResponses = [
      "That's an interesting question about hydrogen infrastructure. Could you provide more specific details so I can give you a more targeted analysis?",
      "I'd be happy to help with that hydrogen infrastructure topic. Could you clarify what specific aspect you'd like me to focus on?",
      "For hydrogen infrastructure planning, I can provide insights on technical, economic, and regulatory factors. What particular area would be most helpful for your project?",
      "Let me help you with hydrogen infrastructure planning. Could you specify whether you're interested in production, storage, transport, or end-use applications?",
      "I have extensive knowledge about green hydrogen infrastructure. To give you the most relevant information, could you tell me more about your specific use case or region of interest?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(async () => {
      const response = await generateResponse(trimmedInput);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-medium">InfraVision Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
            data-testid="button-close-chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'assistant'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'bg-blue-600 text-white ml-auto'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about hydrogen infrastructure..."
              className="flex-1"
              disabled={isTyping}
              data-testid="input-message"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}