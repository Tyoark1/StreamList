import { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { setIsAuthenticated, setCurrentUser } = useOutletContext();
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
          const data = await response.json();
          
          setCurrentUser({
            id: data.id, 
            email: data.email
          });

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

  // Google OAuth Login Handler
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
        alert(data.detail || "Google login failed");
      }
    } catch (error) {
      console.error("Server connection error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-stream-deep mb-6">Sign In to StreamList</h2>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address" 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stream-aqua"
          required
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stream-aqua"
          required
        />
        <button 
          type="submit" 
          className="w-full py-2 bg-stream-aqua text-stream-deep font-bold rounded-lg hover:bg-stream-aqua/80 transition-colors mt-2"
        >
          Sign In
        </button>
      </form>

      {/* Visual Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-gray-400 text-sm">or sign in with</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Google Button */}
      <div className="flex justify-center mb-2">
        <GoogleLogin 
          onSuccess={handleGoogleSuccess} 
          onError={() => alert('Google login widget failed to load')}
          useOneTap={false}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
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