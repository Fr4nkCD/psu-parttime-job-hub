import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageTransition from '../components/PageTransition';
import JobCard from '../components/JobCard';
import bgImage from '../assets/home-bg-1.jpg';
import Placeholder from '../assets/placeholder-image.jpg'

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/jobs/');
                const data = await response.json();

                const formattedJobs = data.map(job => {
                    let displayDate = `${job.academic_term}/${job.academic_year}`;

                    if (job.schedules && job.schedules.length > 0) {
                        const sorted = job.schedules
                            .map(s => new Date(s.date))
                            .filter(d => !isNaN(d.getTime()))
                            .sort((a, b) => a - b);

                        if (sorted.length > 0) {
                            const start = sorted[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                            const end = sorted[sorted.length - 1].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            displayDate = sorted.length === 1 ? `${start} ${sorted[0].getFullYear()}` : `${start} - ${end}`;
                        }
                    }

                    return {
                        ...job,
                        pay: job.compensation_amount,
                        location: job.location_type,
                        image: job.poster_image_url || Placeholder,
                        isOpen: job.status === 'OPEN',
                        type: job.job_type.toLowerCase(),
                        date: displayDate,
                        applicants: job.applicants_count || 0,
                        postedBy: job.organization_name
                    };
                });

                setJobs(formattedJobs);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching jobs: ", error);
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) => {
        const isPublic = job.status === 'OPEN' || job.status === 'CLOSED';

        const matchesType = filter === 'all' || job.type === filter;
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());

        return isPublic && matchesType && matchesSearch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-0 blur-lg scale-105"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 bg-black/30 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm p-6 md:p-8"
                    >
                        <motion.h2 variants={itemVariants} className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                            Search Jobs
                        </motion.h2>

                        <motion.input
                            variants={itemVariants}
                            type="text"
                            placeholder="Search job title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent mb-6 bg-white/50"
                        />

                        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
                            {['all', 'internal', 'external'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${filter === type
                                        ? 'bg-psu-blue text-white shadow-lg scale-105'
                                        : 'bg-white/80 text-gray-600 hover:bg-white/60'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </motion.div>

                        <AnimatePresence mode="popLayout">
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <motion.div
                                            layout
                                            key={job.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        >
                                            <JobCard job={job} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="col-span-full text-center text-gray-400 py-20 bg-white/20 rounded-xl"
                                    >
                                        No results found for your search.
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </PageTransition>
        </div>
    );
}

export default Jobs;