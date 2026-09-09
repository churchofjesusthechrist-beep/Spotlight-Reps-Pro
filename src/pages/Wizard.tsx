import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbApi } from '../lib/db';
import { Board, Script } from '../lib/types';
import { ChevronLeft, Bot, Sparkles, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

export const Wizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  
  const [draftedMessage, setDraftedMessage] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);

  const [sponsorSuggestions, setSponsorSuggestions] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (boardId: string) => {
    const b = await dbApi.getBoard(boardId);
    if (!b) return navigate('/');
    setBoard(b);
    setScripts(await dbApi.getScripts());
  };

  const handleDraftMessage = async (scriptContent: string) => {
    if (!board) return;
    setIsDrafting(true);
    try {
      const response = await fetch('/api/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptContent,
          restaurantName: board.restaurantName,
          contactName: board.restaurantContactName
        })
      });
      const data = await response.json();
      if (data.draft) {
        setDraftedMessage(data.draft);
        setDraftCopied(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to draft message.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draftedMessage);
      setDraftCopied(true);
      setTimeout(() => setDraftCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSuggestSponsors = async () => {
    if (!board) return;
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/suggest-sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: board.restaurantName,
          notes: board.address || ''
        })
      });
      const data = await response.json();
      if (data.suggestions) {
        setSponsorSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to get suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  if (!board) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="pb-32 max-w-4xl mx-auto">
      <header className="p-4 pt-6 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Campaign Wizard</h1>
          <p className="text-[#FFC107] font-medium">{board.restaurantName}</p>
        </div>
      </header>

      <div className="p-4 space-y-8">
        
        {/* Step 1: Pitch */}
        <section className="bg-[#112240] rounded-2xl border border-[#233554] p-6">
          <div className="flex items-center gap-3 mb-4 border-b border-[#233554]/50 pb-4">
            <div className="w-8 h-8 rounded-full bg-[#FFC107] text-[#0A192F] font-bold flex items-center justify-center">1</div>
            <h2 className="text-xl font-bold text-white">Pitch the Restaurant</h2>
          </div>
          
          <p className="text-gray-300 mb-6">Select a script and use AI to automatically personalize it for {board.restaurantName}.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.filter(s => s.category === 'Restaurant').map(script => (
              <div key={script.id} className="bg-[#0A192F] p-4 rounded-xl border border-[#233554] flex flex-col">
                <h4 className="font-bold text-[#FFC107] mb-2 text-sm">{script.title}</h4>
                <p className="text-gray-400 text-xs italic mb-4 flex-1">"{script.content.substring(0, 100)}..."</p>
                <button 
                  onClick={() => handleDraftMessage(script.content)}
                  disabled={isDrafting}
                  className="w-full bg-[#233554] hover:bg-[#2a4066] text-white py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  {isDrafting ? <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Bot className="w-4 h-4" />}
                  Draft with AI
                </button>
              </div>
            ))}
          </div>

          {draftedMessage && (
            <div className="mt-6 bg-gradient-to-br from-[#1a2c4e] to-[#0A192F] p-5 rounded-xl border border-[#FFC107]/30">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-[#FFC107] flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Drafted Message</h4>
                <button 
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition"
                >
                  {draftCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {draftCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-white whitespace-pre-wrap leading-relaxed">{draftedMessage}</p>
            </div>
          )}
        </section>

        {/* Step 2: Referrals & Brainstorming */}
        <section className="bg-[#112240] rounded-2xl border border-[#233554] p-6">
          <div className="flex items-center gap-3 mb-4 border-b border-[#233554]/50 pb-4">
            <div className="w-8 h-8 rounded-full bg-[#FFC107] text-[#0A192F] font-bold flex items-center justify-center">2</div>
            <h2 className="text-xl font-bold text-white">Sponsor Brainstorming</h2>
          </div>
          
          <p className="text-gray-300 mb-6">Not sure who to pitch as sponsors? Let AI analyze the restaurant type and suggest the best local business categories to target.</p>

          <button 
            onClick={handleSuggestSponsors}
            disabled={isSuggesting}
            className="bg-[#FFC107] hover:bg-[#ffcd38] text-[#0A192F] py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {isSuggesting ? <div className="animate-spin w-5 h-5 border-2 border-[#0A192F]/20 border-t-[#0A192F] rounded-full" /> : <Sparkles className="w-5 h-5" />}
            Analyze & Suggest Sponsors
          </button>

          {sponsorSuggestions && (
            <div className="mt-6 bg-[#0A192F] p-5 rounded-xl border border-[#233554]">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">AI Suggestions for {board.restaurantName}</h4>
              <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed markdown-body">
                {sponsorSuggestions}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
