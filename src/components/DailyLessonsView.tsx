import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Mic, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Award, 
  RotateCcw,
  Lightbulb,
  Zap,
  Target,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { defaultLessons, getFallbackLesson } from '../data/lessons';
import { Lesson, Exercise } from '../types';
import { sound, speakPhrase, speechManager } from '../utils/audio';

interface DailyLessonsViewProps {
  onOpenInfinite: () => void;
  onOpenSentences: () => void;
}

export const DailyLessonsView: React.FC<DailyLessonsViewProps> = ({
  onOpenInfinite,
  onOpenSentences
}) => {
  const { currentLanguage, profile, recordLessonCompleted, recordVoicePractice, recordMistake, clearMistake } = useUser();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userTokens, setUserTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [lessonFinished, setLessonFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [generatingAiLesson, setGeneratingAiLesson] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  const lessonsForLang = defaultLessons[currentLanguage.id] || [
    getFallbackLesson(currentLanguage.id, currentLanguage.name, currentLanguage.greeting)
  ];

  // Relevant mistakes for current language
  const languageMistakes = (profile.userMistakes || []).filter(m => m.languageId === currentLanguage.id);

  const startLesson = (lesson: Lesson) => {
    sound.playClick();
    setActiveLesson(lesson);
    setExerciseIndex(0);
    resetExerciseState(lesson.exercises[0]);
    setLessonFinished(false);
    setEarnedXp(0);
  };

  const resetExerciseState = (ex?: Exercise) => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setSpokenTranscript('');
    setIsRecording(false);
    setRecordedAudioUrl(null);
    speechManager.stopListening();

    if (ex && ex.type === 'sentence_builder') {
      const tokens = ex.scrambledTokens ? [...ex.scrambledTokens] : ex.targetPhrase.split(/\s+/).sort(() => 0.5 - Math.random());
      setAvailableTokens(tokens);
      setUserTokens([]);
    }
  };

  const currentExercise = activeLesson?.exercises[exerciseIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setSelectedOption(idx);
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
    if (!currentExercise || isAnswerChecked) return;

    let correct = false;
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'listening_comprehension') {
      correct = selectedOption === currentExercise.correctIndex;
      if (!correct) {
        recordMistake(currentExercise.targetPhrase, 'vocabulary', 40, currentExercise.translation, currentExercise.prompt);
      }
    } else if (currentExercise.type === 'sentence_builder') {
      const assembled = userTokens.join(' ').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      const target = (currentExercise.correctTokens ? currentExercise.correctTokens.join(' ') : currentExercise.targetPhrase)
        .toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      correct = assembled.trim() === target.trim();
      if (!correct) {
        recordMistake(currentExercise.targetPhrase, 'grammar', 50, currentExercise.translation, 'Word arrangement order');
      }
    } else if (currentExercise.type === 'voice_challenge') {
      const cleanTarget = currentExercise.targetPhrase.toLowerCase().replace(/[¿¡,.!]/g, '').trim();
      const cleanSpoken = spokenTranscript.toLowerCase().replace(/[¿¡,.!]/g, '').trim();
      correct = cleanSpoken.length > 0 && (cleanTarget.includes(cleanSpoken) || cleanSpoken.includes(cleanTarget) || cleanSpoken.length >= 3);
      const score = correct ? 94 : 72;
      recordVoicePractice(currentExercise.targetPhrase, score, 15);
      if (!correct) {
        recordMistake(currentExercise.targetPhrase, 'pronunciation', score, currentExercise.translation, currentExercise.pronunciationTip);
      }
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleNextExercise = () => {
    if (!activeLesson) return;
    sound.playClick();

    if (exerciseIndex + 1 < activeLesson.exercises.length) {
      const nextIdx = exerciseIndex + 1;
      setExerciseIndex(nextIdx);
      resetExerciseState(activeLesson.exercises[nextIdx]);
    } else {
      // Completed lesson
      sound.playStreak();
      const reward = activeLesson.xpReward || 30;
      recordLessonCompleted(activeLesson.id, reward, activeLesson.estimatedMinutes || 3);
      setEarnedXp(reward);
      setLessonFinished(true);
    }
  };

  const handleStartVoiceRecord = async () => {
    if (isRecording) {
      speechManager.stopListening();
      setIsRecording(false);
      return;
    }

    sound.playClick();
    setIsRecording(true);
    setSpokenTranscript('');
    setRecordedAudioUrl(null);

    await speechManager.startListening(currentLanguage.voiceCode, {
      onResult: (text, isFinal) => {
        setSpokenTranscript(text);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onAudioRecorded: (url) => {
        setRecordedAudioUrl(url);
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const handlePlayRecorded = () => {
    if (!recordedAudioUrl) return;
    setIsPlayingRecorded(true);
    speechManager.playRecordedAudio(recordedAudioUrl, () => {
      setIsPlayingRecorded(false);
    });
  };

  const handleGenerateAiLesson = async () => {
    const topic = customTopic.trim() || 'Everyday Travel & Coffee';
    setGeneratingAiLesson(true);
    sound.playClick();

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLanguage.name,
          topic,
          level: profile.userSkillLevel
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.lesson) {
          startLesson(data.lesson);
          setCustomTopic('');
          setGeneratingAiLesson(false);
          return;
        }
      }
    } catch {}

    // Fallback instant lesson
    const fallback = getFallbackLesson(currentLanguage.id, currentLanguage.name, currentLanguage.greeting);
    fallback.title = `${topic} in ${currentLanguage.name}`;
    startLesson(fallback);
    setCustomTopic('');
    setGeneratingAiLesson(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner / Call to Action */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#0d1629] via-[#0b1322] to-[#111e38] border border-cyan-500/25 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Polyglot Micro-Lessons • {profile.userSkillLevel} Track
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Master {currentLanguage.name} Faster with Voice
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            3-minute interactive bites combining active speech recognition, natural listening, and conversational fluency drills calibrated for your level.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => startLesson(lessonsForLang[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Start First Lesson <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSentences}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131d33] hover:bg-[#1b2947] border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition"
            >
              Try "No Clues" Listening 🎧
            </button>
          </div>
        </div>

        {/* Ambient cyan glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Focus Areas & Recommended Lessons Based on Previous Mistakes */}
      {languageMistakes.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0f1a2e] border border-cyan-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Recommended Focus Areas (Based on Previous Mistakes)</h3>
            </div>
            <span className="text-[11px] text-cyan-300/70 font-mono">
              {languageMistakes.length} area{languageMistakes.length > 1 ? 's' : ''} to reinforce
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {languageMistakes.slice(0, 4).map(mistake => (
              <div 
                key={mistake.id}
                className="p-3 rounded-xl bg-[#16233b] border border-cyan-500/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      mistake.mistakeType === 'pronunciation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      mistake.mistakeType === 'grammar' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {mistake.mistakeType}
                    </span>
                    <span className="font-bold text-white">{mistake.phrase}</span>
                  </div>
                  {mistake.context && (
                    <p className="text-[11px] text-slate-300/80">{mistake.context}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakPhrase(mistake.phrase, currentLanguage.voiceCode)}
                    className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition"
                    title="Listen correct pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => clearMistake(mistake.id)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                    title="Mark reviewed"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Custom Lesson Generator input */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder={`Enter any topic (e.g. "Airport check-in", "Street food", "Job interview")...`}
            value={customTopic}
            onChange={e => setCustomTopic(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-[#16233b] border border-cyan-500/30 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          onClick={handleGenerateAiLesson}
          disabled={generatingAiLesson}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {generatingAiLesson ? 'Creating AI Lesson...' : 'Generate Custom Lesson'}
        </button>
      </div>

      {/* Lessons List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Curated Lessons for {currentLanguage.name}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {lessonsForLang.length} lessons available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessonsForLang.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-2xl border border-cyan-500/25 bg-[#0f172a]/90 hover:border-cyan-500/50 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/30 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {lesson.level}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{lesson.estimatedMinutes} min</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">{lesson.nativeTitle}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {lesson.description}
                </p>

                {lesson.cultureTip && (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{lesson.cultureTip}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-cyan-500/15 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{lesson.xpReward} XP</span>
                </div>
                <button
                  onClick={() => startLesson(lesson)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition"
                >
                  Start <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Lesson Modal / Runner */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header progress bar */}
            {!lessonFinished ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="text-slate-400 hover:text-white font-medium"
                  >
                    ✕ Exit Lesson
                  </button>
                  <span className="font-bold text-cyan-300">
                    Exercise {exerciseIndex + 1} of {activeLesson.exercises.length}
                  </span>
                </div>

                <div className="w-full h-2 bg-[#16233b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((exerciseIndex + 1) / activeLesson.exercises.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* Exercise View or Completion Screen */}
            {!lessonFinished && currentExercise ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Instructions & Prompt */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                    {currentExercise.type.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-slate-300">{currentExercise.instructions}</p>
                  <h3 className="text-lg font-bold text-white">{currentExercise.prompt}</h3>

                  {/* Audio Speaker Button */}
                  {currentExercise.targetPhrase && (
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#142038] border border-cyan-500/30">
                      <button
                        onClick={() => speakPhrase(currentExercise.targetPhrase, currentLanguage.voiceCode)}
                        className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/30 transition group"
                        title="Listen to native voice"
                      >
                        <Volume2 className="w-5 h-5 group-hover:scale-110 transition" />
                      </button>
                      <div>
                        <p className="text-sm font-bold text-white">{currentExercise.targetPhrase}</p>
                        {currentExercise.phoneticSpelling && (
                          <p className="text-xs text-cyan-400 font-mono">{currentExercise.phoneticSpelling}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'listening_comprehension') && currentExercise.options && (
                  <div className="space-y-2.5">
                    {currentExercise.options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      let btnStyle = 'border-cyan-500/20 bg-[#16233b] hover:bg-[#1c2e4d] text-slate-100';

                      if (isAnswerChecked) {
                        if (i === currentExercise.correctIndex) {
                          btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-cyan-400 bg-cyan-500/20 text-white font-bold ring-2 ring-cyan-500/40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={isAnswerChecked}
                          onClick={() => handleSelectOption(i)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswerChecked && i === currentExercise.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isAnswerChecked && isSelected && i !== currentExercise.correctIndex && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sentence Builder Chips */}
                {currentExercise.type === 'sentence_builder' && (
                  <div className="space-y-4">
                    <div className="min-h-14 p-3.5 rounded-xl bg-[#142038] border border-cyan-500/30 flex flex-wrap gap-2 items-center">
                      {userTokens.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Tap words below to arrange sentence in order...</span>
                      ) : (
                        userTokens.map((token, i) => (
                          <button
                            key={i}
                            disabled={isAnswerChecked}
                            onClick={() => handleRemoveToken(token, i)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-500/40 text-xs font-semibold text-white transition"
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
                          className="px-3.5 py-2 rounded-xl bg-[#16233b] hover:bg-[#1d3154] border border-cyan-500/30 text-xs font-semibold text-slate-100 transition shadow-sm"
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Challenge with Start, Stop, Retry, Replay controls */}
                {currentExercise.type === 'voice_challenge' && (
                  <div className="space-y-4 py-2 text-center">
                    <p className="text-xs text-slate-300">
                      Tap the microphone and enunciate the phrase clearly in {currentLanguage.name}:
                    </p>

                    {/* Microphone Controls */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={handleStartVoiceRecord}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                          isRecording
                            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
                            : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-cyan-500/30'
                        }`}
                      >
                        <Mic className="w-7 h-7" />
                      </button>
                      <span className="text-xs font-semibold text-cyan-300">
                        {isRecording ? 'Listening now... (Tap to finish)' : 'Tap Mic to Speak'}
                      </span>
                    </div>

                    {/* Controls row: Retry, Replay My Voice, Replay Native */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSpokenTranscript('');
                          setRecordedAudioUrl(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#16233b] hover:bg-[#1d3154] border border-cyan-500/30 text-xs text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        Retry
                      </button>

                      {recordedAudioUrl && (
                        <button
                          type="button"
                          onClick={handlePlayRecorded}
                          disabled={isPlayingRecorded}
                          className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-200 hover:text-white border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {isPlayingRecorded ? 'Playing...' : 'Replay My Voice'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => speakPhrase(currentExercise.targetPhrase, currentLanguage.voiceCode)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-white border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Replay Native
                      </button>
                    </div>

                    {spokenTranscript && (
                      <div className="p-3 rounded-xl bg-[#142038] border border-cyan-500/30 text-xs text-white">
                        <span className="text-cyan-400 font-bold block mb-1">Microphone Recognized:</span>
                        &quot;{spokenTranscript}&quot;
                      </div>
                    )}

                    {currentExercise.pronunciationTip && (
                      <p className="text-[11px] text-cyan-300 italic">
                        💡 Tip: {currentExercise.pronunciationTip}
                      </p>
                    )}
                  </div>
                )}

                {/* Explanation feedback message */}
                {isAnswerChecked && (
                  <div className={`p-4 rounded-xl border text-xs ${
                    isCorrect 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                      <span>{isCorrect ? 'Excellent job! Correct.' : 'Not quite. Review key notes:'}</span>
                    </div>
                    <p className="text-slate-300">{currentExercise.explanation || currentExercise.translation}</p>
                  </div>
                )}

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-cyan-500/20 flex justify-end">
                  {!isAnswerChecked ? (
                    <button
                      onClick={checkAnswer}
                      disabled={
                        (currentExercise.type === 'multiple_choice' && selectedOption === null) ||
                        (currentExercise.type === 'sentence_builder' && userTokens.length === 0) ||
                        (currentExercise.type === 'voice_challenge' && !spokenTranscript)
                      }
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition shadow-md shadow-cyan-500/20"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextExercise}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-xs font-bold text-white transition shadow-md flex items-center gap-1.5"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* Lesson Completion Screen */
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                  🎉
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-heading">
                    Lesson Completed!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    You have finished this {currentLanguage.name} micro-lesson.
                  </p>
                </div>

                <div className="flex justify-center gap-4 py-2">
                  <div className="px-5 py-3 rounded-2xl bg-[#142038] border border-cyan-500/30">
                    <span className="text-xs text-cyan-400 block font-medium">XP Earned</span>
                    <span className="text-xl font-black text-amber-300">+{earnedXp}</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-[#142038] border border-cyan-500/30">
                    <span className="text-xs text-cyan-400 block font-medium">Study Time</span>
                    <span className="text-xl font-black text-teal-300">+3m</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-[#142038] border border-cyan-500/30">
                    <span className="text-xs text-cyan-400 block font-medium">Gems</span>
                    <span className="text-xl font-black text-blue-300">+10 💎</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition shadow-lg shadow-cyan-500/25"
                  >
                    Back to Lessons
                  </button>
                  <button
                    onClick={() => {
                      setActiveLesson(null);
                      onOpenInfinite();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1a2b4d] border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition"
                  >
                    Explore 10k Words →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
