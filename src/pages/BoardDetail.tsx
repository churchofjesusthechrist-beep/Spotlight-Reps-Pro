import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbApi } from '../lib/db';
import { Board, Referral, Sponsor, BoardStatus, Script } from '../lib/types';
import { ChevronLeft, CheckCircle2, Phone, Save, Edit3, ArrowRight, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { SponsorBoard } from '../components/SponsorBoard';
import { ScriptsModal } from '../components/ScriptsModal';

const WORKFLOW_STAGES = [
  'Restaurant Prospect',
  'Restaurant Accepted',
  'Collecting Referrals',
  'Selling Sponsors',
  'Ready to Order',
  'Ordered',
  'Delivered',
  'Renewal'
];

export const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (boardId: string) => {
    const b = await dbApi.getBoard(boardId);
    if (!b) return navigate('/');
    setBoard(b);
    
    // Also load referrals and sponsors
    setReferrals(await dbApi.getReferralsForBoard(boardId));
    setSponsors(await dbApi.getSponsorsForBoard(boardId));
    setScripts(await dbApi.getScripts());
  };

  const updateBoardStatus = async (newStatus: BoardStatus) => {
    if (!board) return;
    const updated = { ...board, status: newStatus };
    await dbApi.saveBoard(updated);
    setBoard(updated);
  };

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;
    const formData = new FormData(e.currentTarget);
    const updated: Board = {
      ...board,
      restaurantName: formData.get('restaurantName') as string,
      restaurantContactName: formData.get('restaurantContactName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };
    await dbApi.saveBoard(updated);
    setBoard(updated);
    setIsEditingContact(false);
  };

  const handleAddReferral = async () => {
    if (!board) return;
    const ref = prompt('Enter Business Name:');
    if (!ref) return;
    
    const newRef: Referral = {
      id: crypto.randomUUID(),
      boardId: board.id,
      businessName: ref,
      contactName: '',
      phone: '',
      email: '',
      businessType: '',
      relationship: '',
      notes: '',
      createdAt: new Date().toISOString()
    };
    await dbApi.saveReferral(newRef);
    setReferrals([...referrals, newRef]);
  };

  if (!board) return <div className="p-8 text-white">Loading...</div>;

  const currentStageIndex = WORKFLOW_STAGES.indexOf(board.status);

  return (
    <div className="pb-32">
      <header className="bg-[#112240] border-b border-[#233554] p-4 pt-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            <button onClick={() => navigate(-1)} className="p-2 mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition flex-shrink-0">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-xl font-bold text-white truncate">{board.restaurantName}</h1>
              <p className="text-sm text-[#FFC107] font-medium truncate">{board.status}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowScriptsModal(true)}
            className="flex items-center gap-1.5 bg-[#233554] hover:bg-[#2a4066] text-white px-3 py-1.5 rounded-lg text-sm font-bold transition flex-shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Scripts
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto mt-4 mb-2 flex justify-end">
          <button 
            onClick={() => navigate(`/boards/${board.id}/wizard`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Open AI Campaign Wizard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="h-2 bg-[#0A192F] rounded-full overflow-hidden flex">
            {WORKFLOW_STAGES.map((stage, idx) => (
              <div 
                key={stage} 
                className={clsx(
                  "h-full flex-1 border-r border-[#112240] last:border-0",
                  idx <= currentStageIndex ? "bg-[#FFC107]" : "bg-transparent"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        
        {/* Contact Info Card */}
        <div className="bg-[#112240] rounded-2xl border border-[#233554] overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-[#233554]/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Restaurant Details
            </h2>
            <button 
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="text-[#FFC107] p-2 hover:bg-[#FFC107]/10 rounded-lg transition"
            >
              {isEditingContact ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="p-4">
            {isEditingContact ? (
              <form id="contactForm" onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Restaurant Name</label>
                  <input name="restaurantName" defaultValue={board.restaurantName} className="w-full bg-[#0A192F] border border-[#233554] rounded-lg p-2 text-white focus:border-[#FFC107] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contact Name</label>
                  <input name="restaurantContactName" defaultValue={board.restaurantContactName} className="w-full bg-[#0A192F] border border-[#233554] rounded-lg p-2 text-white focus:border-[#FFC107] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input name="phone" defaultValue={board.phone} className="w-full bg-[#0A192F] border border-[#233554] rounded-lg p-2 text-white focus:border-[#FFC107] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Address</label>
                  <input name="address" defaultValue={board.address} className="w-full bg-[#0A192F] border border-[#233554] rounded-lg p-2 text-white focus:border-[#FFC107] outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#FFC107] text-[#0A192F] font-bold py-3 rounded-lg mt-2 transition-colors hover:bg-[#ffcd38]">Save Details</button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Contact</p>
                  <p className="text-white font-medium">{board.restaurantContactName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  {board.phone ? (
                    <a href={`tel:${board.phone}`} className="text-blue-400 font-medium hover:underline">{board.phone}</a>
                  ) : (
                    <p className="text-white font-medium">Not set</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-white font-medium">{board.address || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Workflow Area - What to do next */}
        <div className="bg-gradient-to-br from-[#1a2c4e] to-[#112240] rounded-2xl border border-[#FFC107]/30 p-5 shadow-lg shadow-[#FFC107]/5">
          <h2 className="text-sm font-bold text-[#FFC107] uppercase tracking-wider mb-2">Next Action</h2>
          
          {board.status === 'Restaurant Prospect' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Pitch the Spotlight Board</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Contact the restaurant and offer them a completely free Local Spotlight Board to display their daily specials. 
                Explain that local businesses sponsor the board.
              </p>
              
              <div className="bg-[#0A192F] p-4 rounded-xl border border-[#233554] mb-6">
                <p className="text-sm text-gray-300 italic">
                  "Hi [Name], we're setting up free Local Spotlight Boards for popular restaurants in the area to help feature local businesses and showcase your daily specials. There is no cost to you. Can I show you a mockup?"
                </p>
              </div>
              
              <button 
                onClick={() => updateBoardStatus('Restaurant Accepted')}
                className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffcd38] transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark as Accepted
              </button>
            </>
          )}

          {board.status === 'Restaurant Accepted' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Collect 12 Warm Referrals</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                The restaurant accepted! Now ask them who they recommend or do business with to fill the 6 sponsor spots. 
                Get 12 names so you have plenty to call.
              </p>
              
              <button 
                onClick={() => updateBoardStatus('Collecting Referrals')}
                className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffcd38] transition-colors"
              >
                Begin Collecting Referrals <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}

          {board.status === 'Collecting Referrals' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Add Referrals ({referrals.length}/12)</h3>
              <p className="text-gray-300 text-sm mb-6">
                Add businesses the restaurant recommended. These are warm leads.
              </p>
              
              <div className="bg-[#0A192F] rounded-xl border border-[#233554] mb-4 overflow-hidden">
                {referrals.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">No referrals added yet.</p>
                ) : (
                  <div className="divide-y divide-[#233554]">
                    {referrals.map(r => (
                      <div key={r.id} className="p-3">
                        <p className="font-bold text-white text-sm">{r.businessName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={handleAddReferral}
                  className="flex-1 bg-gray-700 font-bold text-white py-3 rounded-xl hover:bg-gray-600 transition"
                >
                  + Add Referral
                </button>
              </div>

              <button 
                onClick={() => updateBoardStatus('Selling Sponsors')}
                className="w-full border-2 border-[#FFC107] text-[#FFC107] font-bold text-lg py-3 rounded-xl hover:bg-[#FFC107]/10 transition-colors"
              >
                Proceed to Selling Sponsors
              </button>
            </>
          )}

          {board.status === 'Selling Sponsors' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Fill 6 Sponsor Spots</h3>
              <p className="text-gray-300 text-sm mb-6">
                Call the referrals and sell the $600 annual sponsorships. Once 6 are paid, the board is ready to order.
              </p>
              
              <SponsorBoard 
                sponsors={sponsors} 
                onSlotClick={(spot) => {
                  const s = sponsors.find(sp => sp.spotNumber === spot);
                  if (s) {
                    // Quick simulation of marking paid
                    const updated = { ...s, paymentStatus: 'Paid' as const, status: 'Paid' as const };
                    dbApi.saveSponsor(updated).then(() => {
                      setSponsors(prev => prev.map(p => p.id === s.id ? updated : p));
                    });
                  } else {
                    // Create new
                    const name = prompt(`Enter business name for Sponsor Spot ${spot}:`);
                    if (name) {
                      const sp: Sponsor = {
                        id: crypto.randomUUID(),
                        boardId: board.id,
                        businessName: name,
                        contactName: '',
                        phone: '',
                        email: '',
                        referralSource: '',
                        spotNumber: spot,
                        annualPrice: 600,
                        status: 'Interested',
                        paymentStatus: 'Invoice Not Sent',
                        notes: '',
                        createdAt: new Date().toISOString()
                      };
                      dbApi.saveSponsor(sp).then(() => {
                        setSponsors([...sponsors, sp]);
                      });
                    }
                  }
                }} 
              />
              
              <button 
                onClick={() => {
                  if (sponsors.filter(s => s.paymentStatus === 'Paid').length >= 6) {
                    updateBoardStatus('Ready to Order');
                  } else {
                    alert('You need 6 paid sponsors to proceed.');
                  }
                }}
                className={clsx(
                  "w-full font-bold text-lg py-3 rounded-xl border-2 transition-colors",
                  sponsors.filter(s => s.paymentStatus === 'Paid').length >= 6 
                    ? "border-[#FFC107] bg-[#FFC107] text-[#0A192F] hover:bg-[#ffcd38]"
                    : "border-gray-600 text-gray-500 cursor-not-allowed"
                )}
              >
                Complete Sales Phase
              </button>
            </>
          )}

          {board.status === 'Ready to Order' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                🎉 BOARD FULL
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                6 sponsors have paid. You collected $3,600. It's time to order the board from the printer.
              </p>
              
              <button 
                onClick={() => updateBoardStatus('Ordered')}
                className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffcd38] transition-colors"
              >
                Begin Board Order
              </button>
            </>
          )}

          {board.status === 'Ordered' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Board is Ordered</h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Track the shipment. Once it arrives, deliver it to the restaurant.
              </p>
              
              <button 
                onClick={() => updateBoardStatus('Delivered')}
                className="w-full bg-[#FFC107] text-[#0A192F] font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffcd38] transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark as Delivered
              </button>
            </>
          )}

          {board.status === 'Delivered' && (
            <>
              <h3 className="text-xl font-bold text-white mb-3">Mission Complete</h3>
              <p className="text-emerald-400 text-sm mb-6 font-medium">
                The board is live. Renewals will be tracked automatically.
              </p>
            </>
          )}

        </div>
      </div>

      <ScriptsModal 
        isOpen={showScriptsModal} 
        onClose={() => setShowScriptsModal(false)}
        scripts={scripts}
        restaurantName={board.restaurantName}
        restaurantContact={board.restaurantContactName}
      />
    </div>
  );
};
