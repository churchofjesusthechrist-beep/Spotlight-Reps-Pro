import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { FollowUp, Sponsor, Board } from '../lib/types';
import { Phone, Mail, CheckCircle2, MessageSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface FollowUpEnriched extends FollowUp {
  sponsor?: Sponsor;
  board?: Board;
}

export const FollowUps = () => {
  const [followups, setFollowups] = useState<FollowUpEnriched[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const raw = await dbApi.getFollowUps();
    const pending = raw.filter(f => !f.completed);
    
    // Enrich with sponsor and board data
    const enriched = await Promise.all(pending.map(async f => {
      const sponsors = await dbApi.getSponsorsForBoard(f.boardId);
      const sponsor = sponsors.find(s => s.id === f.sponsorId);
      const board = await dbApi.getBoard(f.boardId);
      return { ...f, sponsor, board };
    }));
    
    // Sort by due date
    enriched.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setFollowups(enriched);
  };

  const markComplete = async (f: FollowUpEnriched) => {
    await dbApi.saveFollowUp({ ...f, completed: true });
    setFollowups(prev => prev.filter(item => item.id !== f.id));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Today's Follow-Ups</h1>
      <p className="text-gray-400 mb-8">Follow up with sponsors to close spots.</p>

      {followups.length === 0 ? (
        <div className="bg-[#112240] p-8 rounded-2xl border border-[#233554] text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
          <p className="text-gray-400">You have no pending follow-ups.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followups.map(f => {
            const due = new Date(f.dueDate);
            const isOverdue = isPast(due) && !isToday(due);
            
            return (
              <div key={f.id} className="bg-[#112240] p-5 rounded-2xl border border-[#233554]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{f.sponsor?.businessName}</h3>
                    <p className="text-sm text-gray-400">{f.sponsor?.contactName}</p>
                    <p className="text-xs text-[#FFC107] mt-1">{f.board?.restaurantName} Board</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {isOverdue ? 'OVERDUE' : format(due, 'MMM d')}
                  </span>
                </div>
                
                {f.notes && (
                  <div className="bg-[#0A192F] p-3 rounded-xl border border-[#233554] mb-4 text-sm text-gray-300">
                    {f.notes}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <a href={`tel:${f.sponsor?.phone}`} className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500/20">
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a href={`mailto:${f.sponsor?.email}`} className="flex-1 bg-blue-500/10 text-blue-400 border border-blue-500/50 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/20">
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <button onClick={() => markComplete(f)} className="flex-1 bg-gray-500/10 text-gray-400 border border-gray-500/50 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-500/20 hover:text-white">
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
