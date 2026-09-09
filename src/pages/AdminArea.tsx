import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { Board, RepProfile } from '../lib/types';
import { Users, FileText, LayoutDashboard, TrendingUp, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminArea = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const allBoards = await dbApi.getBoards();
    setBoards(allBoards);
    setLoading(false);
  };

  const totalBoards = boards.length;
  const activeBoards = boards.filter(b => !['Delivered', 'Renewal'].includes(b.status)).length;
  const completedBoards = boards.filter(b => b.status === 'Delivered').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/crm" className="bg-gradient-to-br from-[#112240] to-[#1a2c4e] p-6 rounded-2xl border border-[#233554] shadow-lg hover:border-[#FFC107]/50 transition cursor-pointer flex flex-col items-center justify-center text-center group">
          <div className="bg-[#233554] p-4 rounded-full mb-4 group-hover:bg-[#FFC107] group-hover:text-[#0A192F] transition-colors">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Team CRM</h2>
          <p className="text-sm text-gray-400 mt-2">Track every rep &amp; contact, spot churn risk</p>
        </Link>

        <Link to="/admin/scripts" className="bg-gradient-to-br from-[#112240] to-[#1a2c4e] p-6 rounded-2xl border border-[#233554] shadow-lg hover:border-[#FFC107]/50 transition cursor-pointer flex flex-col items-center justify-center text-center group">
          <div className="bg-[#233554] p-4 rounded-full mb-4 group-hover:bg-[#FFC107] group-hover:text-[#0A192F] transition-colors">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Manage Scripts</h2>
          <p className="text-sm text-gray-400 mt-2">Edit global scripts for all reps</p>
        </Link>
        
        <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-[#FFC107] w-5 h-5" />
            <h2 className="text-gray-400 font-medium">Total Boards</h2>
          </div>
          <p className="text-4xl font-bold text-white">{loading ? '-' : totalBoards}</p>
        </div>

        <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400 w-5 h-5" />
            <h2 className="text-gray-400 font-medium">Active Pipeline</h2>
          </div>
          <p className="text-4xl font-bold text-white">{loading ? '-' : activeBoards}</p>
        </div>

        <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-emerald-400 w-5 h-5" />
            <h2 className="text-gray-400 font-medium">Completed</h2>
          </div>
          <p className="text-4xl font-bold text-white">{loading ? '-' : completedBoards}</p>
        </div>
      </div>
    </div>
  );
};
