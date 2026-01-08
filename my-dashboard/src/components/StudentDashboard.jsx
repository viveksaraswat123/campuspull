import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, User, BookOpen, Briefcase, 
  Bell, Mail, Code2, Github, ExternalLink,
  ChevronRight, Award, Menu, X, Zap, CheckCircle2,
  Globe, Terminal, Cpu, Plus, Trash2, Edit3, Save, MapPin, Network
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';

const API_BASE = "http://localhost:5000/api";

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = user.id; 

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    college: "",
    department: "",
    degree: "",
    section: "",
    year: "",
    graduationYear: "",
    headline: "",
    bio: "",
    location: "",
    leetcode: "",
    github: "",
    linkedin: "",
    skills: [],
    profileImage: ""
  });

  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [allAlumni, setAllAlumni] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [networkJobs, setNetworkJobs] = useState([]);
  const [stats, setStats] = useState({ progress: 0, attendance: "0%", tasks: 0 });

  // --- COMPUTE TECHNICAL DNA FROM DB SKILLS ---
  const dynamicSkillData = useMemo(() => {
    if (!userData.skills || userData.skills.length === 0) {
      return [{ name: 'Empty', value: 100, color: '#F1F5F9' }];
    }
    const colors = ['#10B981', '#6366F1', '#F59E0B', '#9D174D', '#06B6D4', '#8B5CF6'];
    return userData.skills.map((skillStr, i) => {
      const [name, val] = skillStr.split(':');
      return {
        name: name || "Unknown",
        value: parseInt(val) || 20,
        color: colors[i % colors.length]
      };
    });
  }, [userData.skills]);

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!userId) {
          setLoading(false);
          return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/user/profile/${userId}`);
        const { user, stats: dbStats } = res.data;
        setUserData(user);
        setProjects(user.projects || []);
        setCerts(user.certifications || []);
        setStats(dbStats || { progress: 0, attendance: "0%", tasks: 0 });

        // Fetch alumni and students for networking
        const alumniRes = await axios.get(`${API_BASE}/users/alumni`);
        setAllAlumni(alumniRes.data);
        const studentsRes = await axios.get(`${API_BASE}/users/students`);
        setAllStudents(studentsRes.data);

        // Fetch connections
        const connectionsRes = await axios.get(`${API_BASE}/connections/${userId}`);
        setMyConnections(connectionsRes.data);
        // For sent requests, we can filter from connections where status pending and requester is userId
        const sent = connectionsRes.data.filter(conn => conn.requester._id === userId && conn.status === 'pending');
        setSentRequests(sent);

        // Fetch network jobs
        const networkJobsRes = await axios.get(`${API_BASE}/jobs/network/${userId}`);
        setNetworkJobs(networkJobsRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [userId]);

  const getConnectionStatus = (personId) => {
    const connection = myConnections.find(conn => 
      (conn.requester._id === personId || conn.recipient._id === personId) && conn.status === 'accepted'
    );
    if (connection) return 'connected';
    const sent = sentRequests.find(req => 
      (req.recipient._id === personId || req.requester._id === personId)
    );
    if (sent) return 'pending';
    return 'none';
  };

  const handleConnect = async (recipientId) => {
    try {
      await axios.post(`${API_BASE}/connections`, { requesterId: userId, recipientId });
      // Refresh connections
      const connectionsRes = await axios.get(`${API_BASE}/connections/${userId}`);
      setMyConnections(connectionsRes.data);
      const sent = connectionsRes.data.filter(conn => conn.requester._id === userId && conn.status === 'pending');
      setSentRequests(sent);
      alert("Connection request sent!");
    } catch (err) {
      alert("Failed to send request");
    }
  };

  // --- HANDLERS ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await axios.patch(`${API_BASE}/user/profile/${userId}`, formData);
      setIsEditingProfile(false);
      // Refetch data to update profile image
      const res = await axios.get(`${API_BASE}/user/profile/${userId}`);
      const { user } = res.data;
      setUserData(user);
      alert("Profile Saved!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  const handleAddSkill = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newSkill = `${formData.get('sName')}:${formData.get('sRating')}`;
  const updatedSkills = [...(userData.skills || []), newSkill];

  try {

    setUserData(prev => ({ ...prev, skills: updatedSkills }));
    
    // 2. Sync with MongoDB
    await axios.patch(`${API_BASE}/user/profile/${userId}`, {
      skills: updatedSkills
    });
    
    e.target.reset();
  } catch (err) {
    console.error("Failed to sync skill:", err);
    alert("Skill added locally, but failed to save to database.");
  }
};

  const removeSkill = (idx) => {
    setUserData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx)
    }));
  };

  const handleAddData = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData);
    const type = modalType === 'Project' ? 'projects' : 'certifications';
    try {
      const res = await axios.post(`${API_BASE}/user/collections/${userId}/${type}`, rawData);
      if (modalType === 'Project') setProjects(res.data.data);
      if (modalType === 'Cert') setCerts(res.data.data);
      setIsModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (itemId, typeKey) => {
    const type = typeKey === 'Project' ? 'projects' : 'certifications';
    try {
      const res = await axios.delete(`${API_BASE}/user/collections/${userId}/${type}/${itemId}`);
      if (typeKey === 'Project') setProjects(res.data.data);
      if (typeKey === 'Cert') setCerts(res.data.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-indigo-600 animate-pulse">SYNCING_WITH_MONGODB...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* HERO */}
            <div className="col-span-12 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
               <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white overflow-hidden shrink-0 shadow-lg ring-4 ring-indigo-50">
                 <img src={userData.profileImage ? `http://localhost:5000${userData.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" />
               </div>
               <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight italic">{userData.name}</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                    {userData.department} | {userData.college} | Class of {userData.graduationYear}
                  </p>
               </div>
               <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase italic">Active Student</span>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <CodingStatsSection handles={{ leetcode: userData.leetcode, github: userData.github }} />
            </div>

            {/* TECHNICAL DNA */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
               <h3 className="font-black text-[#1E293B] mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50 italic">Technical DNA</h3>
               <div className="flex items-center gap-4">
                  <div className="h-32 w-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dynamicSkillData} innerRadius={42} outerRadius={55} dataKey="value" stroke="none">
                          {dynamicSkillData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-indigo-600 italic">
                      {userData.skills?.length || 0}
                    </div>
                  </div>
                  <div className="space-y-2 flex-1 overflow-hidden">
                     {dynamicSkillData.slice(0, 4).map((s, i) => (
                       <LegendItem key={i} color={s.color} label={s.name} />
                     ))}
                  </div>
               </div>
            </div>

            <div className="col-span-12">
               <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-[0.2em] mb-6 italic">Top Projects</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map((proj) => (
                    <ProjectCard key={proj._id} title={proj.title} desc={proj.description} link={proj.link} />
                  ))}
               </div>
            </div>

            {/* NEW: CERTIFICATIONS ADDED TO DASHBOARD */}
            <div className="col-span-12 mt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-[0.2em] italic">Latest Certifications</h3>
                <button onClick={() => setActiveTab('Certifications')} className="text-[10px] font-black text-indigo-600 uppercase italic hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {certs.slice(0, 4).map((cert) => (
                  <div key={cert._id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Award size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-800 text-[11px] truncate uppercase">{cert.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{cert.provider}</p>
                    </div>
                  </div>
                ))}
                {certs.length === 0 && (
                  <div className="col-span-full py-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                    <Award size={24} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Certifications Synced</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Projects': 
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          {projects.map((proj) => <ProjectCard key={proj._id} title={proj.title} desc={proj.description} link={proj.link} />)}
        </div>;

      case 'Networking':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black italic">Connect with Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...allAlumni, ...allStudents].filter(u => u._id !== userId).map(person => (
                <div key={person._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <img src={person.profileImage ? `http://localhost:5000${person.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt="avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-black italic text-slate-800">{person.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{person.role} • {person.currentCompany || person.department}</p>
                    <p className="text-[10px] text-slate-500">{person.location}</p>
                  </div>
                  {(() => {
                    const status = getConnectionStatus(person._id);
                    if (status === 'connected') return <button className="ml-auto bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs">Connected</button>;
                    if (status === 'pending') return <button className="ml-auto bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs">Pending</button>;
                    return <button onClick={() => handleConnect(person._id)} className="ml-auto bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs">Connect</button>;
                  })()}
                </div>
              ))}
            </div>
          </div>
        );

      case 'NetworkJobs':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black italic">Jobs from My Network</h3>
            <div className="grid gap-4">
              {networkJobs.map(job => (
                <div key={job._id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-black italic text-slate-800">{job.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{job.company} • {job.location}</p>
                    <p className="text-[10px] text-slate-500">Posted by {job.postedBy.name}</p>
                  </div>
                </div>
              ))}
              {networkJobs.length === 0 && <p className="text-slate-400 font-bold italic">No jobs from your network yet. Connect with alumni to see their postings!</p>}
            </div>
          </div>
        );

      case 'Certifications': 
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {certs.map((cert) => <CertCard key={cert._id} cert={cert} />)}
        </div>;

      case 'Profile': 
        return (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                  <img src={userData.profileImage ? `http://localhost:5000${userData.profileImage}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic">{userData.name}</h2>
                  <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">{userData.headline || 'Student'}</p>
                </div>
              </div>
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="bg-[#1E293B] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {isEditingProfile ? <X size={14}/> : <Edit3 size={14}/>} {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <EditableItem isEditing={isEditingProfile} label="Full Name" name="name" value={userData.name} />
              <EditableItem isEditing={isEditingProfile} label="Headline" name="headline" value={userData.headline} />
              <EditableItem isEditing={isEditingProfile} label="LeetCode Username" name="leetcode" value={userData.leetcode} />
              <EditableItem isEditing={isEditingProfile} label="GitHub Username" name="github" value={userData.github} />
              <EditableItem isEditing={isEditingProfile} label="Bio" name="bio" value={userData.bio} />
              <EditableItem isEditing={isEditingProfile} label="Location" name="location" value={userData.location} />
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

            {/* SKILL MANAGER SECTION */}
            <div className="p-8 border-t border-slate-100">
              <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-widest mb-8">Skill Mastery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <form onSubmit={handleAddSkill} className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Add Skill to DNA</p>
                  <input name="sName" placeholder="Skill Name (e.g. React)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border border-transparent focus:border-indigo-100" required />
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <input name="sRating" type="range" min="10" max="100" className="flex-1 accent-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600">PROFICIENCY</span>
                  </div>
                  <button type="submit" className="w-full bg-[#1E293B] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Add Skills</button>
                </form>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Current Stack</p>
                  {userData.skills?.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="flex-1">
                        <span className="font-black text-[11px] uppercase text-[#1E293B]">{s.split(':')[0]}</span>
                        <div className="h-1 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{width: `${s.split(':')[1]}%`}} />
                        </div>
                      </div>
                      <button onClick={() => removeSkill(i)} className="ml-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1E293B] text-white rounded-[2.5rem] p-8">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="font-black italic uppercase text-xs tracking-widest opacity-50">Projects</h4>
                     <button onClick={() => {setModalType('Project'); setIsModalOpen(true)}} className="bg-indigo-600 p-2 rounded-xl"><Plus size={20}/></button>
                  </div>
                  {projects.map(p => (
                    <div key={p._id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-2">
                      <span className="font-bold text-[11px] uppercase truncate">{p.title}</span>
                      <button onClick={() => deleteItem(p._id, 'Project')} className="text-white/20 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
                {/* Added Certificate Management as well for balance */}
                <div className="bg-white text-slate-800 rounded-[2.5rem] p-8 border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="font-black italic uppercase text-xs tracking-widest opacity-50">Certifications</h4>
                     <button onClick={() => {setModalType('Cert'); setIsModalOpen(true)}} className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><Plus size={20}/></button>
                  </div>
                  {certs.map(c => (
                    <div key={c._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                      <span className="font-bold text-[11px] uppercase truncate">{c.name}</span>
                      <button onClick={() => deleteItem(c._id, 'Cert')} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#334155] font-sans overflow-hidden relative">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E293B] text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-700/30 font-black italic text-xl uppercase tracking-tighter">Campuspull</div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <SidebarItem icon={<Network size={18}/>} label="Networking" active={activeTab === 'Networking'} onClick={() => setActiveTab('Networking')} />
          <SidebarItem icon={<Briefcase size={18}/>} label="Network Jobs" active={activeTab === 'NetworkJobs'} onClick={() => setActiveTab('NetworkJobs')} />
          <SidebarItem icon={<Code2 size={18}/>} label="Projects" active={activeTab === 'Projects'} onClick={() => setActiveTab('Projects')} />
          <SidebarItem icon={<Award size={18}/>} label="Certifications" active={activeTab === 'Certifications'} onClick={() => setActiveTab('Certifications')} />
          <SidebarItem icon={<User size={18}/>} label="My Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
        </nav>
        <div className="p-8 border-t border-slate-700/30">
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-[10px] italic">{userData.name?.charAt(0)}</div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest">{userData.name}</p>
               <p className="text-[8px] text-slate-500 font-bold">STATUS: SYNCED</p>
             </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full relative">
        <header className="flex justify-between items-end p-10 mb-2 pb-6 border-b border-slate-200/60">
           <div>
             <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1 italic tracking-tighter"></p>
             <h1 className="text-4xl font-black text-[#1E293B] tracking-tight italic uppercase">{activeTab}</h1>
           </div>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-4 bg-white rounded-2xl shadow-sm"><Menu size={20}/></button>
        </header>
        <div className="p-4 md:p-10 max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black italic mb-8 uppercase">New {modalType}</h3>
            <form onSubmit={handleAddData} className="space-y-4">
              <input name={modalType === 'Project' ? 'title' : 'name'} placeholder="Entry Title" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" required />
              {modalType === 'Project' ? (
                <>
                  <input name="link" placeholder="Source URL" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
                  <textarea name="description" placeholder="Short description..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm h-32 outline-none"></textarea>
                </>
              ) : (
                <>
                  <input name="provider" placeholder="Organization" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" required />
                  <input name="date" placeholder="Month/Year" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
                </>
              )}
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500">Save Instance</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-black uppercase text-[9px] mt-2">Abort</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ATOMIC UI COMPONENTS ---
const ProjectCard = ({ title, desc, link }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-full group hover:border-indigo-200 transition-all">
    <div>
      <h4 className="font-black text-[#1E293B] italic mb-2 uppercase text-sm">{title}</h4>
      <p className="text-slate-400 text-[11px] leading-tight mb-4 line-clamp-3 italic">{desc}</p>
    </div>
    <div className="flex justify-between items-center text-slate-300 group-hover:text-indigo-600">
      <div className="flex gap-3">
        {link && <a href={link} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a>}
        <Github size={16} />
      </div>
      <ChevronRight size={16} />
    </div>
  </div>
);

const CertCard = ({ cert }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
    <Award className="text-indigo-600 shrink-0" size={28} />
    <div className="flex-1 min-w-0">
      <h4 className="font-black text-slate-800 truncate uppercase text-sm">{cert.name}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{cert.provider} • {cert.date}</p>
    </div>
    <CheckCircle2 className="text-emerald-500" size={20} />
  </div>
);

const CodingStatsSection = ({ handles }) => {
  const [stats, setStats] = useState({ leetcode: null, github: null });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lc, gh] = await Promise.all([
          handles.leetcode ? axios.get(`https://leetcode-stats-api.herokuapp.com/${handles.leetcode}`) : null,
          handles.github ? axios.get(`https://api.github.com/users/${handles.github}`) : null
        ]);
        setStats({ leetcode: lc?.data, github: gh?.data });
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, [handles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
        <h3 className="font-black text-[9px] tracking-[0.2em] uppercase opacity-40 italic mb-6">LeetCode Metrics</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Easy" val={stats.leetcode?.easySolved} color="text-emerald-500" />
          <StatBox label="Med" val={stats.leetcode?.mediumSolved} color="text-orange-500" />
          <StatBox label="Hard" val={stats.leetcode?.hardSolved} color="text-red-500" />
        </div>
      </div>
      <div className="bg-[#1E293B] p-8 rounded-[2.5rem] text-white flex items-center justify-around shadow-lg">
        <div className="text-center"><p className="text-3xl font-black italic">{stats.github?.public_repos || 0}</p><p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Repos</p></div>
        <div className="h-10 w-px bg-white/10" />
        <div className="text-center"><p className="text-3xl font-black italic">{stats.github?.followers || 0}</p><p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Fans</p></div>
      </div>
    </div>
  );
};

const StatBox = ({ label, val, color }) => (
  <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
    <p className={`text-xl font-black italic ${color}`}>{val || 0}</p>
    <p className="text-[8px] uppercase font-black text-slate-400 mt-1">{label}</p>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
    <div className={`h-2 w-2 rounded-full ${color}`} />
    <span className="uppercase text-[9px] font-black text-slate-500 truncate">{label}</span>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon} <span className="text-[11px] uppercase tracking-widest font-black italic">{label}</span>
  </div>
);

const EditableItem = ({ label, name, value, isEditing }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
    {isEditing ? (
      <input name={name} defaultValue={value} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" />
    ) : (
      <div className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700">{value || <span className="text-slate-300 italic">Empty</span>}</div>
    )}
  </div>
);