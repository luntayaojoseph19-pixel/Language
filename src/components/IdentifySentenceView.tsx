import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { generateSentences } from '../data/sentences';
import { SentenceChallenge } from '../types';
import { sound, speakPhrase } from '../utils/audio';

export const IdentifySentenceView: React.FC = () => {
  const { currentLanguage, recordSentencePractice } = useUser();
  const [challenges, setChallenges] = useState<SentenceChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'choice' | 'builder'>('choice');
  
  // Choice state
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Builder state
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  // Check state
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const list = generateSentences(currentLanguage.id, currentLanguage.name);
    setChallenges(list);
    setCurrentIndex(0);
    setStreak(0);
  }, [currentLanguage]);

  const currentChallenge = challenges[currentIndex] || challenges[0];

  useEffect(() => {
    if (!currentChallenge) return;

    // Reset exercise
    setSelectedOption(null);
    setUserTokens([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);

    // Prepare choices
    const opts = [currentChallenge.targetSentence, ...currentChallenge.distractors].sort(() => 0.5 - Math.random());
    setShuffledOptions(opts);

    // Prepare tokens
    const tokens = currentChallenge.tokens || currentChallenge.targetSentence.replace(/[¿¡,.!?]/g, '').split(/\s+/);
    const extra = currentChallenge.distractorTokens || ['not', 'today', 'very'];
    const allTokens = [...tokens, ...extra].sort(() => 0.5 - Math.random());
    setAvailableTokens(allTokens);

    // Auto-play audio once
    playCurrentSentence();
  }, [currentIndex, challenges]);

  const playCurrentSentence = (speed: number = playbackSpeed) => {
    if (!currentChallenge) return;
    setIsPlaying(true);
    speakPhrase(currentChallenge.targetSentence, currentLanguage.voiceCode, speed, () => {
      setIsPlaying(false);
    });
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setSelectedOption(opt);
  };

  const handleAddToken = (token: string, idx: number) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setUserTokens(prev => [...prev, token]);
    setAvailableTokens(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveToken = (token: string, idx: number) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setAvailableTokens(prev => [...prev, token]);
    setUserTokens(prev => prev.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    if (!currentChallenge || isAnswerChecked) return;

    let correct = false;
    if (mode === 'choice') {
      correct = selectedOption === currentChallenge.targetSentence;
    } else {
      const assembled = userTokens.join(' ').toLowerCase().replace(/[¿¡,.!?]/g, '').trim();
      const target = currentChallenge.targetSentence.toLowerCase().replace(/[¿¡,.!?]/g, '').trim();
      correct = assembled === target;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      sound.playCorrect();
      setStreak(s => s + 1);
      recordSentencePractice(currentChallenge.targetSentence, 95, 20);
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  const handleNextChallenge = () => {
    sound.playClick();
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex(c => c + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (!currentChallenge) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Philosophy */}
      <div className="flex items-center justify-between border-b border-pink-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2">
              <Headphones className="w-6 h-6 text-pink-400" />
              Identify Sentence: No Clues 🎧
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/35 text-[10px] font-black uppercase">
              Auditory Reflex
            </span>
          </div>
          <p className="text-xs text-pink-300/80 mt-1">
            Listen with zero text clues to build pure native listening reflex.
          </p>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/35 text-xs font-bold text-pink-300 animate-bounce">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{streak} Streak!</span>
          </div>
        )}
      </div>

      {/* Main Listening Canvas Card */}
      <div className="rounded-3xl bg-[#1b081e] border border-pink-500/35 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Controls: Mode Switch & Speed Controls */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-[#260e2a] p-1 rounded-xl border border-pink-500/30">
            <button
              onClick={() => {
                sound.playClick();
                setMode('choice');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                mode === 'choice' ? 'bg-pink-500 text-white' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              Select Sentence
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMode('builder');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                mode === 'builder' ? 'bg-pink-500 text-white' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              Reconstruct Tokens
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-pink-400/80 font-medium">Speed:</span>
            {[0.8, 1.0, 1.2].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  sound.playClick();
                  setPlaybackSpeed(speed);
                  playCurrentSentence(speed);
                }}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition ${
                  playbackSpeed === speed
                    ? 'bg-pink-500/40 text-pink-200 border border-pink-500/50'
                    : 'bg-[#260e2a] text-pink-400/70 hover:text-pink-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Central Audio Playback Button */}
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <button
            onClick={() => playCurrentSentence()}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isPlaying
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-pink-500/30 scale-110'
                : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-fuchsia-500 text-white hover:scale-105 active:scale-95 shadow-pink-500/40'
            }`}
            title="Tap to replay audio"
          >
            <Volume2 className="w-9 h-9" />
          </button>
          <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
            {isPlaying ? 'Playing Audio...' : 'Tap to Listen Again'}
          </span>
        </div>

        {/* Challenge Input: Choice Mode */}
        {mode === 'choice' && (
          <div className="space-y-2.5">
            <p className="text-xs text-pink-300/80 font-medium mb-1">
              Which sentence did you hear in {currentLanguage.name}?
            </p>
            {shuffledOptions.map((opt, i) => {
              const isSelected = selectedOption === opt;
              let style = 'border-pink-500/25 bg-[#250d28] hover:bg-[#321237] text-pink-100';

              if (isAnswerChecked) {
                if (opt === currentChallenge.targetSentence) {
                  style = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                } else if (isSelected) {
                  style = 'border-rose-500 bg-rose-500/20 text-rose-200';
                }
              } else if (isSelected) {
                style = 'border-pink-500 bg-pink-500/25 text-white font-bold ring-2 ring-pink-500/40';
              }

              return (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswerChecked && opt === currentChallenge.targetSentence && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerChecked && isSelected && opt !== currentChallenge.targetSentence && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Challenge Input: Builder Mode */}
        {mode === 'builder' && (
          <div className="space-y-4">
            <p className="text-xs text-pink-300/80 font-medium">
              Reconstruct the exact sentence you heard:
            </p>

            <div className="min-h-16 p-3.5 rounded-xl bg-[#260e2a] border border-pink-500/30 flex flex-wrap gap-2 items-center">
              {userTokens.length === 0 ? (
                <span className="text-xs text-pink-400/50 italic">Tap words below to arrange...</span>
              ) : (
                userTokens.map((token, i) => (
                  <button
                    key={i}
                    disabled={isAnswerChecked}
                    onClick={() => handleRemoveToken(token, i)}
                    className="px-3 py-1.5 rounded-lg bg-pink-500/30 hover:bg-pink-500/40 border border-pink-500/40 text-xs font-semibold text-white transition"
                  >
                    {token}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTokens.map((token, i) => (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => handleAddToken(token, i)}
                  className="px-3.5 py-2 rounded-xl bg-[#240c29] hover:bg-pink-950 border border-pink-500/30 text-xs font-semibold text-pink-100 transition shadow-sm"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Post-check Explanation & Breakdown */}
        {isAnswerChecked && (
          <div className="p-4 rounded-2xl bg-[#250d2a] border border-pink-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Correct comprehension!
                </span>
              ) : (
                <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Listen closely to the native phrasing:
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-white">{currentChallenge.targetSentence}</p>
              <p className="text-xs text-pink-300">{currentChallenge.translation}</p>
              <p className="text-[11px] text-pink-400/80 font-mono">{currentChallenge.phonetic}</p>
            </div>

            {currentChallenge.distinctionTip && (
              <p className="text-xs text-pink-200/80 leading-relaxed border-t border-pink-500/20 pt-2">
                💡 <strong className="text-pink-300">Ear Training Note:</strong> {currentChallenge.distinctionTip}
              </p>
            )}

            {/* Individual Word Pronunciation Breakdown */}
            {currentChallenge.wordsBreakdown && currentChallenge.wordsBreakdown.length > 0 && (
              <div className="pt-2 border-t border-pink-500/20">
                <span className="text-[11px] text-pink-400 font-bold block mb-2">Tap individual words:</span>
                <div className="flex flex-wrap gap-2">
                  {currentChallenge.wordsBreakdown.map((wb, idx) => (
                    <button
                      key={idx}
                      onClick={() => speakPhrase(wb.word, currentLanguage.voiceCode)}
                      className="px-2.5 py-1 rounded-lg bg-[#1f0923] hover:bg-pink-950 border border-pink-500/30 text-xs text-pink-200 flex items-center gap-1.5 transition"
                    >
                      <Volume2 className="w-3 h-3 text-pink-400" />
                      <span className="font-bold">{wb.word}</span>
                      <span className="text-[10px] text-pink-300/60">({wb.meaning})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Action Button */}
        <div className="pt-4 border-t border-pink-500/20 flex justify-end">
          {!isAnswerChecked ? (
            <button
              onClick={checkAnswer}
              disabled={
                (mode === 'choice' && !selectedOption) ||
                (mode === 'builder' && userTokens.length === 0)
              }
              className="px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-white transition shadow-md"
            >
              Verify Ear Accuracy
            </button>
          ) : (
            <button
              onClick={handleNextChallenge}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold text-xs text-white transition shadow-md flex items-center gap-1.5"
            >
              Next Sentence <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Educational Callout */}
      <div className="p-4 rounded-2xl bg-[#18071a] border border-pink-500/20 text-xs text-pink-300/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Why &quot;No Clues&quot;?</strong> Reading subtitles bypasses the auditory cortex. Practicing without visual text forces your brain to decode native phonemes, cadence, and syllable boundaries directly.
        </p>
      </div>

    </div>
  );
};
