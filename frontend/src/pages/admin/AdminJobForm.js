import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import apiRequest from '../../utils/api';
import placeholder from '../../assets/placeholder-image.jpg';

const emptyForm = {
    title: '',
    organization_name: '',
    description: '',
    location_type: '',
    job_type: 'EXTERNAL',
    compensation_amount: '',
    required_amount: '',
    status: 'OPEN',
    academic_term: 2,
    academic_year: 2569,
    poster_image_url: '',
    line_group_url: '',
    schedules: []
};

function AdminJobForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { refreshAccessToken } = useAuth();
    const isEditing = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            apiRequest(`/jobs/${id}/`)
                .then((res) => {
                    if (!res.ok) throw new Error(`Failed to load job: ${res.status}`);
                    return res.json();
                })
                .then((data) => {
                    setForm({
                        ...data,
                        compensation_amount: data.compensation_amount ?? '',
                        required_amount: data.required_amount ?? '',
                        academic_term: data.academic_term ?? 2,
                        academic_year: data.academic_year ?? 2569,
                        schedules: data.schedules || []
                    });
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let formattedValue = value;

        // Ensure numeric types are sent as integers to avoid 400 errors
        if (type === 'number' || name.includes('academic')) {
            formattedValue = value === '' ? '' : parseInt(value, 10);
        }

        setForm({ ...form, [name]: formattedValue });
        if (success) setSuccess(false);
    };

    const addSchedule = () => {
        setForm({
            ...form,
            schedules: [...form.schedules, { date: '', start_time: '09:00', end_time: '12:00' }]
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
        setSuccess(false);

        try {
            const url = isEditing ? `/jobs/${id}/` : `/jobs/`;
            let response = await apiRequest(url, {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(form),
            });

            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    response = await apiRequest(url, {
                        method: isEditing ? 'PUT' : 'POST',
                        body: JSON.stringify(form),
                    });
                }
            }

            const data = await response.json();
            if (!response.ok) {
                // Advanced error parsing to fix [OBJECT OBJECT] display
                const messages = Object.entries(data).map(([field, errors]) => {
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
                throw new Error(messages.join(' | ') || "Save failed.");
            }

            if (isEditing) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                navigate('/admin/jobs');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen py-10 font-sans">
            <div className="relative z-20 max-w-4xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/jobs')} className="text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">← BACK</button>
                        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md uppercase">
                            {isEditing ? 'Edit Job Detail' : 'Create Job Announcement'}
                        </h1>
                    </div>
                    {isEditing && (
                        <button onClick={() => window.open(`/jobs/${id}`, '_blank')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase border border-white/20 transition-all shadow-lg">
                            🌐 View Live Post
                        </button>
                    )}
                </motion.div>

                {loading ? (
                    <p className="text-white text-center py-20 animate-pulse font-black uppercase tracking-widest">Synchronizing...</p>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/40">
                        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold border border-rose-100 mb-6 uppercase tracking-widest leading-relaxed">{error}</div>}

                        <AnimatePresence>
                            {success && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-[10px] font-bold border border-emerald-100 mb-6 uppercase text-center">
                                    ✓ Update Successful
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Image Preview & Title */}
                            <div className="col-span-2 flex flex-col md:flex-row gap-6 mb-4">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Job Title</label>
                                        <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Poster Image URL</label>
                                        <input type="text" name="poster_image_url" value={form.poster_image_url} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                                    </div>
                                </div>
                                <div className="w-full md:w-56 h-32 bg-slate-100 rounded-2xl overflow-hidden border border-white relative">
                                    <img src={form.poster_image_url || placeholder} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = placeholder; }} />
                                    <div className="absolute top-2 left-2 bg-black/40 text-white text-[8px] font-bold px-2 py-1 rounded-md">PREVIEW</div>
                                </div>
                            </div>

                            {/* Academic Selectors */}
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Academic Term</label>
                                <select name="academic_term" value={form.academic_term} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50">
                                    <option value={1}>1st Semester</option>
                                    <option value={2}>2nd Semester</option>
                                    <option value={3}>Summer</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Academic Year</label>
                                <select name="academic_year" value={form.academic_year} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50">
                                    {[2568, 2569, 2570].map(yr => <option key={yr} value={yr}>{yr}</option>)}
                                </select>
                            </div>

                            {/* Essential Details */}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Organization</label>
                                <input type="text" name="organization_name" value={form.organization_name} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Location</label>
                                <input type="text" name="location_type" value={form.location_type} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">LINE Group</label>
                                <input type="text" name="line_group_url" value={form.line_group_url} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Pay (฿)</label>
                                <input type="number" name="compensation_amount" value={form.compensation_amount} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Staff Need</label>
                                <input type="number" name="required_amount" value={form.required_amount} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>

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
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            {/* Dynamic Work Schedule */}
                            <div className="col-span-2 mt-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">📅 Work Schedule</label>
                                    <button type="button" onClick={addSchedule} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors uppercase">+ Add Shift</button>
                                </div>
                                <div className="space-y-3">
                                    {form.schedules.map((sched, index) => (
                                        <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-gray-100 relative">
                                            <div className="w-full md:w-1/3">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 ml-1">Date</label>
                                                <input type="date" value={sched.date} onChange={(e) => handleScheduleChange(index, 'date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white" />
                                            </div>
                                            <div className="w-1/2 md:w-1/4">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 ml-1">Start</label>
                                                <input type="time" value={sched.start_time} onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                            <div className="w-1/2 md:w-1/4">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 ml-1">End</label>
                                                <input type="time" value={sched.end_time} onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                            <button type="button" onClick={() => removeSchedule(index)} className="p-2.5 text-rose-300 hover:text-rose-600 transition-all uppercase">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-sm bg-white/50 resize-none" />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-4 mt-10">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving}
                                className="flex-[2] bg-psu-accent hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50">
                                {saving ? 'Syncing...' : isEditing ? 'Update Job Listings' : 'Publish Job Post'}
                            </motion.button>
                            <button onClick={() => navigate('/admin/jobs')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase">
                                {isEditing ? 'Done' : 'Cancel'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default AdminJobForm;