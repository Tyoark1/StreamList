import { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { setIsAuthenticated } = useOutletContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch("http://127.0.0.1:8000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          setIsAuthenticated(true);
          navigate('/'); 
        } else {
          const data = await response.json();
          alert(data.detail || "Login failed");
        }
      } catch (error) {
        console.error("Server connection error:", error);
      }
    };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-[#001F3F] mb-6">Sign In to StreamList</h2>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address" 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
          required
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
          required
        />
        <button 
          type="submit" 
          className="w-full py-2 bg-[#00E5FF] text-[#001F3F] font-bold rounded-lg hover:bg-[#00B3CC] transition-colors mt-2"
        >
          Sign In
        </button>
      </form>
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-stream-deep font-bold underline underline-offset-4 decoration-2 hover:decoration-stream-aqua transition-all"
          >
            Register to stream today!
          </Link>
        </p>
      </div>
    </div>
  );
}