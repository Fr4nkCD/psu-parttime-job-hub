import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiRequest from '../../utils/api';

const PSU_BLUE = '#1a3a6b';
const LIGHT_BLUE = '#3b82f6';
const PIE_COLORS = [PSU_BLUE, LIGHT_BLUE];

function NoDataPlaceholder({ message = "No Data Available" }) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[180px] animate-in fade-in duration-700">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-[10px] font-bold text-slate uppercase tracking-[0.2em]">{message}</p>
            <p className="text-[9px] text-slate mt-1 font-semibold">Try adjusting your filters</p>
        </div>
    );
}

function StatCard({ icon, label, value, sub }) {
    return (
        <div className="bg-white/60 rounded-xl p-5 flex items-center gap-4 border border-white/40 shadow-sm">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-tight tracking-tight">{value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
                {sub && <p className="text-[9px] text-psu-blue mt-0.5 font-semibold">{sub}</p>}
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [yearFilter, setYearFilter] = useState('all');
    const [termFilter, setTermFilter] = useState('all');
    // FIXED: Renamed to jobTypeFilter to match JSX
    const [jobTypeFilter, setJobTypeFilter] = useState('all');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                apiRequest('/jobs/'),
                apiRequest('/applications/'),
            ]);
            const jobsData = await jobsRes.json();
            const appsData = await appsRes.json();
            
            setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
            setApplications(Array.isArray(appsData) ? appsData : appsData.results || []);
            setLoading(false);
        } catch (error) { 
            console.error('Fetch Error:', error); 
            setLoading(false); 
        }
    };

    const enrichedApps = applications.map(app => ({
        ...app,
        jobDetails: jobs.find(j => j.id === app.job)
    }));

    const filteredJobs = jobs.filter(j => 
        (yearFilter === 'all' || String(j.academic_year) === yearFilter) &&
        (termFilter === 'all' || String(j.academic_term) === termFilter) &&
        (jobTypeFilter === 'all' || j.job_type === jobTypeFilter.toUpperCase())
    );

    const filteredApps = enrichedApps.filter(a => 
        a.jobDetails &&
        (yearFilter === 'all' || String(a.jobDetails.academic_year) === yearFilter) &&
        (termFilter === 'all' || String(a.jobDetails.academic_term) === termFilter) &&
        (jobTypeFilter === 'all' || a.jobDetails.job_type === jobTypeFilter.toUpperCase())
    );

    const totalPay = filteredJobs.reduce((sum, j) => sum + parseFloat(j.compensation_amount || 0), 0);
    const approvedCount = filteredApps.filter(a => a.status === 'APPROVED').length;

    const facultyData = [
        { name: 'FHT', count: filteredApps.filter(a => a.faculty?.includes('Tourism')).length },
        { name: 'FIS', count: filteredApps.filter(a => a.faculty?.includes('International')).length },
        { name: 'FTE', count: filteredApps.filter(a => a.faculty?.includes('Environment')).length },
        { name: 'CoC', count: filteredApps.filter(a => a.faculty?.includes('Computing')).length },
    ].filter(f => f.count > 0);

    const pieData = [
        { name: 'Internal', value: filteredJobs.filter(j => j.job_type === 'INTERNAL').length },
        { name: 'External', value: filteredJobs.filter(j => j.job_type === 'EXTERNAL').length },
    ].filter(p => p.value > 0);

    const uniqueYears = [...new Set(jobs.map((j) => String(j.academic_year)))].sort((a, b) => b - a);

    const handleExportSummaryPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setTextColor(PSU_BLUE);
        doc.text("PRINCE OF SONGKLA UNIVERSITY", 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text("PART-TIME JOB HUB ACTIVITY REPORT", 105, 22, { align: 'center' });
        doc.line(14, 30, 196, 30);

        const tableOptions = {
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: '#06C755', textColor: '#FFFFFF', fontStyle: 'bold' },
            alternateRowStyles: { fillColor: '#f8fafc' }
        };

        const internalRows = filteredJobs.filter(j => j.job_type === 'INTERNAL').map(j => [j.created_at?.split('T')[0], j.title, j.organization_name]);
        const externalRows = filteredJobs.filter(j => j.job_type === 'EXTERNAL').map(j => [j.created_at?.split('T')[0], j.title, j.organization_name]);

        doc.setTextColor(0);
        doc.text("ON-CAMPUS (INTERNAL) LISTINGS", 14, 40);
        autoTable(doc, { ...tableOptions, startY: 44, head: [['DATE', 'JOB TITLE', 'ORGANIZATION']], body: internalRows });

        doc.text("OFF-CAMPUS (EXTERNAL) LISTINGS", 14, doc.lastAutoTable.finalY + 15);
        autoTable(doc, { ...tableOptions, startY: doc.lastAutoTable.finalY + 19, head: [['DATE', 'JOB TITLE', 'EMPLOYER']], body: externalRows });

        doc.save(`PSU_Job_Report.pdf`);
    };

    return (
        <div className="relative min-h-screen pb-10">
            <div className="relative z-20 max-w-6xl mx-auto px-4 font-sans text-slate-700">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pt-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">DASHBOARD</h1>
                    
                    <div className="flex flex-wrap items-center gap-2 bg-white/40 p-2 rounded-2xl backdrop-blur-md border border-white/20">
                        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none shadow-sm">
                            <option value="all">All Years</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none shadow-sm">
                            <option value="all">All Semesters</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                        </select>
                        {/* FIXED: Reference jobTypeFilter and setJobTypeFilter here */}
                        <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none shadow-sm">
                            <option value="all">All Types</option>
                            <option value="internal">Internal</option>
                            <option value="external">External</option>
                        </select>
                        <button onClick={handleExportSummaryPDF} className="bg-psu-blue hover:bg-blue-900 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-2">
                            <span>📄</span> EXPORT REPORT
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-white text-center py-20 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                ) : (
                    <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-2xl space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon="📋" label="Jobs Cataloged" value={filteredJobs.length} />
                            <StatCard icon="👤" label="Active Applicants" value={filteredApps.length} sub={`${approvedCount} approved`} />
                            <StatCard icon="💵" label="Total Disbursements" value={`฿${totalPay.toLocaleString()}`} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white/40 rounded-2xl p-6 border border-white/60 shadow-sm min-h-[350px]">
                                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Participation by Faculty</h2>
                                {facultyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={facultyData}>
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#475569' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.2)'}} />
                                            <Bar dataKey="count" fill={PSU_BLUE} radius={[6, 6, 0, 0]} barSize={45} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <NoDataPlaceholder message="No Faculty Data" />}
                            </div>

                            <div className="bg-white/40 rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col min-h-[350px]">
                                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Market Distribution (Type)</h2>
                                {pieData.length > 0 ? (
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} dataKey="value" paddingAngle={8}>
                                                    {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} stroke="none" />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <NoDataPlaceholder message="No Distribution Data" />}
                            </div>
                        </div>

                        <div className="pt-4">
                            <h2 className="text-[10px] font-bold text-slate uppercase tracking-[0.2em] mb-6">Recent Work Listings</h2>
                            <div className="overflow-x-auto min-h-[200px]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate text-left text-[10px] uppercase font-bold tracking-widest">
                                            <th className="pb-4 px-2">Job Assignment</th>
                                            <th className="pb-4 px-2">Entity</th>
                                            <th className="pb-4 px-2 text-right">Compensation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredJobs.length > 0 ? (
                                            filteredJobs.slice(0, 8).map((job) => (
                                                <tr key={job.id} className="group hover:bg-white/30 transition-colors">
                                                    <td className="py-5 px-2 font-bold text-slate-700">{job.title}</td>
                                                    <td className="py-5 px-2 text-[11px] font-bold text-slate-500 uppercase">{job.organization_name}</td>
                                                    <td className="py-5 px-2 text-right font-bold text-psu-blue tracking-tight text-base">฿{parseFloat(job.compensation_amount).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-10 text-center text-slate italic text-xs tracking-wider">
                                                    No listings found matching current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;