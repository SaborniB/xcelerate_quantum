import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Search, BarChart3, History, ShieldCheck, Zap, Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import CompanyCard, { CompanyData } from './components/CompanyCard';
import AuditForm from './components/AuditForm';
import { AuditResult } from './services/gemini';
import { db, auth } from './services/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Mock Data
const MOCK_COMPANIES: CompanyData[] = [
    {
        id: 1,
        name: "TechZenith",
        logoColor: "bg-blue-600",
        location: "Bengaluru, India",
        employees: "10K+",
        website: "techzenith.in",
        ghostRisk: 0.78,
        metrics: {
            jobsCount: 120,
            remotePercent: 15,
            avgAgeDays: 155,
            salaryMin: "₹10L",
            salaryMax: "₹25L",
            trend: 0.05,
            sources: [{ name: "LinkedIn", value: 65 }, { name: "Indeed", value: 35 }],
            sparkline: [10, 15, 12, 18, 16, 20, 22, 19, 24, 25]
        }
    },
    {
        id: 2,
        name: "EcomXpress",
        logoColor: "bg-emerald-600",
        location: "Mumbai, India",
        employees: "50K+",
        website: "ecomxpress.com",
        ghostRisk: 0.15,
        metrics: {
            jobsCount: 450,
            remotePercent: 5,
            avgAgeDays: 35,
            salaryMin: "₹5L",
            salaryMax: "₹18L",
            trend: -0.02,
            sources: [{ name: "Career Portal", value: 70 }, { name: "Naukri", value: 30 }],
            sparkline: [50, 45, 48, 40, 42, 38, 35, 30, 28, 25]
        }
    },
    {
        id: 3,
        name: "FinSecure",
        logoColor: "bg-indigo-600",
        location: "Pune, India",
        employees: "5K+",
        website: "finsecure.co.in",
        ghostRisk: 0.42,
        metrics: {
            jobsCount: 60,
            remotePercent: 50,
            avgAgeDays: 90,
            salaryMin: "₹12L",
            salaryMax: "₹30L",
            trend: 0.10,
            sources: [{ name: "Referral", value: 50 }, { name: "LinkedIn", value: 50 }],
            sparkline: [5, 8, 12, 15, 10, 18, 20, 25, 28, 30]
        }
    }
];

type View = 'home' | 'audit' | 'directory' | 'history';

