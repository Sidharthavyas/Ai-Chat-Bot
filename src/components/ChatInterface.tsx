import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/lib/store';
import { generateText, generateImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import anime from 'animejs';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const { messages, addMessage } = useChatStore();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [imageMode, setImageMode] = useState(false);

  useEffect(() => {
    // Check if models are ready
    const checkModels = async () => {
      try {
        await Promise.all([
          generateText('Hi'),
          generateImage('test'),
        ]);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Model loading error:', error);
        toast({
          title: 'Model Loading',
          description: 'Models are still warming up. First response might take longer.',
          duration: 5000,
        });
        setIsModelLoading(false);
      }
    };

    checkModels();
  }, [toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    anime({
      targets: '.message',
      translateX: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      addMessage({ content: input, role: 'user', type: 'text' });

      if (imageMode) {
        const imageUrl = await generateImage(input);
        addMessage({ content: imageUrl, role: 'assistant', type: 'image' });
      } else {
        const response = await generateText(input);
        addMessage({ content: response, role: 'assistant', type: 'text' });
      }

      setInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-gray-800">
            <Bot className="w-12 h-12 animate-bounce text-blue-400" />
            <p className="text-lg">Warming up AI models...</p>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`message flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 ml-auto'
                    : 'bg-gray-700'
                }`}
              >
                {message.type === 'image' ? (
                  <img
                    src={message.content}
                    alt="Generated"
                    className="rounded-lg max-w-full"
                    loading="lazy"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setImageMode(!imageMode)}
            className={imageMode ? 'text-purple-400' : 'text-gray-400'}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              imageMode ? 'Describe the image you want...' : 'Type a message...'
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}