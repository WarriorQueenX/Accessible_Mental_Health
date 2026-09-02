import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VoiceInput from './VoiceInput';
import SafetyAlert from './SafetyAlert';
import { useUser } from '../../contexts/UserContext';
import { useMemory } from '../../contexts/MemoryContext';
import { extractSignals, isCrisis } from '../../utils/signalDetector';
import { getAIResponse } from '../../utils/api';
import { getCopingStrategy } from '../../utils/copingStrategies';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const { user } = useUser();
  const { addSignal } = useMemory();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Check for crisis
    if (isCrisis(text)) {
      setCrisisDetected(true);
      const crisisResponse = {
        role: 'assistant',
        content: `🚨 I'm here for you. Please call Tele MANAS at 14416 (free, 24/7). You are not alone.`,
        timestamp: new Date(),
        isCrisis: true,
      };
      setMessages(prev => [...prev, crisisResponse]);
      setIsLoading(false);
      return;
    }

    // Extract signals
    const signals = extractSignals(text);
    signals.forEach(signal => addSignal(signal));

    // Get AI response
    try {
      const aiResponse = await getAIResponse(text, user, messages);
      const responseMessage = {
        role: 'assistant',
        content: aiResponse || getCopingStrategy(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const fallbackMessage = {
        role: 'assistant',
        content: getCopingStrategy(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {crisisDetected && (
        <SafetyAlert onDismiss={() => setCrisisDetected(false)} />
      )}
      
      <MessageList messages={messages} isLoading={isLoading} />
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <VoiceInput onSend={handleSendMessage} />
          <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
}