import React from 'react';
import { Script } from '../lib/types';
import { ScriptCard } from './ScriptCard';
import { X } from 'lucide-react';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: Script[];
  restaurantName?: string;
  restaurantContact?: string;
  sponsorName?: string;
}

export const ScriptsModal: React.FC<ScriptsModalProps> = ({ 
  isOpen, 
  onClose, 
  scripts,
  restaurantName,
  restaurantContact,
  sponsorName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A192F]">
      <div className="flex items-center justify-between p-4 border-b border-[#233554] bg-[#112240] safe-area-pt">
        <h2 className="text-xl font-bold text-white">Script Library</h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <p className="text-gray-400 mb-2">Tap any script to copy it to your clipboard.</p>
        
        {scripts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No scripts available.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {scripts.map(script => (
              <ScriptCard 
                key={script.id} 
                script={script} 
                restaurantName={restaurantName}
                restaurantContact={restaurantContact}
                sponsorName={sponsorName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
