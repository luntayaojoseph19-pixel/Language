import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  Plus, 
  Languages as LangIcon 
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLanguageModal: React.FC<AddLanguageModalProps> = ({ isOpen, onClose }) => {
  const { addLanguageCustom } = useUser();
  const [name, setName] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [flag, setFlag] = useState('🌐');
  const [voiceCode, setVoiceCode] = useState('en-US');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playCorrect();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 10);
    const newLang: Language = {
      id,
      name: name.trim(),
      nativeName: nativeName.trim() || name.trim(),
      flag: flag.trim() || '🌐',
      voiceCode: voiceCode.trim() || 'en-US',
      family: 'World Language',
      greeting: greeting.trim() || `Hello in ${name.trim()}!`,
      accentColor: '#ec4899',
      popularTopics: ['Greetings', 'Travel', 'Daily Conversations', 'Ordering Food']
    };

    addLanguageCustom(newLang);
    setName('');
    setNativeName('');
    setGreeting('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e0a23] border border-pink-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-heading">
                Add Any World Language
              </h3>
              <p className="text-xs text-pink-300/80">
                LinguaPulse dynamically generates lessons and voice exercises.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-white text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-bold text-pink-300 block mb-1">Language Name (English)*</label>
            <input
              type="text"
              required
              placeholder="e.g. Gaelic, Swahili, Esperanto, Ilocano, Norwegian..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#280e2d] border border-pink-500/30 text-white placeholder-pink-400/50 focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-pink-300 block mb-1">Native Script Name</label>
              <input
                type="text"
                placeholder="e.g. Gàidhlig"
                value={nativeName}
                onChange={e => setNativeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#280e2d] border border-pink-500/30 text-white placeholder-pink-400/50 focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="font-bold text-pink-300 block mb-1">Emoji Flag or Icon</label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 🏴󠁧󠁢󠁳󠁣󠁴󠁿 or 🌐"
                value={flag}
                onChange={e => setFlag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#280e2d] border border-pink-500/30 text-white placeholder-pink-400/50 focus:outline-none focus:border-pink-400 text-center text-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-pink-300 block mb-1">Opening Greeting / Hello</label>
            <input
              type="text"
              placeholder="e.g. Halò! Ciamar a tha thu?"
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#280e2d] border border-pink-500/30 text-white placeholder-pink-400/50 focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="font-bold text-pink-300 block mb-1">Voice Code (Speech Synthesis)</label>
            <input
              type="text"
              placeholder="e.g. gd-GB or en-US"
              value={voiceCode}
              onChange={e => setVoiceCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#280e2d] border border-pink-500/30 text-white placeholder-pink-400/50 focus:outline-none focus:border-pink-400 font-mono text-[11px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#260e2a] text-pink-300 hover:text-white transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition shadow-md shadow-pink-500/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add & Start Learning
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
