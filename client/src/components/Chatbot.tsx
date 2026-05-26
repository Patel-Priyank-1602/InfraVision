import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I am the InfraVision AI. How can I help you with green hydrogen infrastructure planning in India today?'
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (msgs: ChatMessage[]) => {
      const response = await apiRequest('POST', '/api/chat', { messages: msgs });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response }
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    chatMutation.mutate(updatedMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed top-[360px] right-3 h-14 px-5 rounded-full shadow-xl hover:shadow-2xl bg-background text-foreground z-[500] flex items-center gap-2 transition-all duration-300 hover:scale-110 border-2 border-primary/20 hover:border-primary/50 group"
        >
          <img src="/favicon.png" alt="Chat AI" className="w-6 h-6 rounded-sm group-hover:animate-pulse object-cover drop-shadow-sm" />
          <span className="font-bold tracking-wide text-sm">Ask</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed top-[360px] right-3 w-[300px] sm:w-[350px] h-[400px] max-h-[50vh] shadow-2xl z-[500] flex flex-col animate-in zoom-in-95 slide-in-from-right-5 border-2 border-primary/20">
          <CardHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-semibold">InfraVision AI</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground h-8 w-8 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent 
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30"
            ref={scrollRef}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted border border-border text-foreground rounded-bl-none'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-muted border border-border text-foreground rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-3 border-t bg-background rounded-b-xl gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about hydrogen locations..."
              className="flex-1 rounded-full px-4 focus-visible:ring-1"
              disabled={chatMutation.isPending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="rounded-full h-10 w-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
