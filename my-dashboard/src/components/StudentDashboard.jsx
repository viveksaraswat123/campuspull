import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, User, BookOpen, Briefcase, 
  Bell, Mail, Code2, Github, ExternalLink,
  ChevronRight, Award, Menu, X, Zap, CheckCircle2,
  Globe, Terminal, Cpu, Plus, Trash2, Edit3, Save
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- CENTRALIZED STATE ---
  const [userData, setUserData] = useState({
    name: "Vivek Saraswat",
    universityId: "LPU-2025-01",
    email: "vivek.s@campus.edu",
    path: "Full Stack Engineer",
    batch: "Batch 2025"
  });

  const [projects, setProjects] = useState([
    { id: 1, name: "AI Health Monitor", tech: ["React", "Python"], desc: "Real-time vital tracking system." },
    { id: 2, name: "Campuspull Dashboard", tech: ["Node.js", "Tailwind"], desc: "Centralized alumni network." },
    { id: 3, name: "DeFi Wallet", tech: ["Solidity", "Ether.js"], desc: "Web3 crypto tracking tool." }
  ]);

  const [certs, setCerts] = useState([
    { id: 1, title: "AWS Cloud Practitioner", provider: "AWS", date: "Dec 2023" },
    { id: 2, title: "Meta Frontend Pro", provider: "Meta", date: "Oct 2023" }
  ]);

  const skillData = [
    { name: 'Prog', value: 35, color: '#10B981' },
    { name: 'Web', value: 25, color: '#9D174D' },
    { name: 'DSA', value: 12, color: '#F59E0B' },
    { name: 'Ops', value: 28, color: '#6366F1' },
  ];

  const handles = { leetcode: 'viveksaraswat123', github: 'viveksaraswat123' };

  // --- HANDLERS ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newData = Object.fromEntries(formData);
    newData.id = Date.now();
    newData.tech = newData.tech ? newData.tech.split(',') : [];

    if (modalType === 'Project') setProjects([...projects, newData]);
    if (modalType === 'Cert') setCerts([...certs, newData]);
    setIsModalOpen(false);
  };

  const deleteItem = (id, type) => {
    if (type === 'Project') setProjects(projects.filter(p => p.id !== id));
    if (type === 'Cert') setCerts(certs.filter(c => c.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="grid grid-cols-12 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Profile Hero */}
            <div className="col-span-12 bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
               <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white overflow-hidden shrink-0 shadow-lg ring-4 ring-indigo-50">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" />
               </div>
               <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight italic">{userData.name}</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">B.Tech - CSE | {userData.batch}</p>
               </div>
               <div className="flex gap-2">
                 <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase">Level 14</span>
                 <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest">Verified Student</span>
               </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <CodingStatsSection handles={handles} />
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
               <h3 className="font-black text-[#1E293B] mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50 italic">Technical DNA</h3>
               <div className="flex items-center gap-4">
                  <div className="h-32 w-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={skillData} innerRadius={45} outerRadius={55} dataKey="value" stroke="none">{skillData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-[#1E293B] italic">72%</div>
                  </div>
                  <div className="space-y-2 flex-1">
                     <LegendItem color="bg-emerald-500" label="Python" />
                     <LegendItem color="bg-indigo-500" label="Cloud" />
                     <LegendItem color="bg-pink-800" label="Web" />
                  </div>
               </div>
            </div>

            <div className="col-span-12">
               <div className="flex justify-between items-end mb-6 px-2">
                  <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-[0.2em] italic">Live Projects</h3>
                  <button onClick={() => setActiveTab('Projects')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All Projects</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map((proj, i) => (
                    <ProjectCard key={i} {...proj} />
                  ))}
               </div>
            </div>

            <div className="col-span-12 lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
               <h3 className="font-black text-[#1E293B] mb-6 uppercase text-[10px] tracking-[0.2em] opacity-50 italic">Verified Credentials</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certs.slice(0, 2).map((cert, i) => (
                    <CertMiniCard key={i} title={cert.title} provider={cert.provider} />
                  ))}
               </div>
            </div>

            <div className="col-span-12 lg:col-span-5 bg-[#1E293B] rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
               <div className="relative z-10">
                  <p className="text-indigo-400 font-black text-[9px] uppercase tracking-widest mb-2 italic">Placement Readiness</p>
                  <h3 className="text-2xl font-black italic tracking-tighter leading-tight">Prepare for the <br/> Big Day.</h3>
               </div>
               <button className="relative z-10 w-full bg-white text-[#1E293B] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all mt-6">
                  Launch Mock Interview
               </button>
               <Zap className="absolute -bottom-4 -right-4 text-white/5 opacity-20" size={140} />
            </div>
          </div>
        );
      case 'Internships': return <InternshipSection />;
      case 'Projects': return <ProjectSection items={projects} />;
      case 'Certifications': return <CertificationSection items={certs} />;
      case 'Profile': 
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Profile Settings */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black italic uppercase text-slate-400 tracking-widest leading-none">Settings</h3>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditingProfile ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}
                >
                  {isEditingProfile ? <><Save size={14}/> Save Profile</> : <><Edit3 size={14}/> Edit Profile</>}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <EditableItem isEdit={isEditingProfile} label="Full Name" name="name" val={userData.name} onChange={handleProfileChange} />
                <EditableItem isEdit={isEditingProfile} label="University ID" name="universityId" val={userData.universityId} onChange={handleProfileChange} />
                <EditableItem isEdit={isEditingProfile} label="Official Email" name="email" val={userData.email} onChange={handleProfileChange} />
                <EditableItem isEdit={isEditingProfile} label="Career Path" name="path" val={userData.path} onChange={handleProfileChange} />
              </div>
            </div>

            {/* Management Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1E293B] text-white rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                   <h4 className="font-black italic uppercase text-xs tracking-widest opacity-50">Manage Projects</h4>
                   <button onClick={() => {setModalType('Project'); setIsModalOpen(true)}} className="bg-indigo-600 p-2 rounded-xl hover:bg-emerald-500 transition-colors"><Plus size={20}/></button>
                </div>
                <div className="space-y-3">
                  {projects.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                      <span className="font-bold text-[11px] uppercase tracking-wider">{p.name}</span>
                      <button onClick={() => deleteItem(p.id, 'Project')} className="text-white/20 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <h4 className="font-black italic uppercase text-xs tracking-widest text-slate-400">Manage Certificates</h4>
                   <button onClick={() => {setModalType('Cert'); setIsModalOpen(true)}} className="bg-slate-100 p-2 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Plus size={20}/></button>
                </div>
                <div className="space-y-3">
                  {certs.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">{c.title}</span>
                      <button onClick={() => deleteItem(c.id, 'Cert')} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
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
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E293B] text-white flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-700/30">
           <span className="text-xl font-black tracking-tighter uppercase italic">Campuspull</span>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Home" active={activeTab === 'Dashboard'} onClick={() => {setActiveTab('Dashboard'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Briefcase size={18}/>} label="Internships" active={activeTab === 'Internships'} onClick={() => {setActiveTab('Internships'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Code2 size={18}/>} label="Projects" active={activeTab === 'Projects'} onClick={() => {setActiveTab('Projects'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Award size={18}/>} label="Certifications" active={activeTab === 'Certifications'} onClick={() => {setActiveTab('Certifications'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<User size={18}/>} label="My Profile" active={activeTab === 'Profile'} onClick={() => {setActiveTab('Profile'); setIsSidebarOpen(false);}} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto w-full relative">
        <header className="hidden lg:flex justify-between items-end p-10 mb-2 pb-6 border-b border-slate-200/60">
           <div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1 italic">Student Dashboard</p>
              <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">{activeTab}</h1>
           </div>
           <div className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full"></span>
           </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {/* Global Modal for Management */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black italic mb-8 uppercase tracking-tighter">Add {modalType}</h3>
            <form onSubmit={handleAddData} className="space-y-4">
              <input name={modalType === 'Project' ? 'name' : 'title'} placeholder="Name/Title" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" required />
              <input name={modalType === 'Project' ? 'tech' : 'provider'} placeholder={modalType === 'Project' ? "Stack (e.g. React, Node)" : "Provider (e.g. AWS)"} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" required />
              {modalType === 'Project' && <textarea name="desc" placeholder="Project details..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm h-32"></textarea>}
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:bg-emerald-500 transition-all">Save to Portfolio</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-black uppercase text-[10px] mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ATOMIC COMPONENTS ---

const InternshipSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
    {[
      { company: "Microsoft", role: "Software Intern", duration: "Jun - Aug 2024", status: "Active" },
      { company: "Google", role: "Summer Intern", duration: "Jan - Mar 2024", status: "Completed" }
    ].map((job, i) => (
      <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl italic">{job.company.charAt(0)}</div>
          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">{job.status}</span>
        </div>
        <h3 className="text-2xl font-black text-[#1E293B] italic">{job.role}</h3>
        <p className="text-indigo-600 font-bold text-[11px] uppercase tracking-widest mt-1">{job.company}</p>
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">{job.duration} <ExternalLink size={14} /></div>
      </div>
    ))}
  </div>
);

const ProjectSection = ({ items }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
    {items.map((proj, i) => (
      <ProjectCard key={i} {...proj} />
    ))}
  </div>
);

const CertificationSection = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
    {items.map((cert, i) => (
      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 group">
        <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Award size={28} /></div>
        <div className="flex-1">
          <h4 className="font-black text-slate-800 tracking-tight leading-tight">{cert.title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{cert.provider} • {cert.date || 'Verified'}</p>
        </div>
        <CheckCircle2 className="text-emerald-500" size={20} />
      </div>
    ))}
  </div>
);

const CodingStatsSection = ({ handles }) => {
  const [stats, setStats] = useState({ leetcode: null, github: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodingData = async () => {
      try {
        const [lcRes, ghRes] = await Promise.all([
          axios.get(`https://leetcode-stats-api.herokuapp.com/${handles.leetcode}`),
          axios.get(`https://api.github.com/users/${handles.github}`)
        ]);
        setStats({ leetcode: lcRes.data, github: ghRes.data });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCodingData();
  }, [handles]);

  if (loading) return <div className="p-12 text-slate-400 font-black italic text-center uppercase tracking-[0.2em] animate-pulse">Syncing...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-[#1E293B] flex items-center gap-2 uppercase text-[10px] tracking-widest italic opacity-50"><Code2 className="text-yellow-500" size={18} /> LeetCode</h3>
          <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full uppercase italic">Rank: {stats.leetcode?.ranking || 'N/A'}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Easy" val={stats.leetcode?.easySolved} color="text-emerald-500" />
          <StatBox label="Med" val={stats.leetcode?.mediumSolved} color="text-orange-500" />
          <StatBox label="Hard" val={stats.leetcode?.hardSolved} color="text-red-500" />
        </div>
      </div>
      <div className="bg-[#1E293B] p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black flex items-center gap-2 uppercase text-[10px] tracking-widest italic opacity-50"><Github size={18} /> GitHub DNA</h3>
        </div>
        <div className="flex items-center justify-around h-20 text-center">
           <div><p className="text-3xl font-black tracking-tighter italic">{stats.github?.public_repos}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Repos</p></div>
           <div className="h-10 w-px bg-slate-700 opacity-30" />
           <div><p className="text-3xl font-black tracking-tighter italic">{stats.github?.followers}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Followers</p></div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ name, tech, desc }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group h-full flex flex-col justify-between">
    <div>
      <div className="flex gap-2 mb-4">
        {tech.map(t => <span key={t} className="text-[7px] font-black uppercase px-2 py-1 bg-slate-100 rounded text-slate-400 tracking-widest">{t}</span>)}
      </div>
      <h4 className="font-black text-[#1E293B] italic text-base mb-2">{name}</h4>
      <p className="text-slate-400 text-xs mb-6 font-medium leading-tight">{desc}</p>
    </div>
    <div className="flex justify-between items-center text-slate-300 group-hover:text-indigo-600 transition-all">
       <div className="flex gap-4"><Github size={16} /><ExternalLink size={16} /></div>
       <ChevronRight size={16} />
    </div>
  </div>
);

const CertMiniCard = ({ title, provider }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
     <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><Award size={20} /></div>
     <div className="flex-1">
        <p className="font-black text-xs text-slate-700 tracking-tight leading-none">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{provider}</p>
     </div>
     <CheckCircle2 className="text-emerald-500" size={16} />
  </div>
);

const EditableItem = ({ isEdit, label, name, val, onChange }) => (
  <div className="border-b border-slate-50 pb-4">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic opacity-50">{label}</p>
    {isEdit ? (
      <input 
        name={name} 
        value={val} 
        onChange={onChange} 
        className="w-full px-4 py-2 bg-indigo-50 border-none rounded-lg font-bold text-[#1E293B] focus:ring-2 ring-indigo-200 outline-none" 
      />
    ) : (
      <p className="text-lg font-bold text-[#1E293B]">{val}</p>
    )}
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 font-black scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon} <span className="text-[11px] uppercase tracking-widest font-black italic">{label}</span>
  </div>
);

const StatBox = ({ label, val, color }) => (
  <div className="bg-slate-50 p-4 rounded-2xl text-center hover:bg-white hover:shadow-inner transition-all border border-transparent hover:border-slate-100">
    <p className={`text-xl md:text-2xl font-black ${color} tracking-tighter`}>{val || 0}</p>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic leading-none">{label}</p>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
    <div className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
    <span className="uppercase text-[9px] font-black text-slate-500 tracking-tighter truncate">{label}</span>
  </div>
);