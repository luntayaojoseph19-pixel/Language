import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  UserProfile, 
  Badge, 
  PracticeHistoryItem,
  UserMistake
} from '../types';
import { languages as initialLanguages, defaultLanguage } from '../data/languages';
import { allBadges } from '../data/badges';
import { sound } from '../utils/audio';

const STORAGE_KEY = 'linguapulse_user_profile_v3';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const defaultProfile: UserProfile = {
  selectedLanguageId: defaultLanguage.id,
  userSkillLevel: 'Beginner',
  streak: 1,
  highestStreak: 1,
  lastActiveDate: getTodayKey(),
  totalXp: 65,
  level: 1,
  todayXp: 25,
  dailyGoalXp: 50,
  gems: 140,
  voiceScores: [92, 88],
  totalPracticeMinutes: 18,
  completedLessonsCount: 2,
  userMistakes: [
    {
      id: 'm-init-1',
      languageId: 'es',
      phrase: 'Por favor, la cuenta',
      translation: 'Please, the bill',
      mistakeType: 'pronunciation',
      accuracy: 68,
      date: getTodayKey(),
      context: 'Stressed syllable on cu-EN-ta'
    },
    {
      id: 'm-init-2',
      languageId: 'es',
      phrase: '¿Dónde está el baño?',
      translation: 'Where is the restroom?',
      mistakeType: 'grammar',
      accuracy: 72,
      date: getTodayKey(),
      context: 'Use "está" for location, not "es"'
    }
  ],
  masteredWords: [
    { id: 'm-1', word: 'Buenos días', translation: 'Good morning', languageId: 'es', masteryLevel: 5, lastPracticed: getTodayKey() },
    { id: 'm-2', word: 'Muchas gracias', translation: 'Thank you very much', languageId: 'es', masteryLevel: 4, lastPracticed: getTodayKey() }
  ],
  languageStats: {
    es: {
      languageId: 'es',
      languageName: 'Spanish',
      lessonsCompleted: 2,
      voicePractices: 4,
      wordsMastered: 2,
      totalXp: 65,
      avgAccuracy: 90
    }
  },
  practiceHistory: [
    {
      id: 'init-ph-1',
      type: 'voice',
      title: '¡Hola! Mucho gusto en conocerte.',
      languageId: 'es',
      languageName: 'Spanish',
      score: 92,
      xpEarned: 15,
      date: new Date(Date.now() - 3600000).toISOString(),
      formattedDate: 'Today, 1 hour ago',
      details: 'Accuracy: 92% • Fluency: 90%'
    },
    {
      id: 'init-ph-2',
      type: 'voice',
      title: 'Buenos días, ¿cómo estás?',
      languageId: 'es',
      languageName: 'Spanish',
      score: 88,
      xpEarned: 15,
      date: new Date(Date.now() - 7200000).toISOString(),
      formattedDate: 'Today, 2 hours ago',
      details: 'Accuracy: 88% • Clear pronunciation'
    }
  ],
  activityHistory: {
    [getTodayKey()]: 25,
    [getYesterdayKey()]: 40
  }
};

