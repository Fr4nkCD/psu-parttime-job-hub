import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';

function AboutUs() {
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

                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-psu-blue mb-2">
                            PSU Part-time Job Hub
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Prince of Songkla University, Phuket Campus
                        </p>
                    </div>

                    {/* What is it */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            What is PSU Part-time Job Hub?
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            PSU Part-time Job Hub is a centralized web platform designed to streamline
                            part-time employment and social activity opportunities for all students at
                            Prince of Songkla University, Phuket Campus.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Previously, job opportunities were scattered across LINE groups and physical
                            notice boards, causing students to miss opportunities and creating significant
                            administrative burden for the Student Development and Alumni Relations office.
                            This platform solves those problems by bringing everything into one place.
                        </p>
                    </div>

                    {/* Objectives */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Objectives</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
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
                            ].map((item) => (
                                <div key={item.title} className="bg-white/60 rounded-xl p-5 text-center">
                                    <div className="text-4xl mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Benefits for Students</h2>
                        <ul className="space-y-3">
                            {[
                                'Find part-time jobs and social activities in one convenient platform',
                                'Track your application status in real-time',
                                'Build a digital work history and professional profile',
                                'Download work certificates automatically after job completion',
                                'Receive performance evaluations to improve professional skills',
                                'Gain real-world experience alongside your studies',
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                                    <span className="text-psu-accent font-bold mt-0.5">✓</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Contact</h2>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>📍 Student Development and Alumni Relations Office</p>
                            <p>🏫 Prince of Songkla University, Phuket Campus</p>
                            <p>📞 076-276-000</p>
                            <p>🌐 <a href="https://phuket.psu.ac.th" target="_blank" rel="noreferrer" className="text-psu-accent hover:underline">phuket.psu.ac.th</a></p>
                        </div>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}

export default AboutUs;