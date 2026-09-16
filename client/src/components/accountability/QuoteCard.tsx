import React, { useEffect, useState } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import api from '../../services/api';
import type { Quote as QuoteType } from '../../types';

const QuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<QuoteType | null>(null);

  const fetchQuote = async () => {
    try {
      const { data } = await api.get('/motivation/random-quote');
      if (data.success) setQuote(data.data);
    } catch {}
  };

  useEffect(() => { fetchQuote(); }, []);

  if (!quote) return null;

  return (
    <div className="glass flex items-start gap-3.5 p-6 mt-8 animate-slide-up">
      <div className="text-neon opacity-50 shrink-0 mt-0.5">
        <Quote size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-text-secondary italic leading-relaxed mb-1">"{quote.text}"</p>
        <span className="text-xs text-text-tertiary font-medium">— {quote.author}</span>
      </div>
      <button
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-[10px] text-text-tertiary hover:bg-bg-tertiary hover:text-neon hover:rotate-180 transition-all duration-200"
        onClick={fetchQuote}
        title="New quote"
      >
        <RefreshCw size={16} />
      </button>
    </div>
  );
};

export default QuoteCard;
