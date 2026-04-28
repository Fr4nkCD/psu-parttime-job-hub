import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function HallOfFame() {
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
                        <h1 className="text-3xl font-bold text-psu-blue mb-2">Hall of Fame</h1>
                        <p className="text-gray-500 text-sm">
                            Recognizing our top-performing student workers
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-16 flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h2>
                        <p className="text-gray-500 text-sm max-w-md">
                            The Hall of Fame will showcase our highest-rated student workers
                            based on performance evaluations. Check back after the first
                            semester of evaluations is complete.
                        </p>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default HallOfFame;