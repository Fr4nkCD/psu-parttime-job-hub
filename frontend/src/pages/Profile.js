import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import bgImage from '../assets/home-bg-1.jpg';
import placeholder from '../assets/placeholder-image.jpg';
import psuEmblem from '../assets/PSU_Emblem.png';
import jsPDF from 'jspdf';

// Enhanced Star Display with larger scaling for better visual impact
function StarDisplay({ value, size = "sm" }) {
    const starClasses = {
        sm: 'text-2xl', // Increased from text-xs for category boxes
        lg: 'text-5xl'
    };
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`${starClasses[size] || 'text-3xl'} ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}>
                    ★
                </span>
            ))}
        </div>
    );
}

function Profile() {
    const navigate = useNavigate();
    const { student, user, getToken } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [activeAssignments, setActiveAssignments] = useState([]);
    const [workHistory, setWorkHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [selectedApp, setSelectedApp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    // Add this helper inside the Profile component
    const handleImageError = (e) => {
        e.target.src = placeholder;
    };

    const fetchProfile = async () => {
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Student Profile
            const res = await fetch(`http://127.0.0.1:8000/api/students/?student_id=${student?.student_id}`, { headers });
            const data = await res.json();
            const profile = Array.isArray(data) ? data[0] : data;
            setProfileData(profile);
            setFormData(profile);

            // 2. Fetch Applications
            const appRes = await fetch('http://127.0.0.1:8000/api/applications/', { headers });
            const apps = await appRes.json();
            const appsList = Array.isArray(apps) ? apps : (apps.results || []);

            // 3. Process Active Assignments (Sort by latest created job)
            const activeList = appsList.filter((a) => (a.status === 'APPROVED' || a.status === 'PENDING') && !a.evaluation);
            const activeJobsData = await Promise.all(activeList.map(async (app) => {
                const jobRes = await fetch(`http://127.0.0.1:8000/api/jobs/${app.job}/`, { headers });
                const jobData = await jobRes.json();
                return { ...jobData, status: app.status, applicationId: app.id };
            }));

            // --- SORTING: Latest Active Assignments First ---
            setActiveAssignments(activeJobsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

            // 4. Process Work History (Sort by latest application/work date)
            const historyList = appsList.filter(a => !!a.evaluation);
            const historyJobsData = await Promise.all(historyList.map(async (app) => {
                const jobRes = await fetch(`http://127.0.0.1:8000/api/jobs/${app.job}/`, { headers });
                const jobData = await jobRes.json();
                return { ...app, job_poster_url: jobData.poster_image_url, created_at: jobData.created_at };
            }));

            // --- SORTING: Most Recent Work History First ---
            setWorkHistory(historyJobsData.sort((a, b) => new Date(b.application_date) - new Date(a.application_date)));

            setLoading(false);
        } catch (err) {
            console.error('Error fetching professional profile:', err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const token = getToken();
            const res = await fetch(`http://127.0.0.1:8000/api/students/${profileData.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ religion: formData.religion, allergies: formData.allergies }),
            });
            if (!res.ok) throw new Error('Failed to save.');
            const updated = await res.json();
            setProfileData(updated);
            setIsEditing(false);
        } catch (err) { setError('Failed to save changes.'); } finally { setSaving(false); }
    };

    const avgRating = (evaluation) => {
        if (!evaluation) return null;
        const total = evaluation.punctuality_rating + evaluation.responsibility_rating + evaluation.grooming_rating + evaluation.quality_rating;
        return (total / 4).toFixed(1);
    };

    const openEvaluation = (app) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleDownloadCertificate = (app) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const psuBlue = [26, 58, 107];
        const pageWidth = 297;
        const pageHeight = 210;

        const generatePDF = (imgElement = null) => {
            // --- 0. FULL-PAGE COVER WATERMARK (NO STRETCHING) ---
            if (imgElement) {
                try {
                    const imgWidth = imgElement.width;
                    const imgHeight = imgElement.height;
                    const imgRatio = imgWidth / imgHeight;
                    const pageRatio = pageWidth / pageHeight;

                    let renderWidth, renderHeight, xOffset, yOffset;

                    // Calculate "Cover" dimensions to avoid stretching [Point 1]
                    if (imgRatio > pageRatio) {
                        // Image is wider than page
                        renderHeight = pageHeight;
                        renderWidth = pageHeight * imgRatio;
                        xOffset = (pageWidth - renderWidth) / 2;
                        yOffset = 0;
                    } else {
                        // Image is taller than page
                        renderWidth = pageWidth;
                        renderHeight = pageWidth / imgRatio;
                        xOffset = 0;
                        yOffset = (pageHeight - renderHeight) / 2;
                    }

                    doc.saveGraphicsState();
                    // Set to 8% opacity for professional background feel
                    doc.setGState(new doc.GState({ opacity: 0.1 }));

                    // Draw centered and cropped image
                    doc.addImage(imgElement, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
                    doc.restoreGraphicsState();
                } catch (e) {
                    console.warn("Watermark render failed, proceeding with formal layout:", e);
                }
            }

            // --- 1. FORMAL BORDERS ---
            doc.setLineWidth(1.5);
            doc.setDrawColor(psuBlue[0], psuBlue[1], psuBlue[2]);
            doc.rect(10, 10, 277, 190);
            doc.setLineWidth(0.2);
            doc.rect(12, 12, 273, 186);

            // --- 2. UNIVERSITY EMBLEM ---
            if (typeof psuEmblem !== 'undefined') {
                doc.addImage(psuEmblem, 'PNG', 139.56, 18, 17.88, 24);
            }

            // --- 3. HEADER TEXT ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
            doc.text("PRINCE OF SONGKLA UNIVERSITY", 148.5, 50, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text("PHUKET CAMPUS | DIVISION OF STUDENT DEVELOPMENT", 148.5, 56, { align: 'center' });

            // --- 4. MAIN TITLE ---
            doc.setFontSize(28);
            doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
            doc.text("CERTIFICATE OF COMPLETION", 148.5, 80, { align: 'center' });

            // --- 5. RECIPIENT INFO ---
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(16);
            doc.text("This is to certify that", 148.5, 105, { align: 'center' });
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(`${profileData.first_name} ${profileData.last_name}`, 148.5, 118, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            doc.text(`Student ID: ${profileData.student_id} | Faculty: ${profileData.faculty}`, 148.5, 126, { align: 'center' });

            // --- 6. ACHIEVEMENT & RATING ---
            doc.setFontSize(14);
            doc.text("has successfully completed the part-time work assignment for", 148.5, 142, { align: 'center' });
            doc.setFont("helvetica", "bold");
            doc.setTextColor(psuBlue[0], psuBlue[1], psuBlue[2]);
            doc.text(`"${app.job_title}"`, 148.5, 152, { align: 'center' });
            const avg = avgRating(app.evaluation);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139);
            doc.text(`Performance Appraisal Score: ${avg} / 5.0 (${app.evaluation.result_status})`, 148.5, 162, { align: 'center' });

            // --- 7. SIGNATURE BLOCK ---
            doc.setTextColor(30, 41, 59);
            doc.setLineWidth(0.5);
            doc.line(103.5, 180, 193.5, 180);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("(Mr. Sarawut Japrang)", 148.5, 185, { align: 'center' });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("Acting Head of Student Development & Alumni Relations", 148.5, 190, { align: 'center' });

            // --- 8. VALIDATION FOOTER ---
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(`VALIDATED ELECTRONICALLY ON: ${new Date().toLocaleDateString('en-GB')} BY PSU PART-TIME JOB HUB`, 148.5, 196, { align: 'center' });

            doc.save(`PSU_Certificate_${profileData.student_id}.pdf`);
        };

        // --- ASYNC LOADER ---
        if (app.job_poster_url) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = app.job_poster_url;
            img.onload = () => generatePDF(img);
            img.onerror = () => generatePDF(null);
        } else {
            generatePDF(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-white font-black animate-pulse uppercase">Syncing Profile...</p></div>;

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="fixed inset-0 z-0 scale-110 blur-[10px]" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="fixed inset-0 bg-slate-900/20 z-10" />

            <PageTransition>
                <div className="relative z-20 pt-24 pb-16 px-4 max-w-5xl mx-auto flex flex-col gap-8 font-sans">

                    {/* [Point 1, 3] Info Panel with Navbar-style PFP and Full Details */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/40">
                        <div className="flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-32 h-32 rounded-full bg-psu-blue text-white flex items-center justify-center font-bold text-5xl shadow-xl border-4 border-white select-none">
                                {student?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Profile</h2>
                                        <p className="text-psu-blue text-[10px] font-black uppercase tracking-[0.3em] mt-1">Official University Record</p>
                                    </div>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="bg-psu-blue text-white px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg">Edit Info</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">ID</span><span className="font-black text-slate-800">{profileData?.student_id}</span></div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Name</span><span className="font-bold text-slate-700">{profileData?.first_name} {profileData?.last_name}</span></div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Faculty</span><span className="font-bold text-slate-700">{profileData?.faculty}</span></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Email</span><span className="font-bold text-slate-700 truncate ml-4">{profileData?.email || student?.email}</span></div>
                                        {isEditing ? (
                                            <div className="space-y-3 pt-1">
                                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" value={formData.religion || ''} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} placeholder="Religion" />
                                                <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none" value={formData.allergies || ''} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="Allergies" />
                                                <div className="flex gap-2"><button onClick={handleSave} className="bg-psu-blue text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Save</button><button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Religion</span><span className="font-bold text-slate-700">{profileData?.religion || '-'}</span></div>
                                                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Allergies</span><span className="font-bold text-slate-700">{profileData?.allergies || '-'}</span></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* [Point 5] Current Employment Section */}
                    {activeAssignments.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] ml-4 drop-shadow-md">Active Assignments</h2>
                            {activeAssignments.map((job) => (
                                <div key={job.id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-l-[12px] border-[#06C755] flex flex-col md:flex-row gap-8 items-center animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="w-48 h-32 rounded-xl overflow-hidden shadow-lg border border-white/50 flex-shrink-0">
                                        <img
                                            src={job.poster_image_url || placeholder}
                                            alt="Job"
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${job.status === 'APPROVED' ? 'text-green-600' : 'text-amber-500'}`}>{job.status}</p>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2">{job.title}</h3>
                                        <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase">Work in Progress</span>
                                    </div>
                                    <button onClick={() => navigate(`/jobs/${job.id}`)} className="bg-psu-blue text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase shadow-xl">Details</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Work History Section with Custom Thumbnails [Point 5] */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-10 border border-white/40 shadow-2xl">
                        <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em] mb-10 text-center drop-shadow-sm">Work History & Evaluations</h2>
                        <div className="grid gap-4">
                            {workHistory.map((app) => (
                                <div key={app.id} className="bg-white/70 border border-white/60 rounded-xl p-5 flex items-center gap-6 shadow-sm hover:bg-white transition-all group">
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md border border-white flex-shrink-0">
                                        <img
                                            src={app.job_poster_url || placeholder}
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-xl mb-1">{app.job_title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(app.application_date).toLocaleDateString('en-GB')}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-2">
                                            <StarDisplay value={Math.round(avgRating(app.evaluation))} />
                                            <span className="text-sm font-black text-slate-700">{avgRating(app.evaluation)}</span>
                                        </div>
                                        <button onClick={() => openEvaluation(app)} className="bg-psu-blue text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-800 transition-all transform active:scale-95">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageTransition>

            {/* [Point 2, 3] Compact Modal with Aggressive Typography */}
            <AnimatePresence>
                {isModalOpen && selectedApp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden border border-white/20">
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border border-slate-50 flex-shrink-0">
                                        <img src={selectedApp.job_poster_url || placeholder} alt="Job" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-psu-blue uppercase tracking-[0.2em] mb-0.5">Performance Review</p>
                                        <h3 className="text-lg font-medium text-slate-800 leading-tight">{selectedApp.job_title}</h3>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 text-3xl self-start -mt-2">✕</button>
                                </div>

                                <div className="space-y-6">
                                    {/* Main Score: Reduced vertical padding and massive typography [Point 2] */}
                                    <div className="bg-slate-50 rounded-2xl p-6 text-center shadow-inner border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Score</p>
                                        <div className="flex flex-col items-center gap-4 mb-4">
                                            <span className="text-7xl font-medium text-psu-blue tracking-tighter">{avgRating(selectedApp.evaluation)}</span>
                                            <StarDisplay value={Math.round(avgRating(selectedApp.evaluation))} size="lg" />
                                        </div>
                                        <p className="text-xl italic text-slate-500 font-normal px-2 leading-relaxed">"{selectedApp.evaluation.comment || 'Nice work!'}"</p>
                                    </div>

                                    {/* Category Grid: Compact padding, larger stars [Point 2] */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Punctuality', 'Responsibility', 'Quality', 'Grooming'].map(cat => (
                                            <div key={cat} className="text-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{cat}</p>
                                                <div className="flex justify-center scale-90">
                                                    <StarDisplay value={selectedApp.evaluation[`${cat.toLowerCase()}_rating`]} size="sm" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedApp.evaluation.result_status === 'PASS' && (
                                        <button onClick={() => handleDownloadCertificate(selectedApp)} className="w-full py-5 bg-psu-blue text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-blue-800 transition-all flex items-center justify-center gap-4">
                                            <span className="text-lg">📄</span> DOWNLOAD OFFICIAL CERTIFICATE
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Profile;