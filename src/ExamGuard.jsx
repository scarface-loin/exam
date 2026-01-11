import React, { useState, useEffect } from 'react';
import { Clock, Lock, ArrowRight, User, Phone } from 'lucide-react';

const API_URL = "https://wavy-server.onrender.com";

// --- NOUVEAU COMPOSANT : Timer ---
// Ce composant est affiché pendant l'examen
const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp(); // Appelle la fonction de soumission quand le temps est écoulé
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1000);
        }, 1000);
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

    return (
        <div className={`fixed top-4 right-4 z-[100] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 transition-colors ${isLowTime ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-400' : 'text-gray-400'}`} />
            <span className={`font-mono text-xl font-bold tabular-nums ${isLowTime ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
    );
};

// --- COMPOSANT ExamGuard (Modifié) ---
const ExamGuard = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [status, setStatus] = useState('loading');
    const [examConfig, setExamConfig] = useState(null);
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [loadingLogin, setLoadingLogin] = useState(false);
    
    // Pour forcer la soumission depuis le Timer
    const [forceSubmit, setForceSubmit] = useState(false);

    useEffect(() => {
        const savedStudent = localStorage.getItem('exam_student');
        if (savedStudent) setStudent(JSON.parse(savedStudent));
        
        // --- MODIFICATION ICI : On gère le statut de l'examen ---
        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/status`); // Supposons que /status existe
                const data = await response.json();
                setStatus(data.status); // ex: "waiting", "running", "finished"
                setExamConfig(data.config); // ex: { duration: 3600000 }
            } catch (error) { setStatus('error'); }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Synchronise toutes les 30s
        return () => clearInterval(interval);
    }, []);
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoadingLogin(true);
        // ... (votre logique de login reste identique) ...
        const res = await fetch(`${API_URL}/api/login`, { /* ... */ });
        const data = await res.json();
        if (data.success) {
            setStudent(data.student);
            localStorage.setItem('exam_student', JSON.stringify(data.student));
        }
        setLoadingLogin(false);
    };
    
    // --- RENDUS CONDITIONNELS ---
    if (!student) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center mb-6">Identification</h1>
                    <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nom" required className="w-full p-2 border rounded mb-4" />
                    <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Téléphone" required className="w-full p-2 border rounded mb-4" />
                    <button type="submit" disabled={loadingLogin} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
                        {loadingLogin ? 'Vérification...' : 'Entrer'}
                    </button>
                </form>
            </div>
        );
    }

    if (status === 'waiting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-4xl font-bold">L'examen n'a pas encore commencé</h1>
                    <p className="text-blue-300 mt-2">Veuillez patienter.</p>
                </div>
            </div>
        );
    }

    if (status === 'finished') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold">Épreuve terminée</h1>
                    <p className="text-gray-600">Merci d'avoir participé.</p>
                </div>
            </div>
        );
    }
    
    // --- L'EXAMEN EST EN COURS ---
    if (status === 'running') {
        return (
            <div className="relative">
                <Timer 
                    initialTime={examConfig.duration} // ex: 3600000ms
                    onTimeUp={() => setForceSubmit(true)} // Déclenche la sauvegarde auto
                />
                
                {/* On passe l'étudiant ET la fonction de soumission aux enfants */}
                {React.Children.map(children, child =>
                    React.cloneElement(child, { 
                        student,
                        forceSubmit // Le composant Examen (B1/B2) saura quand il doit sauvegarder
                    })
                )}
            </div>
        );
    }

    return <div className="text-center p-10">Chargement...</div>;
};

export default ExamGuard;