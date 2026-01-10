import React, { useState, useEffect } from 'react';
import examData from './data.json';
import { CheckCircle2, XCircle, BookOpen, Trophy } from 'lucide-react';

// --- MODIFICATION ICI ---
const API_URL = "https://wavy-server.onrender.com";

const App = ({ student }) => {
  // ... (Les états restent identiques) ...
  const [activeTab, setActiveTab] = useState('part1');
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (showResults && !submitted) {
      let correctCount = 0;
      let totalCount = 0;

      examData.part1.texts.forEach(t => {
        totalCount++;
        if (answers[t.id] === t.solution) correctCount++;
      });

      examData.part3.situations.forEach(s => {
        totalCount++;
        const userAns = (answers[s.id] || '').toLowerCase();
        const correctAns = s.solution.toLowerCase();
        if (userAns === correctAns) correctCount++;
      });

      setScore({ correct: correctCount, total: totalCount });

      // --- MODIFICATION DANS LE FETCH ---
      if (student && student.phone) {
          // Utilisation de API_URL
          fetch(`${API_URL}/api/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone: student.phone,
                  score: correctCount,
                  total: totalCount,
                  answers: answers
              })
          })
          .then(res => res.json())
          .then(data => {
              console.log("Note enregistrée sur Render !", data);
              setSubmitted(true);
          })
          .catch(err => console.error("Erreur envoi note", err));
      }
    }
  }, [showResults, answers, submitted, student]);

  // ... (Le reste du code handleSelect, getButtonClass et le return HTML reste IDENTIQUE) ...
  // Garde tout le reste de ton fichier App.jsx tel quel.
  
  const handleSelect = (questionId, value) => {
    if (showResults) return; 
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getButtonClass = (questionId, optionId, correctSolution) => {
    const isSelected = answers[questionId] === optionId;
    const isCorrectAnswer = optionId.toLowerCase() === correctSolution?.toLowerCase();
    
    let baseClass = "px-3 py-1 rounded-md text-sm font-medium transition-all border ";

    if (!showResults) {
      return baseClass + (isSelected 
        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50');
    } else {
      if (isSelected && isCorrectAnswer) {
        return baseClass + "bg-green-600 text-white border-green-600 font-bold"; 
      } else if (isSelected && !isCorrectAnswer) {
        return baseClass + "bg-red-500 text-white border-red-500 opacity-60"; 
      } else if (!isSelected && isCorrectAnswer) {
        return baseClass + "bg-white text-green-700 border-green-500 ring-2 ring-green-500 ring-offset-1 font-bold"; 
      } else {
        return baseClass + "bg-gray-50 text-gray-400 border-gray-200 opacity-50"; 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24 pt-16"> 
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600 w-6 h-6" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Telc Deutsch B1</h1>
              {student && <p className="text-xs text-gray-500">Candidat : {student.name}</p>}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!showResults && (
                <button 
                onClick={() => {
                    if(confirm("Êtes-vous sûr de vouloir terminer l'examen ?")) {
                        setShowResults(true);
                    }
                }}
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                Ergebnis prüfen
                </button>
            )}
            {showResults && (
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold">
                    Examen terminé
                </div>
            )}
          </div>
        </div>
        
        {showResults && (
          <div className="bg-gray-900 text-white py-3 animate-in slide-in-from-top-4">
            <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Trophy className={`w-8 h-8 ${score.correct >= score.total * 0.6 ? 'text-yellow-400' : 'text-gray-400'}`} />
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Dein Ergebnis</div>
                  <div className="text-xl font-bold">
                    {score.correct} <span className="text-gray-500 text-base">/ {score.total}</span>
                    <span className="ml-3 text-sm font-normal text-gray-300">
                      ({Math.round((score.correct / score.total) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                 <p className="text-xs text-gray-400">
                   Note enregistrée. Vous pouvez fermer cette page.
                 </p>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('part1')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'part1' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Teil 1 (1–5)
          </button>
          <button
            onClick={() => setActiveTab('part3')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'part3' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Teil 3 (11–20)
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'part1' && (
          <Part1 
            data={examData.part1} 
            answers={answers} 
            onAnswer={handleSelect} 
            getBtnClass={getButtonClass}
            showResults={showResults}
          />
        )}
        {activeTab === 'part3' && (
          <Part3 
            data={examData.part3} 
            answers={answers} 
            onAnswer={handleSelect}
            getBtnClass={getButtonClass}
            showResults={showResults}
          />
        )}
      </main>
    </div>
  );
};

// ... (Ajoute ici les composants Part1 et Part3 qui n'ont pas changé) ...
const Part1 = ({ data, answers, onAnswer, getBtnClass, showResults }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">{data.title}</h2>
        <p className="text-blue-700 text-sm">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-36 md:top-24">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Überschriften (a–j)</h3>
            <ul className="space-y-3 text-sm">
              {data.headlines.map((h) => (
                <li key={h.id} className="p-2 bg-gray-50 rounded border border-gray-100 flex gap-2">
                  <span className="font-bold text-blue-600 min-w-[20px]">{h.id})</span>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {data.texts.map((text) => {
            const isCorrect = answers[text.id] === text.solution;
            
            return (
              <div key={text.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-all ${
                showResults 
                  ? (isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30') 
                  : 'border-gray-200'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div className="flex items-center gap-3">
                     <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-md">
                        {text.id}
                     </span>
                     {showResults && !isCorrect && (
                       <span className="text-red-600 text-sm font-bold flex items-center gap-1 animate-pulse">
                         <XCircle size={16} /> Falsch
                       </span>
                     )}
                     {showResults && isCorrect && (
                       <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                         <CheckCircle2 size={16} /> Richtig
                       </span>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                    {data.headlines.map(h => (
                      <button
                        key={h.id}
                        disabled={showResults}
                        onClick={() => onAnswer(text.id, h.id)}
                        className={getBtnClass(text.id, h.id, text.solution)}
                      >
                        {h.id}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{text.content}</p>
                
                {showResults && !isCorrect && (
                   <div className="mt-3 text-sm text-gray-500 bg-white/50 p-2 rounded border border-gray-100 inline-block">
                     Richtige Lösung: <span className="font-bold text-green-600 uppercase">{text.solution}</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Part3 = ({ data, answers, onAnswer, getBtnClass, showResults }) => {
  const options = [...data.ads.map(ad => ad.id), 'x'];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">{data.title}</h2>
        <p className="text-blue-700 text-sm">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-gray-800 mb-2">Situationen</h3>
          {data.situations.map((sit) => {
             const userAns = (answers[sit.id] || '').toLowerCase();
             const correctAns = sit.solution.toLowerCase();
             const isCorrect = userAns === correctAns;
             
             let statusColor = "bg-gray-200"; 
             if (showResults) {
                 statusColor = isCorrect ? "bg-green-500" : "bg-red-500";
             } else if (answers[sit.id]) {
                 statusColor = "bg-blue-500";
             }

             return (
              <div key={sit.id} className={`bg-white p-5 rounded-xl shadow-sm border relative overflow-hidden transition-all ${
                showResults && !isCorrect ? 'border-red-200' : 'border-gray-200'
              }`}>
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor} transition-colors duration-300`}></div>
                 
                 <div className="pl-3">
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-500 text-sm uppercase tracking-wide">Nr. {sit.id}</span>
                          {showResults && isCorrect && <CheckCircle2 size={18} className="text-green-500"/>}
                          {showResults && !isCorrect && <XCircle size={18} className="text-red-500"/>}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 justify-start sm:justify-end max-w-full sm:max-w-[200px]">
                          {options.map(opt => (
                              <button
                                  key={opt}
                                  disabled={showResults}
                                  onClick={() => onAnswer(sit.id, opt)}
                                  className={getBtnClass(sit.id, opt, sit.solution)}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                   </div>
                   <p className="text-gray-800 font-medium leading-snug">{sit.text}</p>
                   
                   {showResults && !isCorrect && (
                       <div className="mt-3 pt-2 border-t border-red-50 text-sm flex items-center gap-2 text-red-700">
                           <span>Dein: <span className="font-bold strike-through">{answers[sit.id] || '-'}</span></span>
                           <span className="text-gray-400">→</span>
                           <span className="text-green-700 font-bold">Lösung: {sit.solution}</span>
                       </div>
                   )}
                 </div>
              </div>
             );
          })}
        </div>

        <div className="space-y-4">
          <div className="sticky top-24 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="font-bold text-xl text-gray-800 mb-4 px-1">Anzeigen (a–l)</h3>
            <div className="grid grid-cols-1 gap-4">
                {data.ads.map((ad) => (
                    <div key={ad.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-sm group hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded text-xs border border-orange-200">
                                {ad.id}
                            </span>
                            <h4 className="font-bold text-gray-900 truncate">{ad.title}</h4>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">{ad.content}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;