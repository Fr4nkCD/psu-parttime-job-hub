import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-2.jpg';
import Placeholder from '../assets/placeholder-image.jpg';
import lineIcon from '../assets/LINE_logo.svg'; 

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, getToken, isStudent, isAdmin } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState(null);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/jobs/${id}/`);
                const data = await response.json();

                setJob({
                    ...data,
                    pay: data.compensation_amount,
                    location: data.location_type,
                    image: data.poster_image_url || Placeholder,
                    isOpen: data.status === 'OPEN',
                    line_group_url: data.line_group_url,
                    required_amount: data.required_amount,
                    applicants: data.applicants_count || 0,
                });

                if (isLoggedIn()) {
                    const appRes = await fetch('http://127.0.0.1:8000/api/applications/', {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    });
                    const apps = await appRes.json();
                    const appsList = Array.isArray(apps) ? apps : (apps.results || []);
                    const myApp = appsList.find((a) => String(a.job) === String(id));
                    if (myApp) {
                        setApplied(true);
                        setApplicationStatus(myApp.status);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching job detail:', error);
                setLoading(false);
            }
        };
        fetchJobDetail();
    }, [id, isLoggedIn, getToken]);

    const canSeePrivateDetails = isAdmin() || applicationStatus === 'APPROVED';

    const handleApply = async () => {
        if (!isLoggedIn()) { navigate('/signin'); return; }
        setApplying(true);
        setApplyError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/applications/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ job: id }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(JSON.stringify(data) || 'Failed to apply.');
            }
            setApplied(true);
            setApplicationStatus('PENDING');
            setJob(prev => ({ ...prev, applicants: prev.applicants + 1 }));
        } catch (err) { setApplyError(err.message); } finally { setApplying(false); }
    };

    const getScheduleSummary = () => {
        if (!job || !job.schedules || job.schedules.length === 0) {
            return { dates: 'No dates set', totalHours: '0.0' };
        }
        try {
            const totalHours = job.schedules.reduce((acc, shift) => {
                const start = new Date(`1970-01-01T${shift.start_time}`);
                const end = new Date(`1970-01-01T${shift.end_time}`);
                const diff = (end - start) / (1000 * 60 * 60);
                return acc + (isNaN(diff) ? 0 : diff);
            }, 0);

            const validDates = job.schedules
                .map(s => new Date(s.date))
                .filter(d => !isNaN(d.getTime()))
                .sort((a, b) => a - b);

            if (validDates.length === 0) return { dates: 'Invalid dates', totalHours: '0.0' };

            const startDate = validDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const endDate = validDates[validDates.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

            const dateDisplay = validDates.length === 1 ? startDate : `${startDate} - ${endDate}`;
            return { dates: dateDisplay, totalHours: totalHours.toFixed(1) };
        } catch (e) {
            return { dates: 'Error in dates', totalHours: '0.0' };
        }
    };

    const summary = job ? getScheduleSummary() : { dates: 'Loading...', totalHours: '0.0' };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-medium"><p>Loading job details...</p></div>;
    if (!job) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Job not found.</div>;

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-0 scale-110 blur-[6px]"
                style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="fixed inset-0 bg-black/30 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/jobs')} className="text-white mb-6 flex items-center gap-2 hover:translate-x-[-4px] transition-transform font-medium">
                        ← Back to Jobs
                    </button>

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                        {/* Left — Job Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${job.isOpen ? 'bg-[#06C755] text-white shadow-sm' : 'bg-gray-400 text-white'}`}>
                                    {job.isOpen ? '● Open' : '● Closed'}
                                </span>
                                {applied && (
                                    <span className="text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-psu-blue text-white shadow-sm">
                                        Status: {applicationStatus}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6">{job.title}</h1>

                            {/* Info Grid: Restored refreshing light style */}
                            <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-6 grid grid-cols-2 gap-y-6 gap-x-8 mb-8 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💵</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pay</span>
                                        <span className="font-bold text-gray-700">฿{job.pay}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🗓️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dates</span>
                                        <span className="font-bold text-gray-700">{summary.dates}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📍</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                        <span className="font-bold text-gray-700">{job.location}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⏱️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Time</span>
                                        <span className="font-bold text-gray-700">{summary.totalHours} Hours</span>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">📝 Job Description</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">{job.description}</p>

                            {/* Detailed Work Schedule Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📅 Work Schedule</h3>
                                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-2 max-w-sm">
                                    {job.schedules?.map((shift, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 rounded-xl">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-psu-blue uppercase tracking-widest">Date</span>
                                                <span className="font-bold text-gray-700 text-md">
                                                    {new Date(shift.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Shift</span>
                                                <span className="font-bold text-gray-600 text-md">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* LINE Group for Approved Students */}
                            {canSeePrivateDetails && job.line_group_url && (
                                <div className="mt-8 p-4 bg-[#06C755]/10 border border-[#06C755]/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-4">
                                        <img src={lineIcon} alt="LINE" className="w-10 h-10 object-contain" />
                                        <div>
                                            <p className="text-[9px] font-black text-[#06C755] uppercase tracking-widest">Official Group Chat</p>
                                            <p className="text-sm font-bold text-green-800">Coordinate with the team</p>
                                        </div>
                                    </div>
                                    <a href={job.line_group_url} target="_blank" rel="noreferrer" className="bg-[#06C755] hover:bg-[#05b34c] text-white px-5 py-2 rounded-xl font-bold text-[10px] transition-all shadow-md">
                                        JOIN GROUP
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar — Clean and compact */}
                        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6">
                            <div className="bg-white/80 rounded-2xl p-4 shadow-lg border border-white/60">
                                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 border border-gray-100">
                                    <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Posted By</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-6">{job.organization_name}</p>

                                    <div className="mb-3 flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">Capacity</span>
                                        <span className="text-[10px] font-bold text-gray-600">/ {job.required_amount} Applicants</span>
                                    </div>

                                    {isStudent() ? (
                                        job.isOpen ? (
                                            <button onClick={handleApply} disabled={applied || applying}
                                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 text-xs uppercase tracking-widest ${applied ? 'bg-[#06C755] cursor-default' : applying ? 'bg-gray-400' : 'bg-psu-blue hover:bg-blue-900'}`}>
                                                {applied ? '✓ Submitted' : applying ? 'Syncing...' : 'Apply Now'}
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-4 rounded-xl font-bold text-white bg-gray-400 cursor-not-allowed text-xs uppercase tracking-widest">Closed</button>
                                        )
                                    ) : isAdmin() && (
                                        <button onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 bg-psu-blue hover:bg-blue-900 text-xs uppercase tracking-widest">
                                            Edit Post
                                        </button>
                                    )}
                                    {applyError && <p className="text-[10px] text-red-500 mt-4 text-center font-bold">{applyError}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </div>
    );
}

export default JobDetail;