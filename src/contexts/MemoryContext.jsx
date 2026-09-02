import React, { createContext, useState, useContext, useEffect } from 'react';

// Simple memory functions without external imports
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start) / 86400000;
  return Math.ceil(diff / 7);
};

const getMemory = () => {
  try {
    return JSON.parse(localStorage.getItem('saathi_memory')) || {};
  } catch {
    return {};
  }
};

const saveMemory = (memory) => {
  localStorage.setItem('saathi_memory', JSON.stringify(memory));
};

const MemoryContext = createContext();

export function MemoryProvider({ children }) {
  const [memory, setMemory] = useState(() => getMemory());
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

  const addSignal = (signal) => {
    const week = getCurrentWeek();
    const weekKey = `week_${week}`;
    setMemory(prev => {
      const newMemory = { ...prev };
      if (!newMemory[weekKey]) newMemory[weekKey] = {};
      newMemory[weekKey][signal] = (newMemory[weekKey][signal] || 0) + 1;
      return newMemory;
    });
  };

  const clearMemory = () => {
    setMemory({});
  };

  return (
    <MemoryContext.Provider value={{ memory, addSignal, clearMemory, currentWeek }}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within MemoryProvider');
  }
  return context;
}