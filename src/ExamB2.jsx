import React, { useState, useEffect, useMemo } from 'react';
// IMPORT DE VOS DONNÉES SPÉCIFIQUES B2
import examDataStructure from './data/b2/exam_data.json';
import examTextsSource from './data/b2/exam_texts.json';
import examSolutionsFile from './data/b2/exam_solutions.json';

import { 
  CheckCircle2, XCircle, BookOpen, Trophy, Menu, 
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Home 
} from 'lucide-react';

const API_URL = "https://wavy-server.onrender.com";

const ExamB2 = ({ student, onExit, submitTrigger  }) => {
  
  // ==========================================
  // 1. FUSION DES DONNÉES (DATA + TEXTES)
  // ==========================================
  const examData = useMemo(() => {
    const mergedParts = examDataStructure.parts.map(part => {
      const textSource = examTextsSource.texts[part.id];
      if (!textSource) return part;

      if (part.type === 'matching_headlines') {
        const updatedItems = part.items.map(item => ({
          ...item,
          text_content: textSource.items[item.question_id] || "Texte indisponible."
        }));
        return { 
          ...part, 
          items: updatedItems,
          description: textSource.intro || part.instruction 
        };
      }

      if (['multiple_choice', 'gap_fill_choice', 'gap_fill_bank'].includes(part.type)) {
        return {
          ...part,
          reading_text: textSource.content || "Texte indisponible.",
          title: textSource.title || part.title,
          subtitle: textSource.subheadline || ""
        };
      }
      return part;
    });

    return { ...examDataStructure, parts: mergedParts };
  }, []);

  const solutions = useMemo(() => examSolutionsFile.solutions, []);
  
  // ==========================================
  // 2. GESTION D'ÉTATS
  // ==========================================
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const currentPart = examData.parts[activePartIndex];

  // ==========================================
  // 3. LOGIQUE MÉTIER
  // ==========================================
  const handleAnswer = (questionId, value) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

 useEffect(() => {
        // Si le trigger est supérieur à 0 (il a été appelé) et que l'examen n'est pas déjà fini
        if (submitTrigger > 0 && !showResults) {
            console.log("TEMPS ÉCOULÉ ! Soumission automatique...");
            setShowResults(true); // Déclenche la sauvegarde et l'affichage des résultats
        }
    }, [submitTrigger]); // Se déclenche seulement quand `submitTrigger` change

  const calculateAndSendScore = () => {
    let correctCount = 0;
    const questionIds = Object.keys(solutions);
    
    questionIds.forEach(qid => {
      const userAns = (answers[qid] || '').toLowerCase().trim();
      const correctAns = (solutions[qid] || '').toLowerCase().trim();
      if (userAns === correctAns && userAns !== '') correctCount++;
    });

    const totalQuestions = questionIds.length;
    setScore({ correct: correctCount, total: totalQuestions });

    if (student && student.phone) {
      fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: student.phone,
          exam_id: examSolutionsFile.exam_id,
          student_name: student.name,
          score: correctCount,
          total: totalQuestions,
          answers: answers
        })
      })
      .then(res => res.json())
      .then(() => setSubmitted(true))
      .catch(err => console.error("Erreur API:", err));
    }
  };

  useEffect(() => {
    if (showResults && !submitted) {
      calculateAndSendScore();
    }
  }, [showResults]);

  const getBtnClass = (questionId, optionKey, isRound = false) => {
    const isSelected = answers[questionId] === optionKey;
    const correctSol = solutions[questionId];
    
    let cls = `transition-all border font-semibold flex items-center justify-center 
               ${isRound ? 'w-10 h-10 rounded-full text-sm' : 'w-full py-3 px-4 rounded-xl text-base'}`;

    if (!showResults) {
      return cls + (isSelected 
        ? ' bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
        : ' bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:scale-95');
    } else {
      if (isSelected && optionKey === correctSol) return cls + ' bg-green-500 text-white border-green-500 shadow-md';
      if (isSelected && optionKey !== correctSol) return cls + ' bg-red-500 text-white border-red-500 opacity-90';
      if (!isSelected && optionKey === correctSol) return cls + ' bg-green-100 text-green-700 border-green-400 ring-2 ring-green-200';
      return cls + ' bg-gray-50 text-gray-300 border-gray-100 opacity-40';
    }
  };

  // --- RENDU ---
  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-gray-900">
      
      {/* HEADER FIXE */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               {/* BOUTON RETOUR AU MENU PRINCIPAL */}
               <button 
                 onClick={onExit} 
                 className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                 title="Quitter l'examen"
               >
                  <Home size={20} />
               </button>
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg">
                  <Menu size={20} />
               </button>
               <div>
                  <h1 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Telc B2</h1>
                  <p className="text-base font-extrabold text-blue-900 truncate max-w-[150px] sm:max-w-xs">
                    {currentPart.title}
                  </p>
               </div>
            </div>

             {!showResults ? (
              <button 
                onClick={() => { if(confirm("Valider l'examen ?")) setShowResults(true); }}
                className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition active:scale-95"
              >
                Valider
              </button>
            ) : (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                 {score.correct}/{score.total} pts
              </div>
            )}
          </div>

           {/* Onglets Mobile */}
           <div className={`mt-2 pt-2 border-t border-gray-100 overflow-x-auto ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
             <div className="flex space-x-2">
                {examData.parts.map((part, idx) => (
                   <button
                      key={part.id}
                      onClick={() => { setActivePartIndex(idx); setIsMenuOpen(false); }}
                      className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                         activePartIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                   >
                      {idx + 1}. {part.type.replace(/_/g, ' ').split(' ')[0]}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-3xl mx-auto p-4 space-y-6">
          
          {/* Résultat final */}
          {showResults && activePartIndex === 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${score.correct/score.total >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Score B2</p>
                    <p className="text-3xl font-extrabold">{Math.round((score.correct / score.total) * 100)}%</p>
                  </div>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-bold">{score.correct}</span>
                 <span className="text-gray-400 text-sm"> / {score.total}</span>
              </div>
            </div>
          )}

          {/* Consigne */}
          <div className="bg-white border-l-4 border-blue-500 rounded-r-xl shadow-sm p-4 text-sm md:text-base text-gray-700 leading-relaxed">
             <span className="font-bold text-blue-900 block mb-1">Aufgabe:</span>
             {currentPart.instruction || currentPart.description}
          </div>

          {/* INJECTION DES SOUS-COMPOSANTS */}
          {currentPart.type === 'matching_headlines' && (
             <MatchingPart 
                part={currentPart} 
                answers={answers} 
                onAnswer={handleAnswer} 
                getBtnClass={getBtnClass} 
                showResults={showResults} 
                solutions={solutions} 
             />
          )}
          {currentPart.type === 'multiple_choice' && (
             <MultipleChoicePart 
                part={currentPart} 
                answers={answers} 
                onAnswer={handleAnswer} 
                showResults={showResults} 
                solutions={solutions} 
             />
          )}
          {currentPart.type === 'gap_fill_choice' && (
             <GapFillChoicePart 
                part={currentPart} 
                answers={answers} 
                onAnswer={handleAnswer} 
                getBtnClass={getBtnClass} 
                showResults={showResults} 
                solutions={solutions} 
             />
          )}
          {currentPart.type === 'gap_fill_bank' && (
             <GapFillBankPart 
                part={currentPart} 
                answers={answers} 
                onAnswer={handleAnswer} 
                showResults={showResults} 
                solutions={solutions} 
             />
          )}

      </main>
      
      {/* Footer Navigation (Mobile) */}
      {!showResults && (
         <div className="fixed bottom-0 left-0 w-full bg-white p-4 flex justify-between md:hidden border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40">
            <button 
               disabled={activePartIndex === 0}
               onClick={() => { setActivePartIndex(p => Math.max(0, p-1)); window.scrollTo(0,0); }}
               className="flex items-center gap-1 px-3 py-2 text-gray-600 disabled:opacity-30 font-bold"
            >
              <ArrowLeft size={16}/> Précédent
            </button>
            <span className="text-xs flex items-center text-gray-400 font-mono">
              {activePartIndex + 1} / {examData.parts.length}
            </span>
            <button 
               disabled={activePartIndex === examData.parts.length - 1}
               onClick={() => { setActivePartIndex(p => Math.min(examData.parts.length-1, p+1)); window.scrollTo(0,0); }}
               className="flex items-center gap-1 bg-blue-900 text-white px-5 py-2 rounded-xl shadow-lg disabled:opacity-50 font-bold"
            >
               Suivant <ArrowRight size={16}/>
            </button>
         </div>
      )}
    </div>
  );
};


// =========================================================
//  SOUS-COMPOSANTS (RÉINTÉGRÉS COMPLETS)
// =========================================================

// --- 1. APPARIEMENT DE TITRES ---
const MatchingPart = ({ part, answers, onAnswer, getBtnClass, showResults, solutions }) => {
   const [isHeadlinesOpen, setIsHeadlinesOpen] = useState(false);

   return (
      <div className="space-y-6">
         {/* Panneau titres */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-28 z-30 transition-all">
            <button 
               onClick={() => setIsHeadlinesOpen(!isHeadlinesOpen)}
               className="w-full flex items-center justify-between p-4 bg-amber-50 text-amber-900 font-bold border-l-4 border-amber-400"
            >
               <span>Titres disponibles ({part.options[0].id}-{part.options[part.options.length-1].id})</span>
               {isHeadlinesOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            <div className={`${isHeadlinesOpen ? 'max-h-96' : 'max-h-0'} overflow-y-auto transition-all bg-white`}>
               <div className="p-4 space-y-3">
                  {part.options.map(opt => (
                     <div key={opt.id} className="text-sm p-3 rounded-lg bg-gray-50 border border-gray-100 flex gap-3">
                        <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{opt.id}</span>
                        <span className="text-gray-700 leading-snug">{opt.text}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Liste des Textes */}
         <div className="space-y-8">
            {part.items.map((item) => {
               const qId = item.question_id;
               const correctAns = solutions[qId];
               const isCorrect = answers[qId] === correctAns;
               
               return (
                  <div key={qId} className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                     showResults ? (isCorrect ? 'border-green-400' : 'border-red-400') : 'border-transparent'
                   }`}>
                     <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                        <span className="bg-slate-800 text-white min-w-[32px] h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                           Txt {qId}
                        </span>
                        {showResults && !isCorrect && (
                           <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                              Sol: {correctAns.toUpperCase()}
                           </div>
                        )}
                     </div>
                     <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-6 font-medium">
                        {item.text_content}
                     </p>
                     <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                        {part.options.map(opt => (
                           <button
                              key={opt.id}
                              disabled={showResults}
                              onClick={() => onAnswer(qId, opt.id)}
                              className={getBtnClass(qId, opt.id, true)}
                           >
                              {opt.id}
                           </button>
                        ))}
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
   );
};

