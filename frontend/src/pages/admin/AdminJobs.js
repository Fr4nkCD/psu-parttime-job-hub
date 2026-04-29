import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function AdminJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/jobs/');
            const data = await response.json();
            setJobs(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://127.0.0.1:8000/api/jobs/${id}/`, { method: 'DELETE' });
            setJobs(jobs.filter((j) => j.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || job.status === filter.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const styles = {
            OPEN: 'bg-green-100 text-green-700 border-green-200',
            CLOSED: 'bg-gray-100 text-gray-500 border-gray-200',
            IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
            COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return styles[status] || 'bg-slate-100 text-slate-500 border-slate-200';
    };

    return (
        <div className="relative min-h-screen">
            <div className="relative z-20">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Job Management</h1>
                            <p className="text-white/80 text-sm font-medium">Create and manage PSU Phuket job listings</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/jobs/new')}
                            className="bg-psu-accent hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg"
                        >
                            + Add New Job
                        </motion.button>
                    </div>

                    {/* Main Glass Container */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">

                        {/* Search & Filter Bar */}
                        <div className="p-6 bg-white/40 border-b border-gray-200/50 flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search job title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 transition-all"
                            />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-20 font-medium animate-pulse">Fetching records...</p>
                            ) : filteredJobs.length === 0 ? (
                                <div className="text-center py-20 bg-white/20">
                                    <p className="text-gray-400">No jobs found matching your search.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-1000 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-4 text-left font-semibold">Job Title / Organization</th>
                                            <th className="px-6 py-4 text-left font-semibold">Type</th>
                                            <th className="px-6 py-4 text-left font-semibold">Status</th>
                                            <th className="px-8 py-4 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredJobs.map((job) => (
                                            <tr key={job.id} className="hover:bg-psu-blue/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 text-base">{job.title}</span>
                                                        <span className="text-gray-800 text-xs mt-0.5">{job.organization_name} • Term {job.academic_term}/{job.academic_year}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${job.job_type === 'INTERNAL'
                                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {job.job_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                                            className="p-2 bg-black/10 hover:bg-white/10 rounded-lg text-white transition-all"
                                                            title="View"
                                                        >
                                                            👁️
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/jobs/${job.id}/applicants`)}
                                                            className="p-2 bg-black/10 hover:bg-white/10 rounded-lg text-white transition-all"
                                                            title="View Applicants"
                                                        >
                                                            👤
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                                                            className="p-2 bg-black/10 hover:bg-white/10 rounded-lg text-white transition-all"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(job.id)}
                                                            className="p-2 bg-black/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-all"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delete Modal */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() => setDeleteConfirm(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
                            >
                                <div className="text-4xl mb-4">🗑️</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Job?</h3>
                                <p className="text-sm text-gray-500 mb-8">
                                    Are you sure you want to delete <span className="font-bold text-gray-800">"{jobs.find(j => j.id === deleteConfirm)?.title}"</span>? This cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold transition-all">Confirm</button>
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-bold transition-all">Cancel</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminJobs;