// FICHIER : App.js
import React, { useState } from 'react';
import { Star, ArrowRight, Layout, PenTool } from 'lucide-react';

// Importation des deux pages séparées
import ExamB1 from './ExamB1'; // Fichier créé à l'étape 2
import ExamB2 from './ExamB2'; // Votre "Ancien App.js" renommé à l'étape 1

const App = () => {
  // Gestion de la navigation ('HOME', 'B1', 'B2')
  const [currentView, setCurrentView] = useState('HOME');
  
  // Simulation de données élève
  const student = { name: "Étudiant Demo", phone: "00000" };

  // FONCTION DE NAVIGATION (Passée aux enfants via onExit)
  const goHome = () => setCurrentView('HOME');

  // Rendu conditionnel des fichiers
  if (currentView === 'B1') {
    return <ExamB1 student={student} onExit={goHome} />;
  }

  if (currentView === 'B2') {
    return <ExamB2 student={student} onExit={goHome} />;
  }

  // --- MENU D'ACCUEIL ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar Simple */}
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

      {/* Contenu Menu */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-6">
         
         <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold text-gray-800">Choisissez votre niveau</h2>
            <p className="text-gray-500 mt-2">Sélectionnez l'examen que vous souhaitez passer aujourd'hui.</p>
         </div>

         {/* Carte Choix B1 */}
         <button 
            onClick={() => setCurrentView('B1')}
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

         {/* Carte Choix B2 */}
         <button 
            onClick={() => setCurrentView('B2')}
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

         <div className="mt-8 p-4 bg-gray-100 rounded-xl text-xs text-gray-500 text-center leading-relaxed">
            Astuce : Si les structures d'examens changent, chaque niveau charge son propre fichier de configuration indépendant.
         </div>

      </main>
    </div>
  );
};

export default App;