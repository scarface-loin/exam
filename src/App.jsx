import React, { useState } from 'react';
// ... (vos imports habituels : Star, ArrowRight, etc.)
import ExamB1 from './ExamB1';
import ExamB2 from './ExamB2';

// --- COMPOSANT Timer (copié de ExamGuard pour être utilisé ici) ---
const Timer = ({ initialTime, onTimeUp, studentName }) => {
    // ... (Code du Timer exactement comme dans le fichier ExamGuard précédent)
    const [timeLeft, setTimeLeft] = useState(initialTime);
    useEffect(() => { if (timeLeft <= 0) { onTimeUp(); return; } const t = setInterval(()=>setTimeLeft(p=>p-1000), 1000); return ()=>clearInterval(t); }, [timeLeft, onTimeUp]);
    const formatTime = (ms) => { if(ms<0) return "00:00"; const s=Math.floor(ms/1000),m=Math.floor(s/60); return `${(m).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`; };
    const low = timeLeft <= 300000;
    return <div className={`fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 ${low ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}><div className="text-right hidden sm:block"><div className="text-xs text-gray-400">{studentName}</div><div className={`font-mono text-xl font-bold ${low?'text-red-400':'text-green-400'}`}>{formatTime(timeLeft)}</div></div><Clock className={`w-6 h-6 ${low?'text-red-400':'text-gray-400'}`} /></div>;
};


// Le composant App reçoit les nouvelles props
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
          submitTrigger={submitTrigger} // On passe le déclencheur
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
          submitTrigger={submitTrigger} // On passe le déclencheur
        />
      </>
    );
  }

  // --- MENU PRINCIPAL (identique à avant) ---
  return (
    // ... (votre code pour le menu de choix B1/B2 reste identique)
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-8">Choisissez votre examen</h1>
        <div className="grid gap-4 w-full max-w-sm">
            <button onClick={() => setExamType('B1')} className="bg-emerald-500 text-white p-4 rounded-lg font-bold text-lg">Examen B1</button>
            <button onClick={() => setExamType('B2')} className="bg-blue-500 text-white p-4 rounded-lg font-bold text-lg">Examen B2</button>
        </div>
    </div>
  );
};

export default App;