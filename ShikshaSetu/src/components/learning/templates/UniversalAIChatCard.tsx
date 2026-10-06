import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Bot, Send, Sparkles, WifiOff, RefreshCw } from 'lucide-react';

interface UniversalAIChatCardProps {
  isOnline: boolean;
  isLimited: boolean;
  onSendMessage?: (text: string) => Promise<string>;
}

export const UniversalAIChatCard: React.FC<UniversalAIChatCardProps> = ({
  isOnline,
  isLimited,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'student' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'नमस्ते! I am your ShikshaSetu AI Teacher. Ask me any doubt about Fractions, Equations, or Science!',
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'student', text: userText }]);
    setIsSending(true);

    try {
      if (onSendMessage) {
        const reply = await onSendMessage(userText);
        setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      } else {
        // High-quality rural grounded fallback response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: '🌾 Fractions represent equal division: like sharing 1 fresh roti equally among 4 family members (1/4 each). Try solving check questions below!',
            },
          ]);
          setIsSending(false);
        }, isLimited ? 1200 : 400);
        return;
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card variant="elevated" className="border-slate-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              ShikshaSetu AI Teacher Capsule
            </CardTitle>
            <span className="text-[10px] text-slate-400">
              Universal pedagogical companion
            </span>
          </div>
        </div>

        {isOnline ? (
          <Badge variant={isLimited ? 'saffron' : 'brand'} size="sm">
            {isLimited ? '2G Fast Text Mode' : 'Live Connected'}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            Offline Cached Advice
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="h-44 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed ${
                m.sender === 'student'
                  ? 'ml-auto bg-brand-700 text-white font-medium'
                  : 'mr-auto bg-white border border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isOnline
                ? 'Ask a doubt (e.g. "Mujhe fraction samajh nahi aa raha")...'
                : 'Offline: Reviewing pre-cached lessons & exercises...'
            }
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <Button
            size="sm"
            variant="saffron"
            type="submit"
            disabled={!input.trim() || isSending}
            isLoading={isSending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Ask
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
