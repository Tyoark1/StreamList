import { NavLink, useNavigate, Link } from 'react-router-dom';

export default function Navbar({ isAuthenticated, setIsAuthenticated, setMovieList }) {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => 
    isActive 
      ? "text-stream-aqua font-bold flex items-center gap-1" 
      : "text-stream-foam hover:text-stream-aqua transition-colors flex items-center gap-1";

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setMovieList([]);
    console.log("User signed out and list cleared");
    navigate('/login');
  };
  
  return (
    <nav className="bg-stream-deep p-4 shadow-md relative z-20">
      <div className="w-full px-8 flex justify-between items-center">
        
        <div className="text-stream-foam font-extrabold text-2xl flex items-center gap-2">
          <span className="material-symbols-rounded text-stream-aqua text-3xl">water_drop</span>
          StreamList
        </div>

        <div className="flex gap-6 items-center">
          <NavLink to="/" className={linkClass}>
            <span className="material-symbols-rounded">list_alt</span> List
          </NavLink>
          <NavLink to="/movies" className={linkClass}>
            <span className="material-symbols-rounded">movie</span> Movies
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            <span className="material-symbols-rounded">shopping_cart</span> Cart
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            <span className="material-symbols-rounded">info</span> About
          </NavLink>

          <div className="w-px h-6 bg-stream-foam/20 mx-2"></div>

          {isAuthenticated ? (
            <>
              <NavLink to="/account" className={linkClass}>
                <span className="material-symbols-rounded">manage_accounts</span> Account
              </NavLink>
              <button 
                onClick={handleSignOut}
                className="text-stream-foam hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-rounded">logout</span> Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink 
                to="/login" 
                className="text-stream-foam hover:text-stream-aqua transition-colors font-semibold flex items-center gap-1"
              >
                Sign In
              </NavLink>
              <NavLink 
                to="/register" 
                className="bg-stream-aqua hover:bg-stream-aqua/80 text-stream-deep font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-rounded">person_add</span> Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}