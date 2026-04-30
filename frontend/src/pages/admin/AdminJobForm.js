import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import apiRequest from '../../utils/api'; // Using your centralized helper for consistency
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
    academic_term: '',
    academic_year: '',
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
    const [success, setSuccess] = useState(false); // Feedback for non-navigating update

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
                        academic_term: data.academic_term ?? '',
                        academic_year: data.academic_year ?? '',
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
        const formattedValue = type === 'number' && value !== '' ? parseFloat(value) : value;
        setForm({ ...form, [name]: formattedValue });
        if (success) setSuccess(false); // Clear success message on change
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
            let response = await apiRequest(`/jobs/${isEditing ? id + '/' : ''}`, {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(form),
            });

            // Handle token expiration retry
            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    response = await apiRequest(`/jobs/${isEditing ? id + '/' : ''}`, {
                        method: isEditing ? 'PUT' : 'POST',
                        body: JSON.stringify(form),
                    });
                }
            }

            const data = await response.json();
            if (!response.ok) {
                const messages = Object.entries(data).map(([field, errors]) => 
                    `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`
                );
                throw new Error(messages.join(' | ') || "Save failed.");
            }

            if (isEditing) {
                setSuccess(true); // Don't teleport to management [Requirement 3]
                setTimeout(() => setSuccess(false), 3000);
            } else {
                navigate('/admin/jobs'); // Only create case navigates back
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
                {/* Header with Requirement 1: View Live Post */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/jobs')} className="text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">← BACK</button>
                        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md uppercase">
                            {isEditing ? 'Edit Job Detail' : 'Create Job Announcement'}
                        </h1>
                    </div>
                    {isEditing && (
                        <button 
                            onClick={() => window.open(`/jobs/${id}`, '_blank')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/20 transition-all shadow-lg"
                        >
                            🌐 View Live Post
                        </button>
                    )}
                </motion.div>

                {loading ? (
                    <p className="text-white text-center py-20 animate-pulse font-black uppercase tracking-[0.2em]">Synchronizing Interface...</p>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/40">
                        {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold border border-rose-100 mb-6 uppercase tracking-widest">{error}</div>}
                        
                        <AnimatePresence>
                            {success && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-[10px] font-bold border border-emerald-100 mb-6 uppercase tracking-widest text-center">
                                    ✓ Job Post Updated Successfully
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Requirement 2: Image Preview Section */}
                            <div className="col-span-2 flex flex-col md:flex-row gap-6 mb-4">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Job Title</label>
                                        <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-psu-accent/30 bg-white/50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Poster Image URL</label>
                                        <input type="text" name="poster_image_url" value={form.poster_image_url} onChange={handleChange} placeholder="https://unsplash.com/..." className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-psu-accent/30 bg-white/50" />
                                    </div>
                                </div>
                                <div className="w-full md:w-56 h-32 bg-slate-100 rounded-2xl overflow-hidden border border-white shadow-inner flex-shrink-0 relative group">
                                    <img 
                                        src={form.poster_image_url || placeholder} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                        onError={(e) => { e.target.src = placeholder; }}
                                    />
                                    <div className="absolute top-2 left-2 bg-black/40 text-white text-[8px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">PREVIEW</div>
                                </div>
                            </div>

                            {/* Rest of the fields with updated styles */}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Organization</label>
                                <input type="text" name="organization_name" value={form.organization_name} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Location</label>
                                <input type="text" name="location_type" value={form.location_type} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">LINE Group Chat</label>
                                <input type="text" name="line_group_url" value={form.line_group_url} onChange={handleChange} placeholder="https://line.me/..." className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50" />
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
                                <select name="job_type" value={form.job_type} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50 font-bold text-slate-700">
                                    <option value="EXTERNAL">External</option>
                                    <option value="INTERNAL">Internal</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-white/50 font-bold text-slate-700">
                                    <option value="OPEN">Open</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-sm bg-white/50 resize-none leading-relaxed" />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-4 mt-10">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving}
                                className="flex-[2] bg-psu-accent hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all">
                                {saving ? 'SYNCING DATA...' : isEditing ? 'Update Job Listings' : 'Publish Job Post'}
                            </motion.button>
                            <button onClick={() => navigate('/admin/jobs')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
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