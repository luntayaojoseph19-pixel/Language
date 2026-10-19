import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  FileText,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getTutorScenarios, getTutorGreeting } from '../data/tutorScenarios';
import { TutorScenario, ChatMessage, ConversationSessionSummary } from '../types';
import { sound, speakPhrase, speechManager } from '../utils/audio';

export const AiTutorView: React.FC = () => {
  const { currentLanguage, profile, recordTutorConversation } = useUser();
  const scenarios = getTutorScenarios(currentLanguage.id, currentLanguage.name);
  const [activeScenario, setActiveScenario] = useState<TutorScenario>(scenarios[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<ConversationSessionSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scList = getTutorScenarios(currentLanguage.id, currentLanguage.name);
    setActiveScenario(scList[0]);
    resetConversation(scList[0]);
  }, [currentLanguage]);

  const resetConversation = (scenario: TutorScenario) => {
    const initial = getTutorGreeting(currentLanguage.id, currentLanguage.greeting, currentLanguage.name);
    const greetingMsg: ChatMessage = {
      id: `msg-tutor-0`,
      sender: 'tutor',
      text: initial.text,
      translation: initial.translation,
      audioText: initial.text,
      suggestedReplies: initial.suggested,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([greetingMsg]);
    setInputText('');
    setSessionSummary(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handlePlayVoice = (text: string, id: string) => {
    sound.playClick();
    if (playingMessageId === id) {
      setPlayingMessageId(null);
      return;
    }
    setPlayingMessageId(id);
    speakPhrase(text, currentLanguage.voiceCode, 0.95, () => {
      setPlayingMessageId(null);
    });
  };

  const handleStartMic = async () => {
    if (isRecording) {
      speechManager.stopListening();
      setIsRecording(false);
      return;
    }

    sound.playClick();
    setIsRecording(true);

    await speechManager.startListening(currentLanguage.voiceCode, {
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: (err) => {
        console.warn('Voice input error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai-tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLanguage.name,
          scenario: `${activeScenario.title}: ${activeScenario.prompt}`,
          level: profile.userSkillLevel,
          messages: updated.slice(-8).map(m => ({ role: m.sender, content: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const tutorMsg: ChatMessage = {
          id: `msg-tutor-${Date.now()}`,
          sender: 'tutor',
          text: data.reply || currentLanguage.greeting,
          translation: data.translation,
          audioText: data.reply,
          correction: data.correction,
          suggestedReplies: data.suggestedResponses,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, tutorMsg]);
        handlePlayVoice(tutorMsg.text, tutorMsg.id);
        recordTutorConversation(activeScenario.title, updated.length, 15);
        setIsThinking(false);
        return;
      }
    } catch {}

    // Fallback response
    const fallbackTutor: ChatMessage = {
      id: `msg-tutor-${Date.now()}`,
      sender: 'tutor',
      text: `${currentLanguage.greeting}! ¡Muy bien dicho!`,
      translation: 'Very well said! Let us continue our practice.',
      audioText: currentLanguage.greeting,
      suggestedReplies: ['Thank you!', 'Could you repeat?', 'How much is it?'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, fallbackTutor]);
    handlePlayVoice(fallbackTutor.text, fallbackTutor.id);
    recordTutorConversation(activeScenario.title, updated.length, 15);
    setIsThinking(false);
  };

  const handleFinishSession = async () => {
    sound.playStreak();
    setSummarizing(true);

    try {
      const res = await fetch('/api/summarize-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLanguage.name,
          scenario: activeScenario.title,
          messages: messages.map(m => ({ role: m.sender, content: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessionSummary(data);
        setSummarizing(false);
        return;
      }
    } catch {}

    // Heuristic summary fallback
    const summary: ConversationSessionSummary = {
      scenarioTitle: activeScenario.title,
      totalExchanges: messages.length,
      usefulVocabulary: [
        { word: currentLanguage.greeting, translation: 'Opening Greeting', phonetic: '[Native]' },
        { word: 'Muchas gracias / Thank you', translation: 'Courtesy expression', phonetic: '[Gratitude]' }
      ],
      grammarCorrections: [
        {
          original: 'Phrasing in conversation',
          corrected: 'Clear sentence flow',
          explanation: 'Use polite particles or formal verb endings when addressing professionals or interviewers.'
        }
      ],
      suggestions: [
        'Practice responding within 3 seconds to build subconscious reflex.',
        'Use transition phrases like "En mi experiencia" or "Por lo tanto" to bridge ideas smoothly.'
      ]
    };

    setSessionSummary(summary);
    setSummarizing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Real-World Conversation Practice
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Immerse yourself in job interviews, school presentations, transit, and dining in {currentLanguage.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length >= 3 && !sessionSummary && (
            <button
              onClick={handleFinishSession}
              disabled={summarizing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              {summarizing ? 'Analyzing...' : 'Finish & View Report'}
            </button>
          )}

          <span className="px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5">
            <span>{activeScenario.icon}</span>
            <span>{activeScenario.title}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Scenarios Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Real-World Practice Modes
          </h3>
          <div className="space-y-2">
            {scenarios.map(sc => {
              const isSelected = activeScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveScenario(sc);
                    resetConversation(sc);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-white font-bold shadow-md'
                      : 'bg-[#0f172a] border-cyan-500/20 hover:bg-[#16233b] text-slate-300'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{sc.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{sc.title}</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-semibold block">{sc.category}</span>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{sc.description || sc.prompt}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div className="lg:col-span-3 rounded-3xl bg-[#0f172a] border border-cyan-500/30 shadow-2xl flex flex-col h-[580px] overflow-hidden">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map(msg => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
                >
                  {isTutor && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 shadow-lg ${
                    isTutor
                      ? 'bg-[#142038] border border-cyan-500/30 text-white'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/30'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-wider">
                        {isTutor ? `Native Coach (${currentLanguage.name})` : 'You'}
                      </span>
                      {isTutor && msg.audioText && (
                        <button
                          onClick={() => handlePlayVoice(msg.audioText!, msg.id)}
                          className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white transition"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>

                    {msg.translation && (
                      <p className="text-xs text-slate-300 italic border-t border-cyan-500/20 pt-1.5">
                        &quot;{msg.translation}&quot;
                      </p>
                    )}

                    {msg.correction && (
                      <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-200">
                        💡 {msg.correction}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-400 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isTutor && (
                    <div className="w-8 h-8 rounded-xl bg-[#16233b] border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-cyan-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Coach is composing response in {currentLanguage.name}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Replies */}
          {messages.length > 0 && messages[messages.length - 1].suggestedReplies && (
            <div className="px-4 py-2 border-t border-cyan-500/20 bg-[#0b1220] flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-cyan-400 shrink-0">Quick Reply:</span>
              {messages[messages.length - 1].suggestedReplies!.map((rep, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(rep)}
                  className="px-3 py-1 rounded-full bg-[#16233b] hover:bg-cyan-500 hover:text-white border border-cyan-500/30 text-xs text-slate-200 whitespace-nowrap transition shadow-sm"
                >
                  {rep}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar with Start/Stop Mic, Text Input, Send */}
          <div className="p-3 border-t border-cyan-500/25 bg-[#0d1627] flex items-center gap-2">
            <button
              onClick={handleStartMic}
              className={`p-2.5 rounded-xl transition ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#16233b] hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/30'
              }`}
              title={isRecording ? 'Listening now... Click to stop' : 'Speak into microphone'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={`Speak or type reply in ${currentLanguage.name}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-[#16233b] border border-cyan-500/30 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white transition shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Post-Session Summary Modal / Report */}
      {sessionSummary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[88vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-heading">
                    Conversation Session Report
                  </h3>
                  <p className="text-xs text-cyan-300/80">
                    {sessionSummary.scenarioTitle} • {sessionSummary.totalExchanges} conversational exchanges
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSessionSummary(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Useful Vocabulary Learned */}
            {sessionSummary.usefulVocabulary && sessionSummary.usefulVocabulary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Useful Vocabulary & Idioms Learned:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sessionSummary.usefulVocabulary.map((v, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#142038] border border-cyan-500/25 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{v.word}</p>
                        <p className="text-[11px] text-cyan-300/70">{v.translation}</p>
                      </div>
                      <button
                        onClick={() => speakPhrase(v.word, currentLanguage.voiceCode)}
                        className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/20"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Corrections */}
            {sessionSummary.grammarCorrections && sessionSummary.grammarCorrections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Grammar & Phrasing Corrections:
                </h4>
                <div className="space-y-2">
                  {sessionSummary.grammarCorrections.map((gc, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#142038] border border-amber-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400 line-through">{gc.original}</span>
                        <span className="text-cyan-400">→</span>
                        <span className="text-emerald-300 font-bold">{gc.corrected}</span>
                      </div>
                      <p className="text-[11px] text-slate-300/90">{gc.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions for Improvement */}
            {sessionSummary.suggestions && sessionSummary.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Actionable Suggestions for Improvement:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {sessionSummary.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-cyan-500/20 flex justify-end">
              <button
                onClick={() => setSessionSummary(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-md shadow-cyan-500/20"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
