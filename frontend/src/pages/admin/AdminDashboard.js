import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PIE_COLORS = ['#2563eb', '#93c5fd'];

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 shadow-sm">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termFilter, setTermFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/jobs/'),
                fetch('http://127.0.0.1:8000/api/applications/'),
            ]);
            const jobsData = await jobsRes.json();
            const appsData = await appsRes.json();
            setJobs(jobsData);
            setApplications(appsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    // --- Logic & Calculations ---
    const filteredJobs = jobs.filter((job) => {
        const matchesTerm = termFilter === 'all' || String(job.academic_term) === termFilter;
        const matchesYear = yearFilter === 'all' || String(job.academic_year) === yearFilter;
        return matchesTerm && matchesYear;
    });

    const totalJobs = filteredJobs.length;
    const openJobs = filteredJobs.filter((j) => j.status === 'OPEN').length;
    const totalApplicants = applications.length;
    const approvedApplicants = applications.filter((a) => a.status === 'APPROVED').length;
    const totalPay = filteredJobs.reduce((sum, j) => sum + parseFloat(j.compensation_amount || 0), 0);

    const monthlyData = MONTHS.map((month, i) => ({
        month,
        applications: applications.filter((app) => {
            const d = new Date(app.application_date);
            return d.getMonth() === i;
        }).length,
    }));

    const internalCount = filteredJobs.filter((j) => j.job_type === 'INTERNAL').length;
    const externalCount = filteredJobs.filter((j) => j.job_type === 'EXTERNAL').length;
    const pieData = [
        { name: 'Internal', value: internalCount },
        { name: 'External', value: externalCount },
    ];

    const statusData = [
        { name: 'Open', count: filteredJobs.filter((j) => j.status === 'OPEN').length },
        { name: 'Closed', count: filteredJobs.filter((j) => j.status === 'CLOSED').length },
        { name: 'In Progress', count: filteredJobs.filter((j) => j.status === 'IN_PROGRESS').length },
        { name: 'Completed', count: filteredJobs.filter((j) => j.status === 'COMPLETED').length },
    ];

    const uniqueYears = [...new Set(jobs.map((j) => String(j.academic_year)))].sort();
    const uniqueTerms = [...new Set(jobs.map((j) => String(j.academic_term)))].sort();

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="relative z-20">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <div className="flex gap-3">
                            <select
                                value={termFilter}
                                onChange={(e) => setTermFilter(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-psu-accent"
                            >
                                <option value="all">All Terms</option>
                                {uniqueTerms.map((t) => (
                                    <option key={t} value={t}>Term {t}</option>
                                ))}
                            </select>
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-psu-accent"
                            >
                                <option value="all">All Years</option>
                                {uniqueYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => window.print()}
                                className="bg-psu-accent hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white text-center py-20 font-medium">
                            Loading dashboard data...
                        </motion.p>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon="📋" label="Total Jobs" value={totalJobs} sub={`${openJobs} currently open`} />
                                <StatCard icon="👤" label="Total Applicants" value={totalApplicants} sub={`${approvedApplicants} approved`} />
                                <StatCard icon="💵" label="Total Pay (Internal)" value={`฿${totalPay.toLocaleString()}`} sub="Sum of compensation" />
                                <StatCard icon="✅" label="Approval Rate" value={totalApplicants > 0 ? `${Math.round((approvedApplicants / totalApplicants) * 100)}%` : 'N/A'} sub="Approved / Total" />
                            </div>

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Applications</h2>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Jobs by Type</h2>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                                {pieData.map((_, index) => (<Cell key={index} fill={PIE_COLORS[index]} />))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Jobs Table */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Jobs</h2>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500 text-left">
                                            <th className="pb-3 font-medium">Title</th>
                                            <th className="pb-3 font-medium">Type</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Pay</th>
                                            <th className="pb-3 font-medium">Term</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.slice(0, 5).map((job) => (
                                            <tr key={job.id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-3 font-medium text-gray-800 max-w-xs truncate">{job.title}</td>
                                                <td className="py-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${job.job_type === 'INTERNAL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {job.job_type}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-600">฿{parseFloat(job.compensation_amount).toLocaleString()}</td>
                                                <td className="py-3 text-gray-500">{job.academic_term}/{job.academic_year}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;