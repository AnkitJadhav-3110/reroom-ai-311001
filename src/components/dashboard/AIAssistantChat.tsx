import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, HelpCircle, Upload, Palette, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { streamAIChat } from "@/lib/aiChat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "How to upload?", icon: Upload, prompt: "How do I upload a room photo for transformation?" },
  { label: "Theme guide", icon: Palette, prompt: "What design themes are available and which one should I choose?" },
  { label: "Credit system", icon: CreditCard, prompt: "How do credits work and how many do I have?" },
  { label: "Get help", icon: HelpCircle, prompt: "I need help getting started with Velora Studios" },
];

const AIAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! 👋 I'm your Velora Studios assistant. I can help you transform any room with AI-powered design. Ask me about uploading images, choosing themes, or how credits work. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamAIChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message");
      setIsLoading(false);
      // Add a fallback response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or check out the quick actions below for common questions!",
        },
      ]);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-float bg-primary hover:bg-primary/90 hover:shadow-glow transition-all duration-300 hover:scale-110 z-50 border-2 border-accent/30"
        size="icon"
      >
        <Bot className="w-7 h-7 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed ${
        isMinimized ? "bottom-6 right-6 w-80" : "bottom-6 right-6 w-[420px]"
      } shadow-float border-2 border-primary/20 bg-background backdrop-blur-xl z-50 transition-all duration-300 rounded-3xl overflow-hidden`}
      style={{ height: isMinimized ? "70px" : "550px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-primary/10 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-base">AI Design Assistant</h3>
            <p className="text-xs text-primary/60">Here to help you design</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" style={{ height: "350px" }} ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 text-foreground border border-primary/10"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/50 rounded-2xl px-4 py-3 border border-primary/10">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(action.prompt)}
                    disabled={isLoading}
                    className="rounded-full text-xs border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all"
                  >
                    <action.icon className="w-3 h-3 mr-1.5" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t-2 border-primary/10 bg-primary/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about Velora Studios..."
                disabled={isLoading}
                className="flex-1 bg-background border-2 border-primary/20 focus:border-primary rounded-xl text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90 rounded-xl h-10 w-10 transition-all hover:shadow-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};

export default AIAssistantChat;
