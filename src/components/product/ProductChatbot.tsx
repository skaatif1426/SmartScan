'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/AppProviders';
import { getAIChatResponse } from '@/lib/actions';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ProductChatbot({ productData }: { productData: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language, t } = useLanguage();
  const { incrementAiCallCount } = useAiUsage();
  const { trackError } = useAnalytics();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        incrementAiCallCount();
        const response = await getAIChatResponse({
          productData: productData,
          userQuestion: input,
          language: language,
        });

        const botMessage: Message = { sender: 'bot', text: response };
        setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
        trackError();
        const errorMessage: Message = { sender: 'bot', text: "Sorry, I couldn't get a response. Please try again." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96">
      <ScrollArea className="flex-1 p-4 border rounded-lg" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-3', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
              {message.sender === 'bot' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-xs md:max-w-md p-3 rounded-xl', message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="text-sm">{message.text}</p>
              </div>
               {message.sender === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                 <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-muted">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chatbotPlaceholder')}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
