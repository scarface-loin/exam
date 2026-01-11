import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Layout, PenTool, AlertCircle } from 'lucide-react';

import ExamB1 from './ExamB1';
import ExamB2 from './ExamB2';

const API_URL = "https://wavy-server.onrender.com";

// --- COMPOSANT PRINCIPAL APP ---
const App = ({ student, timeRemaining }) => {
  const [examType, setExamType] = useState(null); 
  const [isExiting, setIsExiting] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Récupérer la durée configurée au démarrage
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/status`);
        const data = await res.json();
        if (data.durationMinutes) {
          setDurationMinutes(data.durationMinutes);
        }
      } catch (error) {
        console.error('Erreur récupération config:', error);
      }
    };
    fetchConfig();
  }, []);

  const goHome = () => {
    if (examType) {
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

  // Soumission automatique quand le temps est écoulé
  useEffect(() => {
    if (timeRemaining === 0 && examType) {
      alert('⏰ Le temps est écoulé ! Votre examen sera soumis automatiquement.');
      // L'examen va se soumettre automatiquement via son propre mécanisme
    }
  }, [timeRemaining, examType]);

  if (examType === 'B1') {
    return (
      <div className={`transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        <ExamB1 
          student={student} 
          onExit={goHome}
          autoSubmit={timeRemaining === 0}
        />
      </div>
    );
  }

  if (examType === 'B2') {
    return (
      <div className={`transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        <ExamB2 
          student={student} 
          onExit={goHome}
          autoSubmit={timeRemaining === 0}
        />
      </div>
    );
  }

  // --- MENU PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col font-sans">
      
      {/* Navigation */}
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
               Bienvenue, <span className="text-blue-700">{student?.name || 'Étudiant'}</span>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
              ● En ligne
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-6">
         
         {/* En-tête */}
         <div className="text-center mb-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
              Choisissez votre niveau
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Sélectionnez l'examen Telc que vous souhaitez passer aujourd'hui
            </p>
            <div className="mt-4 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-bold border border-blue-300">
              📚 Durée: {durationMinutes} minutes
            </div>
         </div>

         {/* Grille des examens */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
           
           {/* CARD B1 */}
           <button 
              onClick={() => setExamType('B1')}
              className="group relative bg-white p-6 rounded-2xl shadow-md border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
           >
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
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Durée</p>
                      <p className="text-sm font-bold text-gray-700">{durationMinutes} min</p>
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
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Durée</p>
                      <p className="text-sm font-bold text-gray-700">{durationMinutes} min</p>
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

         {/* Informations importantes */}
         <div className="mt-8 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-4 max-w-2xl">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
             <AlertCircle size={18} className="text-blue-600" />
             Informations importantes
           </h4>
           <ul className="text-sm text-gray-600 space-y-1">
             <li>• Assurez-vous d'avoir une connexion internet stable</li>
             <li>• Vos réponses sont sauvegardées automatiquement</li>
             <li>• Le timer est synchronisé avec le serveur</li>
             <li>• L'examen se soumet automatiquement à la fin du temps</li>
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