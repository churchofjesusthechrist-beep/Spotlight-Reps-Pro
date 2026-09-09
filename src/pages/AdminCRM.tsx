import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { RepProfile, Board, Prospect } from '../lib/types';
import { AlertTriangle, CheckCircle2, ChevronLeft, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface RepSummary {
  profile: RepProfile;
  boardCount: number;
  activeBoardCount: number;
  prospectCount: number;
  lastActivityLabel: string;
  isStale: boolean;
}

export const AdminCRM = () => {
  const navigate = useNavigate();
  const [reps, setReps] = useState<RepSummary[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [allReps, allBoards, allProspects] = await Promise.all([
      dbApi.getAllReps(),
      dbApi.getBoards(),
      dbApi.getProspects()
    ]);
    setBoards(allBoards);
    setProspects(allProspects);

    const summaries: RepSummary[] = allReps
      .filter(r => !r.isAdmin)
      .map(rep => {
        const repBoards = allBoards.filter(b => b.assignedRepId === rep.id);
        const repProspects = allProspects.filter(p => p.assignedRepId === rep.id);
        const activeBoardCount = repBoards.filter(b => !['Delivered', 'Renewal'].includes(b.status)).length;

        let lastActivityLabel = 'No activity yet';
        let isStale = true;
        if (rep.lastActiveAt) {
          const d = new Date(rep.lastActiveAt);
          lastActivityLabel = `${formatDistanceToNow(d)} ago`;
          isStale = Date.now() - d.getTime() > 1000 * 60 * 60 * 24 * 3; // 3+ days quiet = flag it
        }

        return {
          profile: rep,
          boardCount: repBoards.length,
          activeBoardCount,
          prospectCount: repProspects.length,
          lastActivityLabel,
          isStale
        };
      });

    summaries.sort((a, b) => (a.isStale === b.isStale ? 0 : a.isStale ? -1 : 1));
    setReps(summaries);
    setLoading(false);
  };

  const totalContacts = boards.length + prospects.length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/admin')} className="p-2 mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Team CRM</h1>
          <p className="text-gray-400 text-sm">Every rep, every contact, one place — admin only.</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554] text-center">
          <p className="text-2xl font-bold text-white">{loading ? '-' : reps.length}</p>
          <p className="text-xs text-gray-400 mt-1">Reps</p>
        </div>
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554] text-center">
          <p className="text-2xl font-bold text-white">{loading ? '-' : totalContacts}</p>
          <p className="text-xs text-gray-400 mt-1">Total Contacts</p>
        </div>
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554] text-center">
          <p className="text-2xl font-bold text-red-400">{loading ? '-' : reps.filter(r => r.isStale).length}</p>
          <p className="text-xs text-gray-400 mt-1">Going Quiet</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-3">Rep Activity</h2>
      <div className="space-y-3">
        {reps.map(r => (
          <div key={r.profile.id} className={`bg-[#112240] p-4 rounded-2xl border ${r.isStale ? 'border-red-500/40' : 'border-[#233554]'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  {r.profile.fullName}
                  {r.isStale ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </h3>
                <p className="text-xs text-gray-500">Last active: {r.lastActivityLabel}</p>
              </div>
              <div className="flex gap-2">
                {r.profile.phone && (
                  <a href={`tel:${r.profile.phone}`} className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                <a href={`mailto:${r.profile.email}`} className="p-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/40">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-400">Boards: <span className="text-white font-semibold">{r.boardCount}</span></span>
              <span className="text-gray-400">Active: <span className="text-white font-semibold">{r.activeBoardCount}</span></span>
              <span className="text-gray-400">Prospects: <span className="text-white font-semibold">{r.prospectCount}</span></span>
            </div>
          </div>
        ))}
        {!loading && reps.length === 0 && (
          <div className="bg-[#112240] p-8 rounded-2xl border border-[#233554] text-center text-gray-400">
            No reps registered yet.
          </div>
        )}
      </div>
    </div>
  );
};
