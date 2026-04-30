import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import apiRequest from '../../utils/api'; // Using your centralized helper

function AdminApplicants() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [jobRes, appRes] = await Promise.all([
                apiRequest(`/jobs/${id}/`),
                apiRequest(`/applications/?job=${id}`),
            ]);

            const jobData = await jobRes.json();
            const appData = await appRes.json();

            setJob(jobData);
            const cleanApps = Array.isArray(appData) ? appData : (appData.results || []);
            setApplications(cleanApps);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Requirement 2: Remove applicant from database (Kick)
    const handleKick = async (applicationId) => {
        if (!window.confirm("Remove this applicant? They will be able to apply again if the job is still open.")) return;
        
        try {
            const response = await apiRequest(`/applications/${applicationId}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setApplications(prev => prev.filter(app => app.id !== applicationId));
            } else {
                console.error('Failed to remove applicant');
            }
        } catch (error) {
            console.error('Network error during kick:', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            PENDING: 'bg-slate-100 text-slate-500 border-slate-200', 
        };
        return styles[status] || 'bg-slate-50 text-slate-500 border-slate-100';
    };

    const filteredApplications = applications.filter((app) => {
        const name = app.student_name?.toLowerCase() || '';
        const sid = app.student_id?.toLowerCase() || '';
        const matchesSearch = name.includes(search.toLowerCase()) || sid.includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="relative min-h-screen">
            <div className="relative z-20">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => navigate('/admin/jobs')}
                            className="text-white/80 hover:text-white text-sm flex items-center gap-2 transition-all w-fit mb-2"
                        >
                            ← Back to Job Management
                        </button>
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Applicant List</h1>
                        {job && <p className="text-white/70 font-medium">{job.title} • {job.academic_term}/{job.academic_year}</p>}
                    </div>

                    {/* Main Container */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden">

                        {/* Search & Stats Bar */}
                        <div className="p-6 bg-white/40 border-b border-gray-200/50 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by name or student ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent bg-white/50 text-gray-600 min-w-[150px]"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="PENDING">⏳ Pending</option>
                                    <option value="APPROVED">✅ Approved</option>
                                </select>
                            </div>
                            
                            <div className="bg-psu-blue/10 border border-psu-blue/20 rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-wider text-psu-blue w-fit">
                                TOTAL APPLICANTS: {applications.length}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-20 animate-pulse font-medium uppercase tracking-widest">Fetching records...</p>
                            ) : filteredApplications.length === 0 ? (
                                <p className="text-center text-gray-400 py-20 font-medium">No applications found matching your criteria.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/30 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-4 text-left">Student Info</th>
                                            <th className="px-6 py-4 text-left">Faculty</th>
                                            <th className="px-6 py-4 text-left">Applied Date</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-8 py-4 text-center">Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-psu-blue/5 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800">{app.student_name}</span>
                                                        <span className="text-gray-500 font-mono text-xs">{app.student_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-gray-600">{app.faculty}</td>
                                                <td className="px-6 py-5 text-gray-500 text-xs">
                                                    {new Date(app.application_date).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="px-6 py-5 select-none">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Requirement 2: Reject button (now Kick) for all non-completed job statuses */}
                                                        {job?.status !== 'COMPLETED' ? (
                                                            <button
                                                                onClick={() => handleKick(app.id)}
                                                                className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                            >
                                                                Kick Applicant
                                                            </button>
                                                        ) : (
                                                            /* Requirement 3: Evaluate button only when job is COMPLETED */
                                                            <button
                                                                onClick={() => navigate(`/admin/applications/${app.id}/evaluate`)}
                                                                className="bg-psu-accent hover:bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                                                            >
                                                                ⭐ {app.evaluation ? 'Re-evaluate' : 'Evaluate'}
                                                            </button>
                                                        )}
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
            </div>
        </div>
    );
}

export default AdminApplicants;