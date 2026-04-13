import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/home-bg-1.jpg';
import dummyJobs from '../components/dummyJobs';

const dummyStudent = {
    studentId: '6630613009',
    firstName: 'Panichapon',
    lastName: 'Chatdaeng',
    faculty: 'College of Computing',
    major: 'College of Computing',
    program: 'Digital Engineering (International Program)',
    phone: '0927941474',
    email: 's6630613009@phuket.psu.ac.th',
    religion: 'Buddhism',
    food: 'Normal',
    allergies: '-',
    profileImage: null,
    currentJobId: 1,
};

const dummyWorkHistory = [
    {
        id: 1,
        title: 'Student Helper for EDC Thailand 2026 Concert',
        pay: '800/day',
        date: 'Jan 15-18, 2026',
        location: 'Rhythm Park, Cherngtalay, Phuket',
        status: 'Completed',
        image: 'https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/sites/124/2024/07/17180013/edth_2024_mk_an_fest_site_dh_1200x630_r01.jpg',
    },
    {
        id: 2,
        title: 'English and Chinese Language Experience Activity',
        pay: '300/day',
        date: 'Dec 13, 27, 2025',
        location: 'PSU Phuket',
        status: 'Completed',
        image: null,
    },
];

function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [student, setStudent] = useState(dummyStudent);
    const [formData, setFormData] = useState(dummyStudent);

    const currentJob = dummyJobs.find((j) => j.id === student.currentJobId);

    const handleSave = () => {
        setStudent(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(student);
        setIsEditing(false);
    };

    return (
        <div className="relative min-h-screen pt-24 pb-16 px-8 overflow-hidden">

            {/* Blurred Background */}
            <div
                className="absolute inset-0 scale-110"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(6px)',
                }}
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-6">

                {/* Profile Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-8">
                    <div className="flex gap-8 items-start">

                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="w-36 h-36 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                                {student.profileImage ? (
                                    <img src={student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-24 h-24 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium mb-3">Profile</p>
                                <div className="space-y-2">
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-28">Student ID</span>
                                        <span className="font-semibold text-gray-800">{student.studentId}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-28">Name</span>
                                        <span className="text-gray-800">{student.firstName} {student.lastName}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-28">Faculty</span>
                                        <span className="text-gray-800">{student.faculty}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-28">Major</span>
                                        <span className="text-gray-800">{student.major}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-gray-500 w-28">Program</span>
                                        <span className="text-gray-800">{student.program}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500 font-medium mb-3">Personal Info</p>
                                <div className="space-y-2">
                                    {isEditing ? (
                                        <>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 w-24">📞 Phone</span>
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 w-24">✉️ Email</span>
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 w-24">🛐 Religion</span>
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                                    value={formData.religion}
                                                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 w-24">🍴 Food</span>
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                                    value={formData.food}
                                                    onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <span className="text-gray-500 w-24">🛡 Allergies</span>
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                                    value={formData.allergies}
                                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="bg-psu-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex gap-4">
                                                <span className="text-gray-500 w-24">📞 Phone</span>
                                                <span className="text-gray-800">{student.phone}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-gray-500 w-24">✉️ Email</span>
                                                <span className="text-gray-800">{student.email}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-gray-500 w-24">🛐 Religion</span>
                                                <span className="text-gray-800">{student.religion}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-gray-500 w-24">🍴 Food</span>
                                                <span className="text-gray-800">{student.food}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-gray-500 w-24">🛡 Allergies</span>
                                                <span className="text-gray-800">{student.allergies}</span>
                                            </div>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="mt-3 bg-psu-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                            >
                                                Update
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Current Job Card */}
                {currentJob && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Job</h2>
                        <div className="flex gap-6 items-center">
                            {/* Job Image */}
                            <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                {currentJob.image ? (
                                    <img src={currentJob.image} alt={currentJob.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Job Info */}
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-800 mb-2">{currentJob.title}</h3>
                                <div className="flex gap-2 mb-3">
                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                                        In Progress
                                    </span>
                                    <span className="bg-psu-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        Top up Staff
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                                    <p>💵 ฿{currentJob.pay}</p>
                                    <p>📍 {currentJob.location}</p>
                                    <p>📅 {currentJob.date}</p>
                                </div>
                            </div>

                            {/* View Details Button */}
                            <button
                                onClick={() => navigate(`/jobs/${currentJob.id}`)}
                                className="bg-psu-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition self-end"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Work History */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Work History</h2>
                    {dummyWorkHistory.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {dummyWorkHistory.map((work) => (
                                <div key={work.id} className="flex gap-4 items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    {/* Image */}
                                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                        {work.image ? (
                                            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{work.title}</p>
                                        <p className="text-xs text-gray-500">📅 {work.date} · 📍 {work.location}</p>
                                        <p className="text-xs text-gray-500">💵 ฿{work.pay}</p>
                                    </div>
                                    {/* Status */}
                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                        {work.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No work history yet.</p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Profile;