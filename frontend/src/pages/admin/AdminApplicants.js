import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

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
            const headers = {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            };

            const [jobRes, appRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/jobs/${id}/`, { headers }),
                fetch(`http://127.0.0.1:8000/api/applications/?job=${id}`, { headers }),
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

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/applications/${applicationId}/`, {
                method: 'PATCH', // Partial update
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                // ONLY update UI if the database actually saved it
                setApplications(applications.map((app) =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                ));
            } else {
                const errorData = await response.json();
                console.error('Server rejected the update:', errorData);
                alert("Failed to save status. Check console for details.");
            }
        } catch (error) {
            console.error('Network error updating status:', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
            APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
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
                        {job && <p className="text-white/70 font-medium">{job.title}</p>}
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
                                    <option value="REJECTED">❌ Rejected</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                                    <div key={s} className="bg-white/40 border border-white/60 rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-wider">
                                        <span className="text-gray-400 uppercase">{s}:</span>
                                        <span className="text-gray-800 ml-2">
                                            {applications.filter((a) => a.status === s).length}
                                        </span>
                                    </div>
                                ))}
                                <div className="bg-psu-blue/10 border border-psu-blue/20 rounded-lg px-4 py-1.5 text-[10px] font-bold tracking-wider text-psu-blue">
                                    TOTAL: {applications.length}
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <p className="text-center text-gray-500 py-20 animate-pulse font-medium">Loading records...</p>
                            ) : filteredApplications.length === 0 ? (
                                <p className="text-center text-gray-400 py-20 font-medium">No applications found.</p>
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
                                                    {new Date(app.application_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        {app.status === 'PENDING' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusChange(app.id, 'APPROVED')}
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                                                    className="bg-white border border-gray-200 hover:bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        ) : app.status === 'APPROVED' ? (
                                                            <button
                                                                onClick={() => navigate(`/admin/applications/${app.id}/evaluate`)}
                                                                className="bg-psu-accent hover:bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all shadow-sm"
                                                            >
                                                                ⭐ Evaluate
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-300 italic text-xs">No actions</span>
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