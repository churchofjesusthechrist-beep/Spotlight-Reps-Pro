import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbApi } from '../lib/db';
import { Download, Upload, Save, Database } from 'lucide-react';

export const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [msg, setMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await dbApi.saveProfile({ ...profile, fullName, email, phone });
    await refreshProfile();
    setMsg('Profile updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleExport = async () => {
    const data = await dbApi.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotlight-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await dbApi.importData(json);
        alert('Data imported successfully! Please reload the app.');
        window.location.reload();
      } catch (err) {
        alert('Error importing data.');
      }
    };
    reader.readAsText(file);
  };

  const generateDemoData = async () => {
    if (!profile) return;
    
    const boardId = crypto.randomUUID();
    await dbApi.saveBoard({
      id: boardId,
      createdAt: new Date().toISOString(),
      assignedRepId: profile.id,
      restaurantName: "Luigi's Italian Kitchen",
      restaurantContactName: "Mario Rossi",
      phone: "555-0199",
      email: "mario@luigis.example.com",
      address: "123 Main St, Springfield",
      notes: "Demo Data",
      status: "Selling Sponsors"
    });

    const sp1 = crypto.randomUUID();
    await dbApi.saveSponsor({
      id: sp1,
      boardId,
      businessName: "Springfield Auto Repair",
      contactName: "Joe Smith",
      phone: "555-0101",
      email: "joe@auto.example.com",
      referralSource: "Mario Rossi",
      spotNumber: 1,
      annualPrice: 600,
      status: "Paid",
      paymentStatus: "Paid",
      notes: "Demo",
      createdAt: new Date().toISOString()
    });

    const sp2 = crypto.randomUUID();
    await dbApi.saveSponsor({
      id: sp2,
      boardId,
      businessName: "Elite Real Estate",
      contactName: "Sarah Jones",
      phone: "555-0102",
      email: "sarah@elite.example.com",
      referralSource: "Mario Rossi",
      spotNumber: 2,
      annualPrice: 600,
      status: "Contacted",
      paymentStatus: "Invoice Not Sent",
      notes: "Call back tomorrow",
      createdAt: new Date().toISOString()
    });

    await dbApi.saveFollowUp({
      id: crypto.randomUUID(),
      boardId,
      sponsorId: sp2,
      dueDate: new Date().toISOString(),
      notes: "Sarah asked to call back today to finalize.",
      completed: false,
      createdAt: new Date().toISOString()
    });

    alert('Demo data added!');
    window.location.href = '/';
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Settings</h1>

      <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107]"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107]"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107]"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg rounded-xl py-3 mt-4 hover:bg-[#ffcd38] flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </button>
          {msg && <p className="text-emerald-400 text-center font-medium mt-2">{msg}</p>}
        </form>
      </div>

      <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Demo Data</h2>
        <p className="text-gray-400 text-sm mb-6">
          Inject sample data to see how the app works.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/scripts'}
            className="w-full bg-[#0A192F] border border-[#233554] text-white font-bold text-lg rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-[#1a2c4e] transition-colors"
          >
            Manage Outreach Scripts
          </button>
          
          <button
            onClick={generateDemoData}
            className="w-full bg-[#0A192F] border border-[#233554] text-white font-bold text-lg rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-[#1a2c4e] transition-colors"
          >
            <Database className="w-5 h-5" />
            Load Demo Data
          </button>
        </div>
      </div>

      <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554]">
        <h2 className="text-xl font-bold text-white mb-2">Data Backup</h2>
        <p className="text-gray-400 text-sm mb-6">
          Export your data to a file so you don't lose your work if you switch devices.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="w-full bg-[#0A192F] border border-[#FFC107] text-[#FFC107] font-bold text-lg rounded-xl py-3 hover:bg-[#FFC107]/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export My Data
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              className="w-full bg-[#0A192F] border border-[#233554] text-white font-bold text-lg rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-[#1a2c4e] transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