interface UserContextType {
  profile: UserProfile;
  currentLanguage: Language;
  languages: Language[];
  setLanguage: (id: string) => void;
  addLanguageCustom: (lang: Language) => void;
  addXp: (amount: number) => void;
  recordVoicePractice: (title: string, score: number, xp: number, details?: string) => void;
  recordQuizCompleted: (score: number, xp: number) => void;
  recordSentencePractice: (sentence: string, score: number, xp: number) => void;
  recordTutorConversation: (topic: string, count: number, xp: number) => void;
  recordLessonCompleted: (lessonId: string, xp: number, minutes?: number) => void;
  recordMistake: (phrase: string, mistakeType: 'pronunciation' | 'vocabulary' | 'grammar' | 'listening', accuracy?: number, translation?: string, context?: string) => void;
  clearMistake: (id: string) => void;
  setUserSkillLevel: (level: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  setDailyGoalXp: (goal: number) => void;
  resetProgress: () => void;
  allBadges: Badge[];
  dailyQuests: { id: string; title: string; current: number; goal: number; completed: boolean; xpReward: number }[];
  streakDays: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languagesList, setLanguagesList] = useState<Language[]>(() => {
    try {
      const saved = localStorage.getItem('linguapulse_custom_langs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...initialLanguages, ...parsed];
      }
    } catch {}
    return initialLanguages;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getTodayKey();
        const yesterday = getYesterdayKey();
        if (parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
          parsed.streak = 1;
        }
        if (parsed.lastActiveDate !== today) {
          parsed.todayXp = 0;
        }
        if (!parsed.totalPracticeMinutes) parsed.totalPracticeMinutes = 18;
        if (!parsed.completedLessonsCount) parsed.completedLessonsCount = 2;
        if (!parsed.userMistakes) parsed.userMistakes = defaultProfile.userMistakes;
        return parsed;
      }
    } catch {}
    return defaultProfile;
  });

  // Background active session timer: adds 1 minute of practice every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      setProfile(prev => ({
        ...prev,
        totalPracticeMinutes: (prev.totalPracticeMinutes || 0) + 1
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const currentLanguage = languagesList.find(l => l.id === profile.selectedLanguageId) || defaultLanguage;

  const setLanguage = (id: string) => {
    sound.playClick();
    setProfile(prev => {
      const existingStat = prev.languageStats[id] || {
        languageId: id,
        languageName: languagesList.find(l => l.id === id)?.name || id,
        lessonsCompleted: 0,
        voicePractices: 0,
        wordsMastered: 0,
        totalXp: 0,
        avgAccuracy: 88
      };
      return {
        ...prev,
        selectedLanguageId: id,
        languageStats: {
          ...prev.languageStats,
          [id]: existingStat
        }
      };
    });
  };

  const addLanguageCustom = (lang: Language) => {
    sound.playCorrect();
    setLanguagesList(prev => {
      const updated = [...prev, lang];
      try {
        const customOnly = updated.filter(l => !initialLanguages.some(il => il.id === l.id));
        localStorage.setItem('linguapulse_custom_langs', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
    setLanguage(lang.id);
  };

  const addXp = (amount: number) => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    setProfile(prev => {
      const newTotal = prev.totalXp + amount;
      const newToday = (prev.lastActiveDate === today ? prev.todayXp : 0) + amount;
      const oldLevel = prev.level;
      const newLevel = Math.floor(newTotal / 100) + 1;

      if (newLevel > oldLevel) {
        sound.playLevelUp();
      }

      let streak = prev.streak;
      if (prev.lastActiveDate === yesterday) {
        streak += 1;
        sound.playStreak();
      } else if (prev.lastActiveDate !== today) {
        streak = 1;
      }

      const langStat = prev.languageStats[prev.selectedLanguageId] || {
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        lessonsCompleted: 0,
        voicePractices: 0,
        wordsMastered: 0,
        totalXp: 0,
        avgAccuracy: 88
      };

      return {
        ...prev,
        totalXp: newTotal,
        todayXp: newToday,
        level: newLevel,
        streak,
        highestStreak: Math.max(streak, prev.highestStreak),
        lastActiveDate: today,
        gems: prev.gems + Math.ceil(amount / 5),
        activityHistory: {
          ...prev.activityHistory,
          [today]: (prev.activityHistory[today] || 0) + amount
        },
        languageStats: {
          ...prev.languageStats,
          [prev.selectedLanguageId]: {
            ...langStat,
            totalXp: langStat.totalXp + amount
          }
        }
      };
    });
  };

  const recordVoicePractice = (title: string, score: number, xp: number, details?: string) => {
    addXp(xp);
    setProfile(prev => {
      const item: PracticeHistoryItem = {
        id: `voice-${Date.now()}`,
        type: 'voice',
        title,
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        score,
        xpEarned: xp,
        date: new Date().toISOString(),
        formattedDate: 'Just now',
        details: details || `Score: ${score}% • Voice recognition match`
      };

      const langStat = prev.languageStats[prev.selectedLanguageId] || {
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        lessonsCompleted: 0,
        voicePractices: 0,
        wordsMastered: 0,
        totalXp: 0,
        avgAccuracy: score
      };

      const totalPractices = langStat.voicePractices + 1;
      const newAvg = Math.round((langStat.avgAccuracy * langStat.voicePractices + score) / totalPractices);

      return {
        ...prev,
        voiceScores: [score, ...prev.voiceScores.slice(0, 19)],
        practiceHistory: [item, ...prev.practiceHistory.slice(0, 49)],
        languageStats: {
          ...prev.languageStats,
          [prev.selectedLanguageId]: {
            ...langStat,
            voicePractices: totalPractices,
            avgAccuracy: newAvg
          }
        }
      };
    });
  };

  const recordLessonCompleted = (lessonId: string, xp: number, minutes: number = 3) => {
    addXp(xp);
    setProfile(prev => {
      const item: PracticeHistoryItem = {
        id: `lesson-${Date.now()}`,
        type: 'lesson',
        title: `Lesson: ${lessonId}`,
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        score: 100,
        xpEarned: xp,
        date: new Date().toISOString(),
        formattedDate: 'Just now',
        details: `Micro-lesson completed • ${minutes}m study time`
      };

      const langStat = prev.languageStats[prev.selectedLanguageId] || {
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        lessonsCompleted: 0,
        voicePractices: 0,
        wordsMastered: 0,
        totalXp: 0,
        avgAccuracy: 90
      };

      return {
        ...prev,
        completedLessonsCount: (prev.completedLessonsCount || 0) + 1,
        totalPracticeMinutes: (prev.totalPracticeMinutes || 0) + minutes,
        practiceHistory: [item, ...prev.practiceHistory.slice(0, 49)],
        languageStats: {
          ...prev.languageStats,
          [prev.selectedLanguageId]: {
            ...langStat,
            lessonsCompleted: langStat.lessonsCompleted + 1
          }
        }
      };
    });
  };

  const recordQuizCompleted = (score: number, xp: number) => {
    addXp(xp);
    setProfile(prev => {
      const item: PracticeHistoryItem = {
        id: `quiz-${Date.now()}`,
        type: 'quiz',
        title: `10k Vocabulary Speed Quiz`,
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        score,
        xpEarned: xp,
        date: new Date().toISOString(),
        formattedDate: 'Just now',
        details: `Final Score: ${score} points`
      };
      return {
        ...prev,
        practiceHistory: [item, ...prev.practiceHistory.slice(0, 49)]
      };
    });
  };

  const recordSentencePractice = (sentence: string, score: number, xp: number) => {
    addXp(xp);
    setProfile(prev => {
      const item: PracticeHistoryItem = {
        id: `sent-${Date.now()}`,
        type: 'sentence',
        title: sentence,
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        score,
        xpEarned: xp,
        date: new Date().toISOString(),
        formattedDate: 'Just now',
        details: 'Ear-only listening challenge'
      };
      return {
        ...prev,
        practiceHistory: [item, ...prev.practiceHistory.slice(0, 49)]
      };
    });
  };

  const recordTutorConversation = (topic: string, count: number, xp: number) => {
    addXp(xp);
    setProfile(prev => {
      const item: PracticeHistoryItem = {
        id: `tutor-${Date.now()}`,
        type: 'tutor',
        title: topic,
        languageId: prev.selectedLanguageId,
        languageName: currentLanguage.name,
        score: 95,
        xpEarned: xp,
        date: new Date().toISOString(),
        formattedDate: 'Just now',
        details: `${count} conversational exchanges`
      };
      return {
        ...prev,
        totalPracticeMinutes: (prev.totalPracticeMinutes || 0) + Math.max(2, Math.floor(count / 2)),
        practiceHistory: [item, ...prev.practiceHistory.slice(0, 49)]
      };
    });
  };

  const recordMistake = (
    phrase: string, 
    mistakeType: 'pronunciation' | 'vocabulary' | 'grammar' | 'listening', 
    accuracy?: number, 
    translation?: string, 
    context?: string
  ) => {
    setProfile(prev => {
      const existing = (prev.userMistakes || []).filter(m => m.phrase !== phrase);
      const newMistake: UserMistake = {
        id: `m-${Date.now()}`,
        languageId: prev.selectedLanguageId,
        phrase,
        translation,
        mistakeType,
        accuracy,
        date: getTodayKey(),
        context
      };
      return {
        ...prev,
        userMistakes: [newMistake, ...existing].slice(0, 20)
      };
    });
  };

  const clearMistake = (id: string) => {
    sound.playClick();
    setProfile(prev => ({
      ...prev,
      userMistakes: (prev.userMistakes || []).filter(m => m.id !== id)
    }));
  };

  const setUserSkillLevel = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    sound.playClick();
    setProfile(prev => ({ ...prev, userSkillLevel: level }));
  };

  const setDailyGoalXp = (goal: number) => {
    sound.playClick();
    setProfile(prev => ({ ...prev, dailyGoalXp: goal }));
  };

  const resetProgress = () => {
    sound.playClick();
    localStorage.removeItem(STORAGE_KEY);
    setProfile(defaultProfile);
  };

  const dailyQuests = [
    {
      id: 'quest-voice',
      title: 'Practice 2 Voice Challenges',
      current: profile.practiceHistory.filter(h => h.type === 'voice' && h.date.startsWith(getTodayKey())).length,
      goal: 2,
      completed: profile.practiceHistory.filter(h => h.type === 'voice' && h.date.startsWith(getTodayKey())).length >= 2,
      xpReward: 25
    },
    {
      id: 'quest-xp',
      title: `Earn ${profile.dailyGoalXp} Daily XP`,
      current: profile.todayXp,
      goal: profile.dailyGoalXp,
      completed: profile.todayXp >= profile.dailyGoalXp,
      xpReward: 30
    },
    {
      id: 'quest-sentence',
      title: 'Test Ear Comprehension in Identify Sentence',
      current: profile.practiceHistory.filter(h => h.type === 'sentence' && h.date.startsWith(getTodayKey())).length,
      goal: 1,
      completed: profile.practiceHistory.filter(h => h.type === 'sentence' && h.date.startsWith(getTodayKey())).length >= 1,
      xpReward: 20
    }
  ];

  return (
    <UserContext.Provider value={{
      profile,
      currentLanguage,
      languages: languagesList,
      setLanguage,
      addLanguageCustom,
      addXp,
      recordVoicePractice,
      recordQuizCompleted,
      recordSentencePractice,
      recordTutorConversation,
      recordLessonCompleted,
      recordMistake,
      clearMistake,
      setUserSkillLevel,
      setDailyGoalXp,
      resetProgress,
      allBadges,
      dailyQuests,
      streakDays: profile.streak
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
