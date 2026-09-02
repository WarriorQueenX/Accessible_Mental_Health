import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';

// ===== SIGNAL KEYWORDS =====
const SIGNAL_KEYWORDS = {
  work_stress: {
    keywords: ['stress', 'work', 'boss', 'pressure', 'shift', 'tension', 'deadline', 'target', 'manager', 'workload', 'overtime', 'too much'],
    emoji: '💼',
    label: 'Work Stress'
  },
  sleep_problems: {
    keywords: ['sleep', 'neend', 'tired', 'insomnia', 'exhausted', 'thakan', 'raat', 'jag raha', 'restless', 'fatigue'],
    emoji: '😴',
    label: 'Sleep Issues'
  },
  loneliness: {
    keywords: ['alone', 'lonely', 'akela', 'isolated', 'no one', 'tanha', 'kisi se baat', 'left out', 'disconnected'],
    emoji: '🫂',
    label: 'Loneliness'
  },
  sadness: {
    keywords: ['sad', 'depressed', 'cry', 'down', 'low', 'hopeless', 'udaas', 'dukh', 'grief', 'empty', 'worthless'],
    emoji: '😔',
    label: 'Sadness'
  },
  anxiety: {
    keywords: ['anxious', 'worry', 'fear', 'panic', 'scared', 'darr', 'chain', 'ghabrahat', 'overwhelmed', 'nervous', 'tense'],
    emoji: '😰',
    label: 'Anxiety'
  },
  anger: {
    keywords: ['angry', 'frustrated', 'rage', 'irritated', 'annoyed', 'gussa', 'pissed'],
    emoji: '😤',
    label: 'Anger'
  },
  burnout: {
    keywords: ['burnout', 'drained', 'empty', 'exhausted', "can't cope", 'no energy'],
    emoji: '🔥',
    label: 'Burnout'
  }
};

// ===== EXTRACT SIGNALS =====
function extractSignals(text) {
  const detected = [];
  const lower = text.toLowerCase();
  for (const [signal, data] of Object.entries(SIGNAL_KEYWORDS)) {
    if (data.keywords.some(kw => lower.includes(kw))) {
      detected.push({ signal, label: data.label, emoji: data.emoji });
    }
  }
  return detected;
}

// ===== SAFETY DETECTION =====
function isCrisis(text) {
  const lower = text.toLowerCase().trim();

  const crisisPhrases = [
    'suicide', 'self-harm', 'kill myself', 'kill me',
    'want to die', 'wants to die', 'feel like dying',
    'feeling like dying', 'thinking about dying', 'thought of dying',
    'dont want to live', "don't want to live", 'do not want to live',
    'no reason to live', 'no hope in living', 'no hope of living',
    'no hope for living', 'end my life', 'end it all', 'better off dead',
    'give up on living', 'give up on life', 'cant go on', "can't go on",
    'cannot go on', 'khatam kar doon', 'jeene ka mann nahi', 'mar jana',
    'apni jaan le lunga', 'jee nahi karta', 'life is meaningless',
    'nothing matters anymore', 'i should just die'
  ];

  if (crisisPhrases.some(phrase => lower.includes(phrase))) {
    return true;
  }

  if (
    lower.includes('dying') &&
    (
      lower.includes('feel like') ||
      lower.includes('feeling like') ||
      lower.includes('thinking about') ||
      lower.includes('thought of')
    )
  ) {
    return true;
  }

  return false;
}

// ===== SAVE TO localStorage =====
function saveSignalToStorage(signals) {
  const existing = JSON.parse(localStorage.getItem('signal_counts') || '{}');
  signals.forEach(s => {
    existing[s.signal] = (existing[s.signal] || 0) + 1;
  });
  localStorage.setItem('signal_counts', JSON.stringify(existing));
  window.dispatchEvent(new Event('storage'));
}

function saveCopingFeedback(strategy, helpful, context) {
  const existing = JSON.parse(localStorage.getItem('coping_feedback') || '{}');
  if (!existing[strategy]) existing[strategy] = [];
  existing[strategy].push({
    helpful,
    context,
    timestamp: Date.now()
  });
  localStorage.setItem('coping_feedback', JSON.stringify(existing));
}

