import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Added motion

// Animation Variants
const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
                    <span className={
                        star <= (hovered || value)
                            ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                            : 'text-gray-300'
                    }>
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
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        punctuality_rating: 0,
        responsibility_rating: 0,
        grooming_rating: 0,
        quality_rating: 0,
        comment: '',
        result_status: 'PASS',
    });

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    const fetchApplication = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/applications/${applicationId}/`);
            const data = await res.json();
            setApplication(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching application:', error);
            setLoading(false);
        }
    };

    const averageRating = () => {
        const ratings = [
            form.punctuality_rating,
            form.responsibility_rating,
            form.grooming_rating,
            form.quality_rating,
        ];
        const filled = ratings.filter((r) => r > 0);
        if (filled.length === 0) return 0;
        return (filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(1);
    };

    const handleSubmit = async () => {
        if (Object.values(form).some(v => v === 0)) {
            setError('Please complete all ratings before submitting.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/evaluations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, application: applicationId }),
            });

            if (!response.ok) throw new Error('Failed to submit.');
            setSuccess(true);
        } catch (err) {
            setError('Connection error. Please try again.');
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

    return (
        <div className="relative min-h-screen">
            <div className="relative z-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-6">
                        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm w-fit mb-2 flex items-center gap-2">
                            ← Back to Applicants
                        </button>
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Student Evaluation</h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.p key="loading" exit={{ opacity: 0 }} className="text-white text-center py-20 font-medium animate-pulse">
                                Fetching application details...
                            </motion.p>
                        ) : success ? (
                            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center shadow-2xl border border-white/40">
                                <div className="text-6xl mb-6">✨</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Evaluation Finalized</h2>
                                <p className="text-gray-500 mb-8">Performance data has been recorded for the Student Development office.</p>
                                <button onClick={() => navigate(-1)} className="bg-psu-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                                    Return to List
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 overflow-hidden">

                                {/* Student Card Header */}
                                <div className="bg-white/40 p-8 border-b border-gray-200/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-psu-blue/10 flex items-center justify-center text-psu-blue text-2xl border border-psu-blue/20">
                                            👤
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">{application?.student_name}</h2>
                                            <p className="text-gray-500 text-sm font-medium">{application?.student_id} • {application?.faculty}</p>
                                            <div className="mt-1 inline-block bg-psu-blue/10 text-psu-blue text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                                Job: {application?.job_title}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}

                                    {/* Ratings Grid */}
                                    <div className="grid gap-6">
                                        {ratingsConfig.map((item) => (
                                            <motion.div variants={itemVariants} initial="hidden" animate="visible" key={item.key} className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.label}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                                                </div>
                                                <StarRating value={form[item.key]} onChange={(val) => setForm({ ...form, [item.key]: val })} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Score Highlight */}
                                    <div className="bg-psu-blue/5 border border-psu-blue/10 rounded-2xl p-6 flex items-center justify-between">
                                        <span className="text-sm font-black text-psu-blue uppercase tracking-widest">Performance Score</span>
                                        <div className="text-right">
                                            <span className="text-4xl font-black text-gray-800">{averageRating()}</span>
                                            <span className="text-gray-400 font-bold ml-1">/ 5.0</span>
                                        </div>
                                    </div>

                                    {/* Result Toggle */}
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Final Verdict</label>
                                        <div className="flex gap-3">
                                            <button onClick={() => setForm({ ...form, result_status: 'PASS' })}
                                                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${form.result_status === 'PASS' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-[1.02]' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                                                    }`}>
                                                {form.result_status === 'PASS' ? '✓ Passed' : 'Pass'}
                                            </button>
                                            <button onClick={() => setForm({ ...form, result_status: 'FAIL' })}
                                                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${form.result_status === 'FAIL' ? 'bg-rose-500 border-rose-500 text-white shadow-lg scale-[1.02]' : 'bg-white border-gray-100 text-gray-400 hover:border-rose-200'
                                                    }`}>
                                                {form.result_status === 'FAIL' ? '✕ Failed' : 'Fail'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comment Box */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Supervisor Comments</label>
                                        <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3}
                                            placeholder="Write a brief summary of the student's performance..."
                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 resize-none transition-all" />
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-4 flex gap-4">
                                        <button onClick={handleSubmit} disabled={saving}
                                            className="flex-[2] bg-psu-accent hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50">
                                            {saving ? 'Processing...' : 'Submit Evaluation'}
                                        </button>
                                        <button onClick={() => navigate(-1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold text-sm transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export default AdminEvaluate;