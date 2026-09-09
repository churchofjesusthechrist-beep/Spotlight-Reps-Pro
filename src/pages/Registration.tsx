import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbApi } from '../lib/db';

export const Registration = () => {
  const { user, signIn, refreshProfile } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!phone) return;
    
    try {
      await dbApi.saveProfile({
        id: user.uid,
        fullName: user.displayName || 'Unknown User',
        email: user.email || '',
        phone,
        isAdmin: user.email === 'williamblizzard@gmail.com', // Bootstrap admin
      });
      await refreshProfile();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 safe-area-pt">
      <div className="w-full max-w-md bg-[#112240] rounded-3xl p-8 shadow-2xl border border-[#233554]">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-[#FFC107] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">SB</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">Spotlight Reps</h1>
        <p className="text-center text-[#FFC107] font-medium mb-8">Build Boards. Help Local Businesses. Get Paid.</p>
        
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        {!user ? (
          <div className="space-y-6">
            <p className="text-center text-gray-400">Sign in to manage your boards and sponsors.</p>
            <button
              onClick={handleSignIn}
              className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <p className="text-sm text-gray-400 mb-4 text-center">Welcome, {user.displayName}! Please complete your profile to continue.</p>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107]"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg rounded-xl py-4 mt-4 hover:bg-[#ffcd38] transition-colors"
            >
              Enter Spotlight Portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