function getCopingFeedback() {
  return JSON.parse(localStorage.getItem('coping_feedback') || '{}');
}

function getSignalFromStorage() {
  return JSON.parse(localStorage.getItem('signal_counts') || '{}');
}

function getSignalLabels() {
  const labels = {};
  for (const [signal, data] of Object.entries(SIGNAL_KEYWORDS)) {
    labels[signal] = { label: data.label, emoji: data.emoji };
  }
  return labels;
}

// ===== COPING STRATEGIES =====
const COPING_STRATEGIES = {
  slow_breathing: {
    label: 'Slow Breathing',
    emoji: '🌬️',
    description: "Let's slow things down for a minute.",
    instruction: "Breathe in slowly... now breathe out... just a little slower than before."
  },
  grounding_54321: {
    label: '5-4-3-2-1 Grounding',
    emoji: '🌎',
    description: "Let's focus on what's around you for a moment.",
    instruction: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
  },
  feet_on_floor: {
    label: 'Feet on Floor',
    emoji: '🪑',
    description: "Put both feet on the floor.",
    instruction: "Feel your feet on the ground, the chair beneath you."
  },
  short_walk: {
    label: 'Short Walk',
    emoji: '🚶',
    description: "If you can step outside or walk around for a few minutes.",
    instruction: "Walk somewhere, even just to the next room or outside."
  },
  water_food_rest: {
    label: 'Water & Rest',
    emoji: '🥤',
    description: "Have you had some water or food recently?",
    instruction: "Drink some water, have a small snack, or rest for a moment."
  },
  thought_distancing: {
    label: 'Thought Distancing',
    emoji: '🧠',
    description: "You don't have to solve that thought right now.",
    instruction: "Notice the thought without trying to fix it. It's just a thought."
  },
  brain_dump: {
    label: 'Brain Dump',
    emoji: '📝',
    description: "Say everything that's on your mind.",
    instruction: "Write or say everything on your mind, no filters needed."
  },
  contact_trusted: {
    label: 'Contact Someone',
    emoji: '📞',
    description: "Is there someone you feel comfortable talking with right now?",
    instruction: "Reach out to one person you trust."
  },
  one_tiny_step: {
    label: 'One Tiny Step',
    emoji: '🧩',
    description: "Forget the whole problem for now.",
    instruction: "What's one thing you need to get through the next hour?"
  },
  pause_trigger: {
    label: 'Pause the Trigger',
    emoji: '⏸️',
    description: "Step away from whatever is making this worse.",
    instruction: "Step away from the situation, even for 5 minutes."
  },
  wind_down: {
    label: 'Wind Down',
    emoji: '🛏️',
    description: "Make the next 20 minutes quieter.",
    instruction: "Dim lights, no screens, just quiet for 20 minutes."
  },
  reduce_stimulation: {
    label: 'Reduce Stimulation',
    emoji: '📱',
    description: "Put the phone aside if scrolling is making things heavier.",
    instruction: "Put away screens for a few minutes."
  },
  familiar_activity: {
    label: 'Familiar Activity',
    emoji: '🎨',
    description: "Do something familiar and low-pressure.",
    instruction: "Do something you know well that doesn't require much effort."
  },
  small_physical_task: {
    label: 'Small Physical Task',
    emoji: '🧹',
    description: "Let's do one tiny thing.",
    instruction: "Wash a cup, organize your bag, or change rooms."
  },
  voice_release: {
    label: 'Talk It Out',
    emoji: '🎙️',
    description: "You don't have to explain everything perfectly.",
    instruction: "Just say what's on your mind. Start anywhere."
  }
};

