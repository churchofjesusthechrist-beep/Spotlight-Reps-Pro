import React, { useState } from 'react';
import { Script } from '../lib/types';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface ScriptCardProps {
  script: Script;
  restaurantName?: string;
  restaurantContact?: string;
  sponsorName?: string;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({ 
  script, 
  restaurantName = '[Restaurant Name]', 
  restaurantContact = '[Restaurant Contact]',
  sponsorName = '[Name]'
}) => {
  const [copied, setCopied] = useState(false);

  // Replace placeholders dynamically
  const firstName = restaurantContact && restaurantContact !== '[Restaurant Contact]'
    ? restaurantContact.split(' ')[0]
    : '[First Name]';

  let displayContent = script.content
    .replace(/\[Name\]/gi, sponsorName)
    .replace(/\[First Name\]/gi, firstName)
    .replace(/\[Contact Name\]/gi, firstName)
    .replace(/\[Restaurant Name\]/gi, restaurantName)
    .replace(/\[Restaurant Contact\]/gi, restaurantContact)
    .replace(/\[Restaurant Contact \/ Restaurant Name\]/gi, `${restaurantContact} at ${restaurantName}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="bg-[#0A192F] p-5 rounded-2xl border border-[#233554] flex flex-col h-full shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[#FFC107] font-bold text-sm tracking-wide uppercase">{script.title}</h4>
      </div>
      
      <div className="flex-1">
        <p className="text-white text-lg leading-relaxed italic mb-4">
          "{displayContent}"
        </p>
      </div>

      <button
        onClick={handleCopy}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors",
          copied 
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
            : "bg-[#112240] text-gray-300 border border-[#233554] hover:bg-[#1a2c4e] hover:text-white"
        )}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            Copy Script
          </>
        )}
      </button>
    </div>
  );
};
