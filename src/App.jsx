import { useState, useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [movieList, setMovieList] = useState([]);

  // Exposed list: cleared automatically while there is no logged-in user.
  const visibleMovieList = useMemo(
    () => (isAuthenticated && currentUser ? movieList : []),
    [isAuthenticated, currentUser, movieList]
  );

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse saved cart:", error);
      localStorage.removeItem('cartItems');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    if (isAuthenticated && currentUser) {
      const fetchMovies = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/movies/${currentUser.id}`);
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          const data = await response.json();
          if (!cancelled) {
            setMovieList(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          if (!cancelled) {
            console.error("Failed to fetch movie list:", error);
            setMovieList([]);
          }
        }
      };

      fetchMovies();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (visibleMovieList.length > 0) {
      localStorage.setItem('streamlist_local_backup', JSON.stringify(visibleMovieList));
    } else if (visibleMovieList.length === 0 && isAuthenticated) {
      localStorage.removeItem('streamlist_local_backup');
    }
  }, [visibleMovieList, isAuthenticated]);

  return (
    <div className="min-h-screen bg-stream-foam relative overflow-hidden">

      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        setMovieList={setMovieList}
        cart={cart}
      />

      <main className="max-w-6xl mx-auto relative z-10 p-8">
        <Outlet context={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, movieList: visibleMovieList, setMovieList, cart, setCart }} />
      </main>

      <div className="absolute bottom-0 left-0 w-[200%] flex z-0 opacity-40 pointer-events-none animate-[wave_15s_linear_infinite]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-1/2 h-32 text-stream-aqua">
          <path fill="currentColor" fillOpacity="0.3" d="M0,60 C150,90 450,30 600,60 C750,90 1050,30 1200,60 L1200,120 L0,120 Z"></path>
          <path fill="currentColor" fillOpacity="0.5" d="M0,75 C200,110 400,40 600,75 C800,110 1000,40 1200,75 L1200,120 L0,120 Z"></path>
          <path fill="currentColor" d="M0,90 C250,120 350,60 600,90 C850,120 950,60 1200,90 L1200,120 L0,120 Z"></path>
        </svg>

        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-1/2 h-32 text-stream-aqua">
          <path fill="currentColor" fillOpacity="0.3" d="M0,60 C150,90 450,30 600,60 C750,90 1050,30 1200,60 L1200,120 L0,120 Z"></path>
          <path fill="currentColor" fillOpacity="0.5" d="M0,75 C200,110 400,40 600,75 C800,110 1000,40 1200,75 L1200,120 L0,120 Z"></path>
          <path fill="currentColor" d="M0,90 C250,120 350,60 600,90 C850,120 950,60 1200,90 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

    </div>
  );
}