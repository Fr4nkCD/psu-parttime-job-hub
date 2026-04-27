import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-2.jpg';
import Placeholder from '../assets/placeholder-image.jpg';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, getToken, student } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState(false);
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
                    schedule: data.schedules
                        ? data.schedules.map(s => `${s.date}: ${s.start_time} - ${s.end_time}`)
                        : [],
                });

                // Check if already applied
                if (isLoggedIn()) {
                    const appRes = await fetch('http://127.0.0.1:8000/api/applications/', {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    });
                    const apps = await appRes.json();
                    const appsList = Array.isArray(apps) ? apps : (apps.results || []);
                    const alreadyApplied = appsList.some((a) => String(a.job) === String(id));
                    setApplied(alreadyApplied);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching job detail:', error);
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [id]);

    const handleApply = async () => {
        if (!isLoggedIn()) {
            navigate('/signin');
            return;
        }

        setApplying(true);
        setApplyError(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/applications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    job: id, // Only send the job ID
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                // This will now show you the ACTUAL error from Django (e.g., "Already applied")
                throw new Error(JSON.stringify(data) || 'Failed to apply.');
            }

            setApplied(true);
        } catch (err) {
            setApplyError(err.message);
        } finally {
            setApplying(false);
        }
    };

    const getScheduleSummary = () => {
        // Check if job exists AND has schedules
        if (!job || !job.schedules || job.schedules.length === 0) {
            return { dates: 'No dates set', totalHours: '0.0' };
        }

        try {
            // Calculate Total Hours
            const totalHours = job.schedules.reduce((acc, shift) => {
                // Ensure time format is HH:mm:ss for reliable parsing
                const start = new Date(`1970-01-01T${shift.start_time}`);
                const end = new Date(`1970-01-01T${shift.end_time}`);
                const diff = (end - start) / (1000 * 60 * 60);
                return acc + (isNaN(diff) ? 0 : diff);
            }, 0);

            // Determine Date Range
            const validDates = job.schedules
                .map(s => new Date(s.date))
                .filter(d => !isNaN(d.getTime())) // Filter out any invalid dates
                .sort((a, b) => a - b);

            if (validDates.length === 0) return { dates: 'Invalid dates', totalHours: '0.0' };

            const startDate = validDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const endDate = validDates[validDates.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

            const dateDisplay = validDates.length === 1
                ? startDate
                : `${startDate} - ${endDate}`;

            return { dates: dateDisplay, totalHours: totalHours.toFixed(1) };
        } catch (e) {
            console.error("Summary calculation error:", e);
            return { dates: 'Error in dates', totalHours: '0.0' };
        }
    };
    const summary = job ? getScheduleSummary() : { dates: 'Loading...', totalHours: '0.0' };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-white font-medium">
            <p>Loading job details...</p>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
            Job not found.
        </div>
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-0 scale-110 blur-[6px]"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 bg-black/30 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="text-white mb-6 flex items-center gap-2 hover:translate-x-[-4px] transition-transform font-medium"
                    >
                        ← Back to Jobs
                    </button>

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 flex flex-col lg:flex-row gap-8">

                        {/* Left — Job Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${job.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {job.isOpen ? '🟢 Open' : '⚫ Closed'}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6">{job.title}</h1>

                            <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-6 grid grid-cols-2 gap-y-4 gap-x-8">
                                {/* Pay */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💵</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pay</span>
                                        <span className="font-bold text-gray-700">฿{job.compensation_amount}</span>
                                    </div>
                                </div>

                                {/* Dynamic Dates */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🗓️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dates</span>
                                        <span className="font-bold text-gray-700">{summary.dates}</span>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📍</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                        <span className="font-bold text-gray-700">{job.location_type}</span>
                                    </div>
                                </div>

                                {/* Dynamic Total Hours */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⏱️</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Time</span>
                                        <span className="font-bold text-gray-700">{summary.totalHours} Hours</span>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-gray-800 mb-3">Job Description</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">{job.description}</p>

                            {/* Work Schedule Section */}
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    📅 Work Schedule
                                </h3>
                                <div className="grid gap-3">
                                    {job.schedules && job.schedules.length > 0 ? (
                                        job.schedules.map((shift, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-4 flex justify-between items-center"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-psu-blue uppercase tracking-widest">Date</span>
                                                    <span className="font-bold text-gray-700">
                                                        {new Date(shift.date).toLocaleDateString('en-GB', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex gap-8">
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start</span>
                                                        <span className="font-mono font-bold text-gray-600">{shift.start_time.slice(0, 5)}</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End</span>
                                                        <span className="font-mono font-bold text-gray-600">{shift.end_time.slice(0, 5)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic text-sm ml-1">No specific shifts listed. See description for details.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6">
                            <div className="bg-white/80 rounded-xl p-3 shadow-inner">
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 border border-gray-100">
                                    <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-2 pb-2">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Posted By</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">{job.organization_name}</p>

                                    {applyError && (
                                        <p className="text-xs text-red-500 mb-2 text-center">{applyError}</p>
                                    )}

                                    {job.isOpen ? (
                                        <button
                                            onClick={handleApply}
                                            disabled={applied || applying}
                                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${applied
                                                ? 'bg-green-500 cursor-default'
                                                : applying
                                                    ? 'bg-gray-400 cursor-wait'
                                                    : 'bg-psu-blue hover:bg-blue-900'
                                                }`}
                                        >
                                            {applied
                                                ? '✓ Application Submitted'
                                                : applying
                                                    ? 'Submitting...'
                                                    : isLoggedIn()
                                                        ? 'Apply Now'
                                                        : 'Sign In to Apply'}
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-4 rounded-xl font-bold text-white bg-gray-400 cursor-not-allowed"
                                        >
                                            Application Closed
                                        </button>
                                    )}
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