import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  extractSignals,
  isCrisis,
  saveSignalToStorage,
  getSignalFromStorage,
  COPING_STRATEGIES,
  SITUATION_STRATEGIES,
  getCopingFeedback,
  saveCopingFeedback,
  getPersonalizedStrategy,
  getSituationType
} from '../utils/helpers';

// ===== VOICE RECORDER COMPONENT (Built-in) =====
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
            onRecordingComplete(base64Audio);
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

  const handleVoiceRecording = (audioData) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: '🎤 Voice note recorded',
      sender: 'user',
      type: 'user'
    }]);
    setTimeout(() => {
      addBotMessage(
        "Thanks for the voice note. I'll listen to it and get back to you. (In a real app, this would be transcribed and processed.)",
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
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#f1f5f9] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-semibold text-sm text-[#0f172a]">Accessible Mental Health</span>
          </div>
          <button onClick={() => navigate('/')} className="text-[#94a3b8] hover:text-[#0f172a] text-lg">✕</button>
        </div>

        {/* Chat */}
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
          {/* Choice buttons */}
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
          {/* Feedback buttons */}
          {conversationMode === 'feedback' && !isTyping && activeStrategy && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleFeedback('yes')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">👍 Helped</button>
              <button onClick={() => handleFeedback('little')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">🙂 A little</button>
              <button onClick={() => handleFeedback('no')} className="flex-1 px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm hover:bg-[#f8fafc] transition">Not really</button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA - Voice Recorder is here */}
        <div className="p-4 bg-white border-t border-[#f1f5f9] flex gap-2 items-center">
          {/* 🎤 VOICE RECORDER BUTTON */}
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

export default ChatPage;