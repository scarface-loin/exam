import React, { useState, useEffect } from 'react';
import { Clock, Lock, ArrowRight, User, Phone, Wifi, WifiOff } from 'lucide-react';

const API_URL = "https://wavy-server.onrender.com";

// --- COMPOSANT Timer Serveur ---
const ServerTimer = ({ studentName }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(API_URL.replace('https://', 'wss://').replace('http://', 'ws://'));
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'time_update') {
                setTimeLeft(data.timeRemaining);
            }
        };

        return () => ws.close();
    }, []);
    
    const formatTime = (ms) => {
        if (ms < 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft <= 5 * 60 * 1000;
    const isCriticalTime = timeLeft <= 2 * 60 * 1000;

    useEffect(() => {
        if (isCriticalTime) {
            const blinkInterval = setInterval(() => {
                setIsBlinking(prev => !prev);
            }, 500);
            return () => clearInterval(blinkInterval);
        } else {
            setIsBlinking(false);
        }
    }, [isCriticalTime]);

    return (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg shadow-xl border-2 flex items-center gap-3 transition-all ${
            isCriticalTime 
                ? `bg-red-600 border-red-800 ${isBlinking ? 'scale-110' : 'scale-100'}` 
                : isLowTime 
                    ? 'bg-orange-600 border-orange-800 animate-pulse' 
                    : 'bg-gray-900 border-gray-700'
        }`}>
            <div className="text-right hidden sm:block">
                <div className={`text-xs ${isCriticalTime ? 'text-red-100' : isLowTime ? 'text-orange-100' : 'text-gray-400'}`}>
                    {studentName}
                </div>
                <div className={`font-mono text-xl font-bold tabular-nums ${
                    isCriticalTime ? 'text-white' : isLowTime ? 'text-white' : 'text-green-400'
                }`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <Clock className={`w-6 h-6 ${isCriticalTime || isLowTime ? 'text-white' : 'text-gray-400'}`} />
        </div>
    );
};

// --- COMPOSANT ExamGuard ---
const ExamGuard = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [status, setStatus] = useState('loading');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    // WebSocket pour recevoir les mises à jour en temps réel
    useEffect(() => {
        if (!student) return;

        const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('✅ WebSocket connecté');
            setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'time_update') {
                setTimeRemaining(data.timeRemaining);
                
                // Mise à jour du statut basé sur le temps
                if (!data.isRunning && data.timeRemaining === 0) {
                    setStatus('finished');
                }
            }
        };
        
        ws.onclose = () => {
            console.log('🔌 WebSocket déconnecté');
            setIsConnected(false);
        };

        return () => ws.close();
    }, [student]);

    // Chargement de l'étudiant depuis localStorage
    useEffect(() => {
        const savedStudent = localStorage.getItem('exam_student');
        if (savedStudent) {
            setStudent(JSON.parse(savedStudent));
        } else {
            setStatus('login');
        }
    }, []);

    // Vérification périodique du statut
    useEffect(() => {
        if (!student) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/status`);
                const data = await response.json();

                setStatus(data.status);
                setTimeRemaining(data.timeRemaining || 0);
            } catch (error) {
                console.error("Erreur de synchronisation:", error);
            }
        };

        checkStatus();
        const syncInterval = setInterval(checkStatus, 20000);
        return () => clearInterval(syncInterval);
    }, [student]);

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Bienvenue</h1>
                        <p className="text-gray-500 mt-2">Identifiez-vous pour commencer</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                value={formName} 
                                onChange={e => setFormName(e.target.value)} 
                                placeholder="Nom et Prénom" 
                                required 
                                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="tel" 
                                value={formPhone} 
                                onChange={e => setFormPhone(e.target.value)} 
                                placeholder="Téléphone" 
                                required 
                                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loadingLogin} 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
                        >
                            {loadingLogin ? 'Connexion...' : (
                                <>
                                    Continuer
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Connexion au serveur...</p>
                </div>
            </div>
        );
    }

    if (status === 'waiting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center p-4">
                <div className="max-w-md">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Salle d'attente</h1>
                    <p className="text-blue-300 text-lg mb-6">
                        L'examen n'a pas encore commencé.
                    </p>
                    <p className="text-gray-400">
                        Attendez que le professeur démarre l'évaluation.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm">
                        {isConnected ? (
                            <>
                                <Wifi className="text-green-400" size={16} />
                                <span className="text-green-400">Connecté</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="text-red-400" size={16} />
                                <span className="text-red-400">Déconnecté</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    if (status === 'finished') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 text-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Épreuve terminée</h1>
                    <p className="text-gray-600">
                        Vos réponses ont été enregistrées avec succès.
                    </p>
                    <p className="text-gray-500 mt-2 text-sm">
                        Merci d'avoir participé !
                    </p>
                </div>
            </div>
        );
    }

    // --- L'EXAMEN EST EN COURS ---
    if (status === 'running') {
        return (
            <>
                <ServerTimer studentName={student.name} />
                {React.Children.map(children, child =>
                    React.cloneElement(child, { 
                        student,
                        timeRemaining
                    })
                )}
            </>
        );
    }

    return null;
};

export default ExamGuard;