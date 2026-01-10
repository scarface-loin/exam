import React, { useState, useEffect } from 'react';
import { Clock, Lock, AlertTriangle, User, Phone, ArrowRight } from 'lucide-react';

// --- MODIFICATION ICI : L'URL DE TON SERVEUR ---
const API_URL = "https://wavy-server.onrender.com"; 

const ExamGuard = ({ children }) => {
  // ... (Les états restent les mêmes : student, status, timeLeft, etc.) ...
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState('loading'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [config, setConfig] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    const savedStudent = localStorage.getItem('exam_student');
    if (savedStudent) {
        setStudent(JSON.parse(savedStudent));
    }
  }, []);

  const formatTime = (ms) => {
    if (ms < 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- MODIFICATION DANS HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone) return;
    setLoadingLogin(true);

    try {
        // Utilisation de API_URL au lieu de localhost
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formName, phone: formPhone })
        });
        const data = await res.json();
        
        if (data.success) {
            setStudent(data.student);
            localStorage.setItem('exam_student', JSON.stringify(data.student));
        }
    } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur");
    } finally {
        setLoadingLogin(false);
    }
  };

  // --- MODIFICATION DANS CHECK STATUS ---
  useEffect(() => {
    let intervalId;
    const checkStatus = async () => {
      try {
        // Utilisation de API_URL au lieu de localhost
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        setStatus(data.status);
        setTimeLeft(data.timeRemaining);
        setConfig(data.config);
        if (data.status === 'finished') clearInterval(intervalId);
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    checkStatus();
    intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) { checkStatus(); return 0; }
        return prev - 1000;
      });
    }, 1000);
    const syncInterval = setInterval(checkStatus, 10000);
    return () => { clearInterval(intervalId); clearInterval(syncInterval); };
  }, []);

  // ... (Le reste du rendu : if(!student), if(status===waiting)... TOUT RESTE PAREIL) ...
  // Je ne remets pas tout le code HTML en bas car il ne change pas, 
  // garde ce que tu avais, change juste les fetch et ajoute la const API_URL en haut.

  // --- RENDU (Copie-colle la suite de ton ancien fichier ici) ---
  if (!student) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenue / Willkommen</h1>
                    <p className="text-gray-500 text-sm mt-2">Veuillez vous identifier pour accéder à la salle d'attente.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ex: Jean Dupont"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input 
                                type="tel" 
                                required
                                value={formPhone}
                                onChange={e => setFormPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Ex: 699..."
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loadingLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
                    >
                        {loadingLogin ? 'Connexion...' : <>Entrer <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  if (status === 'error') {
    return <div className="text-center p-10 text-red-600">Erreur de connexion au serveur ({API_URL}).</div>;
  }
  
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <h2 className="text-xl text-blue-400">Bonjour, <span className="font-bold text-white">{student.name}</span></h2>
            <div className="bg-gray-800 p-4 rounded-full inline-block mb-4 shadow-lg shadow-blue-500/20">
                <Lock className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">L'examen commencera bientôt</h1>
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto">
                <div className="text-5xl md:text-7xl font-mono font-bold text-blue-500 tabular-nums">
                    {formatTime(timeLeft)}
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-lg border-t-4 border-red-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Examen Terminé</h1>
            <p className="text-gray-600">Merci {student.name}, l'épreuve est clôturée.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="relative">
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border border-gray-700 flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-400">{student.name}</div>
                <div className="font-mono text-xl font-bold text-green-400">{formatTime(timeLeft)}</div>
            </div>
            <Clock className="w-6 h-6 text-gray-400" />
        </div>
        {React.Children.map(children, child => 
            React.cloneElement(child, { student })
        )}
    </div>
  );
};

export default ExamGuard;