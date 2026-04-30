import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function AboutUs() {
    const objectives = [
        {
            icon: '🏛️',
            title: 'Centralization',
            desc: 'A single web-based hub for all PSU Phuket student employment and social activities.',
        },
        {
            icon: '⭐',
            title: 'Performance Tracking',
            desc: 'A digital 5-star evaluation system to build student professional profiles.',
        },
        {
            icon: '⚡',
            title: 'Automation',
            desc: 'Automated generation of work reports and PDF certificates to reduce manual paperwork.',
        },
    ];

    const benefits = [
        'Find part-time jobs and social activities in one convenient platform',
        'Track your application status in real-time',
        'Build a digital work history and professional profile',
        'Download work certificates automatically after job completion',
        'Receive performance evaluations to improve professional skills',
        'Gain real-world experience alongside your studies',
    ];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-psu-blue">
            {/* Static Background Layer */}
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

            {/* Fixed Overlay */}
            <div className="fixed inset-0 bg-black/40 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-28 pb-16 px-4 max-w-5xl mx-auto flex flex-col gap-6 font-sans">

                    {/* Header Section: Reduced curve to rounded-2xl, Weight to font-bold */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/40"
                    >
                        <h1 className="text-3xl font-bold text-psu-blue mb-1 tracking-tight">
                            PSU Part-time Job Hub
                        </h1>
                        <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase">
                            Prince of Songkla University, Phuket Campus
                        </p>
                    </motion.div>

                    {/* Main Content: Sharper corners and clearer text colors */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-white/30 space-y-10">
                        
                        {/* About Segment */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-psu-blue">●</span> What is PSU Part-time Job Hub?
                            </h2>
                            <div className="space-y-4 text-slate-700 leading-relaxed font-medium text-sm">
                                <p>
                                    PSU Part-time Job Hub is a centralized web platform designed to streamline
                                    part-time employment and social activity opportunities for all students at
                                    Prince of Songkla University, Phuket Campus.
                                </p>
                                <p>
                                    Previously, job opportunities were scattered across LINE groups and physical
                                    notice boards, causing students to miss opportunities and creating significant
                                    administrative burden for the Student Development and Alumni Relations office.
                                </p>
                            </div>
                        </section>

                        {/* Objectives Segment: Integrated Cards */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Objectives</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {objectives.map((item) => (
                                    <div key={item.title} className="bg-white/40 rounded-xl p-6 text-center border border-white/50 transition-all hover:bg-white/60">
                                        <div className="text-4xl mb-4 filter drop-shadow-sm">{item.icon}</div>
                                        <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">{item.title}</h3>
                                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits Segment */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Benefits for Students</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                                {benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700 font-semibold list-none group">
                                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                        <span className="text-sm leading-relaxed">{benefit}</span>
                                    </li>
                                ))}
                            </div>
                        </section>

                        {/* Contact Segment: Grid for cleaner vertical alignment */}
                        <section className="pt-6 border-t border-slate-200/50">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-500 tracking-wide uppercase">
                                <div className="space-y-3">
                                    <p className="flex items-center gap-3">📍 <span>SD & Alumni Relations Office</span></p>
                                    <p className="flex items-center gap-3">🏫 <span>PSU Phuket Campus</span></p>
                                </div>
                                <div className="space-y-3">
                                    <p className="flex items-center gap-3">📞 <span>076-276-000</span></p>
                                    <p className="flex items-center gap-3 lowercase">
                                        🌐 <a href="https://phuket.psu.ac.th" target="_blank" rel="noreferrer" className="text-psu-blue hover:text-blue-800 underline decoration-psu-blue/30 transition-all font-bold uppercase tracking-wider">phuket.psu.ac.th</a>
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default AboutUs;