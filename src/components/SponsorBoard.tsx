import React from 'react';
import { Sponsor } from '../lib/types';
import clsx from 'clsx';

interface SponsorBoardProps {
  sponsors: Sponsor[];
  onSlotClick?: (spotNumber: number) => void;
}

export const SponsorBoard: React.FC<SponsorBoardProps> = ({ sponsors, onSlotClick }) => {
  const spots = [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {spots.map(spot => {
        const sponsor = sponsors.find(s => s.spotNumber === spot);
        
        return (
          <div 
            key={spot}
            onClick={() => onSlotClick && onSlotClick(spot)}
            className={clsx(
              "p-3 rounded-xl flex flex-col items-center justify-center min-h-[100px] border cursor-pointer transition-colors",
              sponsor 
                ? sponsor.paymentStatus === 'Paid' 
                  ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20"
                  : "bg-[#FFC107]/10 border-[#FFC107]/50 hover:bg-[#FFC107]/20"
                : "bg-[#0A192F] border-dashed border-[#233554] hover:bg-[#112240]"
            )}
          >
            <span className="text-xs text-gray-500 font-bold mb-1">SPOT {spot}</span>
            {sponsor ? (
              <>
                <span className={clsx(
                  "text-sm font-bold text-center",
                  sponsor.paymentStatus === 'Paid' ? "text-emerald-400" : "text-[#FFC107]"
                )}>
                  {sponsor.businessName}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{sponsor.paymentStatus}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-400">AVAILABLE</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
