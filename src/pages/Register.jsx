import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const { setIsAuthenticated, setCurrentUser } = useOutletContext();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // CAPSTONE: REGISTER_SUBMIT
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      // Backend handles email validation and prevents duplicate user IntegrityErrors
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("You have successfully registered! Please log in.");
        setEmail('');
        setPassword('');
      } else {
        setMessage(data.detail || "Registration failed");
      }
    } catch (error) {
      setMessage("Server connection error.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setCurrentUser({
          id: data.id, 
          email: data.email
        });
        setIsAuthenticated(true);
        navigate('/'); 
      } else {
        const data = await response.json();
        setMessage(data.detail || "Google registration failed");
      }
    } catch (error) {
      setMessage("Server connection error.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-[#001F3F] mb-6 text-center">Register a New Account</h2>
      
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        />
        <button 
          type="submit" 
          className="px-6 py-2 bg-[#001F3F] text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign Up
        </button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-gray-400 text-sm">or sign up with</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="flex justify-center mb-2">
        <GoogleLogin 
          onSuccess={handleGoogleSuccess} 
          onError={() => setMessage('Google login widget failed to load')}
          useOneTap={false}
        />
      </div>

      {message && (
        <p className="mt-4 text-center font-semibold text-gray-700">{message}</p>
      )}
    </div>
  );
}