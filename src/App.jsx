import React, { useState, useEffect } from 'react';
import examData from './data.json';
import { CheckCircle2, XCircle, BookOpen, Trophy, ChevronDown } from 'lucide-react';

const API_URL = "https://wavy-server.onrender.com";

const App = ({ student }) => {
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

      if (student && student.phone) {
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

  const handleSelect = (questionId, value) => {
    if (showResults) return; 
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getButtonClass = (questionId, optionId, correctSolution) => {
    const isSelected = answers[questionId] === optionId;
    const isCorrectAnswer = optionId.toLowerCase() === correctSolution?.toLowerCase();
    
    let baseClass = "px-3 py-2 rounded-lg text-sm font-semibold transition-all ";

    if (!showResults) {
      return baseClass + (isSelected 
        ? 'bg-blue-600 text-white shadow-lg scale-105' 
        : 'bg-white text-gray-700 border-2 border-gray-200 active:scale-95');
    } else {
      if (isSelected && isCorrectAnswer) {
        return baseClass + "bg-green-500 text-white shadow-md"; 
      } else if (isSelected && !isCorrectAnswer) {
        return baseClass + "bg-red-500 text-white opacity-70"; 
      } else if (!isSelected && isCorrectAnswer) {
        return baseClass + "bg-green-50 text-green-700 border-2 border-green-500 ring-2 ring-green-200"; 
      } else {
        return baseClass + "bg-gray-100 text-gray-400 opacity-50"; 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Header Mobile-First */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Telc B1</h1>
                {student && <p className="text-xs text-gray-500">{student.name}</p>}
              </div>
            </div>
            
            {!showResults ? (
              <button 
                onClick={() => {
                  if(confirm("Examen beenden?")) {
                    setShowResults(true);
                  }
                }}
                className="bg-green-600 text-white hover:bg-green-700 active:scale-95 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
              >
                Fertig
              </button>
            ) : (
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold">
                Beendet
              </div>
            )}
          </div>
          
          {/* Tabs Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            <button
              onClick={() => setActiveTab('part1')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'part1' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Teil 1 (1-5)
            </button>
            <button
              onClick={() => setActiveTab('part3')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'part3' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Teil 3 (11-20)
            </button>
          </div>
        </div>
        
        {/* Score Banner */}
        {showResults && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className={`w-8 h-8 ${score.correct >= score.total * 0.6 ? 'text-yellow-400' : 'text-gray-400'}`} />
                <div>
                  <div className="text-xs text-gray-400 uppercase">Ergebnis</div>
                  <div className="text-2xl font-bold">
                    {score.correct}<span className="text-gray-400 text-lg">/{score.total}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">
                  {Math.round((score.correct / score.total) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Gespeichert ✓</div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-6">
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

const Part1 = ({ data, answers, onAnswer, getBtnClass, showResults }) => {
  const [showHeadlines, setShowHeadlines] = useState(false);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-1">{data.title}</h2>
        <p className="text-sm text-blue-100">{data.description}</p>
      </div>

      {/* Headlines Drawer Mobile */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <button
          onClick={() => setShowHeadlines(!showHeadlines)}
          className="w-full px-4 py-3 flex items-center justify-between font-semibold text-gray-800 active:bg-gray-50"
        >
          <span>Überschriften (a-j)</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showHeadlines ? 'rotate-180' : ''}`} />
        </button>
        
        {showHeadlines && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {data.headlines.map((h) => (
              <div key={h.id} className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-bold text-blue-600 text-sm">{h.id})</span>
                <span className="text-sm text-gray-700">{h.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {data.texts.map((text) => {
          const isCorrect = answers[text.id] === text.solution;
          
          return (
            <div key={text.id} className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
              showResults 
                ? (isCorrect ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400') 
                : ''
            }`}>
              <div className="p-4">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                      {text.id}
                    </span>
                    {showResults && (
                      isCorrect ? (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={16} /> Richtig
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-bold flex items-center gap-1">
                          <XCircle size={16} /> Falsch
                        </span>
                      )
                    )}
                  </div>
                </div>
                
                {/* Text Content */}
                <p className="text-gray-700 leading-relaxed text-base mb-4">{text.content}</p>
                
                {/* Answer Options */}
                <div className="grid grid-cols-5 gap-2">
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
                
                {/* Correct Answer Display */}
                {showResults && !isCorrect && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-xs text-gray-600">Lösung: </span>
                    <span className="font-bold text-green-700">{text.solution}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Part3 = ({ data, answers, onAnswer, getBtnClass, showResults }) => {
  const [showAds, setShowAds] = useState(false);
  const options = [...data.ads.map(ad => ad.id), 'x'];

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-1">{data.title}</h2>
        <p className="text-sm text-blue-100">{data.description}</p>
      </div>

      {/* Ads Drawer Mobile */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-20 z-40">
        <button
          onClick={() => setShowAds(!showAds)}
          className="w-full px-4 py-3 flex items-center justify-between font-semibold text-gray-800 active:bg-gray-50"
        >
          <span>Anzeigen (a-l) ansehen</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showAds ? 'rotate-180' : ''}`} />
        </button>
        
        {showAds && (
          <div className="px-4 pb-4 space-y-2 max-h-96 overflow-y-auto">
            {data.ads.map((ad) => (
              <div key={ad.id} className="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-500 text-white font-bold px-2 py-0.5 rounded text-xs">
                    {ad.id}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm">{ad.title}</h4>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{ad.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Situations */}
      <div className="space-y-4">
        {data.situations.map((sit) => {
          const userAns = (answers[sit.id] || '').toLowerCase();
          const correctAns = sit.solution.toLowerCase();
          const isCorrect = userAns === correctAns;
          
          return (
            <div key={sit.id} className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
              showResults && !isCorrect ? 'ring-2 ring-red-400' : ''
            } ${showResults && isCorrect ? 'ring-2 ring-green-400' : ''}`}>
              <div className="p-4">
                {/* Situation Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-500 text-sm">Nr. {sit.id}</span>
                    {showResults && (
                      isCorrect ? (
                        <CheckCircle2 size={18} className="text-green-500"/>
                      ) : (
                        <XCircle size={18} className="text-red-500"/>
                      )
                    )}
                  </div>
                </div>
                
                {/* Situation Text */}
                <p className="text-gray-800 font-medium leading-snug mb-4">{sit.text}</p>
                
                {/* Answer Grid */}
                <div className="grid grid-cols-4 gap-2">
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
                
                {/* Feedback */}
                {showResults && !isCorrect && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700">
                        Dein: <span className="font-bold line-through">{answers[sit.id] || '-'}</span>
                      </span>
                      <span className="text-green-700 font-bold">→ {sit.solution}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;