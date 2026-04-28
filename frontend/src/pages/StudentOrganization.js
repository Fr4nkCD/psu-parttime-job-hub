import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function StudentOrganization() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-0 scale-110 blur-[6px]"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 bg-black/30 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-4xl mx-auto flex flex-col gap-6">

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-psu-blue mb-2">Student Organization</h1>
                        <p className="text-gray-500 text-sm">Student Development and Alumni Relations Office</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">About the Office</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The Student Development and Alumni Relations Office at PSU Phuket Campus
                            is responsible for supporting student activities, part-time employment,
                            extracurricular development, and alumni engagement.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            The office manages the PSU Activity Transcript system, coordinates
                            part-time job placements for students, issues work certificates,
                            and organizes activities that contribute to student development
                            both academically and professionally.
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">PSU Activity Transcript</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The PSU Activity Transcript system records student participation in
                            extracurricular activities throughout their studies. Students are required
                            to accumulate a minimum of 100 activity hours, consisting of at least
                            50 hours of student development activities and 50 hours of elective activities.
                        </p>
                        <a
                            href="https://student.psu.ac.th/transcript/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-psu-accent hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
                        >
                            Visit PSU Transcript System →
                        </a>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default StudentOrganization;