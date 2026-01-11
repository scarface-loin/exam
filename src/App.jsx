// FICHIER : App.jsx

import React, { useState, useEffect } from 'react'; // <--- CORRECTION ICI
import { Star, ArrowRight, Layout, PenTool, Clock } from 'lucide-react';

import ExamB1 from './ExamB1';
import ExamB2 from './ExamB2';

// --- COMPOSANT Timer ---
const Timer = ({ initialTime, onTimeUp, studentName }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    // Maintenant, `useEffect` est correctement défini car il a été importé en haut.
    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, onTimeUp]);
    
    const formatTime = (ms) => {
        if (ms < 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft <= 5 * 60 * 1000;

    return (
        <div className={`fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 ${isLowTime ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
            <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-400">{studentName}</div>
                <div className={`font-mono text-xl font-bold tabular-nums ${isLowTime ? 'text-red-400' : 'text-green-400'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
    );
};

// --- LE RESTE DU FICHIER RESTE IDENTIQUE ---

const App = ({ student, examConfig, onTimeUp, submitTrigger }) => {
  const [examType, setExamType] = useState(null); 

  const goHome = () => setExamType(null);

  if (examType === 'B1') {
    return (
      <>
        <Timer 
            initialTime={examConfig.durationB1} 
            onTimeUp={onTimeUp} 
            studentName={student.name}
        />
        <ExamB1 
          student={student} 
          onExit={goHome}
          submitTrigger={submitTrigger}
        />
      </>
    );
  }

  if (examType === 'B2') {
    return (
      <>
        <Timer 
            initialTime={examConfig.durationB2} 
            onTimeUp={onTimeUp} 
            studentName={student.name}
        />
        <ExamB2 
          student={student} 
          onExit={goHome}
          submitTrigger={submitTrigger}
        />
      </>
    );
  }

  // --- MENU PRINCIPAL (identique à avant) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-blue-900">
           <div className="bg-blue-600 text-white p-1 rounded-md">
             <Layout size={20} />
           </div>
           WAVY.LEARN
        </div>
        <div className="text-sm font-semibold text-gray-500">
           Bienvenue, {student.name}
        </div>
      </nav>
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6">
         <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold text-gray-800">Choisissez votre niveau</h2>
            <p className="text-gray-500 mt-2">Sélectionnez l'examen que vous souhaitez passer aujourd'hui.</p>
         </div>
         <button 
            onClick={() => setExamType('B1')}
            className="w-full bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-500 hover:shadow-xl hover:scale-105 transition-all group flex items-center justify-between"
         >
            <div className="flex items-center gap-4">
               <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                  <PenTool size={28} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-700">Telc B1</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase">Intermédiaire</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-emerald-500" />
         </button>
         <button 
            onClick={() => setExamType('B2')}
            className="w-full bg-white p-5 rounded-2xl shadow-sm border border-blue-100 hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all group flex items-center justify-between"
         >
            <div className="flex items-center gap-4">
               <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Star size={28} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">Telc B2</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase">Avancé (Format Standard)</p>
               </div>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-blue-500" />
         </button>
      </main>
    </div>
  );
};

export default App;