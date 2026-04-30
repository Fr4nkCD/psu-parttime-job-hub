import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const DEFAULT_FORM = {
    punctuality_rating: 5,
    responsibility_rating: 5,
    grooming_rating: 5,
    quality_rating: 5,
    comment: '',
    result_status: 'PASS',
};

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1 bg-white/40 p-2 rounded-xl border border-white/60">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-2xl transition-transform hover:scale-125 active:scale-90"
                >
                    <span className={star <= (hovered || value) ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-gray-300'}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
}

function AdminEvaluate() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Initialize with default state
    const [form, setForm] = useState(DEFAULT_FORM);

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    const fetchApplication = async () => {
        setLoading(true);
        setError(null);
        
        // 1. CRITICAL RESET: Forget any previous evaluation data immediately
        setForm(DEFAULT_FORM);

        try {
            const token = getToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            // 2. Fetch details for this specific application
            const appRes = await fetch(`http://127.0.0.1:8000/api/applications/${applicationId}/`, { headers });
            if (!appRes.ok) throw new Error("Application not found.");
            const appData = await appRes.json();
            setApplication(appData);

            // 3. Check if an evaluation ALREADY exists for THIS application only
            const evalRes = await fetch(`http://127.0.0.1:8000/api/evaluations/?application=${applicationId}`, { headers });
            const evalData = await evalRes.json();
            
            // Only set form data if the backend returned a match for THIS specific ID
            const existingEval = Array.isArray(evalData) ? evalData[0] : (evalData.results?.[0]);

            if (existingEval) {
                setForm({
                    punctuality_rating: existingEval.punctuality_rating,
                    responsibility_rating: existingEval.responsibility_rating,
                    grooming_rating: existingEval.grooming_rating,
                    quality_rating: existingEval.quality_rating,
                    comment: existingEval.comment,
                    result_status: existingEval.result_status,
                    id: existingEval.id // Triggers PATCH mode
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load record.');
        } finally {
            setLoading(false);
        }
    };

    const averageRating = () => {
        const ratings = [form.punctuality_rating, form.responsibility_rating, form.grooming_rating, form.quality_rating];
        return (ratings.reduce((a, b) => a + b, 0) / 4).toFixed(1);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const isEditing = !!form.id;
        const url = isEditing ? `http://127.0.0.1:8000/api/evaluations/${form.id}/` : 'http://127.0.0.1:8000/api/evaluations/';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                // IMPORTANT: Always bind it to the current applicationId
                body: JSON.stringify({ ...form, application: applicationId }),
            });

            if (!response.ok) throw new Error('Submission failed.');
            setSuccess(true);
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const ratingsConfig = [
        { key: 'punctuality_rating', label: 'Punctuality', desc: 'Timing and schedule reliability' },
        { key: 'responsibility_rating', label: 'Responsibility', desc: 'Execution of assigned duties' },
        { key: 'grooming_rating', label: 'Appearance', desc: 'Presentation and attire' },
        { key: 'quality_rating', label: 'Work Quality', desc: 'General output standard' },
    ];

    if (loading && !application) return <div className="text-white text-center py-20 font-bold animate-pulse">SYNCING DATA...</div>;

    return (
        <div className="relative min-h-screen pt-24 pb-16 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto relative z-20">
                
                <div className="flex flex-col gap-1 mb-8">
                    <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-xs w-fit mb-4 flex items-center gap-2 font-bold uppercase tracking-widest transition-colors">
                        ← Back to Applicants
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Performance Sync</h1>
                </div>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/80 backdrop-blur-md rounded-[2rem] p-12 text-center shadow-2xl border border-white/40">
                            <div className="text-6xl mb-6">✅</div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Sync Complete</h2>
                            <p className="text-slate-500 mb-8 font-medium italic">Record for {application?.student_name} has been updated.</p>
                            <button onClick={() => navigate(-1)} className="bg-psu-accent text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">
                                Return to List
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">

                            {/* Info Header */}
                            <div className="bg-white/40 p-8 border-b border-gray-200/30 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-psu-blue/10 flex items-center justify-center text-3xl border border-psu-blue/20">👤</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-2 leading-none">{application?.student_name}</h2>
                                    <p className="text-slate-500 text-md font-bold uppercase tracking-wider">{application?.student_id}</p>
                                    <div className="mt-3 inline-block bg-blue-50 text-blue-600 text-sm font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                                        JOB: {application?.job_title}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 italic">⚠️ {error}</div>}

                                <div className="grid gap-8">
                                    {ratingsConfig.map((item) => (
                                        <motion.div variants={itemVariants} initial="hidden" animate="visible" key={item.key} className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-black text-slate-700 text-lg uppercase tracking-tight">{item.label}</p>
                                                <p className="text-md text-slate-500 font-medium">{item.desc}</p>
                                            </div>
                                            <StarRating value={form[item.key]} onChange={(val) => setForm({ ...form, [item.key]: val })} />
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-slate-900/5 border border-white/50 rounded-3xl p-6 flex items-center justify-between shadow-inner">
                                    <span className="text-md font-semibold text-slate-600 uppercase tracking-[0.2em]">Live Average</span>
                                    <div className="text-right">
                                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{averageRating()}</span>
                                        <span className="text-slate-400 font-bold ml-1 text-sm">/ 5.0</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Verdict</label>
                                    <div className="flex gap-4">
                                        <button onClick={() => setForm({ ...form, result_status: 'PASS' })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${form.result_status === 'PASS' ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-300 hover:border-emerald-200'}`}>
                                            {form.result_status === 'PASS' ? '✓ Passed' : 'Pass'}
                                        </button>
                                        <button onClick={() => setForm({ ...form, result_status: 'FAIL' })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${form.result_status === 'FAIL' ? 'bg-rose-500 border-rose-500 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-300 hover:border-rose-200'}`}>
                                            {form.result_status === 'FAIL' ? '✕ Failed' : 'Fail'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Notes</label>
                                    <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3}
                                        placeholder="Performance summary..."
                                        className="w-full border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-200 bg-white/50 resize-none transition-all" />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button onClick={handleSubmit} disabled={saving}
                                        className="flex-[2] bg-psu-accent hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl disabled:opacity-50">
                                        {saving ? 'Processing...' : 'Finalize & Sync Evaluation'}
                                    </button>
                                    <button onClick={() => navigate(-1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default AdminEvaluate;