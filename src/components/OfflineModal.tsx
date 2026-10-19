import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Check, 
  Download, 
  Trash2, 
  HardDrive, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { sound } from '../utils/audio';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ isOpen, onClose }) => {
  const { languages, currentLanguage } = useUser();
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>([
    'es', 'ja', 'fr', 'de', 'tl'
  ]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (id: string) => {
    sound.playClick();
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadedPacks(prev => [...prev, id]);
      setDownloadingId(null);
      sound.playCorrect();
    }, 800);
  };

  const handleRemove = (id: string) => {
    sound.playClick();
    setDownloadedPacks(prev => prev.filter(p => p !== id));
  };

  const totalSizeMb = (downloadedPacks.length * 1.8).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e0a23] border border-pink-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-heading">
                Offline Language Packs
              </h3>
              <p className="text-xs text-pink-300/80">
                Downloaded packs work completely offline with zero latency.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-pink-400 hover:text-white text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Storage stats */}
        <div className="py-4 flex items-center justify-between text-xs bg-[#290e2d] px-4 my-3 rounded-2xl border border-pink-500/25">
          <div className="flex items-center gap-2 text-pink-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{downloadedPacks.length} packs installed</span>
          </div>
          <span className="font-mono font-bold text-amber-300">
            {totalSizeMb} MB cached
          </span>
        </div>

        {/* Packs list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {languages.map(lang => {
            const isInstalled = downloadedPacks.includes(lang.id);
            const isDownloading = downloadingId === lang.id;

            return (
              <div
                key={lang.id}
                className="p-3.5 rounded-2xl bg-[#240c29] border border-pink-500/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{lang.name}</h4>
                    <span className="text-[10px] text-pink-300/70">{lang.nativeName} • ~1.8 MB</span>
                  </div>
                </div>

                <div>
                  {isDownloading ? (
                    <span className="text-[11px] font-bold text-pink-400 animate-pulse">
                      Downloading...
                    </span>
                  ) : isInstalled ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                      <button
                        onClick={() => handleRemove(lang.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete cached pack"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(lang.id)}
                      className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/30 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-pink-500/20 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 font-bold text-xs text-white transition shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
