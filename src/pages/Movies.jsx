import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Movies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const { movieList, setMovieList, currentUser } = useOutletContext();

  const searchMovies = async (e) => {
    e.preventDefault();
    if (!query) return;

    const apiKey = import.meta.env.VITE_TMDB_API_KEY; 
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=en-US&page=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddToList = async (movieTitle) => {
    if (movieList && movieList.includes(movieTitle)) {
      alert(`${movieTitle} is already in your list!`);
      return;
    }

    if (!currentUser) {
      alert("Please log in to save movies to your list.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/add-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          movie_title: movieTitle
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMovieList([...(movieList || []), movieTitle]);
      alert(`${movieTitle} added to your StreamList!`);
      
    } catch (error) {
      console.error("There was an error saving this movie to the database:", error);
      alert("There was an error saving this movie. Please try again.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
      
      <h2 className="text-3xl font-bold text-stream-deep mb-6 flex items-center gap-2">
        <span className="material-symbols-rounded text-stream-aqua">movie</span>
        Movie Database
      </h2>

      <form onSubmit={searchMovies} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the database for your must-watch movies."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stream-aqua"
        />
        <button type="submit" className="px-6 py-2 bg-stream-deep text-white font-semibold rounded-lg hover:bg-stream-deep/80 transition-colors">
          Search
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((movie) => (
          <div key={movie.id} className="relative group">
            
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                onClick={() => handleAddToList(movie.title)}
                className="w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 group-hover:ring-stream-aqua"
              />
            ) : (
              <div 
                onClick={() => handleAddToList(movie.title)}
                className="w-full h-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 group-hover:ring-stream-aqua"
              >
                <span className="text-gray-400 text-sm p-4 text-center">No Poster Available</span>
              </div>
            )}
            
            <p className="mt-2 text-center text-sm font-semibold text-stream-deep">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}