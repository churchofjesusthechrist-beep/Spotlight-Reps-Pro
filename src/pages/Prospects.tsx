import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { useAuth } from '../hooks/useAuth';
import { Prospect, ProspectType, Board } from '../lib/types';
import { Sparkles, Mail, Phone, ArrowRightCircle, Trash2, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const Prospects = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [location, setLocation] = useState('');
  const [type, setType] = useState<ProspectType>('Restaurant');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [drafting, setDrafting] = useState<string | null>(null);

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    const all = await dbApi.getProspects();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setProspects(all);
  };

  const handleFindLeads = async () => {
    if (!location.trim() || !profile) return;
    setSearching(true);
    setError('');
    try {
      const response = await fetch('/api/find-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, prospectType: type, count: 8 })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const leads = (data.leads || []) as any[];
      for (const lead of leads) {
        const prospect: Prospect = {
          id: genId('prospect'),
          assignedRepId: profile.id,
          type,
          businessName: lead.businessName || 'Unknown Business',
          contactName: lead.contactName || undefined,
          phone: lead.phone || undefined,
          email: lead.email || undefined,
          address: lead.address || undefined,
          website: lead.website || undefined,
          reasonFlagged: lead.reasonFlagged || undefined,
          status: 'New',
          source: 'AI',
          createdAt: new Date().toISOString()
        };
        await dbApi.saveProspect(prospect);
      }
      await loadProspects();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to find leads. Try a different location.');
    } finally {
      setSearching(false);
    }
  };

  const handleDraftOutreach = async (p: Prospect) => {
    setDrafting(p.id);
    try {
      const scripts = await dbApi.getScripts();
      const relevantScript = scripts.find(s => s.category === (p.type === 'Restaurant' ? 'Restaurant' : 'Sponsor')) || scripts[0];
      const response = await fetch('/api/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptContent: relevantScript?.content || 'Write a short, friendly cold outreach message introducing our free community spotlight board program.',
          restaurantName: p.businessName,
          contactName: p.contactName,
          sponsorName: p.businessName
        })
      });
      const data = await response.json();
      if (data.draft && p.email) {
        const subject = encodeURIComponent(`Quick question for ${p.businessName}`);
        const body = encodeURIComponent(data.draft);
        window.location.href = `mailto:${p.email}?subject=${subject}&body=${body}`;
        await dbApi.saveProspect({ ...p, status: 'Contacted', lastContactedAt: new Date().toISOString() });
        await loadProspects();
      } else if (!p.email) {
        alert('This lead has no email on file — try calling instead.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to draft outreach message.');
    } finally {
      setDrafting(null);
    }
  };

  const handleConvertToBoard = async (p: Prospect) => {
    if (p.type !== 'Restaurant' || !profile) return;
    const board: Board = {
      id: genId('board'),
      createdAt: new Date().toISOString(),
      assignedRepId: profile.id,
      restaurantName: p.businessName,
      restaurantContactName: p.contactName || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      notes: p.reasonFlagged || '',
      status: 'Restaurant Prospect'
    };
    await dbApi.saveBoard(board);
    await dbApi.saveProspect({ ...p, status: 'Converted', convertedBoardId: board.id });
    navigate(`/boards/${board.id}`);
  };

  const handleDismiss = async (p: Prospect) => {
    await dbApi.deleteProspect(p.id);
    setProspects(prev => prev.filter(x => x.id !== p.id));
  };

  const activeProspects = prospects.filter(p => p.status !== 'Converted' && p.status !== 'Not Interested');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Prospects</h1>
      <p className="text-gray-400 mb-6">Let AI find real, current local leads — restaurants for new boards, or businesses to sponsor a spot.</p>

      <div className="bg-[#112240] p-5 rounded-2xl border border-[#233554] mb-8">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setType('Restaurant')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${type === 'Restaurant' ? 'bg-[#FFC107] text-[#0A192F]' : 'bg-[#0A192F] text-gray-400 border border-[#233554]'}`}
          >
            Restaurant Leads
          </button>
          <button
            onClick={() => setType('Sponsor')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${type === 'Sponsor' ? 'bg-[#FFC107] text-[#0A192F]' : 'bg-[#0A192F] text-gray-400 border border-[#233554]'}`}
          >
            Sponsor Leads
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-[#0A192F] border border-[#233554] rounded-xl px-3">
            <MapPin className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or neighborhood, e.g. Salt Lake City, UT"
              className="bg-transparent py-2.5 text-white placeholder-gray-500 outline-none w-full text-sm"
            />
          </div>
          <button
            onClick={handleFindLeads}
            disabled={searching || !location.trim()}
            className="bg-[#FFC107] hover:bg-[#ffcd38] disabled:opacity-50 text-[#0A192F] px-4 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Find Leads
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {activeProspects.length === 0 ? (
        <div className="bg-[#112240] p-8 rounded-2xl border border-[#233554] text-center text-gray-400">
          No prospects yet. Search a location above to have AI find some.
        </div>
      ) : (
        <div className="space-y-3">
          {activeProspects.map(p => (
            <div key={p.id} className="bg-[#112240] p-5 rounded-2xl border border-[#233554]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.businessName}</h3>
                  {p.contactName && <p className="text-sm text-gray-400">{p.contactName}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${p.type === 'Restaurant' ? 'bg-[#FFC107]/20 text-[#FFC107]' : 'bg-blue-500/20 text-blue-400'}`}>
                  {p.type}
                </span>
              </div>

              {p.reasonFlagged && (
                <p className="text-xs text-emerald-400 italic mb-3">✦ {p.reasonFlagged}</p>
              )}

              {p.address && <p className="text-xs text-gray-500 mb-3">{p.address}</p>}

              <div className="flex gap-2 flex-wrap">
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex-1 min-w-[100px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 py-2 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-emerald-500/20">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
                <button
                  onClick={() => handleDraftOutreach(p)}
                  disabled={!p.email || drafting === p.id}
                  className="flex-1 min-w-[100px] bg-blue-500/10 text-blue-400 border border-blue-500/50 py-2 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-blue-500/20 disabled:opacity-40"
                >
                  {drafting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Email
                </button>
                {p.type === 'Restaurant' && (
                  <button
                    onClick={() => handleConvertToBoard(p)}
                    className="flex-1 min-w-[100px] bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/50 py-2 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-[#FFC107]/20"
                  >
                    <ArrowRightCircle className="w-4 h-4" /> Convert
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(p)}
                  className="bg-gray-500/10 text-gray-500 border border-gray-500/50 py-2 px-3 rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
