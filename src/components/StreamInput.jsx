import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function StreamInput() { 

  const { isAuthenticated } = useOutletContext();
  const [movieInput, setMovieInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!movieInput.trim()) return;
    console.log("New StreamList Item:", movieInput);
    setMovieInput('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      
      <h2 className="text-3xl font-bold text-[#001F3F] mb-2 flex items-center gap-2">
        {isAuthenticated ? 'My StreamList' : 'Discover StreamList'}
      </h2>
      
      <p className="text-gray-500 mb-6">
        {isAuthenticated 
          ? 'Build a custom stream and never run dry on what to watch next.' 
          : 'Search and see if your favorite movie could flow down your stream today.'}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input 
          type="text" 
          value={movieInput}
          onChange={(e) => setMovieInput(e.target.value)}
          placeholder={isAuthenticated ? "Add a movie to your stream..." : "Search for a movie..."}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        />
        <button 
          type="submit" 
          className="px-6 py-2 bg-[#00E5FF] text-[#001F3F] font-semibold rounded-lg hover:bg-[#00B3CC] transition-colors flex items-center gap-2"
        >
          {isAuthenticated ? '+ Add' : 'Search'}
        </button>
      </form>
      
    </div>
  );
}