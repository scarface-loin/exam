import React, { useState } from 'react';
import examData from './data.json';
import { CheckCircle2, Circle, BookOpen, AlertCircle, Menu, X } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('part1');
  // Stockage des réponses : { 1: 'a', 11: 'x', etc. }
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getButtonClass = (questionId, optionId) => {
    const isSelected = answers[questionId] === optionId;
    return `px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
      isSelected 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-900">Telc Deutsch B1 <span className="text-gray-400 font-normal">| Leseverstehen</span></h1>
          </div>
          <button 
            onClick={() => setShowResults(!showResults)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showResults ? 'Bearbeiten' : 'Ergebnis prüfen'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('part1')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'part1' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Teil 1 (1–5)
          </button>
          <button
            onClick={() => setActiveTab('part3')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
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
          />
        )}
        {activeTab === 'part3' && (
          <Part3 
            data={examData.part3} 
            answers={answers} 
            onAnswer={handleSelect}
            getBtnClass={getButtonClass}
          />
        )}
      </main>

      {/* Footer / Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <span>Beantwortet: {Object.keys(answers).length} Fragen</span>
          <span className="text-xs text-gray-400">Übungsmaterial basierend auf Telc</span>
        </div>
      </div>
    </div>
  );
};

// --- Composant pour Teil 1 ---
const Part1 = ({ data, answers, onAnswer, getBtnClass }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">{data.title}</h2>
        <p className="text-blue-700 text-sm">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche : Les Titres (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Überschriften (a–j)</h3>
            <ul className="space-y-3 text-sm">
              {data.headlines.map((h) => (
                <li key={h.id} className="p-2 bg-gray-50 rounded border border-gray-100">
                  <span className="font-bold text-blue-600 mr-2">{h.id})</span>
                  {h.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colonne de droite : Les Textes */}
        <div className="lg:col-span-2 space-y-6">
          {data.texts.map((text) => (
            <div key={text.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
                  {text.id}
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                   {/* Génération des boutons a-j */}
                  {data.headlines.map(h => (
                    <button
                      key={h.id}
                      onClick={() => onAnswer(text.id, h.id)}
                      className={getBtnClass(text.id, h.id)}
                    >
                      {h.id}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{text.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Composant pour Teil 3 ---
const Part3 = ({ data, answers, onAnswer, getBtnClass }) => {
  // Liste des options possibles pour Teil 3 : A-L + X
  const options = [...data.ads.map(ad => ad.id), 'x'];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">{data.title}</h2>
        <p className="text-blue-700 text-sm">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne Gauche : Situations (Questions) */}
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-gray-800 mb-2">Situationen</h3>
          {data.situations.map((sit) => (
            <div key={sit.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
               {/* Indicateur de réponse */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${answers[sit.id] ? 'bg-green-500' : 'bg-gray-200'}`}></div>
               
               <div className="pl-3">
                 <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="font-bold text-gray-500 text-sm uppercase tracking-wide">Nummer {sit.id}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium mr-1">Lösung:</span>
                        {/* Dropdown simplifié pour mobile, Grid pour desktop */}
                        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                            {options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => onAnswer(sit.id, opt)}
                                    className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-all ${
                                        answers[sit.id] === opt 
                                        ? 'bg-blue-600 text-white shadow-md scale-110' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    } ${opt === 'x' ? 'text-red-500 bg-red-50' : ''}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
                 <p className="text-gray-800 font-medium text-lg leading-snug">{sit.text}</p>
               </div>
               
               {answers[sit.id] && answers[sit.id] !== 'x' && (
                   <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-blue-600 flex items-center gap-2">
                       <CheckCircle2 size={14} />
                       Gewählt: Anzeige {answers[sit.id]}
                   </div>
               )}
            </div>
          ))}
        </div>

        {/* Colonne Droite : Les Annonces (Ads) */}
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