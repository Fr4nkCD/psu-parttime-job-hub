import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

const personnel = [
    {
        role: 'Project Advisor',
        name: 'Asst. Prof. Dr. Kittasil Silanon',
        department: 'College of Computing',
        university: 'Prince of Songkla University, Phuket Campus',
        icon: '👨‍🏫',
    },
    {
        role: 'Co-Advisor',
        name: 'Assoc. Prof. Dr. Warodom Werapun',
        department: 'College of Computing',
        university: 'Prince of Songkla University, Phuket Campus',
        icon: '👨‍🏫',
    },
    {
        role: 'Co-Advisor',
        name: 'Dr. Thammarsat Visutarrom',
        department: 'College of Computing',
        university: 'Prince of Songkla University, Phuket Campus',
        icon: '👨‍🏫',
    },
    {
        role: 'Developer',
        name: 'Panichapon Chatdaeng',
        department: 'Digital Engineering (International Program)',
        university: 'College of Computing, PSU Phuket',
        studentId: '6630613009',
        icon: '👨‍💻',
    },
];

function Personnel() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-psu-blue">
            {/* 1. Static Background Layer - Matching Home.js/AboutUs.js style */}
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

                    {/* Page Header Card: 2xl corners and bold weight */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/40"
                    >
                        <h1 className="text-3xl font-bold text-psu-blue mb-1 tracking-tight uppercase">
                            Project Personnel
                        </h1>
                        <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase opacity-80">
                            The academic advisors and development team
                        </p>
                    </motion.div>

                    {/* Personnel List: Refined card contrast and spacing */}
                    <div className="flex flex-col gap-4">
                        {personnel.map((person, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex items-center gap-6 border border-white/30 group hover:bg-white/80 transition-all"
                            >
                                {/* Avatar: Refined sizing and psu-blue branding */}
                                <div className="w-20 h-20 rounded-2xl bg-psu-blue flex items-center justify-center text-4xl flex-shrink-0 shadow-lg border-2 border-white/20 transition-transform group-hover:scale-105">
                                    {person.icon}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-psu-blue tracking-[0.2em] uppercase mb-1.5 opacity-90">
                                        {person.role}
                                    </p>
                                    <h3 className="font-bold text-slate-900 text-xl tracking-tight mb-1">
                                        {person.name}
                                    </h3>
                                    <div className="space-y-0.5">
                                        <p className="text-sm text-slate-600 font-semibold italic opacity-90">
                                            {person.department}
                                        </p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide opacity-70">
                                            {person.university}
                                        </p>
                                        {person.studentId && (
                                            <p className="text-[10px] font-black text-psu-blue mt-2 inline-block px-2 py-0.5 bg-psu-blue/5 rounded-md border border-psu-blue/10">
                                                STUDENT ID: {person.studentId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default Personnel;