import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, User, Users, Briefcase, Menu, X, Plus, 
  Globe, Zap, LogOut, Trash2, Edit3, Save, BarChart3, Network, Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://your-render-backend-url.onrender.com/api' : 'http://localhost:5000/api';
const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-render-backend-url.onrender.com' : 'http://localhost:5000';

const AlumniKPIs = ({ stats }) => {
  const mentorshipVal = stats?.mentorshipHrs !== undefined ? stats.mentorshipHrs : 0;
  const kpiData = [
    { label: "Referrals", val: stats?.referrals || 0, icon: <Zap size={20} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Mentorship", val: `${mentorshipVal}h`, icon: <User size={20} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Reach", val: stats?.profileViews || 0, icon: <Globe size={20} />, color: "bg-pink-50 text-pink-600" },
    { label: "Jobs Shared", val: stats?.jobPosts || 0, icon: <Briefcase size={20} />, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>{kpi.icon}</div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
            <h4 className="text-2xl font-black text-slate-800 italic">{kpi.val}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AlumniDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alumni, setAlumni] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [allAlumni, setAllAlumni] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({ referrals: 0, mentorshipHrs: 0, profileViews: 0, jobPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const userId = user?.id;

  const fetchData = async () => {
    try {
      const profileRes = await axios.get(`${API_BASE}/user/profile/${userId}`);
      setAlumni(profileRes.data.user);
      setStats(profileRes.data.stats);
      const jobsRes = await axios.get(`${API_BASE}/jobs/user/${userId}`);
      setMyJobs(jobsRes.data);
      const alumniRes = await axios.get(`${API_BASE}/users/alumni`);
      setAllAlumni(alumniRes.data);
      const studentsRes = await axios.get(`${API_BASE}/users/students`);
      setAllStudents(studentsRes.data);
      const requestsRes = await axios.get(`${API_BASE}/connections/requests/${userId}`);
      setPendingRequests(requestsRes.data);
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      salary: formData.get('salary'),
      description: formData.get('description'),
      userId
    };
    try {
      await axios.post(`${API_BASE}/jobs`, jobData);
      setIsModalOpen(false);
      fetchData();
      alert("Job Posted!");
    } catch (err) { alert("Post failed"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await axios.patch(`${API_BASE}/user/profile/${userId}`, formData);
      setIsEditingProfile(false);
      fetchData();
      alert("Profile Saved!");
    } catch (err) { alert("Update failed"); }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.patch(`${API_BASE}/connections/${requestId}/accept`);
      fetchData();
      alert("Request accepted!");
    } catch (err) { alert("Failed to accept"); }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.patch(`${API_BASE}/connections/${requestId}/reject`);
      fetchData();
      alert("Request rejected!");
    } catch (err) { alert("Failed to reject"); }
  };

  const deleteJob = async (jobId) => {
    if(!window.confirm("Delete job?")) return;
    try {
      await axios.delete(`${API_BASE}/jobs/${jobId}`);
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 italic">CAMPUSPULL...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
              <img src={alumni?.profileImage ? `${BASE_URL}${alumni.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${alumni?.name}`} alt="avatar" className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-2xl font-black italic">Welcome back, {alumni?.name}!</h2>
                <p className="text-slate-600">{alumni?.role} at {alumni?.currentCompany}</p>
                <p className="text-slate-500 text-sm">{alumni?.location}</p>
              </div>
            </div>
            <AlumniKPIs stats={stats} />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-400 uppercase text-xs italic mb-4">Mentorship Inbox</h3>
                <p className="text-slate-400 font-bold italic">No pending requests.</p>
              </div>
              <div className="col-span-12 lg:col-span-6 bg-[#1E293B] rounded-3xl p-8 text-white flex flex-col justify-between min-h-[220px]">
                <p className="text-2xl font-black italic">Post a Job <br/> Referral.</p>
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-[#1E293B] py-4 rounded-2xl font-black uppercase tracking-widest">+ New Post</button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-400 uppercase text-xs italic mb-4">Recent Postings</h3>
                <div className="space-y-4">
                  {myJobs.slice(0, 3).map(job => (
                    <div key={job._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <h4 className="font-black italic text-slate-800 text-sm">{job.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{job.company} • {job.location}</p>
                      </div>
                    </div>
                  ))}
                  {myJobs.length === 0 && <p className="text-slate-400 font-bold italic">No postings yet.</p>}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-400 uppercase text-xs italic mb-4">Networking Suggestions</h3>
                <div className="space-y-4">
                  {[...allAlumni, ...allStudents].filter(u => u._id !== userId).slice(0, 3).map(person => (
                    <div key={person._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <img src={person.profileImage ? `${BASE_URL}${person.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <h4 className="font-black italic text-slate-800 text-sm">{person.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{person.role} • {person.currentCompany || person.department}</p>
                      </div>
                      <button className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl font-bold text-xs">Connect</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-400 uppercase text-xs italic mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-indigo-100 transition-all">
                  <Plus size={24} />
                  Post Job
                </button>
                <button onClick={() => setActiveTab('Profile')} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-emerald-100 transition-all">
                  <User size={24} />
                  Edit Profile
                </button>
                <button onClick={() => setActiveTab('Networking')} className="bg-pink-50 text-pink-600 p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-pink-100 transition-all">
                  <Network size={24} />
                  Network
                </button>
                <button onClick={() => setActiveTab('Analytics')} className="bg-amber-50 text-amber-600 p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-amber-100 transition-all">
                  <BarChart3 size={24} />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        );
      case 'Requests':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black italic">Connection Requests</h3>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={request.requester.profileImage ? `${BASE_URL}${request.requester.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requester.name}`} alt="avatar" className="w-12 h-12 rounded-full" />
                    <div>
                      <h4 className="font-black italic text-slate-800">{request.requester.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{request.requester.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(request._id)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs">Accept</button>
                    <button onClick={() => handleRejectRequest(request._id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs">Reject</button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && <p className="text-slate-400 font-bold italic">No pending requests.</p>}
            </div>
          </div>
        );
      case 'Referrals':
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black italic">Your Postings</h3>
            <div className="grid gap-4">
              {myJobs.map(job => (
                <div key={job._id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-black italic text-slate-800">{job.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{job.company} • {job.location}</p>
                  </div>
                  <button onClick={() => deleteJob(job._id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Networking':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black italic">Connect with Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...allAlumni, ...allStudents].filter(u => u._id !== userId).map(person => (
                <div key={person._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <img src={person.profileImage ? `${BASE_URL}${person.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt="avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-black italic text-slate-800">{person.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{person.role} • {person.currentCompany || person.department}</p>
                    <p className="text-[10px] text-slate-500">{person.location}</p>
                  </div>
                  <button className="ml-auto bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs">Connect</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Analytics':
        const chartData = [
          { name: 'Referrals', value: stats.referrals },
          { name: 'Mentorship Hrs', value: stats.mentorshipHrs },
          { name: 'Profile Views', value: parseInt(stats.profileViews.replace('k', '000')) || 0 },
          { name: 'Job Posts', value: stats.jobPosts }
        ];
        const pieData = [
          { name: 'Referrals', value: stats.referrals, color: '#6366f1' },
          { name: 'Mentorship', value: stats.mentorshipHrs, color: '#10b981' },
          { name: 'Views', value: parseInt(stats.profileViews.replace('k', '000')) || 0, color: '#f59e0b' },
          { name: 'Posts', value: stats.jobPosts, color: '#ef4444' }
        ];
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black italic">Your Analytics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-400 uppercase text-xs italic mb-4">Activity Overview</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-400 uppercase text-xs italic mb-4">Activity Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'Profile':
        return (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  <img src={alumni?.profileImage ? `${BASE_URL}${alumni.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${alumni?.name}`} alt="avatar" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic">{alumni?.name}</h2>
                  <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">{alumni?.role}</p>
                </div>
              </div>
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-[#1E293B] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {isEditingProfile ? <X size={14}/> : <Edit3 size={14}/>} {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <EditableItem isEditing={isEditingProfile} label="Full Name" name="name" value={alumni?.name} />
              <EditableItem isEditing={isEditingProfile} label="Role" name="role" value={alumni?.role} />
              <EditableItem isEditing={isEditingProfile} label="Company" name="company" value={alumni?.currentCompany} />
              <EditableItem isEditing={isEditingProfile} label="Batch (Grad Year)" name="batch" value={alumni?.graduationYear} />
              <EditableItem isEditing={isEditingProfile} label="Location" name="location" value={alumni?.location} />
              <EditableItem isEditing={isEditingProfile} label="Email" name="email" value={alumni?.email} />
              <EditableItem isEditing={isEditingProfile} label="Certification Link" name="certificationLink" value={alumni?.certificationLink} />
              {isEditingProfile && (
                <div className="md:col-span-2 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Profile Picture</p>
                  <input type="file" name="avatar" accept="image/*" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
                </div>
              )}
              {isEditingProfile && (
                <div className="md:col-span-2 flex justify-center mt-4">
                  <button type="submit" className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-100"><Save size={18}/> Save Data</button>
                </div>
              )}
            </form>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E293B] text-white flex flex-col transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-700/30 text-xl font-black italic">CAMPUSPULL</div>
        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <SidebarItem icon={<Bell size={18} />} label="Requests" active={activeTab === 'Requests'} onClick={() => setActiveTab('Requests')} />
          <SidebarItem icon={<User size={18} />} label="My Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
          <SidebarItem icon={<Briefcase size={18} />} label="Referrals" active={activeTab === 'Referrals'} onClick={() => setActiveTab('Referrals')} />
          <SidebarItem icon={<Network size={18} />} label="Networking" active={activeTab === 'Networking'} onClick={() => setActiveTab('Networking')} />
          <SidebarItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
        </nav>
        <div className="p-6 border-t border-slate-700/30">
          <button onClick={handleLogout} className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-slate-400 hover:text-red-400 transition-all">
            <LogOut size={18} /> <span className="text-[11px] uppercase tracking-widest font-black italic">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-8 md:p-10 flex justify-between items-center">
          <button className="lg:hidden p-2 bg-white rounded-xl" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">{activeTab}</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8 md:p-10 max-w-6xl mx-auto w-full">{renderContent()}</div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-10 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400"><X /></button>
            <h2 className="text-3xl font-black italic mb-6">Post Referral</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <input name="title" required placeholder="Job Title" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <input name="company" required placeholder="Company" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <input name="location" required placeholder="Location" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <input name="salary" placeholder="Salary/Package" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <textarea name="description" placeholder="Details..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold h-32 resize-none" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">Post</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const EditableItem = ({ label, name, value, isEditing }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
    {isEditing ? (
      <input name={name} defaultValue={value} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
    ) : name === 'certificationLink' && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-indigo-600 hover:text-indigo-800 underline block">{value}</a>
    ) : (
      <div className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700">{value || <span className="text-slate-300 italic">Empty</span>}</div>
    )}
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon} <span className="text-[11px] uppercase tracking-widest font-black italic">{label}</span>
  </div>
);