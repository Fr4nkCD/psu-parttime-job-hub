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
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-3xl mx-auto flex flex-col gap-6">

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-psu-blue mb-2">Personnel</h1>
                        <p className="text-gray-500 text-sm">Project team and advisors</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {personnel.map((person, i) => (
                            <div key={i} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-psu-blue flex items-center justify-center text-3xl flex-shrink-0">
                                    {person.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-psu-accent uppercase tracking-widest mb-1">
                                        {person.role}
                                    </p>
                                    <h3 className="font-bold text-gray-800 text-lg">{person.name}</h3>
                                    <p className="text-sm text-gray-500">{person.department}</p>
                                    <p className="text-sm text-gray-400">{person.university}</p>
                                    {person.studentId && (
                                        <p className="text-xs text-gray-400 mt-1">ID: {person.studentId}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default Personnel;