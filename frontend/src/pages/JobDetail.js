import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-2.jpg';
import Placeholder from '../assets/placeholder-image.jpg';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // 1. ADD THESE STATES: This fixes the "is not defined" errors
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/jobs/${id}/`);
                const data = await response.json();

                // 2. MAPPING: Converts backend names to your frontend names
                setJob({
                    ...data,
                    pay: data.compensation_amount,
                    location: data.location_type,
                    image: data.poster_image_url || Placeholder,
                    isOpen: data.status === 'OPEN',
                    // Map 'schedules' from backend to 'schedule' for your list below
                    schedule: data.schedules ? data.schedules.map(s => `${s.date}: ${s.start_time}-${s.end_time}`) : []
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching job detail:", error);
                setLoading(false);
            }
        };
        fetchJobDetail();
    }, [id]);

    // 3. Handle Loading State
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-white font-medium">
            <p>Loading job details...</p>
        </div>
    );

    // 4. Handle "Not Found" State
    if (!job) return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
            Job not found.
        </div>
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Layers */}
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
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${
                                    job.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {job.isOpen ? '🟢 Open' : '⚫ Closed'}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6">{job.title}</h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/50 border border-white/40 rounded-xl p-5 mb-8 text-sm text-gray-700">
                                <p className="flex items-center gap-2 font-medium">💵 Pay: <span className="text-gray-900">฿{job.pay}</span></p>
                                <p className="flex items-center gap-2 font-medium">📅 Date: <span className="text-gray-900">{job.date_info || job.date}</span></p>
                                <p className="flex items-center gap-2 font-medium">📍 Location: <span className="text-gray-900">{job.location}</span></p>
                                <p className="flex items-center gap-2 font-medium">🕛 Hours: <span className="text-gray-900">{job.hours || 'See Schedule'}</span></p>
                            </div>

                            <h2 className="text-lg font-bold text-gray-800 mb-3">Job Description</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">{job.description}</p>

                            <h2 className="text-lg font-bold text-gray-800 mb-3">Work Schedule</h2>
                            <ul className="space-y-2 mb-8">
                                {job.schedule && job.schedule.map((s, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                                        <span className="text-psu-accent">•</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Sidebar: Application */}
                        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-6">
                            <div className="bg-white/80 rounded-xl p-3 shadow-inner">
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 border border-gray-100">
                                    <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-2 pb-2">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Posted By</p>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">{job.organization_name}</p>

                                    {job.isOpen ? (
                                        <button
                                            onClick={() => setApplied(!applied)}
                                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                                                applied ? 'bg-gray-400' : 'bg-[#002B5B] hover:bg-[#004C91]'
                                            }`}
                                        >
                                            {applied ? '✓ Application Submitted' : 'Apply Now'}
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-xl font-bold text-white bg-gray-400 cursor-not-allowed">Application Closed</button>
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