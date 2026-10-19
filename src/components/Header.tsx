import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  ChevronDown, 
  Search, 
  Plus, 
  Check, 
  BookOpen, 
  Layers, 
  Headphones, 
  Mic, 
  MessageSquare, 
  Award,
  WifiOff,
  Clock,
  SlidersHorizontal,
  Target
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { sound } from '../utils/audio';

export type TabType = 'lessons' | 'infinite' | 'sentences' | 'voicelab' | 'tutor' | 'progress';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddLanguage: () => void;
  onOpenOfflineModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddLanguage,
  onOpenOfflineModal
}) => {
  const { profile, currentLanguage, languages, setLanguage, setUserSkillLevel, setDailyGoalXp } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const xpPercent = Math.min(100, Math.round((profile.todayXp / profile.dailyGoalXp) * 100));

  const navItems = [
    { id: 'lessons' as TabType, label: 'Daily Lessons', icon: BookOpen, badge: null },
    { id: 'infinite' as TabType, label: '10,000 Words', icon: Layers, badge: '10k' },
    { id: 'sentences' as TabType, label: 'Identify Sentence', icon: Headphones, badge: 'No Clues 🎧' },
    { id: 'voicelab' as TabType, label: 'Voice Coach', icon: Mic, badge: 'Live Wave' },
    { id: 'tutor' as TabType, label: 'Real-World Roleplay', icon: MessageSquare, badge: 'AI Chat' },
    { id: 'progress' as TabType, label: 'Dashboard & Mastery', icon: Award, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a1120]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tier */}
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-black text-xl">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
                Lingua<span className="text-cyan-400">Pulse</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-cyan-200/70 -mt-0.5 tracking-wide">
                Fast Polyglot & Voice Coach
              </span>
            </div>
          </div>

          {/* Middle: Language & Proficiency Level Selectors */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setDropdownOpen(!dropdownOpen);
                  setLevelDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131d33] hover:bg-[#1a2744] border border-cyan-500/30 text-xs sm:text-sm font-semibold transition text-slate-100 shadow-sm"
              >
                <span className="text-lg leading-none">{currentLanguage.flag}</span>
                <span className="hidden sm:inline font-medium">{currentLanguage.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-[#0d1627] border border-cyan-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-cyan-500/20">
                    <div className="relative">
                      <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search all languages..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#152037] border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
                    {filteredLanguages.map(l => {
                      const isSelected = l.id === currentLanguage.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => {
                            setLanguage(l.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40'
                              : 'text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{l.flag}</span>
                            <div>
                              <p className="font-semibold text-white">{l.name}</p>
                              <p className="text-[10px] text-cyan-300/70">{l.nativeName}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-cyan-500/20">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setDropdownOpen(false);
                        onOpenAddLanguage();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#142038] hover:bg-[#1a2b4d] text-xs font-semibold text-cyan-300 hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      Add Any World Language
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Proficiency Level Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick();
                  setLevelDropdownOpen(!levelDropdownOpen);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131d33] hover:bg-[#1a2744] border border-cyan-500/25 text-xs font-semibold text-cyan-300 transition"
                title="Choose your proficiency level"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline font-medium text-slate-300">Level:</span>
                <span className="font-bold text-white">{profile.userSkillLevel}</span>
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              </button>

              {levelDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0d1627] border border-cyan-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 border-b border-cyan-500/20">
                    Proficiency Level
                  </div>
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => {
                    const isSelected = profile.userSkillLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          setUserSkillLevel(lvl);
                          setLevelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition mt-1 ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/40'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-white">{lvl}</p>
                          <p className="text-[10px] text-cyan-300/70">
                            {lvl === 'Beginner' ? 'Foundations & Greetings' :
                             lvl === 'Intermediate' ? 'Conversations & Transit' :
                             'Nuanced & Fluent Idioms'}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* User Stats: Streak, Practice Time, XP, Level, Gems */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Streak */}
            <div 
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs sm:text-sm shadow-sm"
              title={`${profile.streak} Day Active Streak!`}
            >
              <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-bounce" />
              <span>{profile.streak}</span>
              <span className="hidden sm:inline text-xs font-medium text-cyan-200/70">days</span>
            </div>

            {/* Total Practice Time */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131d33] border border-cyan-500/20 text-xs font-semibold text-slate-300"
              title={`Total practice time: ${profile.totalPracticeMinutes || 18} minutes`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.totalPracticeMinutes || 18}m</span>
            </div>

            {/* Daily XP progress bar */}
            <div 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131d33] border border-cyan-500/25 text-xs"
              title={`Today's XP: ${profile.todayXp} / ${profile.dailyGoalXp}`}
            >
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col">
                <div className="flex justify-between items-center gap-2 text-[10px] font-bold text-slate-200">
                  <span>{profile.todayXp} XP</span>
                  <span className="text-cyan-400/60">/ {profile.dailyGoalXp}</span>
                </div>
                <div className="w-16 h-1.5 bg-[#090e1a] rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/35 text-blue-200 font-bold text-xs">
              <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-extrabold">Lvl</span>
              <span>{profile.level}</span>
            </div>

            {/* Gems */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-200 font-bold text-xs">
              <span>💎</span>
              <span>{profile.gems}</span>
            </div>

            {/* Offline Content Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenOfflineModal();
              }}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#131d33] hover:bg-[#1a2744] border border-cyan-500/25 text-cyan-300 text-xs font-medium transition"
              title="Manage offline content & downloads"
            >
              <WifiOff className="w-3.5 h-3.5 text-cyan-400" />
              <span>Offline Ready</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 -mb-px scrollbar-none border-t border-cyan-500/20">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                    item.id === 'sentences'
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/30'
                      : 'bg-teal-500/20 text-teal-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
