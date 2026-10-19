import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  BarChart3, 
  Mic, 
  BookOpen, 
  Search,
  Zap,
  Globe,
  Clock,
  Target,
  SlidersHorizontal,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { sound, speakPhrase } from '../utils/audio';

export const ProgressView: React.FC = () => {
  const { profile, currentLanguage, allBadges, resetProgress, setUserSkillLevel, setDailyGoalXp, clearMistake } = useUser();
  const [wordSearch, setWordSearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'voice' | 'lesson' | 'quiz' | 'sentence'>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  // 28-day activity heatmap
  const today = new Date();
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const xp = profile.activityHistory[dateStr] || 0;
    return {
      date: dateStr,
      dayNumber: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      xp
    };
  });

  const avgAccuracy = profile.voiceScores.length > 0
    ? Math.round(profile.voiceScores.reduce((a, b) => a + b, 0) / profile.voiceScores.length)
    : 90;

  const filteredHistory = profile.practiceHistory.filter(item => 
    historyFilter === 'all' || item.type === historyFilter
  );

  const statsList = Object.values(profile.languageStats || {});

  const dailyGoalPercent = Math.min(100, Math.round((profile.todayXp / profile.dailyGoalXp) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Profile & Goals Dashboard Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#0d1629] via-[#0b1322] to-[#12203a] border border-cyan-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                  Personal Learning Dashboard
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                  Level {profile.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Target: {currentLanguage.name} • {profile.userSkillLevel} Track
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-[#142038] border border-cyan-500/25 text-center">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Total XP</span>
              <span className="text-xl font-black text-amber-300 font-mono">{profile.totalXp}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#142038] border border-cyan-500/25 text-center">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Practice Time</span>
              <span className="text-xl font-black text-teal-300 font-mono flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-teal-400" />
                {profile.totalPracticeMinutes || 18}m
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#142038] border border-cyan-500/25 text-center">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Lessons Done</span>
              <span className="text-xl font-black text-blue-300 font-mono">
                {profile.completedLessonsCount || 2}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-[#142038] border border-cyan-500/25 text-center">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Avg Voice</span>
              <span className="text-xl font-black text-emerald-300 font-mono">{avgAccuracy}%</span>
            </div>
          </div>

        </div>

        {/* Daily Goal & Proficiency Customizer Bar */}
        <div className="mt-6 pt-5 border-t border-cyan-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Daily Goal Selector */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" /> Daily Goal Progress
              </span>
              <span className="text-cyan-300 font-mono font-bold">
                {profile.todayXp} / {profile.dailyGoalXp} XP ({dailyGoalPercent}%)
              </span>
            </div>

            <div className="w-full h-2 bg-[#16233b] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Set daily target:</span>
              <div className="flex items-center gap-1.5">
                {[30, 50, 100].map(goal => (
                  <button
                    key={goal}
                    onClick={() => setDailyGoalXp(goal)}
                    className={`px-2.5 py-0.5 rounded-lg font-mono font-bold transition ${
                      profile.dailyGoalXp === goal
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'bg-[#16233b] text-slate-300 hover:text-white'
                    }`}
                  >
                    {goal} XP
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Proficiency Level Selector */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Proficiency Level
              </span>
              <span className="text-cyan-300 font-bold">
                {profile.userSkillLevel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setUserSkillLevel(lvl)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                    profile.userSkillLevel === lvl
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                      : 'bg-[#16233b] text-slate-300 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Review Focus Areas / Past Mistakes */}
      {profile.userMistakes && profile.userMistakes.length > 0 && (
        <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Personalized Focus Areas (Mistakes Log)</h3>
            </div>
            <span className="text-xs text-slate-400">
              {profile.userMistakes.length} items to reinforce
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.userMistakes.map(m => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[#142038] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.mistakeType === 'pronunciation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      m.mistakeType === 'grammar' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {m.mistakeType}
                    </span>
                    <span className="font-bold text-white text-sm">{m.phrase}</span>
                  </div>
                  {m.context && <p className="text-[11px] text-slate-300">{m.context}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakPhrase(m.phrase, currentLanguage.voiceCode)}
                    className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => clearMistake(m.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                  >
                    Mastered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 28-Day Activity Heatmap */}
      <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">28-Day Practice Heatmap</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Daily Knowledge XP Intensity</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2">
          {heatmapDays.map((day, idx) => {
            let bg = 'bg-[#16233b] border-cyan-500/10 text-slate-500';
            if (day.xp >= 40) bg = 'bg-cyan-500 border-cyan-400 text-white shadow-md shadow-cyan-500/30 font-bold';
            else if (day.xp >= 20) bg = 'bg-cyan-600/80 border-cyan-500 text-white font-semibold';
            else if (day.xp > 0) bg = 'bg-cyan-900/60 border-cyan-500/40 text-cyan-200';

            return (
              <div
                key={idx}
                className={`h-16 rounded-xl border flex flex-col items-center justify-between p-1.5 transition hover:scale-105 ${bg}`}
                title={`${day.date}: ${day.xp} XP`}
              >
                <span className="text-[9px] uppercase">{day.dayName}</span>
                <span className="text-xs font-mono">{day.dayNumber}</span>
                <span className="text-[9px] font-mono">{day.xp > 0 ? `+${day.xp}` : '·'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Badges & Milestones</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {allBadges.length} achievements available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            let unlocked = false;
            if (badge.id === 'first-lesson' && profile.totalXp > 0) unlocked = true;
            if (badge.id === 'streak-3' && profile.highestStreak >= 3) unlocked = true;
            if (badge.id === 'voice-virtuoso' && profile.practiceHistory.filter(h => h.type === 'voice').length >= 10) unlocked = true;
            if (badge.id === 'accent-master' && profile.voiceScores.some(s => s >= 95)) unlocked = true;
            if (badge.id === 'century-xp' && profile.totalXp >= 100) unlocked = true;
            if (badge.id === 'grand-master' && profile.level >= 5) unlocked = true;
            if (badge.id === 'ear-master' && profile.practiceHistory.filter(h => h.type === 'sentence').length >= 5) unlocked = true;
            if (badge.id === 'polyglot-explorer' && statsList.length >= 2) unlocked = true;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                  unlocked
                    ? 'bg-[#142038] border-cyan-500/40 shadow-lg shadow-cyan-950/40'
                    : 'bg-[#0b1220] border-cyan-500/10 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{badge.icon}</span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      badge.tier === 'diamond' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      badge.tier === 'gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      badge.tier === 'silver' ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30' :
                      'bg-orange-700/20 text-orange-300 border border-orange-700/30'
                    }`}>
                      {badge.tier}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-cyan-500/15 mt-3 flex items-center justify-between text-[10px]">
                  <span className={unlocked ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-500'}>
                    {unlocked ? <><CheckCircle2 className="w-3 h-3" /> Unlocked</> : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Breakdown Stats Table */}
      <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-base">World Language Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#142038] text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Language</th>
                <th className="py-2.5 px-4">Voice Practices</th>
                <th className="py-2.5 px-4">Avg Accuracy</th>
                <th className="py-2.5 px-4">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {statsList.map(st => (
                <tr key={st.languageId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{st.languageName}</td>
                  <td className="py-3 px-4 text-slate-200 font-mono">{st.voicePractices}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold font-mono">{st.avgAccuracy}%</td>
                  <td className="py-3 px-4 text-amber-300 font-bold font-mono">+{st.totalXp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice History Log */}
      <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Practice History Log</h3>
          </div>

          <div className="flex items-center gap-1 bg-[#142038] p-1 rounded-xl border border-cyan-500/20 text-xs">
            {(['all', 'voice', 'quiz', 'sentence', 'lesson'] as const).map(f => (
              <button
                key={f}
                onClick={() => {
                  sound.playClick();
                  setHistoryFilter(f as any);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] transition ${
                  historyFilter === f ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredHistory.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#142038] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    {item.type}
                  </span>
                  <span className="font-bold text-white">{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{item.details} • {item.formattedDate}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-300 block">+{item.xpEarned} XP</span>
                <span className="text-[10px] text-emerald-400 font-mono">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Progress */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-rose-300 block">Reset Progress Data</span>
          <span className="text-slate-400 text-[11px]">Clear all local progress history and restart from Level 1.</span>
        </div>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition"
          >
            Reset All
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold transition"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
