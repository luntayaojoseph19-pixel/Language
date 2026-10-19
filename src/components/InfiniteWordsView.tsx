import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Volume2, 
  Play, 
  RotateCw, 
  Zap, 
  Check, 
  Sparkles, 
  Clock, 
  Award, 
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { generate10kWords } from '../data/vocabulary';
import { VocabularyWord } from '../types';
import { sound, speakPhrase } from '../utils/audio';

interface InfiniteWordsViewProps {
  onOpenSentences: () => void;
}

export const InfiniteWordsView: React.FC<InfiniteWordsViewProps> = ({
  onOpenSentences
}) => {
  const { currentLanguage, recordQuizCompleted, addXp } = useUser();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [activeMode, setActiveMode] = useState<'runner' | 'flashcard' | 'speedquiz'>('runner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Flashcard mode state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Speed Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(60);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizWord, setQuizWord] = useState<VocabularyWord | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const list = generate10kWords(currentLanguage.id, currentLanguage.name);
    setWords(list);
    setCurrentPage(1);
    setCardIndex(0);
  }, [currentLanguage]);

  const categories = useMemo(() => {
    const set = new Set(words.map(w => w.category));
    return ['All', ...Array.from(set)];
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.translation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'All' || w.difficulty === selectedDifficulty;
      return matchSearch && matchCat && matchDiff;
    });
  }, [words, searchQuery, selectedCategory, selectedDifficulty]);

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const paginatedWords = filteredWords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Speed Quiz logic
  const startSpeedQuiz = () => {
    sound.playClick();
    setQuizActive(true);
    setQuizTimeLeft(60);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizFinished(false);
    nextQuizQuestion();
  };

  const nextQuizQuestion = () => {
    if (words.length === 0) return;
    const target = words[Math.floor(Math.random() * Math.min(words.length, 300))];
    const others = words.filter(w => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.translation);
    const opts = [target.translation, ...others].sort(() => 0.5 - Math.random());
    setQuizWord(target);
    setQuizOptions(opts);
  };

  const handleQuizAnswer = (chosen: string) => {
    if (!quizWord) return;
    if (chosen === quizWord.translation) {
      sound.playCorrect();
      const points = 10 + quizStreak * 2;
      setQuizScore(prev => prev + points);
      setQuizStreak(prev => prev + 1);
    } else {
      sound.playWrong();
      setQuizStreak(0);
    }
    nextQuizQuestion();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && quizTimeLeft > 0) {
      timer = setInterval(() => {
        setQuizTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            setQuizActive(false);
            setQuizFinished(true);
            sound.playStreak();
            const xp = Math.min(80, Math.floor(quizScore / 3));
            recordQuizCompleted(quizScore, xp);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizActive, quizTimeLeft, quizScore]);

  const activeCard = filteredWords[cardIndex] || words[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            10,000-Word Vocabulary Engine
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Ranked frequency builder for {currentLanguage.name} with audio, phonetics, and speed recall drills.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0d1627] border border-cyan-500/30">
          <button
            onClick={() => {
              sound.playClick();
              setActiveMode('runner');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeMode === 'runner'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Word Explorer
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveMode('flashcard');
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeMode === 'flashcard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3D Flashcards
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveMode('speedquiz');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              activeMode === 'speedquiz'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Speed Quiz 60s
          </button>
        </div>
      </div>

      {/* Mode 1: Word Explorer / Runner */}
      {activeMode === 'runner' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/25">
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search words in ${currentLanguage.name} or English...`}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#16233b] border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-300 shrink-0">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 px-2.5 text-xs bg-[#16233b] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-300 shrink-0">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={e => {
                  setSelectedDifficulty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 px-2.5 text-xs bg-[#16233b] border border-cyan-500/30 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner (1 - 2,500)</option>
                <option value="Intermediate">Intermediate (2,501 - 6,000)</option>
                <option value="Advanced">Advanced (6,001 - 10,000)</option>
              </select>
            </div>
          </div>

          {/* Words List */}
          <div className="rounded-2xl border border-cyan-500/25 bg-[#0f172a] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#142038] text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-cyan-500/20">
                  <tr>
                    <th className="py-3 px-4 w-14">Rank</th>
                    <th className="py-3 px-4">Word & Pronunciation</th>
                    <th className="py-3 px-4">English Meaning</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4 text-right">Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {paginatedWords.map(word => (
                    <tr key={word.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        #{word.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{word.word}</div>
                        <div className="text-[11px] text-cyan-300/80 font-mono">{word.phonetic}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {word.translation}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                          {word.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          word.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10' :
                          word.difficulty === 'Intermediate' ? 'text-amber-400 bg-amber-500/10' :
                          'text-purple-400 bg-purple-500/10'
                        }`}>
                          {word.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => speakPhrase(word.word, currentLanguage.voiceCode)}
                          className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-300">
              <div>
                Showing {filteredWords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredWords.length)} of {filteredWords.length} words
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-[#16233b] border border-cyan-500/30 disabled:opacity-30 text-slate-300 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-white px-2">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-[#16233b] border border-cyan-500/30 disabled:opacity-30 text-slate-300 hover:text-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: 3D Flashcards */}
      {activeMode === 'flashcard' && activeCard && (
        <div className="max-w-md mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Card {cardIndex + 1} of {filteredWords.length}</span>
            <span className="font-mono">Rank #{activeCard.rank}</span>
          </div>

          {/* Flashcard container */}
          <div
            onClick={() => {
              sound.playClick();
              setIsFlipped(!isFlipped);
            }}
            className="w-full h-80 rounded-3xl bg-gradient-to-tr from-[#0d1629] via-[#0f1a2e] to-[#12233f] border border-cyan-500/40 p-8 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-cyan-400 transition-all select-none relative overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {activeCard.category}
              </span>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Tap to flip
              </span>
            </div>

            <div className="text-center space-y-3">
              {!isFlipped ? (
                <>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight font-heading">
                    {activeCard.word}
                  </h3>
                  <p className="text-sm text-cyan-400 font-mono">{activeCard.phonetic}</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-teal-300 font-heading">
                    {activeCard.translation}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    &quot;{activeCard.exampleSentence}&quot;
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakPhrase(activeCard.word, currentLanguage.voiceCode);
                }}
                className="p-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/30 transition shadow-md"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Card Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsFlipped(false);
                setCardIndex(p => Math.max(0, p - 1));
              }}
              disabled={cardIndex === 0}
              className="flex-1 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2b4b] disabled:opacity-30 text-xs font-bold text-slate-300 border border-cyan-500/25 transition"
            >
              Previous
            </button>
            <button
              onClick={() => {
                sound.playCorrect();
                addXp(5);
                setIsFlipped(false);
                setCardIndex(p => Math.min(filteredWords.length - 1, p + 1));
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 transition"
            >
              Mastered (+5 XP)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsFlipped(false);
                setCardIndex(p => Math.min(filteredWords.length - 1, p + 1));
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2b4b] text-xs font-bold text-slate-300 border border-cyan-500/25 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Speed Quiz 60s */}
      {activeMode === 'speedquiz' && (
        <div className="max-w-xl mx-auto py-4 space-y-6">
          {!quizActive && !quizFinished ? (
            <div className="rounded-3xl bg-[#0f172a] border border-cyan-500/30 p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
                ⚡
              </div>
              <h3 className="text-2xl font-black text-white font-heading">
                60-Second Vocabulary Blitz
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Test your rapid recall! Answer as many high-frequency {currentLanguage.name} words as you can before the clock runs out. Build combos for bonus XP!
              </p>

              <div className="pt-2">
                <button
                  onClick={startSpeedQuiz}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 font-extrabold text-sm text-white shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition"
                >
                  Start 60s Quiz Now
                </button>
              </div>
            </div>
          ) : quizActive && quizWord ? (
            <div className="rounded-3xl bg-[#0f172a] border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
              
              {/* Quiz Header: Timer & Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-black text-sm">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{quizTimeLeft}s</span>
                </div>

                <div className="flex items-center gap-3">
                  {quizStreak > 1 && (
                    <span className="text-xs font-black text-cyan-400 animate-bounce">
                      {quizStreak}x Combo! 🔥
                    </span>
                  )}
                  <span className="text-lg font-black text-white font-mono">
                    {quizScore} pts
                  </span>
                </div>
              </div>

              {/* Target Word */}
              <div className="text-center py-4 space-y-2">
                <h4 className="text-3xl font-extrabold text-white font-heading">
                  {quizWord.word}
                </h4>
                <p className="text-xs text-cyan-400 font-mono">{quizWord.phonetic}</p>
                <button
                  onClick={() => speakPhrase(quizWord.word, currentLanguage.voiceCode)}
                  className="p-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Translation Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(opt)}
                    className="p-4 rounded-xl bg-[#142038] hover:bg-cyan-600 border border-cyan-500/30 text-xs sm:text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-sm text-left"
                  >
                    {opt}
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Quiz Results */
            <div className="rounded-3xl bg-[#0f172a] border border-cyan-500/30 p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="text-4xl">🏆</div>
              <h3 className="text-2xl font-black text-white font-heading">
                Quiz Complete!
              </h3>
              <p className="text-xs text-slate-300">
                You scored <strong className="text-white text-sm">{quizScore} points</strong> in the 60-second {currentLanguage.name} blitz!
              </p>

              <div className="flex justify-center gap-4 py-2">
                <div className="px-5 py-3 rounded-2xl bg-[#142038] border border-cyan-500/30">
                  <span className="text-xs text-cyan-400 block font-medium">XP Reward</span>
                  <span className="text-xl font-black text-amber-300">+{Math.min(80, Math.floor(quizScore / 3))}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={startSpeedQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-xs text-white transition shadow-md"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setActiveMode('runner')}
                  className="px-5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2b4b] text-xs font-semibold text-slate-300 transition"
                >
                  Back to Words
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
