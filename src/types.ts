export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceCode: string;
  family: string;
  greeting: string;
  accentColor: string;
  popularTopics: string[];
}

export type ExerciseType = 
  | 'multiple_choice' 
  | 'sentence_builder' 
  | 'voice_challenge' 
  | 'listening_comprehension';

export interface Exercise {
  id: string;
  type: ExerciseType;
  instructions: string;
  prompt: string;
  targetPhrase: string;
  phoneticSpelling?: string;
  translation: string;
  options?: string[];
  correctIndex?: number;
  scrambledTokens?: string[];
  correctTokens?: string[];
  pronunciationTip?: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  languageId: string;
  title: string;
  nativeTitle: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  estimatedMinutes: number;
  xpReward: number;
  cultureTip?: string;
  grammarTip?: string;
  exercises: Exercise[];
}

export interface VocabularyWord {
  id: string;
  rank: number;
  word: string;
  phonetic: string;
  translation: string;
  partOfSpeech: string;
  languageId: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exampleSentence: string;
  exampleTranslation: string;
  masteryLevel?: number;
}

export interface SentenceChallenge {
  id: string;
  languageId: string;
  targetSentence: string;
  distractors: string[];
  translation: string;
  phonetic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  distinctionTip: string;
  tokens: string[];
  distractorTokens: string[];
  wordsBreakdown?: { word: string; meaning: string; phonetic?: string }[];
}

export interface VoiceExercise {
  id: string;
  languageId: string;
  phrase: string;
  phonetic: string;
  translation: string;
  category: string;
  difficulty: string;
  tip: string;
}

export interface TutorScenario {
  id: string;
  title: string;
  category?: string;
  description?: string;
  prompt: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  translation?: string;
  audioText?: string;
  correction?: string;
  suggestedReplies?: string[];
  timestamp: string;
}

export interface MasteredWord {
  id: string;
  word: string;
  translation: string;
  languageId: string;
  masteryLevel: number;
  lastPracticed: string;
}

export interface PracticeHistoryItem {
  id: string;
  type: 'voice' | 'lesson' | 'quiz' | 'sentence' | 'tutor';
  title: string;
  languageId: string;
  languageName: string;
  score: number;
  xpEarned: number;
  date: string;
  formattedDate: string;
  details: string;
}

export interface LanguageStat {
  languageId: string;
  languageName: string;
  lessonsCompleted: number;
  voicePractices: number;
  wordsMastered: number;
  totalXp: number;
  avgAccuracy: number;
}

export interface UserMistake {
  id: string;
  languageId: string;
  phrase: string;
  translation?: string;
  mistakeType: 'pronunciation' | 'vocabulary' | 'grammar' | 'listening';
  accuracy?: number;
  date: string;
  context?: string;
}

export interface ConversationSessionSummary {
  scenarioTitle: string;
  totalExchanges: number;
  usefulVocabulary: { word: string; translation: string; phonetic?: string }[];
  grammarCorrections: { original: string; corrected: string; explanation: string }[];
  suggestions: string[];
}

export interface UserProfile {
  selectedLanguageId: string;
  userSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  streak: number;
  highestStreak: number;
  lastActiveDate: string;
  totalXp: number;
  level: number;
  todayXp: number;
  dailyGoalXp: number;
  gems: number;
  voiceScores: number[];
  masteredWords: MasteredWord[];
  languageStats: Record<string, LanguageStat>;
  practiceHistory: PracticeHistoryItem[];
  activityHistory: Record<string, number>;
  totalPracticeMinutes: number;
  completedLessonsCount: number;
  userMistakes: UserMistake[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

