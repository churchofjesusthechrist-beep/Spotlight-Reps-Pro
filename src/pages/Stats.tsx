import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { Board, Sponsor } from '../lib/types';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export const Stats = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const b = await dbApi.getBoards();
    setBoards(b);
    
    let allSponsors: Sponsor[] = [];
    for (const board of b) {
      const s = await dbApi.getSponsorsForBoard(board.id);
      allSponsors = [...allSponsors, ...s];
    }
    setSponsors(allSponsors);
  };

  const revenueSold = sponsors.filter(s => s.paymentStatus === 'Paid').reduce((sum, s) => sum + s.annualPrice, 0);
  const boardsCompleted = boards.filter(b => b.status === 'Ordered' || b.status === 'Delivered').length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Performance Stats</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#112240] p-5 rounded-2xl border border-[#233554] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">{boards.length}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Boards Started</p>
        </div>
        
        <div className="bg-[#112240] p-5 rounded-2xl border border-[#233554] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">{boardsCompleted}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Boards Completed</p>
        </div>

        <div className="bg-[#112240] p-5 rounded-2xl border border-[#233554] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">{sponsors.filter(s => s.paymentStatus === 'Paid').length}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Sponsors Paid</p>
        </div>

        <div className="bg-[#112240] p-5 rounded-2xl border border-[#233554] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-white">${revenueSold.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Revenue Collected</p>
        </div>
      </div>

      <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554]">
        <h2 className="text-lg font-bold text-white mb-4">Board Economics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#233554] pb-3">
            <span className="text-gray-400">Total Contracted Revenue</span>
            <span className="text-white font-bold">${(sponsors.length * 600).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#233554] pb-3">
            <span className="text-gray-400">Outstanding Balance</span>
            <span className="text-[#FFC107] font-bold">${((sponsors.length * 600) - revenueSold).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-400">Avg Sponsors / Board</span>
            <span className="text-white font-bold">
              {boards.length ? (sponsors.length / boards.length).toFixed(1) : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
