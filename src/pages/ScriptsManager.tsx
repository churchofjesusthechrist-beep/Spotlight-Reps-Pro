import React, { useEffect, useState } from 'react';
import { dbApi } from '../lib/db';
import { Script, ScriptCategory } from '../lib/types';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import clsx from 'clsx';

export const ScriptsManager = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ScriptCategory>('Restaurant');

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    const data = await dbApi.getScripts();
    setScripts(data);
  };

  const handleEdit = (script: Script) => {
    setEditingId(script.id);
    setTitle(script.title);
    setContent(script.content);
    setCategory(script.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('Restaurant');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      await dbApi.deleteScript(id);
      loadScripts();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newScript: Script = {
      id: editingId || crypto.randomUUID(),
      title,
      content,
      category,
      updatedAt: new Date().toISOString()
    };

    await dbApi.saveScript(newScript);
    loadScripts();
    handleCancel();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Script Manager</h1>
      <p className="text-gray-400 mb-8">Customize the outreach and objection scripts used during calls.</p>

      {/* Editor Form */}
      <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] mb-8">
        <h2 className="text-xl font-bold text-white mb-6">
          {editingId ? 'Edit Script' : 'Add New Script'}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107]"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Intro Pitch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select
                className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107] appearance-none"
                value={category}
                onChange={e => setCategory(e.target.value as ScriptCategory)}
              >
                <option value="Restaurant">Restaurant Outreach</option>
                <option value="Sponsor">Sponsor Outreach</option>
                <option value="Objection">Objection Handling</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Script Content</label>
            <p className="text-xs text-gray-500 mb-2">Use placeholders: [First Name], [Restaurant Name], [Restaurant Contact]</p>
            <textarea
              required
              rows={5}
              className="w-full bg-[#0A192F] border border-[#233554] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107] resize-none"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Hi [First Name]..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#FFC107] text-[#0A192F] font-bold text-lg rounded-xl py-3 hover:bg-[#ffcd38] flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingId ? 'Update Script' : 'Save Script'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-700 text-white font-bold text-lg rounded-xl py-3 hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Script List */}
      <div className="space-y-6">
        {(['Restaurant', 'Sponsor', 'Objection', 'Other'] as ScriptCategory[]).map(cat => {
          const catScripts = scripts.filter(s => s.category === cat);
          if (catScripts.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-lg font-bold text-[#FFC107] border-b border-[#233554] pb-2">{cat} Scripts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catScripts.map(script => (
                  <div key={script.id} className="bg-[#112240] p-5 rounded-2xl border border-[#233554] flex flex-col shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{script.title}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(script)} className="p-1.5 text-gray-400 hover:text-[#FFC107] hover:bg-[#FFC107]/10 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(script.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-4 flex-1">"{script.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
