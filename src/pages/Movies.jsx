import { useState } from 'react';

export default function Movies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

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

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
      <h2 className="text-3xl font-bold text-[#001F3F] mb-6 flex items-center gap-2">
        <span className="material-symbols-rounded text-[#00E5FF]">movie</span>
        Movie Database
      </h2>

      <form onSubmit={searchMovies} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search TMDB for a movie..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        />
        <button type="submit" className="px-6 py-2 bg-[#001F3F] text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
          Search
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {results.map((movie) => (
          <div key={movie.id} className="flex flex-col items-center text-center">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                alt={movie.title} 
                className="rounded-lg shadow-sm mb-2"
              />
            ) : (
              <div className="w-[200px] h-[300px] bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                No Image
              </div>
            )}
            <span className="font-semibold text-gray-800 text-sm">{movie.title}</span>
            <span className="text-xs text-gray-500">{movie.release_date?.substring(0, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}