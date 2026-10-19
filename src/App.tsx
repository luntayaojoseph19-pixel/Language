import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Headphones, 
  Mic, 
  MessageSquare, 
  Award,
  Sparkles,
  Heart
} from 'lucide-react';
import { UserProvider, useUser } from './context/UserContext';
import { Header, TabType } from './components/Header';
import { DailyLessonsView } from './components/DailyLessonsView';
import { InfiniteWordsView } from './components/InfiniteWordsView';
import { IdentifySentenceView } from './components/IdentifySentenceView';
import { VoiceLabView } from './components/VoiceLabView';
import { AiTutorView } from './components/AiTutorView';
import { ProgressView } from './components/ProgressView';
import { OfflineModal } from './components/OfflineModal';
import { AddLanguageModal } from './components/AddLanguageModal';
import { sound } from './utils/audio';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [addLangModalOpen, setAddLangModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#130716] text-pink-50 flex flex-col font-sans selection:bg-pink-500/40 selection:text-white">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddLanguage={() => setAddLangModalOpen(true)}
        onOpenOfflineModal={() => setOfflineModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8 relative z-10">
        {activeTab === 'lessons' && (
          <DailyLessonsView
            onOpenInfinite={() => setActiveTab('infinite')}
            onOpenSentences={() => setActiveTab('sentences')}
          />
        )}

        {activeTab === 'infinite' && (
          <InfiniteWordsView
            onOpenSentences={() => setActiveTab('sentences')}
          />
        )}

        {activeTab === 'sentences' && (
          <IdentifySentenceView />
        )}

        {activeTab === 'voicelab' && (
          <VoiceLabView />
        )}

        {activeTab === 'tutor' && (
          <AiTutorView />
        )}

        {activeTab === 'progress' && (
          <ProgressView />
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#160618]/95 backdrop-blur-lg border-t border-pink-500/30 px-1 py-1.5 shadow-2xl flex items-center justify-between overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('lessons');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'lessons'
              ? 'text-pink-300 font-extrabold bg-pink-500/20'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Lessons</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('infinite');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'infinite'
              ? 'text-pink-300 font-extrabold bg-pink-500/20'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">10k Words</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('sentences');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'sentences'
              ? 'text-white font-extrabold bg-gradient-to-tr from-pink-500 to-rose-500 shadow-md shadow-pink-500/40'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <Headphones className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">No Clues</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('voicelab');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'voicelab'
              ? 'text-pink-300 font-extrabold bg-pink-500/20'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <Mic className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Voice Lab</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('tutor');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'tutor'
              ? 'text-pink-300 font-extrabold bg-pink-500/20'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Tutor</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('progress');
          }}
          className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-1.5 rounded-xl transition ${
            activeTab === 'progress'
              ? 'text-pink-300 font-extrabold bg-pink-500/20'
              : 'text-pink-400/60 font-medium hover:text-pink-200'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] leading-tight">Progress</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 py-6 px-4 bg-[#110514] text-center text-xs text-pink-300/60 space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium text-pink-200">
          <span>LinguaPulse: Fast Polyglot & Voice Coach</span>
          <span className="text-pink-400/40">•</span>
          <span>by Joseph Luntayao</span>
        </p>
        <p className="text-[11px] text-pink-400/50">
          Built with Google AI Studio • Micro-lessons, Voice Recognition & 10k Vocabulary Runner
        </p>
      </footer>

      {/* Modals */}
      <OfflineModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
      />

      <AddLanguageModal
        isOpen={addLangModalOpen}
        onClose={() => setAddLangModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainAppContent />
    </UserProvider>
  );
}
