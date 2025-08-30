import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { X, Bot, User, Send } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  onClose: () => void;
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your InfraVision assistant. I can help you find optimal hydrogen plant locations, explain suitability scores, and answer questions about green hydrogen infrastructure. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const messagesToSend = [
        ...messages.filter(m => m.role !== 'assistant' || m.content !== messages[0].content), // Exclude welcome message
        { role: 'user' as const, content: userMessage }
      ];
      
      const response = await apiRequest('POST', '/api/chat', { messages: messagesToSend });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ]);

    // Send to API
    chatMutation.mutate(userMessage);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 h-96 md:h-[500px] bg-card border border-border shadow-xl overflow-hidden z-[1000]">
      <CardHeader className="p-4 border-b border-border bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span className="font-medium">InfraVision Assistant</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            data-testid="button-close-chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' ? 'bg-primary' : 'bg-muted'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <User className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'assistant' 
                  ? 'bg-muted text-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about hydrogen infrastructure..."
              className="flex-1 text-sm"
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputValue.trim() || chatMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
