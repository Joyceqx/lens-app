'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Check, Mic, Type, ChevronRight, ChevronLeft, Star, BarChart2, ArrowRight, Sparkles } from 'lucide-react';
import { ONBOARDING_QUESTIONS, REWARD_TIERS, TOTAL_WEIGHT, COMPARISON_QUESTIONS, COMPARISON_RESPONSES, DEMOGRAPHIC_FIELDS } from '@/lib/constants';

type Stage = 'consent' | 'privacy' | 'demographics' | 'mode' | 'voice' | 'questions' | 'rewards' | 'comparison' | 'final';

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? 'w-6 bg-gold' : i === current ? 'w-6 bg-gold-light' : 'w-1.5 bg-white/20'}`} />
      ))}
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-16 my-6">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-150"
          style={{
            height: active ? `${Math.random() * 100}%` : '8%',
            background: active
              ? `hsl(${40 + i * 2}, 80%, ${55 + Math.random() * 15}%)`
              : 'rgba(255,255,255,0.15)',
            animation: active ? `waveBar 0.4s ease ${i * 0.02}s infinite alternate` : 'none',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('consent');
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text' | null>(null);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [enrichment, setEnrichment] = useState(0);
  const [compQi, setCompQi] = useState(0);
  const [compPhase, setCompPhase] = useState<'question' | 'responses'>('question');
  const [personalResponses, setPersonalResponses] = useState<string[] | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [contributorId, setContributorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personaResult, setPersonaResult] = useState<any>(null);

  // Demographics
  const [demographics, setDemographics] = useState<Record<string, string>>({});
  const [selfDescribe, setSelfDescribe] = useState<Record<string, string>>({});

  // Per-question evaluation scores and feedback
  const [scores, setScores] = useState<Record<number, { score: number; max: number; feedback: string }>>({});
  const [evaluating, setEvaluating] = useState(false);

  // Voice state — 5-state flow: ready → listening → processing → editing → answered
  const [voiceState, setVoiceState] = useState<'ready' | 'listening' | 'processing' | 'editing' | 'answered'>('ready');
  const [callTime, setCallTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  const question = ONBOARDING_QUESTIONS[qi];
  const answeredCount = Object.keys(answers).length;

  // Enrichment is now based on real evaluation scores
  useEffect(() => {
    let totalScore = 0;
    Object.values(scores).forEach(s => { totalScore += s.score; });
    setEnrichment(Math.round((totalScore / TOTAL_WEIGHT) * 100));
  }, [scores]);

  const currentTier = REWARD_TIERS.filter(t => enrichment >= t.threshold).pop();

  // Call timer — only runs during 'listening' state
  useEffect(() => {
    if (voiceState === 'listening') {
      timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [voiceState]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recording is not supported in this browser. Please use Chrome or Edge, or switch to text mode.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Pick the highest-confidence alternative
          let best = result[0].transcript;
          let bestConf = result[0].confidence || 0;
          for (let j = 1; j < result.length; j++) {
            if ((result[j].confidence || 0) > bestConf) {
              best = result[j].transcript;
              bestConf = result[j].confidence;
            }
          }
          finalTranscript += best + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Silently ignore — these are common and non-fatal
      } else {
        isRecordingRef.current = false;
        setVoiceState('ready');
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still in listening mode (browser stops after ~60s of silence)
      if (isRecordingRef.current) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    recognition.start();
    setVoiceState('listening');
    setCallTime(0);
    setTranscript('');
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Brief processing state, then show editable transcript
    setVoiceState('processing');
    setTimeout(() => {
      setVoiceState('editing');
    }, 600);
  }, []);

  // When entering editing state, populate the editable text field
  useEffect(() => {
    if (voiceState === 'editing') {
      setEditedTranscript(transcript.trim());
    }
  }, [voiceState, transcript]);

  // Evaluate an answer via Claude and update scores
  const evaluateAnswer = async (questionIndex: number, text: string) => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/onboarding/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_index: questionIndex, answer: text }),
      });
      const data = await res.json();
      setScores(prev => ({
        ...prev,
        [questionIndex]: { score: data.score || 0, max: data.max_score || 10, feedback: data.feedback || '' },
      }));
    } catch (e) {
      // Fallback: balanced word-count heuristic on 1-10 scale
      const words = text.split(/\s+/).filter(Boolean).length;
      const fallback = words < 3 ? 2 : words < 8 ? 4 : words < 20 ? 6 : words < 40 ? 7 : 8;
      setScores(prev => ({
        ...prev,
        [questionIndex]: { score: fallback, max: 10, feedback: 'Scored locally' },
      }));
    }
    setEvaluating(false);
  };

  // Confirm the (possibly edited) transcript and save
  const confirmTranscript = () => {
    const finalText = editedTranscript.trim();
    if (finalText) {
      const newAnswers = { ...answers, [qi]: finalText };
      setAnswers(newAnswers);
      saveAnswer(qi, finalText);
      evaluateAnswer(qi, finalText);
    }
    setVoiceState('answered');
  };

  // Re-record: go back to ready state
  const reRecord = () => {
    setVoiceState('ready');
    setTranscript('');
    setEditedTranscript('');
  };

  const voiceNextQuestion = () => {
    // Clean state reset for next question
    setVoiceState('ready');
    setCallTime(0);
    setTranscript('');
    setEditedTranscript('');
    if (qi < ONBOARDING_QUESTIONS.length - 1) {
      setQi(qi + 1);
    } else {
      setStage('rewards');
    }
  };

  const voiceSkipQuestion = () => {
    setVoiceState('ready');
    setCallTime(0);
    setTranscript('');
    setEditedTranscript('');
    if (qi < ONBOARDING_QUESTIONS.length - 1) {
      setQi(qi + 1);
    } else {
      setStage('rewards');
    }
  };

  const submitConsent = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/consent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true }),
      });
      const data = await res.json();
      if (data.contributor_id) setContributorId(data.contributor_id);
    } catch (e) { console.error('Consent error:', e); }
    setIsSubmitting(false);
  };

  const saveAnswer = async (qNum: number, text: string) => {
    if (!contributorId) return;
    try {
      await fetch('/api/onboarding/response', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributor_id: contributorId, question_number: qNum + 1, response_text: text }),
      });
    } catch (e) { console.error('Save error:', e); }
  };

  // Generate personalized comparison responses when entering comparison stage
  const generateComparisonResponses = async () => {
    if (personalResponses || Object.keys(answers).length === 0) return;
    setLoadingComparison(true);
    try {
      const res = await fetch('/api/onboarding/compare', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.responses && Array.isArray(data.responses)) {
        setPersonalResponses(data.responses);
      }
    } catch (e) {
      console.error('Comparison generation error:', e);
    }
    setLoadingComparison(false);
  };

  // Trigger when entering comparison stage
  useEffect(() => {
    if (stage === 'comparison' && !personalResponses) {
      generateComparisonResponses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const completeOnboarding = async () => {
    if (Object.keys(answers).length === 0) {
      setPersonaResult({ error: 'No answers recorded. Please go back and answer at least one question.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_id: contributorId || undefined,
          answers,
          demographics: Object.keys(demographics).length > 0
            ? Object.fromEntries(
                Object.entries(demographics).map(([k, v]) =>
                  v === 'Prefer to self-describe' && selfDescribe[k]?.trim()
                    ? [k, selfDescribe[k].trim()]
                    : [k, v]
                )
              )
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPersonaResult({ error: data.error || data.detail || `Server error (${res.status})` });
      } else {
        setPersonaResult(data);
      }
    } catch (e: any) {
      setPersonaResult({ error: `Network error: ${e.message}` });
    }
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      const newAnswers = { ...answers, [qi]: currentAnswer };
      setAnswers(newAnswers);
      saveAnswer(qi, currentAnswer);
      evaluateAnswer(qi, currentAnswer);
    }
    if (qi < ONBOARDING_QUESTIONS.length - 1) {
      setQi(qi + 1);
      setCurrentAnswer(answers[qi + 1] || '');
    } else {
      setStage('rewards');
    }
  };

  const pv = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen ob-gradient text-white">
      <AnimatePresence mode="wait">
        {/* ========== CONSENT ========== */}
        {stage === 'consent' && (
          <motion.div key="consent" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Share Your Perspective</h1>
              <p className="text-white/60 mb-8 leading-relaxed">Help build authentic human personas that inform better products and decisions.</p>
              <div className="space-y-3 mb-8 text-left">
                {['Your responses create a unique persona profile', 'No personally identifying information is shared', 'You can delete your data at any time', 'Takes about 10-15 minutes'].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 rounded border-white/30 bg-white/10 accent-amber-500" />
                <span className="text-sm text-white/70">I consent to my responses being used to create a persona profile</span>
              </label>
              <button disabled={!consent || isSubmitting} onClick={async () => { await submitConsent(); setStage('privacy'); }} className="w-full py-3.5 rounded-xl bg-gold text-navy font-semibold disabled:opacity-40 hover:bg-gold-light transition">
                {isSubmitting ? 'Setting up...' : "I'm In \u2014 Let's Start"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ========== PRIVACY ========== */}
        {stage === 'privacy' && (
          <motion.div key="privacy" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6"><Shield className="w-8 h-8 text-gold" /></div>
              <h2 className="text-2xl font-bold mb-3">Before We Begin</h2>
              <p className="text-white/60 mb-8">A few important things about your privacy</p>
              <div className="space-y-4 mb-8">
                {[{ title: 'Anonymized', desc: 'Your identity is never linked to your persona' }, { title: 'Encrypted', desc: 'All responses are encrypted in transit and at rest' }, { title: 'Your Control', desc: 'Delete your data at any time with one click' }].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 text-left">
                    <h4 className="font-medium text-gold mb-1">{item.title}</h4>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStage('demographics')} className="w-full py-3.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-light transition">Got It, Let&apos;s Go</button>
            </div>
          </motion.div>
        )}

        {/* ========== DEMOGRAPHICS ========== */}
        {stage === 'demographics' && (
          <motion.div key="demographics" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">{'\u{1F4CB}'}</div>
                <h2 className="text-2xl font-bold mb-2">Quick Background</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  If you&apos;re comfortable, share a bit about yourself. This helps build a richer persona.
                  <br />
                  <span className="text-white/40">Everything is optional — skip what you prefer.</span>
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {DEMOGRAPHIC_FIELDS.map((field) => (
                  <div key={field.key} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{field.icon}</span>
                      <span className="text-sm font-medium text-white/80">{field.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setDemographics((prev) => {
                              if (prev[field.key] === option) {
                                const next = { ...prev };
                                delete next[field.key];
                                // Clear self-describe text if deselecting
                                if (option === 'Prefer to self-describe') {
                                  setSelfDescribe((sd) => { const n = { ...sd }; delete n[field.key]; return n; });
                                }
                                return next;
                              }
                              // If selecting self-describe, clear any previous self-describe text
                              if (option !== 'Prefer to self-describe') {
                                setSelfDescribe((sd) => { const n = { ...sd }; delete n[field.key]; return n; });
                              }
                              return { ...prev, [field.key]: option };
                            });
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            demographics[field.key] === option
                              ? 'bg-gold/20 border-gold/40 text-gold font-medium'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {demographics[field.key] === 'Prefer to self-describe' && (
                      <input
                        type="text"
                        placeholder={`Describe your ${field.label.toLowerCase()}...`}
                        value={selfDescribe[field.key] || ''}
                        onChange={(e) => setSelfDescribe((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="mt-3 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 focus:border-gold/50 focus:outline-none transition"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage('mode')}
                  className="flex-1 py-3.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-light transition"
                >
                  {Object.keys(demographics).length > 0 ? 'Continue' : 'Skip & Continue'} <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>

              {Object.keys(demographics).length > 0 && (
                <p className="text-center text-xs text-white/30 mt-3">
                  {Object.keys(demographics).length} of {DEMOGRAPHIC_FIELDS.length} shared
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== MODE SELECT ========== */}
        {stage === 'mode' && (
          <motion.div key="mode" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-2">How would you like to share?</h2>
              <p className="text-white/60 mb-8">Choose whichever feels more natural</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setMode('voice'); setStage('voice'); }} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/50 hover:bg-white/10 transition-all group">
                  <Mic className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">Voice</h3>
                  <p className="text-xs text-white/50">Speak naturally, we&apos;ll transcribe</p>
                </button>
                <button onClick={() => { setMode('text'); setStage('questions'); }} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold/50 hover:bg-white/10 transition-all group">
                  <Type className="w-8 h-8 text-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">Type</h3>
                  <p className="text-xs text-white/50">Write at your own pace</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== VOICE CALL ========== */}
        {stage === 'voice' && question && (
          <motion.div key={`voice-${qi}`} {...pv} className="min-h-screen flex flex-col items-center p-6">
            {/* Progress bar */}
            <div className="max-w-[480px] w-full pt-4 mb-2">
              <div className="flex gap-1 mb-2">
                {ONBOARDING_QUESTIONS.map((_, i) => (
                  <div key={i} className="flex-1 h-[3px] rounded-sm transition-all duration-400" style={{ background: i < qi ? '#C8A96E' : i === qi ? '#1a1a2e' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-xs text-white/40">Q{qi + 1} of {ONBOARDING_QUESTIONS.length}</span>
                <span className="text-xs font-bold text-gold">Enrichment: {enrichment}%</span>
              </div>
            </div>

            {/* Dark gradient card — matches original design */}
            <div className="max-w-[480px] w-full rounded-3xl p-8 mb-6" style={{ background: 'linear-gradient(160deg, #1a1a2e, #0f3460, #16213e)', boxShadow: '0 12px 48px rgba(15,52,96,0.3)' }}>
              {/* Question text */}
              <p className="text-center text-lg font-medium text-white leading-relaxed mb-2">{question.question}</p>
              <p className="text-center text-xs mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{question.hint}</p>

              {/* Waveform */}
              <Waveform active={voiceState === 'listening'} />

              {/* State-based controls */}
              <div className="mt-7 flex flex-col items-center">
                {/* READY — Gold mic button */}
                {voiceState === 'ready' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                    <button
                      onClick={startRecording}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all hover:scale-105"
                      style={{ border: '3px solid rgba(200,169,110,0.4)', background: 'rgba(200,169,110,0.12)' }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.5">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    </button>
                    <p className="text-xs mt-4 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Tap the mic to start speaking</p>
                  </motion.div>
                )}

                {/* LISTENING — Red stop square + timer */}
                {voiceState === 'listening' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ border: '3px solid rgba(229,57,53,0.4)', background: 'rgba(229,57,53,0.2)', animation: 'pulse 1.5s ease infinite' }}
                    >
                      <div className="w-6 h-6 rounded-[4px]" style={{ background: '#e53935' }} />
                    </button>
                    <p className="text-base font-semibold mt-3 tabular-nums" style={{ color: '#e53935' }}>{formatTime(callTime)}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Tap to finish</p>

                    {/* Live transcript preview */}
                    {transcript && (
                      <div className="mt-4 w-full max-h-20 overflow-y-auto rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-xs text-white/60">{transcript}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PROCESSING — Animated dots */}
                {voiceState === 'processing' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ border: '3px solid rgba(200,169,110,0.3)', background: 'rgba(200,169,110,0.08)', animation: 'pulse 1s ease infinite' }}
                    >
                      <span className="text-sm font-semibold" style={{ color: '#C8A96E' }}>...</span>
                    </div>
                    <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Processing...</p>
                  </motion.div>
                )}

                {/* EDITING — Editable transcript for review */}
                {voiceState === 'editing' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full">
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Review and edit your response:</p>
                    <textarea
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl p-4 text-sm text-white placeholder-white/30 resize-none focus:outline-none transition"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(200,169,110,0.3)' }}
                      placeholder="Your transcribed answer will appear here..."
                    />
                    <div className="flex items-center justify-between w-full mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span>{editedTranscript.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={reRecord}
                        className="px-5 py-2 rounded-xl text-sm font-medium transition"
                        style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        Re-record
                      </button>
                      <button
                        onClick={confirmTranscript}
                        disabled={!editedTranscript.trim()}
                        className="px-6 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40"
                        style={{ background: 'rgba(200,169,110,0.2)', border: '1.5px solid rgba(200,169,110,0.4)', color: '#C8A96E' }}
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ANSWERED — Green checkmark + real score */}
                {voiceState === 'answered' && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ border: '3px solid rgba(102,187,106,0.4)', background: 'rgba(102,187,106,0.12)' }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#66BB6A" strokeWidth="2.5">
                        <path d="M5 12l5 5L20 7"/>
                      </svg>
                    </div>
                    {evaluating ? (
                      <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Evaluating your answer...</p>
                    ) : scores[qi] ? (
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold" style={{ color: scores[qi].score >= 7 ? '#66BB6A' : scores[qi].score >= 5 ? '#C8A96E' : '#ef5350' }}>
                          +{scores[qi].score} enrichment
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{scores[qi].feedback}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold mt-3" style={{ color: '#66BB6A' }}>Saved!</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action buttons below the card */}
            <div className="max-w-[480px] w-full flex gap-3 justify-center">
              {voiceState !== 'listening' && voiceState !== 'processing' && (
                <button
                  onClick={voiceSkipQuestion}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition hover:brightness-105"
                  style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                >
                  Skip
                </button>
              )}
              {voiceState === 'answered' && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={voiceNextQuestion}
                  className="px-8 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#C8A96E' }}
                >
                  {qi < ONBOARDING_QUESTIONS.length - 1 ? 'Next \u2192' : 'Finish \u2192'}
                </motion.button>
              )}
            </div>

            {/* Switch to typing link */}
            <button
              onClick={() => { setStage('questions'); setMode('text'); setCurrentAnswer(answers[qi] || ''); setVoiceState('ready'); setTranscript(''); }}
              className="mt-4 text-xs transition"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Switch to typing
            </button>

            {/* Next tier hint */}
            {(() => { const nextTier = REWARD_TIERS.find(t => enrichment < t.threshold); return nextTier ? (
              <div className="mt-5 inline-flex gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)' }}>
                <span className="text-xs" style={{ color: '#C8A96E' }}>{nextTier.threshold - enrichment}% to <strong>{nextTier.reward}</strong></span>
              </div>
            ) : null; })()}
          </motion.div>
        )}

        {/* ========== TEXT QUESTIONS ========== */}
        {stage === 'questions' && question && (
          <motion.div key={`q-${qi}`} {...pv} className="min-h-screen flex flex-col p-6">
            <div className="max-w-2xl mx-auto w-full pt-4 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">Question {qi + 1} of {ONBOARDING_QUESTIONS.length}</span>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-gold" /><span className="text-sm font-medium text-gold">{enrichment}%</span></div>
              </div>
              <ProgressDots current={qi} total={ONBOARDING_QUESTIONS.length} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-xl w-full">
                <h2 className="text-2xl font-bold text-center mb-2">{question.question}</h2>
                <p className="text-sm text-white/40 text-center mb-8">{question.hint}</p>
                <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Share your thoughts..." rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:border-gold/50 focus:outline-none transition" />
                <div className="flex items-center justify-between mt-2 text-xs text-white/30">
                  <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                  {scores[qi] ? (
                    <span className={scores[qi].score >= 7 ? 'text-emerald-400' : scores[qi].score >= 5 ? 'text-gold' : 'text-red-400'} title={scores[qi].feedback}>
                      +{scores[qi].score} — {scores[qi].feedback}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => { if (qi > 0) { if (currentAnswer.trim()) setAnswers({ ...answers, [qi]: currentAnswer }); setQi(qi - 1); setCurrentAnswer(answers[qi - 1] || ''); }}} disabled={qi === 0} className="flex items-center gap-1 text-sm text-white/50 hover:text-white disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" /> Back</button>
                  <button onClick={handleNextQuestion} className="flex items-center gap-2 bg-gold text-navy px-6 py-2.5 rounded-xl font-medium hover:bg-gold-light transition">{qi === ONBOARDING_QUESTIONS.length - 1 ? 'Finish' : 'Next'}<ChevronRight className="w-4 h-4" /></button>
                </div>
                <button onClick={() => { if (qi < ONBOARDING_QUESTIONS.length - 1) { setQi(qi + 1); setCurrentAnswer(answers[qi + 1] || ''); } else setStage('rewards'); }} className="w-full text-center mt-4 text-xs text-white/30 hover:text-white/50 transition">Skip this question</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========== REWARDS ========== */}
        {stage === 'rewards' && (
          <motion.div key="rewards" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="text-5xl mb-4">{enrichment >= 95 ? '\u{1F3C6}' : enrichment >= 80 ? '\u{1F948}' : enrichment >= 60 ? '\u{1F949}' : '\u{1F4CA}'}</div>
              <h2 className="text-2xl font-bold mb-2">Your Enrichment Score</h2>
              <div className="text-5xl font-bold text-gold my-6">{enrichment}%</div>
              <div className="space-y-3 mb-8">
                {REWARD_TIERS.map((tier) => (
                  <div key={tier.name} className={`flex items-center justify-between px-4 py-3 rounded-xl transition ${enrichment >= tier.threshold ? 'bg-gold/20 border border-gold/30' : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex items-center gap-3"><span className="text-lg">{tier.icon}</span><div className="text-left"><div className="font-medium text-sm">{tier.name}</div><div className="text-xs text-white/40">{tier.threshold}% threshold</div></div></div>
                    <div className={`text-sm font-semibold ${enrichment >= tier.threshold ? 'text-gold' : 'text-white/30'}`}>{tier.reward}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50 mb-6">{answeredCount} of {ONBOARDING_QUESTIONS.length} questions answered</p>
              <button onClick={() => setStage('comparison')} className="w-full py-3.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-light transition">See How You Compare</button>
            </div>
          </motion.div>
        )}

        {/* ========== COMPARISON ========== */}
        {stage === 'comparison' && (
          <motion.div key="comparison" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
              <div className="text-center mb-8"><BarChart2 className="w-8 h-8 text-gold mx-auto mb-3" /><h2 className="text-2xl font-bold">Perspective Comparison</h2><p className="text-white/50 text-sm mt-1">See how different personas might answer</p></div>
              {compPhase === 'question' && (
                <div className="text-center">
                  <div className="bg-white/5 rounded-xl p-6 mb-6"><p className="text-sm text-white/40 mb-2">Question {compQi + 1} of {COMPARISON_QUESTIONS.length}</p><h3 className="text-lg font-medium">{COMPARISON_QUESTIONS[compQi]}</h3></div>
                  <button onClick={() => setCompPhase('responses')} className="bg-gold text-navy px-6 py-2.5 rounded-xl font-medium hover:bg-gold-light transition">See Responses</button>
                </div>
              )}
              {compPhase === 'responses' && (
                <div>
                  <div className="space-y-3 mb-6">
                    {COMPARISON_RESPONSES.filter(r => r.type !== 'personal').map((resp, i) => (
                      <div key={i} className="rounded-xl p-4 bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2"><span className="text-sm font-medium">{resp.label}</span></div>
                        <p className="text-sm text-white/70">{resp.responses[compQi]}</p>
                      </div>
                    ))}
                    {/* Your Persona — dynamic */}
                    <div className="rounded-xl p-4 bg-gold/10 border border-gold/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Your Persona</span>
                        <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">You</span>
                      </div>
                      {loadingComparison ? (
                        <p className="text-sm text-white/50 italic">Generating your personalized response...</p>
                      ) : personalResponses && personalResponses[compQi] ? (
                        <p className="text-sm text-white/70">{personalResponses[compQi]}</p>
                      ) : (
                        <p className="text-sm text-white/50 italic">Could not generate — answer more questions for better results</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {compQi < COMPARISON_QUESTIONS.length - 1 ? (
                      <button onClick={() => { setCompQi(compQi + 1); setCompPhase('question'); }} className="flex-1 py-3 rounded-xl bg-gold text-navy font-medium hover:bg-gold-light transition">Next Comparison</button>
                    ) : (
                      <button onClick={async () => { await completeOnboarding(); setStage('final'); }} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-gold text-navy font-medium hover:bg-gold-light transition disabled:opacity-50">{isSubmitting ? 'Building your persona...' : 'See Your Results'}</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========== FINAL ========== */}
        {stage === 'final' && (
          <motion.div key="final" {...pv} className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              {personaResult?.error ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">&#x26A0;</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
                  <p className="text-white/60 mb-6">We couldn&apos;t generate your persona this time</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 text-left">
                    <h3 className="font-semibold text-red-400 mb-2 text-sm">Error Details</h3>
                    <p className="text-sm text-white/70">{personaResult.error}</p>
                  </div>
                  <button onClick={() => { setPersonaResult(null); setStage('comparison'); setCompPhase('responses'); }} className="w-full py-3.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition">Try Again</button>
                </>
              ) : (
                <>
                  <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Your Persona is Live</h2>
                  <p className="text-white/60 mb-8">Thank you for sharing your perspective with the world</p>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gold mb-3">Persona Summary</h3>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{personaResult?.narrative || 'Generating...'}</p>
                  </div>
                  {personaResult?.attributes && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left">
                      <h3 className="font-semibold text-gold mb-3 text-sm">Key Attributes</h3>
                      {personaResult.attributes.values?.length > 0 && (
                        <div className="mb-3"><span className="text-xs text-white/40">Values:</span><div className="flex flex-wrap gap-1.5 mt-1">{personaResult.attributes.values.map((v: string, i: number) => (<span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">{v}</span>))}</div></div>
                      )}
                      {personaResult.attributes.decision_style && (
                        <div className="mb-3"><span className="text-xs text-white/40">Decision style:</span> <span className="text-sm text-white/80">{personaResult.attributes.decision_style}</span></div>
                      )}
                      {personaResult.attributes.interests?.length > 0 && (
                        <div><span className="text-xs text-white/40">Interests:</span><div className="flex flex-wrap gap-1.5 mt-1">{personaResult.attributes.interests.map((v: string, i: number) => (<span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">{v}</span>))}</div></div>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-gold">{answeredCount}</div><div className="text-xs text-white/40">Answered</div></div>
                    <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-gold">{enrichment}%</div><div className="text-xs text-white/40">Enrichment</div></div>
                    <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-gold">{currentTier?.icon || '\u{1F4CA}'}</div><div className="text-xs text-white/40">{currentTier?.name || 'Starter'}</div></div>
                  </div>
                  {personaResult?.confidence_scores?.overall && (
                    <div className="mb-6 text-sm text-white/50">Confidence: <span className="text-gold font-semibold">{Math.round(personaResult.confidence_scores.overall * 100)}%</span></div>
                  )}
                  <a href="/" className="w-full inline-block py-3.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-light transition text-center">Return Home</a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
