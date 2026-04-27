import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Added for security

const emptyForm = {
    title: '',
    organization_name: '',
    description: '',
    location_type: '',
    job_type: 'EXTERNAL',
    compensation_amount: '',
    required_amount: '',
    status: 'OPEN',
    academic_term: '',
    academic_year: '',
    poster_image_url: '',
    line_group_url: '',
    schedules: [] // Initialized for nested shifts
};

function AdminJobForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getToken } = useAuth();
    const isEditing = Boolean(id);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            fetch(`http://127.0.0.1:8000/api/jobs/${id}/`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })
                .then((res) => res.json())
                .then((data) => {
                    setForm({ ...data, schedules: data.schedules || [] });
                    setLoading(false);
                })
                .catch(() => {
                    setError('Failed to load job.');
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const formattedValue = type === 'number' && value !== '' ? parseFloat(value) : value;
        setForm({ ...form, [name]: formattedValue });
    };

    // --- Dynamic Schedule Logic ---
    const addSchedule = () => {
        setForm({
            ...form,
            schedules: [...form.schedules, { date: '', start_time: '', end_time: '' }]
        });
    };

    const removeSchedule = (index) => {
        const newSchedules = form.schedules.filter((_, i) => i !== index);
        setForm({ ...form, schedules: newSchedules });
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...form.schedules];
        newSchedules[index][field] = value;
        setForm({ ...form, schedules: newSchedules });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            const url = isEditing
                ? `http://127.0.0.1:8000/api/jobs/${id}/`
                : 'http://127.0.0.1:8000/api/jobs/';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorData = await response.json();

                const messages = Object.entries(errorData).map(([field, errors]) => {
                    if (field === 'schedules' && Array.isArray(errors)) {
                        return errors.map((err, i) => {
                            const shiftErrors = Object.entries(err)
                                .map(([f, m]) => `${f}: ${m}`)
                                .join(', ');
                            return shiftErrors ? `Shift ${i + 1} (${shiftErrors})` : null;
                        }).filter(Boolean).join(' | ');
                    }
                    return `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`;
                });

                throw new Error(messages.join(' | ') || 'Failed to save.');
            }

            navigate('/admin/jobs');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: 'title', label: 'Job Title', type: 'text', full: true },
        { name: 'organization_name', label: 'Organization', type: 'text', full: true },
        { name: 'location_type', label: 'Location', type: 'text', full: true },
        { name: 'compensation_amount', label: 'Pay (฿)', type: 'number' },
        { name: 'required_amount', label: 'Staff Need', type: 'number' },
        { name: 'academic_term', label: 'Term', type: 'number' },
        { name: 'academic_year', label: 'Year', type: 'number' },
    ];

    return (
        <div className="relative min-h-screen py-10">
            <div className="relative z-20 max-w-4xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <button onClick={() => navigate('/admin/jobs')} className="text-white/80 hover:text-white transition-colors text-sm font-bold">← BACK</button>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                        {isEditing ? 'EDIT JOB' : 'CREATE JOB'}
                    </h1>
                </motion.div>

                {loading ? (
                    <p className="text-white text-center py-20 animate-pulse">Initializing Interface...</p>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.1, 1, 0.1, 1] }} // Snappy Ease
                        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/40"
                    >
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 mb-6 uppercase tracking-widest">{error}</div>}

                        <div className="grid grid-cols-2 gap-6">
                            {/* Base Fields */}
                            {fields.map((f) => (
                                <div key={f.name} className={f.full ? 'col-span-2' : 'col-span-1'}>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">{f.label}</label>
                                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                                        className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent/50 bg-white/50 transition-all" />
                                </div>
                            ))}

                            {/* Dropdowns */}
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Type</label>
                                <select name="job_type" value={form.job_type} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50">
                                    <option value="EXTERNAL">External</option>
                                    <option value="INTERNAL">Internal</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50">
                                    <option value="OPEN">Open</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                </select>
                            </div>

                            {/* --- WORK SCHEDULES SECTION (FROM PDF) --- */}
                            <div className="col-span-2 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black text-psu-blue uppercase tracking-widest ml-1">Work Schedules</label>
                                    <button type="button" onClick={addSchedule} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all">
                                        + ADD SHIFT
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {form.schedules.map((shift, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: 10, opacity: 0 }}
                                                className="grid grid-cols-12 gap-3 bg-white/40 p-4 rounded-2xl border border-white/60 items-end"
                                            >
                                                <div className="col-span-5">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Date</label>
                                                    <input type="date" value={shift.date} onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                                                        className="w-full border-none rounded-lg px-3 py-2 text-xs bg-white/60 focus:ring-1 focus:ring-psu-accent" />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Start</label>
                                                    <input type="time" value={shift.start_time} onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                                                        className="w-full border-none rounded-lg px-3 py-2 text-xs bg-white/60" />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">End</label>
                                                    <input type="time" value={shift.end_time} onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                                                        className="w-full border-none rounded-lg px-3 py-2 text-xs bg-white/60" />
                                                </div>
                                                <button type="button" onClick={() => removeSchedule(index)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2 text-lg">✕</button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {form.schedules.length === 0 && <p className="text-center text-gray-400 text-xs py-4 italic">No shifts added yet.</p>}
                                </div>
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                                    className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent/50 bg-white/50 resize-none" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-10">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving}
                                className="flex-[2] bg-psu-accent hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50">
                                {saving ? 'SYNCING...' : isEditing ? 'UPDATE JOB POST' : 'PUBLISH JOB POST'}
                            </motion.button>
                            <button onClick={() => navigate('/admin/jobs')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                                CANCEL
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default AdminJobForm;