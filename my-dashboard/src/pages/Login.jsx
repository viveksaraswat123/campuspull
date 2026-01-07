import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        login(response.data); // Stores: { name, role, college, etc. }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f4f9]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h2 className="text-2xl font-bold text-[#2d405f] mb-6 text-center">Campuspull Login</h2>
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Password" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)} required 
          />
          <button type="submit" className="w-full bg-[#2d405f] text-white p-3 rounded-xl font-bold hover:bg-[#1e2b40] transition-all">
            Enter Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}