const App = () => {
    const [currentView, setCurrentView] = useState<View>('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [auditResult, setAuditResult] = useState<{result: AuditResult, job: any} | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    // Firebase History Listener
    useEffect(() => {
        if (!db || !auth?.currentUser) return;

        const q = query(
            collection(db, `users/${auth.currentUser.uid}/audits`),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [auth?.currentUser]);

    const handleAuditComplete = async (result: AuditResult, jobData: any) => {
        setAuditResult({ result, job: jobData });
        setCurrentView('audit'); // Ensure we stay on audit view to show results
        
        // Save to Firebase
        if (db && auth?.currentUser) {
            try {
                await addDoc(collection(db, `users/${auth.currentUser.uid}/audits`), {
                    jobTitle: jobData.title,
                    company: jobData.company,
                    score: result.score,
                    timestamp: serverTimestamp(),
                    summary: result.analysis
                });
            } catch (e) {
                console.error("Failed to save history", e);
            }
        }
    };

    const renderAuditResult = () => {
        if (!auditResult) return null;
        const { result } = auditResult;
        const score = result.score;
        const isHighRisk = score > 0.6;
        const isMediumRisk = score > 0.3 && score <= 0.6;
        
        const colorClass = isHighRisk ? 'text-rose-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500';
        const bgClass = isHighRisk ? 'bg-rose-50' : isMediumRisk ? 'bg-amber-50' : 'bg-emerald-50';
        const borderClass = isHighRisk ? 'border-rose-200' : isMediumRisk ? 'border-amber-200' : 'border-emerald-200';

        return (
            <div className="animate-in fade-in zoom-in duration-500 mt-8">
                <div className={`rounded-2xl border-2 ${borderClass} ${bgClass} p-8 shadow-lg`}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-200/50 pb-8">
                        <div className="text-center md:text-left mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold text-gray-800">Ghost Job Risk Assessment</h3>
                            <p className="text-gray-600 mt-1 max-w-md">{result.analysis}</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-6xl font-black ${colorClass} tracking-tighter`}>
                                {(score * 100).toFixed(0)}%
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-wider ${colorClass}`}>
                                {isHighRisk ? 'High Probability' : isMediumRisk ? 'Moderate Risk' : 'Legitimate'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {result.factors.map((factor, idx) => (
                             <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                 <div>
                                     <div className="font-bold text-gray-700">{factor.name}</div>
                                     <div className="text-xs text-gray-500 mt-1">{factor.reason}</div>
                                 </div>
                                 <div className="h-12 w-1.5 bg-gray-100 rounded-full overflow-hidden">
                                     <div 
                                        className={`w-full ${isHighRisk ? 'bg-rose-500' : 'bg-indigo-500'} transition-all duration-1000`}
                                        style={{ height: `${factor.impact * 100}%`, marginTop: `${100 - (factor.impact * 100)}%` }}
                                     ></div>
                                 </div>
                             </div>
                         ))}
                    </div>
                    
                    <button 
                        onClick={() => setAuditResult(null)}
                        className="mt-8 w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                        Analyze Another Post
                    </button>
                </div>
            </div>
        );
    };

    const NavItem = ({ view, label, icon: Icon }: any) => (
        <button
            onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 w-full md:w-auto ${
                currentView === view 
                ? 'bg-indigo-100 text-indigo-700 font-bold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <Icon className={`w-5 h-5 mr-2 ${currentView === view ? 'text-indigo-600' : 'text-gray-400'}`} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
                                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-200">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className="font-black text-xl tracking-tight text-gray-900">Ghost<span className="text-indigo-600">Buster</span></span>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-2">
                            <NavItem view="home" label="Dashboard" icon={LayoutDashboard} />
                            <NavItem view="audit" label="Audit Post" icon={ShieldCheck} />
                            <NavItem view="directory" label="Company Index" icon={BarChart3} />
                            <NavItem view="history" label="History" icon={History} />
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1">
                        <NavItem view="home" label="Dashboard" icon={LayoutDashboard} />
                        <NavItem view="audit" label="Audit Post" icon={ShieldCheck} />
                        <NavItem view="directory" label="Company Index" icon={BarChart3} />
                        <NavItem view="history" label="History" icon={History} />
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                
                {currentView === 'home' && (
                    <div className="space-y-12">
                        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                                    Stop Chasing <br/><span className="text-indigo-200">Ghost Jobs.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10 font-light">
                                    Our AI analyzes job market signals to verify if a listing is legitimate, stale, or just for compliance. Don't waste time on applications that go nowhere.
                                </p>
                                <button 
                                    onClick={() => setCurrentView('audit')}
                                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-xl hover:scale-105 transform duration-200"
                                >
                                    Start Free Audit
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 text-rose-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Risk Scoring</h3>
                                <p className="text-gray-500">Get a 0-100% probability score on whether a job is active or a "ghost".</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                    <History className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Staleness Detection</h3>
                                <p className="text-gray-500">Identify jobs that have been reposted for months without hiring.</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Market Intelligence</h3>
                                <p className="text-gray-500">See which companies are actually hiring versus just collecting resumes.</p>
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'audit' && (
                    <div className="max-w-3xl mx-auto">
                        {!auditResult ? (
                            <AuditForm onAuditComplete={handleAuditComplete} />
                        ) : (
                            renderAuditResult()
                        )}
                    </div>
                )}

                {currentView === 'directory' && (
                    <div className="space-y-8">
                         <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Company Accountability Index</h2>
                                <p className="text-gray-500 mt-1">Real-time tracking of hiring behavior in India.</p>
                            </div>
                            <div className="mt-4 md:mt-0 relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                <input type="text" placeholder="Search companies..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {MOCK_COMPANIES.map(company => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>
                    </div>
                )}

                {currentView === 'history' && (
                     <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Audit History</h2>
                        {history.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No audits found. Start by auditing a job post.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {history.map((item) => (
                                        <li key={item.id} className="p-6 hover:bg-gray-50 transition flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{item.jobTitle}</h4>
                                                <p className="text-sm text-gray-500">{item.company}</p>
                                                <p className="text-xs text-gray-400 mt-2">{item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-lg font-bold ${item.score > 0.6 ? 'bg-rose-100 text-rose-700' : item.score > 0.3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {(item.score * 100).toFixed(0)}% Risk
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                     </div>
                )}

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Zap className="w-5 h-5 text-indigo-600 mr-2" />
                            <span className="font-bold text-gray-900">GhostBuster</span>
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500"><Github className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-gray-500"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-400">
                        &copy; 2025 GhostBuster Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;