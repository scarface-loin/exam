import React, { useState } from 'react';
import { 
  Trophy, CheckCircle2, XCircle, TrendingUp, 
  Clock, Award, BarChart3, ChevronDown, ChevronUp,
  Download, Share2, Home
} from 'lucide-react';

// Composant pour afficher les résultats détaillés
const DetailedResults = ({ 
  score, 
  answers, 
  solutions, 
  examData, 
  student,
  examType,
  timeTaken,
  onExit 
}) => {
  const [expandedPart, setExpandedPart] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Calcul des statistiques par partie
  const partStats = examData.parts.map(part => {
    const partQuestions = part.items || [];
    let correct = 0;
    let total = 0;

    partQuestions.forEach(item => {
      const qId = item.question_id;
      if (solutions[qId]) {
        total++;
        const userAns = (answers[qId] || '').toLowerCase().trim();
        const correctAns = (solutions[qId] || '').toLowerCase().trim();
        if (userAns === correctAns) correct++;
      }
    });

    return {
      id: part.id,
      title: part.title,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  });

  // Calcul du niveau atteint
  const overallPercentage = Math.round((score.correct / score.total) * 100);
  const getLevel = () => {
    if (overallPercentage >= 90) return { label: 'Excellent', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🏆' };
    if (overallPercentage >= 75) return { label: 'Très bien', color: 'text-green-600', bg: 'bg-green-50', icon: '🌟' };
    if (overallPercentage >= 60) return { label: 'Bien', color: 'text-blue-600', bg: 'bg-blue-50', icon: '👍' };
    if (overallPercentage >= 50) return { label: 'Passable', color: 'text-orange-600', bg: 'bg-orange-50', icon: '📚' };
    return { label: 'À améliorer', color: 'text-red-600', bg: 'bg-red-50', icon: '💪' };
  };

  const level = getLevel();

  // Formatage du temps
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}min ${seconds}s`;
  };

  // Télécharger les résultats en PDF (simulation)
  const downloadResults = () => {
    const content = `
RÉSULTATS D'EXAMEN
==================
Étudiant: ${student.name}
Examen: ${examType}
Date: ${new Date().toLocaleDateString('fr-FR')}

SCORE GLOBAL
------------
${score.correct} / ${score.total} (${overallPercentage}%)
Niveau: ${level.label}
Temps: ${formatTime(timeTaken)}

DÉTAIL PAR PARTIE
-----------------
${partStats.map(p => `${p.title}: ${p.correct}/${p.total} (${p.percentage}%)`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats_${examType}_${student.name.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-8">
      {/* Header avec retour */}
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Home size={18} />
            <span className="hidden sm:inline text-sm font-semibold">Menu</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Résultats {examType}</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        
        {/* Card principale - Score */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 font-medium">Étudiant</p>
                <h2 className="text-2xl font-bold">{student.name}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs opacity-80 mb-1">Score</p>
                <p className="text-3xl font-bold">{overallPercentage}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs opacity-80 mb-1">Temps</p>
                <p className="text-2xl font-bold">{formatTime(timeTaken)}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Niveau atteint */}
            <div className={`${level.bg} border-2 ${level.color.replace('text-', 'border-')} rounded-xl p-4 mb-6`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{level.icon}</span>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Niveau atteint</p>
                  <p className={`text-2xl font-bold ${level.color}`}>{level.label}</p>
                </div>
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{score.correct}</p>
                <p className="text-xs text-green-600 font-medium">Correctes</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{score.total - score.correct}</p>
                <p className="text-xs text-red-600 font-medium">Incorrectes</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{score.total}</p>
                <p className="text-xs text-blue-600 font-medium">Total</p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700">Progression globale</span>
                <span className="font-bold text-blue-600">{overallPercentage}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={downloadResults}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Download size={18} />
                Télécharger
              </button>
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                <Share2 size={18} />
                Partager
              </button>
            </div>

            {showShareMenu && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
                <p className="text-sm text-gray-600">
                  📧 Vos résultats ont été automatiquement envoyés au professeur
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Détail par partie */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Détail par partie
          </h3>
          
          <div className="space-y-3">
            {partStats.map((part, idx) => (
              <div key={part.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPart(expandedPart === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      part.percentage >= 75 ? 'bg-green-100 text-green-700' :
                      part.percentage >= 50 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{part.title}</p>
                      <p className="text-xs text-gray-500">{part.correct} / {part.total} réponses correctes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        part.percentage >= 75 ? 'text-green-600' :
                        part.percentage >= 50 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {part.percentage}%
                      </p>
                    </div>
                    {expandedPart === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {expandedPart === idx && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            part.percentage >= 75 ? 'bg-green-500' :
                            part.percentage >= 50 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${part.percentage}%` }}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <span className="text-gray-500">✓ Correctes:</span>
                          <span className="font-bold text-green-600 ml-1">{part.correct}</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <span className="text-gray-500">✗ Incorrectes:</span>
                          <span className="font-bold text-red-600 ml-1">{part.total - part.correct}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Award className="text-purple-600" />
            Recommandations
          </h3>
          
          <div className="space-y-3">
            {overallPercentage >= 75 ? (
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  🎉 <strong>Excellent travail !</strong> Vous maîtrisez bien ce niveau. 
                  Continuez à pratiquer régulièrement pour maintenir vos compétences.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    📚 <strong>Points à renforcer :</strong> Concentrez-vous sur les parties 
                    où votre score est inférieur à 60%.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    💡 <strong>Conseil :</strong> Refaites les exercices similaires et 
                    consultez le matériel de cours correspondant.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bouton retour final */}
        <button
          onClick={onExit}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Retour au menu principal
        </button>
      </div>
    </div>
  );
};

export default DetailedResults;