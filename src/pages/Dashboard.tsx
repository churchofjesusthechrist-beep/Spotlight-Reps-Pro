import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbApi } from '../lib/db';
import { Board } from '../lib/types';
import { Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const data = await dbApi.getBoards();
    // Sort by most recent
    setBoards(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const createBoard = async () => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      assignedRepId: profile?.id || '',
      restaurantName: 'New Restaurant',
      restaurantContactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'Restaurant Prospect'
    };
    await dbApi.saveBoard(newBoard);
    navigate(`/boards/${newBoard.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Restaurant Prospect': return 'bg-blue-500/20 text-blue-400';
      case 'Restaurant Accepted': return 'bg-emerald-500/20 text-emerald-400';
      case 'Ready to Order': return 'bg-[#FFC107]/20 text-[#FFC107]';
      case 'Delivered': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-4 pt-6 md:p-8 max-w-4xl mx-auto pb-32">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Spotlight Portal</h1>
          <p className="text-gray-400 mt-1">Welcome back, {profile?.fullName.split(' ')[0]}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#112240] border border-[#233554] flex items-center justify-center font-bold text-[#FFC107]">
          {profile?.fullName.charAt(0)}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554]">
          <p className="text-sm text-gray-400 font-medium mb-1">Active Boards</p>
          <p className="text-2xl font-bold text-white">{boards.filter(b => b.status !== 'Delivered').length}</p>
        </div>
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554]">
          <p className="text-sm text-gray-400 font-medium mb-1">Spots Sold</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554]">
          <p className="text-sm text-gray-400 font-medium mb-1">Collected</p>
          <p className="text-2xl font-bold text-emerald-400">$0</p>
        </div>
        <div className="bg-[#112240] p-4 rounded-2xl border border-[#233554]">
          <p className="text-sm text-gray-400 font-medium mb-1">Ready to Order</p>
          <p className="text-2xl font-bold text-[#FFC107]">{boards.filter(b => b.status === 'Ready to Order').length}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Your Boards</h2>
      </div>

      <div className="space-y-4">
        {boards.length === 0 ? (
          <div className="text-center py-12 bg-[#112240] rounded-2xl border border-[#233554]">
            <p className="text-gray-400">No boards created yet.</p>
          </div>
        ) : (
          boards.map(board => (
            <div 
              key={board.id} 
              onClick={() => navigate(`/boards/${board.id}`)}
              className="bg-[#112240] p-5 rounded-2xl border border-[#233554] cursor-pointer hover:bg-[#1a2c4e] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{board.restaurantName}</h3>
                  <p className="text-sm text-gray-400">{board.address || 'Address not added'}</p>
                </div>
                <span className={clsx("px-3 py-1 text-xs font-bold rounded-full", getStatusColor(board.status))}>
                  {board.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-[#233554]/50">
                <div className="text-sm text-gray-300">
                  <span className="font-medium text-gray-400 mr-2">Sponsors:</span> 
                  0 / 6
                </div>
                <div className="flex items-center text-[#FFC107] text-sm font-bold">
                  View Board <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={createBoard}
        className="fixed bottom-20 right-4 md:right-auto md:left-1/2 md:-ml-8 w-16 h-16 bg-[#FFC107] text-[#0A192F] rounded-full shadow-[0_8px_30px_rgba(255,193,7,0.3)] flex items-center justify-center hover:bg-[#ffcd38] transition-colors z-30"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};
