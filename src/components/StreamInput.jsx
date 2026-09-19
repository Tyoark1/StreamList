import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function StreamInput() { 
  const { isAuthenticated, currentUser, movieList, setMovieList } = useOutletContext();
  const [movieInput, setMovieInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!movieInput.trim()) return;
    
    setMovieList([...movieList, movieInput.trim()]);
    setMovieInput('');
  };

  const handleRemoveFromList = async (movieTitle) => {
      if (!currentUser) return;

      try {
        const response = await fetch('http://127.0.0.1:8000/api/remove-movie', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            movie_title: movieTitle
          })
        });

        if (!response.ok) {
          throw new Error("Failed to delete from database");
        }

        setMovieList((prevList) => prevList.filter((title) => title !== movieTitle));
        
      } catch (error) {
        console.error("Error removing movie:", error);
        alert("There was an error removing this movie. Please try again.");
      }
    };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      
      <h2 className="text-3xl font-bold text-stream-deep mb-2 flex items-center gap-2">
        My StreamList
      </h2>
      
      <p className="text-gray-500 mb-6">
        Build a custom stream and never run dry on what to watch next.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={movieInput}
          onChange={(e) => setMovieInput(e.target.value)}
          placeholder="Filter your stream or add a movie..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stream-aqua"
        />
        <button 
          type="submit" 
          className="px-6 py-2 bg-stream-aqua text-stream-deep font-semibold rounded-lg hover:bg-stream-aqua/80 transition-colors flex items-center gap-2"
        >
          + Add
        </button>
      </form>
      
      {movieList && movieList.length > 0 && (
        <ul className="space-y-3">
          {movieList.map((movie, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="text-stream-deep font-medium">{movie}</span>
              <button 
                onClick={() => handleRemoveFromList(movie)}
                className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors flex items-center gap-1"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      
    </div>
  );
}