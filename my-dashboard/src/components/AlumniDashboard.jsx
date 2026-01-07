import React, { useState } from 'react';
import { 
  LayoutDashboard, User, Users, Mail, 
  Briefcase, Bell, Menu, X, TrendingUp, 
  Building2, ChevronRight, Award, Plus, 
  Globe, BriefcaseIcon, MapPin, Send, Search,
  CheckCircle2, MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function AlumniDashboard({ alumni = {} }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback Data
  const { 
    name = "Alumni Member", 
    batch = "2023", 
    company = "Google", 
    role = "Senior Engineer" 
  } = alumni;

  const networkData = [
    { n: 'Jan', v: 30 }, { n: 'Feb', v: 55 }, { n: 'Mar', v: 45 },
    { n: 'Apr', v: 90 }, { n: 'May', v: 75 }, { n: 'Jun', v: 95 }
  ];

  const mentorshipRequests = [
    { name: "Anuj Sharma", topic: "Placement Guidance", status: "Today" },
    { name: "Ruchi Mehta", topic: "Resume Tips", status: "Active" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="grid grid-cols-12 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Header Card */}
            <div className="col-span-12 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
               <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white overflow-hidden shrink-0 shadow-lg ring-4 ring-indigo-50">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" />
               </div>
               <div className="text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-black text-[#1E293B] tracking-tight italic">{name}</h2>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                    {role} at <span className="text-indigo-600">{company}</span>
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                     <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">Batch {batch}</span>
                     <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Top Mentor</span>
                  </div>
               </div>
            </div>

            {/* 2. Mentorship Inbox */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-[0.2em] opacity-50 italic">Mentorship Inbox</h3>
                  <div className="h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</div>
               </div>
               <div className="space-y-4">
                  {mentorshipRequests.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                              {req.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{req.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{req.topic}</p>
                           </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                    </div>
                  ))}
               </div>
            </div>

            {/* 3. Post a Referral Card */}
            <div className="col-span-12 lg:col-span-5 bg-[#1E293B] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-200 flex flex-col justify-between overflow-hidden relative">
               <div className="relative z-10">
                  <h3 className="font-black text-white/50 mb-6 uppercase text-xs tracking-[0.2em] italic">Career Referral</h3>
                  <p className="text-2xl font-black italic tracking-tighter leading-tight mb-2">Help a junior join <br/>your team.</p>
                  <p className="text-slate-400 text-xs font-medium">Post openings at {company} and find the best talent.</p>
               </div>
               <button 
                onClick={() => setIsModalOpen(true)}
                className="relative z-10 mt-8 w-full bg-white text-[#1E293B] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
               >
                  <Plus size={16} /> Create Referral
               </button>
               <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* 4. Analytics */}
            <div className="col-span-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <h3 className="font-black text-[#1E293B] uppercase text-xs tracking-[0.2em] opacity-50 italic">Interaction Impact</h3>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full">
                     <TrendingUp size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">+24% Influence</span>
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={networkData}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                        <Bar dataKey="v" radius={[10, 10, 0, 0]} barSize={40}>
                           {networkData.map((e, i) => (
                              <Cell key={i} fill={i % 2 === 0 ? '#6366F1' : '#10B981'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        );
      case 'Profile':
        return <AlumniProfileView alumni={alumni} />;
      case 'Network':
        return <AlumniNetworkView />;
      case 'Referrals':
        return <AlumniReferralsView company={company} onOpenModal={() => setIsModalOpen(true)} />;
      case 'Messages':
        return <AlumniMessagesView />;
      default:
        return <div className="p-10 text-center font-bold text-slate-400 uppercase tracking-widest">Section Under Development</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#334155] font-sans overflow-hidden relative">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E293B] text-white flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-700/30">
           <span className="text-xl font-black tracking-tighter uppercase italic">Campuspull</span>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
           </button>
        </div>

        <div className="p-8 text-center border-b border-slate-700/30 hidden sm:block">
           <div className="h-24 w-24 rounded-full mx-auto mb-4 border-2 border-indigo-400/30 p-1 bg-slate-800">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="rounded-full" alt="avatar" />
           </div>
           <h3 className="font-black text-lg tracking-tight">{name}</h3>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">ABESIT Alumni</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => {setActiveTab('Dashboard'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<User size={18}/>} label="My Profile" active={activeTab === 'Profile'} onClick={() => {setActiveTab('Profile'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Users size={18}/>} label="Network" active={activeTab === 'Network'} onClick={() => {setActiveTab('Network'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Briefcase size={18}/>} label="Referrals" active={activeTab === 'Referrals'} onClick={() => {setActiveTab('Referrals'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<Mail size={18}/>} label="Messages" active={activeTab === 'Messages'} onClick={() => {setActiveTab('Messages'); setIsSidebarOpen(false);}} />
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <header className="hidden lg:flex justify-between items-end p-10 mb-2 pb-6 border-b border-slate-200/60">
           <div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1 italic">Alumni Portal</p>
              <h1 className="text-4xl font-black text-[#1E293B] tracking-tight">{activeTab}</h1>
           </div>
           <div className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm relative"><Bell size={20} /><span className="absolute top-3 right-3 h-2 w-2 bg-red-500 rounded-full"></span></div>
        </header>
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-xl"><Menu size={24} /></button>
           <span className="font-black italic text-indigo-600 tracking-tighter uppercase">Campuspull</span>
           <div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" /></div>
        </div>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* REFERRAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1E293B]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#1E293B] p-8 text-white relative">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={20} /></button>
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2 italic">Career Opportunity</p>
               <h2 className="text-3xl font-black italic tracking-tighter">Post a Referral</h2>
            </div>
            <form className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label><input type="text" placeholder="e.g. SDE-1" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label><input type="text" placeholder="Remote / City" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
               </div>
               <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application URL</label><input type="url" placeholder="https://..." className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
               <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"><Send size={16} /> Broadcast to Students</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEWS ---

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 font-black' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon} <span className="text-[11px] uppercase tracking-widest font-black">{label}</span>
  </div>
);

const AlumniProfileView = ({ alumni }) => (
  <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
        <InfoItem label="Legal Name" val={alumni.name || "User Name"} />
        <InfoItem label="Current Role" val={alumni.role || "Professional"} />
        <InfoItem label="Company" val={alumni.company || "Google"} />
        <InfoItem label="Class Of" val={alumni.batch || "2023"} />
     </div>
  </div>
);

const AlumniNetworkView = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-50 mb-4 overflow-hidden border-2 border-indigo-50"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" /></div>
        <p className="font-black text-slate-800 tracking-tight">Alumni Contact {i}</p>
        <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1">SDE @ Microsoft</p>
        <button className="mt-4 w-full py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 hover:text-white transition-all">Connect</button>
      </div>
    ))}
  </div>
);

const AlumniReferralsView = ({ company, onOpenModal }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
    <div className="bg-indigo-600 rounded-3xl p-8 text-white flex justify-between items-center">
      <div>
        <h3 className="text-2xl font-black italic">Active Referrals</h3>
        <p className="text-indigo-100 text-xs">Manage the opportunities you've shared with {company}.</p>
      </div>
      <button onClick={onOpenModal} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">New Post</button>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {[1, 2].map(i => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
           <div><p className="font-black text-slate-800">Senior React Developer</p><p className="text-[10px] font-bold text-slate-400 uppercase italic">Posted 2 days ago • 14 Applicants</p></div>
           <button className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase">View Applicants</button>
        </div>
      ))}
    </div>
  </div>
);

const AlumniMessagesView = () => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-[500px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4">
    <div className="text-center">
      <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active conversations</p>
    </div>
  </div>
);

const InfoItem = ({ label, val }) => (
  <div className="border-b border-slate-50 pb-4">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{label}</p>
    <p className="text-lg font-bold text-[#1E293B]">{val}</p>
  </div>
);