import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Lock, ArrowRight, User, Phone } from 'lucide-react';

const API_URL = "https://wavy-server.onrender.com";

// --- COMPOSANT Timer ---
const Timer = ({ initialTime, onTimeUp, studentName }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, onTimeUp]);
    
    const formatTime = (ms) => {
        if (ms < 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft <= 5 * 60 * 1000;

    return (
        <div className={`fixed top-4 right-4 z-[100] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 transition-colors ${isLowTime ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
            <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-400">{studentName}</div>
                <div className={`font-mono text-xl font-bold tabular-nums ${isLowTime ? 'text-red-400' : 'text-green-400'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
    );
};

// --- COMPOSANT ExamGuard (Modifié) ---
const ExamGuard = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading', 'login', 'waiting', 'running', 'finished', 'error'
    const [examConfig, setExamConfig] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [loadingLogin, setLoadingLogin] = useState(false);
    
    // --- NOUVEAU : État pour déclencher la soumission ---
    // On le met dans une fonction pour le passer facilement aux enfants
    const [submitTrigger, setSubmitTrigger] = useState(0);
    const triggerSubmit = () => setSubmitTrigger(prev => prev + 1);
    
    // --- Chargement de l'étudiant depuis le localStorage ---
    useEffect(() => {
        const savedStudent = localStorage.getItem('exam_student');
        if (savedStudent) {
            setStudent(JSON.parse(savedStudent));
        } else {
            setStatus('login'); // Si pas d'étudiant, on affiche le login
        }
    }, []);

    // --- Vérification périodique du statut de l'examen ---
    useEffect(() => {
        if (!student) return; // Ne rien faire si l'étudiant n'est pas connecté

        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/status`);
                const data = await response.json();

                setStatus(data.status);
                setExamConfig(data.config);
                setTimeRemaining(data.timeRemaining);

                if (data.status === 'finished') {
                    clearInterval(syncInterval);
                }
            } catch (error) {
                console.error("Erreur de synchronisation:", error);
                setStatus('error');
                clearInterval(syncInterval);
            }
        };

        checkStatus(); // Vérification immédiate
        const syncInterval = setInterval(checkStatus, 20000); // Puis toutes les 20 secondes
        return () => clearInterval(syncInterval);
    }, [student]); // Se redéclenche si l'étudiant change

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoadingLogin(true);
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, phone: formPhone })
            });
            const data = await res.json();
            if (data.success) {
                setStudent(data.student);
                localStorage.setItem('exam_student', JSON.stringify(data.student));
                // Le useEffect de `checkStatus` va maintenant s'activer
            } else {
                alert(data.error || "Erreur de connexion.");
            }
        } catch (err) {
            alert("Impossible de joindre le serveur. Vérifiez votre connexion.");
        } finally {
            setLoadingLogin(false);
        }
    };
    
    // --- RENDUS CONDITIONNELS ---
    if (status === 'login') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
                    <h1 className="text-2xl font-bold text-center mb-6">Identification</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400"/>
                            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nom et Prénom" required className="w-full p-2 pl-10 border rounded"/>
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400"/>
                            <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Téléphone" required className="w-full p-2 pl-10 border rounded"/>
                        </div>
                        <button type="submit" disabled={loadingLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4">
                            {loadingLogin ? 'Vérification...' : <>Entrer <ArrowRight size={18}/></>}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (status === 'error' || status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center text-center"><p>Connexion au serveur...</p></div>;
    }

    if (status === 'waiting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-4">
                <div>
                    <Lock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-3xl font-bold">Salle d'attente</h1>
                    <p className="text-blue-300 mt-2">L'examen commencera dès que le professeur l'activera.</p>
                </div>
            </div>
        );
    }
    
    if (status === 'finished') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold">Épreuve terminée</h1>
                    <p className="text-gray-600 mt-2">Vos résultats ont été enregistrés. Merci d'avoir participé.</p>
                </div>
            </div>
        );
    }

    // --- L'EXAMEN EST EN COURS ---
    if (status === 'running') {
        return (
            <>
                {/* 
                    Le composant App (qui contient B1/B2) doit maintenant savoir quelle durée utiliser.
                    On va le lui passer en prop.
                */}
                {React.Children.map(children, child =>
                    React.cloneElement(child, { 
                        student,
                        examConfig, // Contient durationB1 et durationB2
                        onTimeUp: triggerSubmit, // La fonction à appeler quand le temps est écoulé
                        submitTrigger // L'état qui déclenche la soumission
                    })
                )}
            </>
        );
    }

    return null; // Fallback
};

export default ExamGuard;