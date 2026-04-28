import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Changed import style to avoid the .mjs error

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#2563eb', '#93c5fd'];

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 flex items-center gap-4 border border-white/20 shadow-sm">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{sub}</p>}
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
    const [exporting, setExporting] = useState(false);
    const dashboardRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            const [jobsRes, appsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/jobs/', { headers }),
                fetch('http://127.0.0.1:8000/api/applications/', { headers }),
            ]);
            const jobsData = await jobsRes.json();
            const appsData = await appsRes.json();
            setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
            setApplications(Array.isArray(appsData) ? appsData : appsData.results || []);
            setLoading(false);
        } catch (error) { console.error('Fetch Error:', error); setLoading(false); }
    };

    // --- Data Processing ---
    const filteredJobs = jobs.filter(j => (termFilter === 'all' || String(j.academic_term) === termFilter) && (yearFilter === 'all' || String(j.academic_year) === yearFilter));
    const approvedApplicants = applications.filter(a => a.status === 'APPROVED').length;
    const totalApplicants = applications.length;
    const openJobsCount = filteredJobs.filter(j => j.status === 'OPEN').length;
    const totalPay = filteredJobs.reduce((sum, j) => sum + parseFloat(j.compensation_amount || 0), 0);

    const monthlyData = MONTHS.map((month, i) => ({
        month,
        applications: applications.filter(app => new Date(app.application_date).getMonth() === i).length,
    }));

    // Faculty Chart Logic
    const facultyData = [
        { name: 'FHT', count: applications.filter(a => a.faculty?.includes('Tourism')).length },
        { name: 'FIS', count: applications.filter(a => a.faculty?.includes('International')).length },
        { name: 'FTE', count: applications.filter(a => a.faculty?.includes('Environment')).length },
        { name: 'CoC', count: applications.filter(a => a.faculty?.includes('Computing')).length },
    ];

    const pieData = [
        { name: 'Internal', value: filteredJobs.filter(j => j.job_type === 'INTERNAL').length },
        { name: 'External', value: filteredJobs.filter(j => j.job_type === 'EXTERNAL').length },
    ];

    const uniqueYears = [...new Set(jobs.map((j) => String(j.academic_year)))].sort();
    const uniqueTerms = [...new Set(jobs.map((j) => String(j.academic_term)))].sort();

    // Requirement: PDF Summary List
    const handleExportSummaryPDF = () => {
        const doc = new jsPDF();
        
        // Header based on PSU Transcript style
        doc.setFontSize(10);
        doc.text("PRINCE OF SONGKLA UNIVERSITY", 105, 15, { align: 'center' });
        doc.text("ACTIVITY SUMMARY FOR STUDENT DEVELOPMENT", 105, 20, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 190, 25, { align: 'right' });
        doc.line(14, 28, 196, 28);

        // INTERNAL Section
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("INTERNAL JOBS (ON-CAMPUS)", 14, 38);
        
        const internalRows = filteredJobs
            .filter(j => j.job_type === 'INTERNAL')
            .map(j => [j.created_at?.split('T')[0] || '-', j.title, j.organization_name || 'PSU Unit']);

        autoTable(doc, {
            startY: 42,
            head: [['DATE', 'JOB TITLE', 'ORGANIZATION / UNIT']],
            body: internalRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillStyle: '#f1f5f9', textColor: '#000' }
        });

        // EXTERNAL Section
        const nextY = doc.lastAutoTable.finalY + 15;
        doc.text("EXTERNAL JOBS (OFF-CAMPUS)", 14, nextY);

        const externalRows = filteredJobs
            .filter(j => j.job_type === 'EXTERNAL')
            .map(j => [j.created_at?.split('T')[0] || '-', j.title, j.organization_name || 'External Agency']);

        autoTable(doc, {
            startY: nextY + 4,
            head: [['DATE', 'JOB TITLE', 'EMPLOYER']],
            body: externalRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillStyle: '#f1f5f9', textColor: '#000' }
        });

        doc.save(`Job_Summary_Report_${new Date().getFullYear()}.pdf`);
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="relative z-20">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <div className="flex gap-3">
                            <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-psu-accent">
                                <option value="all">All Terms</option>
                                {uniqueTerms.map(t => <option key={t} value={t}>Term {t}</option>)}
                            </select>
                            <button 
                                onClick={handleExportSummaryPDF} 
                                className="bg-psu-accent hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                            >
                                📄 Export Summary PDF
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-white text-center py-20 font-medium">Loading dashboard data...</p>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Stat Cards - Preserved your slim style */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon="📋" label="Total Jobs" value={filteredJobs.length} sub={`${openJobsCount} currently open`} />
                                <StatCard icon="👤" label="Applicants" value={totalApplicants} sub={`${approvedApplicants} approved`} />
                                <StatCard icon="💵" label="Total Pay" value={`฿${totalPay.toLocaleString()}`} />
                                <StatCard icon="✅" label="Approval Rate" value={totalApplicants > 0 ? `${Math.round((approvedApplicants / totalApplicants) * 100)}%` : 'N/A'} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-tight">Monthly Applications</h2>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                    <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-tight">Jobs by Type</h2>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                                {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Requirement: Faculty Participation Bar Chart */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-tight">Participation by Faculty</h2>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={facultyData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="count" fill="#2563eb" radius={[5, 5, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4 tracking-tight">Recent Postings</h2>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-400 text-left text-[10px] uppercase font-bold tracking-widest">
                                            <th className="pb-3">Title</th>
                                            <th className="pb-3">Organization</th>
                                            <th className="pb-3 text-right">Pay</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.slice(0, 5).map((job) => (
                                            <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-white/20 transition-colors">
                                                <td className="py-4 font-bold text-gray-800">{job.title}</td>
                                                <td className="py-4 text-xs font-semibold text-gray-500">{job.organization_name}</td>
                                                <td className="py-4 text-right font-bold text-gray-900">฿{parseFloat(job.compensation_amount).toLocaleString()}</td>
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