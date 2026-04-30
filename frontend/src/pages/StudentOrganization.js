import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function StudentOrganization() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-psu-blue">
            {/* 1. Static Background Layer - Matching Informational Style */}
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

            {/* 2. Fixed Dark Overlay */}
            <div className="fixed inset-0 bg-black/40 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-28 pb-16 px-4 max-w-4xl mx-auto flex flex-col gap-6 font-sans">

                    {/* Page Header: Reduced curve and font weight for clarity */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/40"
                    >
                        <h1 className="text-3xl font-bold text-psu-blue mb-1 tracking-tight uppercase">
                            Student Organization
                        </h1>
                        <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase opacity-80">
                            Student Development and Alumni Relations Office
                        </p>
                    </motion.div>

                    {/* Content Section 1: About the Office */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-white/30">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="text-psu-blue">●</span> About the Office
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed font-medium text-sm">
                            <p>
                                The Student Development and Alumni Relations Office at PSU Phuket Campus
                                is responsible for supporting student activities, part-time employment,
                                extracurricular development, and alumni engagement.
                            </p>
                            <p>
                                The office manages the PSU Activity Transcript system, coordinates
                                part-time job placements for students, issues work certificates,
                                and organizes activities that contribute to student development
                                both academically and professionally.
                            </p>
                        </div>
                    </div>

                    {/* Content Section 2: Transcript System */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-white/30">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">PSU Activity Transcript</h2>
                        <p className="text-slate-700 leading-relaxed font-medium text-sm mb-8">
                            The PSU Activity Transcript system records student participation in
                            extracurricular activities throughout their studies. Students are required
                            to accumulate a minimum of 100 activity hours, consisting of at least
                            50 hours of student development activities and 50 hours of elective activities.
                        </p>
                        
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href="https://student.psu.ac.th/transcript/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-psu-accent hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
                        >
                            Visit PSU Transcript System 
                            <span className="text-lg">→</span>
                        </motion.a>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default StudentOrganization;