// ===== SITUATION → STRATEGY MAPPING =====
const SITUATION_STRATEGIES = {
  work_stress: ['slow_breathing', 'one_tiny_step', 'short_walk', 'water_food_rest', 'thought_distancing', 'pause_trigger'],
  sleep_problems: ['wind_down', 'slow_breathing', 'reduce_stimulation', 'water_food_rest', 'thought_distancing', 'feet_on_floor'],
  loneliness: ['contact_trusted', 'voice_release', 'brain_dump', 'familiar_activity'],
  sadness: ['brain_dump', 'voice_release', 'contact_trusted', 'water_food_rest', 'familiar_activity', 'small_physical_task'],
  anxiety: ['grounding_54321', 'slow_breathing', 'feet_on_floor', 'thought_distancing', 'reduce_stimulation', 'water_food_rest'],
  anger: ['pause_trigger', 'short_walk', 'feet_on_floor', 'brain_dump', 'voice_release', 'small_physical_task'],
  burnout: ['water_food_rest', 'short_walk', 'pause_trigger', 'familiar_activity', 'reduce_stimulation', 'small_physical_task']
};

// ===== GET SITUATION TYPE =====
function getSituationType(signals) {
  if (!signals || signals.length === 0) {
    return 'anxiety';
  }

  const priority = [
    'burnout',
    'anxiety',
    'sadness',
    'loneliness',
    'anger',
    'sleep_problems',
    'work_stress'
  ];

  for (const type of priority) {
    if (signals.some((s) => s.signal === type)) {
      return type;
    }
  }

  return signals[0].signal;
}

// ===== PERSONALIZED STRATEGY SELECTION =====
function getPersonalizedStrategy(situation, usedStrategies) {
  const available =
    SITUATION_STRATEGIES[situation] ||
    SITUATION_STRATEGIES.anxiety;

  const feedback = getCopingFeedback();

  const ranked = available
    .filter((key) => !usedStrategies.includes(key))
    .map((key) => {
      const history = feedback[key] || [];

      const helpful = history.filter(
        (item) =>
          item.helpful === 'yes' ||
          item.helpful === 'little'
      ).length;

      const total = history.length;

      let score = 0.5;

      if (total > 0) {
        score = helpful / total;
      }

      return {
        key,
        score,
        total
      };
    });

  if (ranked.length === 0) {
    return available[0] || 'slow_breathing';
  }

  ranked.sort((a, b) => {
    const difference = b.score - a.score;

    if (Math.abs(difference) < 0.15) {
      return Math.random() - 0.5;
    }

    return difference;
  });

  return ranked[0].key;
}

// ===== HOME PAGE =====
function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Accessible Mental Health</h1>
          <p className="text-sm text-[#64748b] mt-1">Evidence-based support for India's working class</p>
          <div className="h-px bg-[#e2e8f0] my-6"></div>
          <Link to="/chat" className="block w-full bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-[#1e293b] transition">Start Conversation</Link>
          <Link to="/dashboard" className="block w-full mt-2 bg-white text-[#0f172a] font-semibold py-3 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] transition">View Dashboard</Link>
          <div className="flex justify-center gap-5 mt-6 text-xs text-[#94a3b8]">
            <span>24/7</span><span>Confidential</span><span>Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== VOICE RECORDER COMPONENT =====
function VoiceRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          const recordings = JSON.parse(localStorage.getItem('voice_recordings') || '[]');
          const newRecording = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            audioData: base64Audio,
            duration: recordingTime
          };
          recordings.push(newRecording);
          localStorage.setItem('voice_recordings', JSON.stringify(recordings));
          if (onRecordingComplete) {
            onRecordingComplete(base64Audio, recordingTime);
          }
        };
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Microphone error:', error);
      alert('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!isSupported}
        className={`p-3 rounded-full transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
            : !isSupported
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        title={!isSupported ? 'Voice recording not supported' : (isRecording ? 'Stop recording' : 'Start recording')}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        {isRecording ? '⏹️' : '🎙️'}
      </button>
      {isRecording && (
        <span className="text-xs font-mono text-red-500">
          🔴 {formatTime(recordingTime)}
        </span>
      )}
    </div>
  );
}

// ===== VOICE NOTE PLAYER =====
function VoiceNotePlayer({ audioData, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioData;
    }
  }, [audioData]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-[#0f172a] text-white rounded-full hover:bg-[#1e293b] transition"
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <audio ref={audioRef} className="hidden" />
      <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#0f172a] rounded-full" style={{ width: isPlaying ? '100%' : '0%' }}></div>
      </div>
    </div>
  );
}

// ===== CHAT PAGE =====
function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey 👋 I'm here. How's your day been?",
      sender: 'bot',
      type: 'chat'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationMode, setConversationMode] = useState('listening');
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [lastContext, setLastContext] = useState(null);
  const [usedStrategies, setUsedStrategies] = useState([]);
  const [signalCounts, setSignalCounts] = useState(getSignalFromStorage);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleStorage = () => {
      setSignalCounts(getSignalFromStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function addBotMessage(text, type = 'chat') {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), text, sender: 'bot', type }
    ]);
  }

  function startStrategy() {
    const situation = lastContext || 'anxiety';
    const strategyKey = getPersonalizedStrategy(situation, usedStrategies);
    const strategy = COPING_STRATEGIES[strategyKey];
    if (!strategy) return;

    setActiveStrategy(strategyKey);
    setUsedStrategies(prev => [...prev, strategyKey]);
    setConversationMode('feedback');

    addBotMessage(
      `Okay. Let's keep it simple.\n\n${strategy.emoji} ${strategy.label}\n${strategy.instruction}\n\nGive it a try, then tell me how it went.`,
      'helping'
    );
  }

  function handleChoice(choice) {
    if (isTyping) return;
    if (choice === 'talk') {
      setConversationMode('listening');
      addBotMessage("Sure. I'm listening. Start wherever you want.", 'listening');
      return;
    }
    if (choice === 'settle' || choice === 'small_step') {
      startStrategy();
      return;
    }
  }

  function handleFeedback(result) {
    if (!activeStrategy) return;
    saveCopingFeedback(activeStrategy, result, lastContext);
    setActiveStrategy(null);
    if (result === 'yes' || result === 'little') {
      setConversationMode('listening');
      addBotMessage(
        result === 'yes'
          ? "Good. Let's keep that one in mind for next time."
          : "That's okay. Even a little is useful to know.",
        'followup'
      );
    } else {
      setConversationMode('choosing');
      addBotMessage(
        "Got it. That one wasn't useful this time. We can try something different, or you can just keep talking.",
        'followup'
      );
    }
  }

  function generateNaturalResponse(text, signals) {
    const lower = text.toLowerCase();
    const containsExams = /exam|quiz|test|study|studying|padhai/.test(lower);
    const containsTired = /tired|tiring|exhausted|drained|no energy|thakan/.test(lower);
    const containsWork = /work|job|kaam/.test(lower);
    const containsBoss = /boss|manager/.test(lower);
    const containsDeadline = /deadline|target/.test(lower);
    const containsFamily = /family|ghar|parents/.test(lower);
    const containsMoney = /money|paise|loan/.test(lower);

    if (containsExams && containsTired) {
      return {
        text: "Yeah, that sounds exhausting. You've got studying and exams taking a lot out of you. What feels hardest right now — getting started, keeping up, or the fear of not doing well?",
        offerChoice: true
      };
    }
    if (containsWork && containsBoss && containsDeadline) {
      return {
        text: "Another deadline while you're already trying to keep up? That's a lot. What's putting the most pressure on you right now?",
        offerChoice: true
      };
    }
    if (containsFamily) {
      return { text: "Yeah, things at home can affect everything else too. What happened?", offerChoice: false };
    }
    if (containsMoney) {
      return { text: "Money worries can take up a lot of mental space. What's the biggest thing you're dealing with right now?", offerChoice: false };
    }

    if (signals.some(s => s.signal === 'sleep_problems')) {
      return { text: "Being tired for a while can make everything feel harder. What's been messing with your sleep lately?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'loneliness')) {
      return { text: "Yeah. Feeling alone can make a difficult day feel even heavier. Have you been able to talk to anyone about it?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'anger')) {
      return { text: "Sounds like something really got under your skin. What happened?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'anxiety')) {
      return { text: "I hear you. What's the thing that's worrying you the most right now?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'sadness')) {
      return { text: "That sounds really heavy. What's been going on?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'burnout')) {
      return { text: "It sounds like you've been running on empty for a while. What's been taking the most out of you?", offerChoice: false };
    }
    if (signals.some(s => s.signal === 'work_stress')) {
      return { text: "Work pressure can pile up quickly. What's been the hardest part of it?", offerChoice: false };
    }

    return { text: "I'm listening. Tell me what happened.", offerChoice: false };
  }

  function processMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    if (isCrisis(cleanText)) {
      setConversationMode('safety');
      setActiveStrategy(null);
      addBotMessage(
        "I'm really glad you said that. This is something you shouldn't have to handle alone. Please reach out to a trusted person who can be with you right now, and contact immediate professional or emergency support if you might be in danger. In India, Tele-MANAS is available at 14416.",
        'crisis'
      );
      return;
    }

    if (conversationMode === 'feedback' && activeStrategy) {
      const lower = cleanText.toLowerCase();
      if (/yes|better|helped|good|acha/.test(lower)) {
        handleFeedback('yes');
        return;
      }
      if (/little|thoda|slight/.test(lower)) {
        handleFeedback('little');
        return;
      }
      if (/no|not|didn't|didnt|nahi/.test(lower)) {
        handleFeedback('no');
        return;
      }
      addBotMessage("How did that feel — better, a little better, or not really?", 'followup');
      return;
    }

    const signals = extractSignals(cleanText);
    console.log('📊 Signals detected:', signals);
    if (signals.length > 0) {
      saveSignalToStorage(signals);
      setSignalCounts(getSignalFromStorage());
    }

    const situation = getSituationType(signals);
    setLastContext(situation);
    const response = generateNaturalResponse(cleanText, signals);
    addBotMessage(response.text, response.offerChoice ? 'offering' : 'listening');
    setConversationMode(response.offerChoice ? 'choosing' : 'listening');
  }

  const handleSend = () => {
    if (!inputText.trim() || isTyping || conversationMode === 'safety') return;
    const userText = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user', type: 'user' }]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      processMessage(userText);
      setIsTyping(false);
    }, 600);
  };

  // ===== VOICE RECORDING COMPLETE =====
  const handleVoiceRecording = (audioData, duration) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: '🎤 Voice note',
        sender: 'user',
        type: 'voice',
        audioData: audioData,
        duration: duration
      }
    ]);
    // Add bot response after a delay
    setTimeout(() => {
      addBotMessage(
        "I've received your voice note. (In production, this would be transcribed and processed.)",
        'chat'
      );
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function renderMessage(msg) {
    const lines = msg.text.split('\n');

    // ===== VOICE NOTE MESSAGE =====
    if (msg.type === 'voice' && msg.audioData) {
      return (
        <div key={msg.id} className="flex justify-end">
          <div className="max-w-[85%] bg-[#0f172a] text-white px-4 py-3 rounded-2xl rounded-br-md">
            <VoiceNotePlayer audioData={msg.audioData} duration={msg.duration} />
          </div>
        </div>
      );
    }

    // ===== REGULAR MESSAGE =====
    return (
      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          msg.sender === 'user'
            ? 'bg-[#0f172a] text-white rounded-br-md'
            : msg.type === 'crisis'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-white text-[#0f172a] border border-[#f1f5f9] rounded-bl-md'
        }`}>
          {lines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        <div className="px-5 py-4 bg-white border-b border-[#f1f5f9] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-semibold text-sm text-[#0f172a]">Accessible Mental Health</span>
          </div>
          <button onClick={() => navigate('/')} className="text-[#94a3b8] hover:text-[#0f172a] text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfc]">
          {messages.map(renderMessage)}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#f1f5f9] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          {conversationMode === 'choosing' && !isTyping && (
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={() => handleChoice('talk')} className="w-full text-left px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#94a3b8] hover:bg-[#f8fafc] transition">
                <span className="mr-2">🎙️</span> Talk it out
                <p className="text-xs text-[#94a3b8] ml-7 mt-0.5">I just want someone to listen</p>
              </button>
              <button onClick={() => handleChoice('settle')} className="w-full text-left px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#94a3b8] hover:bg-[#f8fafc] transition">
                <span className="mr-2">🌿</span> Help me settle down
                <p className="text-xs text-[#94a3b8] ml-7 mt-0.5">Try something simple together</p>
              </button>
              <button onClick={() => handleChoice('small_step')} className="w-full text-left px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#94a3b8] hover:bg-[#f8fafc] transition">
                <span className="mr-2">🧩</span> Figure out one small thing
                <p className="text-xs text-[#94a3b8] ml-7 mt-0.5">Focus on what comes next</p>
              </button>
            </div>
          )}
          {conversationMode === 'feedback' && !isTyping && activeStrategy && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleFeedback('yes')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">👍 Helped</button>
              <button onClick={() => handleFeedback('little')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">🙂 A little</button>
              <button onClick={() => handleFeedback('no')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">Not really</button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== INPUT AREA WITH VOICE RECORDER ===== */}
        <div className="p-4 bg-white border-t border-[#f1f5f9] flex gap-2 items-center">
          <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={conversationMode === 'safety' ? 'Please reach out to someone you trust...' : 'Type your message...'}
            disabled={isTyping || conversationMode === 'safety'}
            className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#0f172a] transition disabled:bg-[#f8fafc]"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !inputText.trim() || conversationMode === 'safety'}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-xl hover:bg-[#1e293b] transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD PAGE =====
function DashboardPage() {
  const [signalCounts, setSignalCounts] = useState(getSignalFromStorage);
  const signalLabels = getSignalLabels();

  useEffect(() => {
    const handleStorage = () => {
      setSignalCounts(getSignalFromStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">📊 Dashboard</h1>
          <Link to="/" className="text-sm text-[#64748b] bg-white px-4 py-2 rounded-xl border border-[#e2e8f0] hover:border-[#94a3b8] transition">← Back</Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">{Object.keys(signalCounts).length}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Signal Types</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">{totalSignals}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Total Signals</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">0</div>
            <div className="text-xs text-[#94a3b8] mt-1">Crisis Alerts</div>
          </div>
          <div className="bg-white rounded-xl border border-[#f1f5f9] p-5 text-center">
            <div className="text-2xl font-bold text-[#0f172a]">0</div>
            <div className="text-xs text-[#94a3b8] mt-1">Peer Connections</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">📌 Signal Breakdown</h2>
          {Object.keys(signalCounts).length === 0 ? (
            <div className="text-center text-[#94a3b8] text-sm py-8">No signals detected yet.</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(signalCounts).map(([signal, count]) => (
                <div key={signal} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <span className="text-sm text-[#0f172a]">
                    {signalLabels[signal]?.emoji || '📌'} {signalLabels[signal]?.label || signal}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a] bg-[#f1f5f9] px-3 py-1 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#f1f5f9] p-6">
          <h2 className="text-sm font-semibold text-[#0f172a] mb-4">📈 Signal Trends</h2>
          <div className="h-48 bg-[#fafbfc] rounded-lg flex items-center justify-center text-[#94a3b8] text-sm border border-dashed border-[#e2e8f0]">
            {totalSignals > 0 ? `${totalSignals} signals tracked` : 'No data yet'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== WIDGET PAGE =====
function WidgetPage() {
  const [signalCounts, setSignalCounts] = useState(getSignalFromStorage);
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => {
      setSignalCounts(getSignalFromStorage());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalSignals = Object.values(signalCounts).reduce((sum, count) => sum + count, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const signals = extractSignals(inputText);
      if (signals.length > 0) {
        saveSignalToStorage(signals);
        setSignalCounts(getSignalFromStorage());
      }
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-[380px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100/50 p-5">
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-light text-gray-700">AMH</span>
            <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">beta</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">How are you feeling today?</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="flex items-center w-full bg-white border border-gray-200 rounded-full px-5 py-3 transition-all duration-200 hover:shadow-[0_1px_6px_rgba(0,0,0,0.1)] focus-within:shadow-[0_1px_6px_rgba(0,0,0,0.15)] focus-within:border-blue-400">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type how you feel..."
                className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 mx-3"
                autoFocus
              />
              <button type="button" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 rounded-full border border-gray-200 transition-all"
              >
                🔍 Search
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 rounded-full border border-gray-200 transition-all"
              >
                📊 Dashboard
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">🔒 Confidential</span>
            <span className="text-[10px] text-gray-300">•</span>
            <span className="text-[10px] text-gray-400">24/7</span>
          </div>
          {totalSignals > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500">{totalSignals} signals tracked</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400">No signals yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/widget" element={<WidgetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;