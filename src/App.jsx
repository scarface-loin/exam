import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Layout, PenTool, Clock, AlertCircle } from 'lucide-react';

import ExamB1 from './ExamB1';
import ExamB2 from './ExamB2';

// --- COMPOSANT Timer ---
const Timer = ({ initialTime, onTimeUp, studentName }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isBlinking, setIsBlinking] = useState(false);

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

    const isLowTime = timeLeft <= 5 * 60 * 1000; // Moins de 5 minutes
    const isCriticalTime = timeLeft <= 2 * 60 * 1000; // Moins de 2 minutes

    // Animation de clignotement pour le temps critique
    useEffect(() => {
        if (isCriticalTime) {
            const blinkInterval = setInterval(() => {
                setIsBlinking(prev => !prev);
            }, 500);
            return () => clearInterval(blinkInterval);
        } else {
            setIsBlinking(false);
        }
    }, [isCriticalTime]);

    return (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 transition-all ${
            isCriticalTime 
                ? `bg-red-600 border-red-800 ${isBlinking ? 'scale-110' : 'scale-100'}` 
                : isLowTime 
                    ? 'bg-orange-600 border-orange-800 animate-pulse' 
                    : 'bg-gray-900 border-gray-700'
        }`}>
            <div className="text-right hidden sm:block">
                <div className={`text-xs ${isCriticalTime ? 'text-red-100' : isLowTime ? 'text-orange-100' : 'text-gray-400'}`}>
                    {studentName}
                </div>
                <div className={`font-mono text-xl font-bold tabular-nums ${
                    isCriticalTime ? 'text-white' : isLowTime ? 'text-white' : 'text-green-400'
                }`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <Clock className={`w-6 h-6 ${isCriticalTime || isLowTime ? 'text-white' : 'text-gray-400'}`} />
            
            {/* Alerte visuelle pour temps critique */}
            {isCriticalTime && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 animate-bounce">
                    <AlertCircle className="w-4 h-4 text-red-800" />
                </div>
            )}
        </div>
    );
};

// --- COMPOSANT PRINCIPAL APP ---
const App = ({ student, examConfig, onTimeUp, submitTrigger }) => {
  const [examType, setExamType] = useState(null); 
  const [isExiting, setIsExiting] = useState(false);

  const goHome = () => {
    // Confirmation avant de quitter un examen en cours
    if (examType && !submitTrigger) {
      const confirmExit = window.confirm(
        "⚠️ Attention ! Vous êtes en train de passer un examen.\n\nSi vous quittez maintenant, vos réponses seront perdues.\n\nVoulez-vous vraiment quitter ?"
      );
      if (!confirmExit) return;
    }
    
    setIsExiting(true);
    setTimeout(() => {
      setExamType(null);
      setIsExiting(false);
    }, 300);
  };

  if (examType === 'B1') {
    return (
      <div className={`transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
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
      </div>
    );
  }

  if (examType === 'B2') {
    return (
      <div className={`transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
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
      </div>
    );
  }

  // --- MENU PRINCIPAL AMÉLIORÉ ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col font-sans">
      
      {/* Navigation avec effet glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-md p-4 shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-blue-900">
             <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-1 rounded-md shadow-lg">
               <Layout size={20} />
             </div>
             WAVY.LEARN
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm font-semibold text-gray-500">
               Bienvenue, <span className="text-blue-700">{student.name}</span>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
              ● En ligne
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-6">
         
         {/* En-tête avec animation */}
         <div className="text-center mb-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
              Choisissez votre niveau
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Sélectionnez l'examen Telc que vous souhaitez passer aujourd'hui
            </p>
            <div className="mt-4 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-bold border border-blue-300">
              📚 2 examens disponibles
            </div>
         </div>

         {/* Grille des examens avec hover effects améliorés */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
           
           {/* CARD B1 */}
           <button 
              onClick={() => setExamType('B1')}
              className="group relative bg-white p-6 rounded-2xl shadow-md border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
           >
              {/* Effet de fond animé */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="flex items-center justify-between w-full">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                    <PenTool size={32} />
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={24} />
                </div>
                
                <div className="text-left w-full">
                  <h3 className="font-bold text-2xl text-gray-800 group-hover:text-emerald-700 transition-colors mb-1">
                    Telc B1
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                    Niveau Intermédiaire
                  </p>
                  
                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Durée</p>
                      <p className="text-sm font-bold text-gray-700">{Math.round(examConfig.durationB1 / 60000)} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Niveau</p>
                      <p className="text-sm font-bold text-emerald-600">★★★☆☆</p>
                    </div>
                  </div>
                </div>
              </div>
           </button>

           {/* CARD B2 */}
           <button 
              onClick={() => setExamType('B2')}
              className="group relative bg-white p-6 rounded-2xl shadow-md border-2 border-blue-100 hover:border-blue-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
           >
              {/* Effet de fond animé */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="flex items-center justify-between w-full">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                    <Star size={32} />
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={24} />
                </div>
                
                <div className="text-left w-full">
                  <h3 className="font-bold text-2xl text-gray-800 group-hover:text-blue-700 transition-colors mb-1">
                    Telc B2
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                    Niveau Avancé
                  </p>
                  
                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Durée</p>
                      <p className="text-sm font-bold text-gray-700">{Math.round(examConfig.durationB2 / 60000)} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Niveau</p>
                      <p className="text-sm font-bold text-blue-600">★★★★☆</p>
                    </div>
                  </div>
                </div>
              </div>
           </button>
         </div>

         {/* Informations supplémentaires */}
         <div className="mt-8 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 max-w-2xl">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
             <AlertCircle size={18} className="text-blue-600" />
             Informations importantes
           </h4>
           <ul className="text-sm text-gray-600 space-y-1">
             <li>• Assurez-vous d'avoir une connexion internet stable</li>
             <li>• Vos réponses sont sauvegardées automatiquement</li>
             <li>• Le timer démarre dès que vous entrez dans l'examen</li>
             <li>• Vous pouvez naviguer entre les sections pendant l'examen</li>
           </ul>
         </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-200 bg-white/50">
        <p>© 2025 WAVY.LEARN - Plateforme d'examens Telc</p>
      </footer>
    </div>
  );
};

export default App;