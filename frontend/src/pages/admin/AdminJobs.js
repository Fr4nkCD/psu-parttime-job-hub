import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiRequest from '../../utils/api';

function AdminJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [termFilter, setTermFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await apiRequest('/jobs/');
            const data = await response.json();
            
            // MULTI-LEVEL SORTING: 
            // 1. Academic Year (descending)
            // 2. Academic Term (descending)
            // 3. Date Created (descending)
            const sortedData = data.sort((a, b) => {
                // Primary: Academic Year
                if (b.academic_year !== a.academic_year) {
                    return b.academic_year - a.academic_year;
                }
                // Secondary: Academic Term
                if (b.academic_term !== a.academic_term) {
                    return b.academic_term - a.academic_term;
                }
                // Tertiary: Date Created (latest first)
                return new Date(b.created_at) - new Date(a.created_at);
            });
            
            setJobs(sortedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await apiRequest(`/jobs/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: false })
            });

            if (response.ok) {
                setJobs(jobs.filter((j) => j.id !== id));
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Error in soft-delete:', error);
        }
    };

    // Extract unique Academic Years for the dropdown
    const uniqueYears = [...new Set(jobs.map(job => job.academic_year))].sort((a, b) => b - a);

    // EXPANDED FILTERING: Combined Search, Status, Type, Year, and Term filters
    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter.toUpperCase();
        const matchesType = typeFilter === 'all' || job.job_type === typeFilter.toUpperCase();
        const matchesYear = yearFilter === 'all' || job.academic_year === Number(yearFilter);
        const matchesTerm = termFilter === 'all' || job.academic_term === Number(termFilter);
        return matchesSearch && matchesStatus && matchesType && matchesYear && matchesTerm;
    });

    const formatStatusText = (status) => {
        return status.replace('_', ' ');
    };

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
                        <div className="p-6 bg-white/40 border-b border-gray-200/50 flex flex-col lg:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search job title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 transition-all"
                            />
                            {/* NEW: Extended Row of Dynamic Selectors */}
                            <div className="flex flex-wrap gap-3">
                                {/* Academic Year Filter - Dynamic */}
                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600 font-medium"
                                >
                                    <option value="all">All Years</option>
                                    {uniqueYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                {/* Term/Semester Filter - Static */}
                                <select
                                    value={termFilter}
                                    onChange={(e) => setTermFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600 font-medium"
                                >
                                    <option value="all">All Semesters</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                </select>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600 font-medium"
                                >
                                    <option value="all">All Types</option>
                                    <option value="internal">Internal</option>
                                    <option value="external">External</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600 font-medium"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-20 font-medium animate-pulse uppercase tracking-widest">Fetching records...</p>
                            ) : filteredJobs.length === 0 ? (
                                <div className="text-center py-20 bg-white/20">
                                    <p className="text-gray-400 font-medium">No jobs found matching your search.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-4 text-left">Job Title / Organization</th>
                                            <th className="px-6 py-4 text-left">Type</th>
                                            <th className="px-6 py-4 text-left">Applicants</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-8 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredJobs.map((job) => (
                                            <tr key={job.id} className="hover:bg-psu-blue/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 text-base">{job.title}</span>
                                                        <span className="text-gray-500 text-xs mt-0.5">{job.organization_name} • {job.academic_term}/{job.academic_year}</span>
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
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-700 font-bold">{job.applicants_count || 0} / {job.required_amount}</span>
                                                        <div className="w-24 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                            <div 
                                                                className="h-full bg-psu-blue" 
                                                                style={{ width: `${Math.min(100, ((job.applicants_count || 0) / job.required_amount) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${getStatusBadge(job.status)}`}>
                                                        {formatStatusText(job.status)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                                            className="p-2 bg-slate-100 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm border border-slate-200"
                                                            title="View Public Post"
                                                        >
                                                            👁️
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/jobs/${job.id}/applicants`)}
                                                            className="p-2 bg-slate-100 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm border border-slate-200"
                                                            title="Manage Applicants"
                                                        >
                                                            👤
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                                                            className="p-2 bg-slate-100 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm border border-slate-200"
                                                            title="Edit Details"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(job.id)}
                                                            className="p-2 bg-rose-50 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all shadow-sm border border-rose-100"
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
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setDeleteConfirm(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100"
                            >
                                <div className="text-4xl mb-4">🗑️</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Job?</h3>
                                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                    Are you sure you want to remove <span className="font-bold text-slate-800">"{jobs.find(j => j.id === deleteConfirm)?.title}"</span>? 
                                    This will hide the job from public discovery.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20">Confirm</button>
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition-all">Cancel</button>
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