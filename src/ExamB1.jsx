import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, XCircle, BookOpen, Trophy, Menu, 
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Home, Store, Clock 
} from 'lucide-react';

// NOUVEAU : Import du composant de résultats détaillés
import DetailedResults from './DetailedResults.jsx';

// === IMPORT DES DONNÉES SPÉCIFIQUES B1 ===
import examDataStructure from './data/b1/exam_data.json';
import examTextsSource from './data/b1/exam_texts.json';
import examSolutionsFile from './data/b1/exam_solutions.json';

const API_URL = "https://wavy-server.onrender.com";

// MODIFICATION ICI : Ajout de 'timeRemaining' dans les props reçues
const ExamB1 = ({ student, onExit, submitTrigger, timeRemaining }) => {

  // ==========================================
  // 1. FUSION DES DONNÉES (DATA + TEXTES)
  // ==========================================
  const examData = useMemo(() => {
    const mergedParts = examDataStructure.parts.map(part => {
      const textSource = examTextsSource.texts[part.id];
      if (!textSource) return part;

      // CAS 1 : Leseverstehen Teil 3 (Situations vs Annonces)
      if (part.type === 'matching_situations') {
        const updatedItems = part.items.map(item => {
           const situationObj = textSource.situations.find(s => s.id == item.question_id);
           return {
             ...item,
             text: situationObj ? situationObj.text : "Texte manquant"
           };
        });

        return {
          ...part,
          items: updatedItems,
          ads: textSource.ads,
          description: part.instruction
        };
      }

      // CAS 2 : Texte long + Questions (Teil 2, Sprachbausteine)
      if (['multiple_choice', 'gap_fill_choice', 'gap_fill_bank'].includes(part.type)) {
        return {
          ...part,
          reading_text: textSource.content || "",
          title: textSource.title || part.title,
          subtitle: textSource.headline || ""
        };
      }

      return part;
    });

    return { ...examDataStructure, parts: mergedParts };
  }, []);

  const solutions = useMemo(() => examSolutionsFile.solutions, []);

  // ==========================================
  // 2. ÉTATS
  // ==========================================
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startTime] = useState(Date.now()); 
  const [timeTaken, setTimeTaken] = useState(0);

  const currentPart = examData.parts[activePartIndex];

  // ==========================================
  // 3. LOGIQUE
  // ==========================================
  
  // Fonction pour formater le temps serveur (ms -> MM:SS)
  const formatTime = (ms) => {
    if (ms === undefined || ms === null || ms < 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, value) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Sauvegarde automatique des réponses
  useEffect(() => {
    if (!showResults && Object.keys(answers).length > 0) {
      sessionStorage.setItem(`exam_b1_answers_${student.phone}`, JSON.stringify(answers));
    }
  }, [answers, showResults, student.phone]);

  // Récupération des réponses en cas de rechargement
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem(`exam_b1_answers_${student.phone}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Erreur récupération réponses");
      }
    }
  }, [student.phone]);

  // Gestion de la soumission automatique via le Trigger (Server timer = 0)
  useEffect(() => {
    if (submitTrigger > 0 && !showResults) {
      console.log("TEMPS ÉCOULÉ ! Soumission automatique...");
      setTimeTaken(Date.now() - startTime); 
      setShowResults(true);
    }
  }, [submitTrigger, showResults, startTime]); 
    
  const calculateAndSendScore = () => {
    let currentScore = 0;
    let totalPossible = 0; // Le total est maintenant calculé dynamiquement
    const questionIds = Object.keys(solutions);
    
    questionIds.forEach(qid => {
      const userAns = (answers[qid] || '').toLowerCase().trim();
      const correctAns = (solutions[qid] || '').toLowerCase().trim();
      
      // Convertir l'ID de question en nombre (ex: "1" -> 1)
      const qNum = parseInt(qid, 10); 
      let points = 0;

      // ====================================================
      // CONFIGURATION DES POINTS PAR EXERCICE
      // Modifiez les chiffres (<= 5, <= 10) selon vos questions réelles
      // ====================================================

      // EXO 1 (Disons questions 1 à 5) -> 5 points
      if (qNum >= 1 && qNum <= 5) {
          points = 5;
      } 
      // EXO 2 (Disons questions 6 à 10) -> 2.5 points
      else if (qNum >= 6 && qNum <= 10) {
          points = 2.5;
      } 
      // EXO 3 et 4 (Le reste des questions, ex: 11 à 45) -> 1.5 points
      else {
          points = 1.5;
      }
      
      // ====================================================

      // 1. On ajoute la valeur de la question au Total Possible (Maximum atteignable)
      totalPossible += points;

      // 2. Si la réponse est correcte, on ajoute les points au score de l'élève
      if (userAns === correctAns && userAns !== '') {
          currentScore += points;
      }
    });

    // Mise à jour de l'état local
    setScore({ correct: currentScore, total: totalPossible });

    // Envoi au serveur
    if (student && student.phone) {
      fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: student.phone,
          exam_id: examSolutionsFile.exam_id,
          student_name: student.name,
          score: currentScore,     // Score pondéré
          total: totalPossible,    // Total pondéré
          answers: answers,
          timeTaken: timeTaken
        })
      })
      .then(res => res.json())
      .then(() => {
        setSubmitted(true);
        // Nettoyage des réponses sauvegardées
        const storageKey = examSolutionsFile.exam_id.includes('b2') 
             ? `exam_b2_answers_${student.phone}` 
             : `exam_b1_answers_${student.phone}`;
        sessionStorage.removeItem(storageKey);
      })
      .catch(err => console.error("Erreur API:", err));
    }
  };

  useEffect(() => {
    if (showResults && !submitted) {
      setTimeTaken(Date.now() - startTime);
      calculateAndSendScore();
    }
  }, [showResults, submitted, startTime]);

  // Style boutons générique
  const getBtnClass = (questionId, optionKey, isSmall = false) => {
    const isSelected = answers[questionId] === optionKey;
    const correctSol = solutions[questionId];
    
    let cls = `transition-all border font-bold flex items-center justify-center 
               ${isSmall ? 'w-9 h-9 text-sm rounded-lg' : 'w-full py-3 px-4 rounded-xl text-base'}`;

    if (!showResults) {
      return cls + (isSelected 
        ? ' bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' 
        : ' bg-white text-gray-600 border-gray-200 active:scale-95 hover:bg-emerald-50');
    } else {
      if (isSelected && optionKey === correctSol) return cls + ' bg-green-500 text-white border-green-500';
      if (isSelected && optionKey !== correctSol) return cls + ' bg-red-500 text-white border-red-500 opacity-80';
      if (!isSelected && optionKey === correctSol) return cls + ' bg-green-100 text-green-700 border-green-400 ring-2 ring-green-200';
      return cls + ' bg-gray-50 text-gray-300 border-gray-100 opacity-40';
    }
  };

  // ==========================================
  // 4. RENDU PRINCIPAL
  // ==========================================

  if (showResults && submitted) {
    return (
      <DetailedResults
        score={score}
        answers={answers}
        solutions={solutions}
        examData={examData}
        student={student}
        examType="Telc B1"
        timeTaken={timeTaken}
        onExit={onExit}
      />
    );
  }

  // Calcul pour l'alerte visuelle (rouge si moins de 5 min)
  const isUrgent = timeRemaining < 300000; // 5 minutes

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button onClick={onExit} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition">
                  <Home size={20} />
               </button>
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg">
                  <Menu size={20} />
               </button>
               <div className="hidden sm:block">
                  <h1 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Telc B1</h1>
                  <p className="text-sm font-extrabold text-emerald-800 truncate max-w-[150px] sm:max-w-xs">{currentPart.title}</p>
               </div>
            </div>

             {!showResults ? (
               <div className="flex items-center gap-2 sm:gap-4">
                  {/* LE TIMER A ÉTÉ SUPPRIMÉ ICI */}

                  <button 
                    onClick={() => { 
                      if(confirm("Êtes-vous sûr de vouloir terminer l'examen ?")) {
                        setTimeTaken(Date.now() - startTime);
                        setShowResults(true);
                      }
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    Terminer
                  </button>
               </div>
            ) : (
              <div className="bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 text-emerald-700">
                 Calcul...
              </div>
            )}
          </div>
          
          {/* Menu Onglets Mobile */}
           <div className={`mt-2 pt-2 border-t border-gray-100 overflow-x-auto ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
             <div className="flex space-x-2">
                {examData.parts.map((part, idx) => (
                   <button
                      key={part.id}
                      onClick={() => { setActivePartIndex(idx); setIsMenuOpen(false); }}
                      className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                         activePartIndex === idx ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                   >
                      {idx + 1}. {part.id.split('_').pop()}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto p-4 space-y-6">
          
          {/* Consigne */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-r-xl shadow-sm p-4 text-sm text-gray-700 leading-relaxed">
             <span className="font-bold text-emerald-900 block mb-1">Aufgabe:</span>
             {currentPart.instruction || currentPart.description}
          </div>

          {/* --- RENDU CONDITIONNEL DES EXERCICES --- */}
          
          {currentPart.type === 'multiple_choice' && (
             <MultipleChoicePart 
                part={currentPart} answers={answers} onAnswer={handleAnswer} 
                showResults={showResults} solutions={solutions} 
             />
          )}

          {currentPart.type === 'matching_situations' && (
             <MatchingSituationsPart 
                part={currentPart} answers={answers} onAnswer={handleAnswer} 
                getBtnClass={getBtnClass} showResults={showResults} solutions={solutions} 
             />
          )}

          {currentPart.type === 'gap_fill_choice' && (
             <GapFillChoicePart 
                part={currentPart} answers={answers} onAnswer={handleAnswer} 
                getBtnClass={getBtnClass} showResults={showResults} solutions={solutions} 
             />
          )}

          {currentPart.type === 'gap_fill_bank' && (
             <GapFillBankPart 
                part={currentPart} answers={answers} onAnswer={handleAnswer} 
                showResults={showResults} solutions={solutions} 
             />
          )}

      </main>

      {/* FOOTER NAV MOBILE */}
      {!showResults && (
         <div className="fixed bottom-0 left-0 w-full bg-white p-4 flex justify-between md:hidden border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40">
            <button 
               disabled={activePartIndex === 0}
               onClick={() => { setActivePartIndex(p => Math.max(0, p-1)); window.scrollTo(0,0); }}
               className="flex items-center gap-1 px-3 py-2 text-gray-600 disabled:opacity-30 font-bold"
            >
              <ArrowLeft size={16}/> Retour
            </button>
            <span className="text-xs flex items-center text-gray-400 font-mono">
              {activePartIndex + 1} / {examData.parts.length}
            </span>
            <button 
               disabled={activePartIndex === examData.parts.length - 1}
               onClick={() => { setActivePartIndex(p => Math.min(examData.parts.length-1, p+1)); window.scrollTo(0,0); }}
               className="flex items-center gap-1 bg-emerald-800 text-white px-5 py-2 rounded-xl shadow-lg disabled:opacity-50 font-bold"
            >
               Suivant <ArrowRight size={16}/>
            </button>
         </div>
      )}
    </div>
  );
};

// =========================================================
//  SOUS-COMPOSANTS
// =========================================================

const MultipleChoicePart = ({ part, answers, onAnswer, showResults, solutions }) => {
  const [isTextOpen, setIsTextOpen] = useState(true);

  return (
     <div className="space-y-8">
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden">
           <button 
              onClick={() => setIsTextOpen(!isTextOpen)}
              className="w-full flex items-center justify-between p-4 font-bold text-emerald-900 bg-emerald-100/50"
           >
              <span className="flex items-center gap-2"><BookOpen size={18} /> Lire le texte</span>
              {isTextOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
           </button>
           {isTextOpen && (
              <div className="p-5 text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-serif border-t border-emerald-100">
                 <h3 className="font-bold text-lg mb-1">{part.subtitle}</h3>
                 {part.reading_text}
              </div>
           )}
        </div>

        <div className="grid gap-4">
           {part.items.map(item => {
              const qId = item.question_id;
              const correctAns = solutions[qId];
              return (
                 <div key={qId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                       <span className="text-xs font-bold text-gray-400 uppercase">Question {qId}</span>
                       <h3 className="font-bold text-gray-900 text-md mt-1">{item.question}</h3>
                    </div>
                    <div className="p-3 space-y-2">
                       {item.choices.map(choice => {
                          const isSelected = answers[qId] === choice.key;
                          let bgClass = "bg-white border-gray-200 hover:bg-gray-50";
                          let indicColor = "border-gray-300";

                          if (showResults) {
                             if (choice.key === correctAns) { bgClass = "bg-green-50 border-green-500 ring-1 ring-green-500"; indicColor = "bg-green-500 border-green-500"; }
                             else if (isSelected) { bgClass = "bg-red-50 border-red-400"; indicColor = "bg-red-500 border-red-500"; }
                             else { bgClass = "opacity-50"; }
                          } else if (isSelected) {
                             bgClass = "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600";
                             indicColor = "bg-emerald-600 border-emerald-600";
                          }

                          return (
                             <button key={choice.key} disabled={showResults} onClick={() => onAnswer(qId, choice.key)} className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${bgClass}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${indicColor}`} />
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

const MatchingSituationsPart = ({ part, answers, onAnswer, getBtnClass, showResults, solutions }) => {
  const [isAdsOpen, setIsAdsOpen] = useState(false);

  return (
     <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-28 z-30 transition-all">
           <button 
              onClick={() => setIsAdsOpen(!isAdsOpen)}
              className="w-full flex items-center justify-between p-4 bg-orange-50 text-orange-900 font-bold border-l-4 border-orange-400"
           >
              <span className="flex items-center gap-2"><Store size={18}/> Voir les annonces (a-l)</span>
              {isAdsOpen ? <ChevronUp /> : <ChevronDown />}
           </button>
           
           <div className={`${isAdsOpen ? 'max-h-96' : 'max-h-0'} overflow-y-auto transition-all bg-white`}>
              <div className="p-4 grid gap-3 sm:grid-cols-2">
                 {part.ads.map(ad => (
                    <div key={ad.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-white bg-orange-500 px-2 py-0.5 rounded text-xs uppercase">{ad.id}</span>
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{ad.title}</h4>
                       </div>
                       <p className="text-xs text-gray-600 leading-snug">{ad.content}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           {part.items.map((item) => {
              const qId = item.question_id;
              const correctAns = solutions[qId];
              const isCorrect = answers[qId] === correctAns;
              
              return (
                 <div key={qId} className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                    showResults ? (isCorrect ? 'border-green-400' : 'border-red-400') : 'border-transparent'
                  }`}>
                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                       <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Situation {qId}</span>
                       {showResults && !isCorrect && (
                          <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                             Réponse: {correctAns.toUpperCase()}
                          </div>
                       )}
                    </div>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed mb-4">
                       {item.text}
                    </p>
                    
                    <div>
                       <div className="flex flex-wrap gap-1.5 justify-center">
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
                 </div>
              )
           })}
        </div>
     </div>
  );
};

const GapFillChoicePart = ({ part, answers, onAnswer, getBtnClass, showResults, solutions }) => {
  const renderedText = useMemo(() => {
     return part.reading_text.split(/__\(\s*(\d+)\s*\)__/g).map((chunk, i) => {
        if (i % 2 === 1) {
           const qId = chunk;
           const isAnswered = !!answers[qId];
           return <span key={i} className={`inline-flex mx-1 items-center justify-center px-2 h-6 rounded text-xs font-bold transition-colors ${isAnswered ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{qId}</span>;
        }
        return <span key={i}>{chunk}</span>;
     });
  }, [part.reading_text, answers]);

  return (
     <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 leading-8 text-gray-800 text-sm sm:text-base font-serif whitespace-pre-wrap">
           {renderedText}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
           {part.items.map(item => {
              const qId = item.question_id;
              const correctSol = solutions[qId]?.toLowerCase();
              const optionKeys = ["a", "b", "c"];
              return (
                 <div key={qId} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">({qId})</span>
                       {showResults && answers[qId] !== correctSol && <span className="text-red-500 text-xs font-bold">Corr: {correctSol}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                       {item.choices.map((label, idx) => {
                          const key = optionKeys[idx];
                          return <button key={idx} disabled={showResults} onClick={() => onAnswer(qId, key)} className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-colors ${getBtnClass(qId, key, false).replace('w-full', '')}`}>{label}</button>;
                       })}
                    </div>
                 </div>
              )
           })}
        </div>
     </div>
  );
};

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
               badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-400 font-bold";
            }
            if (isFocused && !showResults) badgeClass = "bg-emerald-600 text-white border-emerald-600 scale-110 shadow-lg";

            return <button key={i} onClick={() => setFocusedQId(isFocused ? null : qId)} className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-xs sm:text-sm border transition-all ${badgeClass}`}><span className="opacity-70 text-[9px]">({qId})</span><span>{wordDisplay}</span></button>;
         }
         return <span key={i} className="leading-9 text-gray-700">{chunk}</span>;
      });
   };

   return (
      <div className="relative pb-40">
         <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 text-sm md:text-base mb-6 whitespace-pre-wrap">
            {renderInteractiveText()}
         </div>
         <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 rounded-t-2xl p-4 md:sticky md:bottom-4 md:rounded-2xl md:border ${focusedQId || showResults ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
            {focusedQId && !showResults && (
               <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Mot pour la case ({focusedQId})</span>
                  <button onClick={() => setFocusedQId(null)} className="p-1 bg-gray-100 rounded-full"><ChevronDown size={18}/></button>
               </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
               {part.word_bank.map((opt) => {
                  const isActive = answers[focusedQId] === opt.key.toLowerCase();
                  const isUsed = Object.values(answers).includes(opt.key.toLowerCase()) && !isActive;
                  return (
                     <button key={opt.key} disabled={showResults || (!focusedQId && window.innerWidth < 768) || isUsed} onClick={() => { if(focusedQId) { onAnswer(focusedQId, opt.key.toLowerCase()); setFocusedQId(null); } }} className={`py-2 px-1 text-xs md:text-sm rounded-lg border font-semibold truncate transition-all ${isActive ? 'bg-emerald-600 text-white' : (isUsed ? 'bg-gray-100 text-gray-300' : 'bg-white hover:bg-gray-50')}`}>
                        <span className="mr-1 opacity-50 text-[10px]">{opt.key})</span>{opt.word}
                     </button>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

export default ExamB1;