// --- 2. QCM AVEC TEXTE ---
const MultipleChoicePart = ({ part, answers, onAnswer, showResults, solutions }) => {
   const [isTextOpen, setIsTextOpen] = useState(true);

   return (
      <div className="space-y-8">
         <div className="bg-indigo-50 rounded-2xl border border-indigo-100 overflow-hidden">
            <button 
               onClick={() => setIsTextOpen(!isTextOpen)}
               className="w-full flex items-center justify-between p-4 font-bold text-indigo-900 bg-indigo-100/50"
            >
               <span className="flex items-center gap-2"><BookOpen size={18} /> Lire le texte</span>
               {isTextOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </button>
            {isTextOpen && (
               <div className="p-5 text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif border-t border-indigo-100">
                  {part.reading_text}
               </div>
            )}
         </div>

         <div className="grid gap-6">
            {part.items.map(item => {
               const qId = item.question_id;
               const correctAns = solutions[qId];
               return (
                  <div key={qId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">Q.{qId}</span>
                        <h3 className="font-bold text-gray-900 text-lg mt-1">{item.question}</h3>
                     </div>
                     <div className="p-4 space-y-2">
                        {item.choices.map(choice => {
                           const isSelected = answers[qId] === choice.key;
                           let bgClass = "bg-white border-gray-200 hover:bg-gray-50";
                           let indicColor = "border-gray-300";

                           if (showResults) {
                              if (choice.key === correctAns) { bgClass = "bg-green-50 border-green-500 ring-1 ring-green-500"; indicColor = "bg-green-500 border-green-500"; }
                              else if (isSelected) { bgClass = "bg-red-50 border-red-400"; indicColor = "bg-red-500 border-red-500"; }
                              else { bgClass = "opacity-50"; }
                           } else if (isSelected) {
                              bgClass = "bg-blue-50 border-blue-600 ring-1 ring-blue-600";
                              indicColor = "bg-blue-600 border-blue-600";
                           }

                           return (
                              <button key={choice.key} disabled={showResults} onClick={() => onAnswer(qId, choice.key)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${bgClass}`}>
                                 <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${indicColor}`} />
                                 <span className="text-sm text-gray-700 font-medium">{choice.text}</span>
                              </button>
                           )
                        })}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

// --- 3. TROUS AVEC CHOIX INLINE (A/B/C) ---
const GapFillChoicePart = ({ part, answers, onAnswer, getBtnClass, showResults, solutions }) => {
   const renderedText = useMemo(() => {
      return part.reading_text.split(/__\(\s*(\d+)\s*\)__/g).map((chunk, i) => {
         if (i % 2 === 1) {
            const qId = chunk;
            const isAnswered = !!answers[qId];
            return <span key={i} className={`inline-flex mx-1 items-center justify-center px-2 h-6 rounded text-xs font-bold transition-colors ${isAnswered ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{qId}</span>;
         }
         return <span key={i}>{chunk}</span>;
      });
   }, [part.reading_text, answers]);

   return (
      <div className="space-y-6">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 leading-8 text-gray-800 text-base font-serif whitespace-pre-wrap">
            {renderedText}
         </div>
         <div className="grid gap-4 md:grid-cols-2">
            {part.items.map(item => {
               const qId = item.question_id;
               const correctSol = solutions[qId]?.toLowerCase();
               const optionKeys = ["a", "b", "c"];
               return (
                  <div key={qId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">({qId})</span>
                        {showResults && answers[qId] !== correctSol && <span className="text-green-600 text-xs font-bold">Sol: {correctSol}</span>}
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {item.choices.map((label, idx) => {
                           const key = optionKeys[idx];
                           return <button key={idx} disabled={showResults} onClick={() => onAnswer(qId, key)} className={`py-2 px-1 text-sm font-semibold rounded-lg border text-center transition-colors ${getBtnClass(qId, key, false).replace('w-full', '')}`}>{label.replace(/^[A-C]:\s*/, '')}</button>;
                        })}
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
   );
};

// --- 4. TROUS AVEC BANQUE DE MOTS (WORD BANK) ---
const GapFillBankPart = ({ part, answers, onAnswer, showResults, solutions }) => {
    const [focusedQId, setFocusedQId] = useState(null);

    const renderInteractiveText = () => {
       return part.reading_text.split(/__\(\s*(\d+)\s*\)__/g).map((chunk, i) => {
          if (i % 2 === 1) {
             const qId = chunk;
             const userAnswerKey = answers[qId];
             const wordObject = part.word_bank.find(w => w.key.toLowerCase() === (userAnswerKey || '').toLowerCase());
             const wordDisplay = wordObject ? wordObject.word : '...';
             const isFocused = focusedQId === qId;
             
             let badgeClass = "bg-gray-100 text-gray-500 border-gray-300";
             if (showResults) {
                const correct = solutions[qId]?.toLowerCase();
                badgeClass = userAnswerKey === correct ? "bg-green-100 text-green-700 border-green-500" : "bg-red-100 text-red-700 border-red-500 line-through";
             } else if (userAnswerKey) {
                badgeClass = "bg-blue-100 text-blue-700 border-blue-400 font-bold";
             }
             if (isFocused && !showResults) badgeClass = "bg-blue-600 text-white border-blue-600 scale-110 shadow-lg";

             return <button key={i} onClick={() => setFocusedQId(isFocused ? null : qId)} className={`inline-flex items-center gap-1 mx-1 px-3 py-0.5 rounded-full text-sm border transition-all ${badgeClass}`}><span className="opacity-70 text-[10px]">({qId})</span><span>{wordDisplay}</span></button>;
          }
          return <span key={i} className="leading-9 text-gray-700">{chunk}</span>;
       });
    };

    return (
       <div className="relative pb-32">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 text-sm md:text-base mb-6 whitespace-pre-wrap">
             {renderInteractiveText()}
          </div>
          <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 rounded-t-2xl p-4 md:sticky md:bottom-4 md:rounded-2xl md:border ${focusedQId || showResults ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
             {focusedQId && !showResults && (
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                   <span className="font-bold text-gray-900">Mot pour ({focusedQId})</span>
                   <button onClick={() => setFocusedQId(null)} className="p-1 bg-gray-100 rounded-full"><ChevronDown size={20}/></button>
                </div>
             )}
             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {part.word_bank.map((opt) => {
                   const isActive = answers[focusedQId] === opt.key.toLowerCase();
                   return (
                      <button key={opt.key} disabled={showResults || (!focusedQId && window.innerWidth < 768)} onClick={() => { if(focusedQId) { onAnswer(focusedQId, opt.key.toLowerCase()); setFocusedQId(null); } }} className={`py-2 px-1 text-xs md:text-sm rounded-lg border font-semibold truncate transition-all ${isActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                         <span className="mr-1 opacity-50 text-[10px]">{opt.key})</span>{opt.word}
                      </button>
                   );
                })}
             </div>
          </div>
       </div>
    );
};

export default ExamB2;