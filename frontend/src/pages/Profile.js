import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import dummyJobs from '../components/dummyJobs';
import bgImage from '../assets/home-bg-1.jpg';

const dummyStudent = {
    studentId: '6630613009',
    firstName: 'Panichapon',
    lastName: 'Chatdaeng',
    faculty: 'College of Computing',
    major: 'Digital Engineering',
    program: 'International Program',
    phone: '0927941474',
    email: 's6630613009@phuket.psu.ac.th',
    religion: 'Buddhism',
    food: 'Normal',
    allergies: '-',
    currentJobId: 1,
};

function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [student, setStudent] = useState(dummyStudent);
    const [formData, setFormData] = useState(dummyStudent);

    const currentJob = dummyJobs.find((j) => j.id === student.currentJobId);

    const handleSave = () => { setStudent(formData); setIsEditing(false); };
    const handleCancel = () => { setFormData(student); setIsEditing(false); };

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
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-5xl mx-auto flex flex-col gap-6">
                    
                    {/* Core Profile Card */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="w-40 h-40 rounded-full bg-[#002B5B] overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                                <svg className="w-24 h-24 text-white opacity-90" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-psu-accent hover:underline">Edit Info</button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Student ID</span>
                                            <span className="font-bold text-gray-800 tracking-tight">{student.studentId}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Full Name</span>
                                            <span className="text-gray-800">{student.firstName} {student.lastName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-400 uppercase font-bold text-[10px]">Faculty</span>
                                            <span className="text-gray-800">{student.faculty}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isEditing ? (
                                            <div className="space-y-4 pt-2">
                                                <input className="w-full border p-2 rounded text-xs" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone" />
                                                <input className="w-full border p-2 rounded text-xs" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" />
                                                <div className="flex gap-2">
                                                    <button onClick={handleSave} className="bg-[#002B5B] text-white px-4 py-2 rounded text-xs font-bold shadow-md">Save</button>
                                                    <button onClick={handleCancel} className="bg-gray-100 text-gray-500 px-4 py-2 rounded text-xs">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Phone</span>
                                                    <span className="text-gray-800 font-medium">{student.phone}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Email</span>
                                                    <span className="text-gray-800">{student.email}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                                    <span className="text-gray-400 uppercase font-bold text-[10px]">Allergies</span>
                                                    <span className="text-gray-800">{student.allergies}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Employment Card */}
                    {currentJob && (
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border-l-8 border-[#002B5B]">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Current Employment</h2>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-48 h-32 rounded-xl overflow-hidden bg-gray-200 shadow-sm">
                                    <img src={currentJob.image} alt={currentJob.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2">{currentJob.title}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">In Progress</span>
                                        <span className="bg-[#002B5B] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Top-up Staff</span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1 text-xs text-gray-500">
                                        <p>💵 ฿{currentJob.pay}</p>
                                        <p>📍 {currentJob.location}</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/jobs/${currentJob.id}`)} className="bg-white border-2 border-[#002B5B] text-[#002B5B] px-6 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">Details</button>
                            </div>
                        </div>
                    )}
                </div>
            </PageTransition>
        </div>
    );
}

export default Profile;