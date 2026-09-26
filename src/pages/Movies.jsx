import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Movies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  
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

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie); 

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits,watch/providers`);
      
      if (response.ok) {
        const detailedData = await response.json();
        setSelectedMovie(detailedData);
      }
    } catch (error) {
      console.error("Error fetching advanced movie details:", error);
    }
  };

  const handleAddToList = async (movieTitle) => {
    const isAlreadyInList = movieList?.some(movie => typeof movie === 'string' ? movie === movieTitle : movie.title === movieTitle);
    
    if (isAlreadyInList) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, movie_title: movieTitle })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setSelectedMovie(null);
      
      setMovieList([...(movieList || []), { title: movieTitle, completed: false }]);
      alert(`${movieTitle} added to your StreamList!`);
      
    } catch (error) {
      console.error("Error saving this movie to the database:", error);
      alert("There was an error saving this movie. Please try again.");
    }
  };

  const formatReleaseDate = (dateString) => {
      if (!dateString) return 'Unknown';
      
      const [year, month, day] = dateString.split('-');
      
      const date = new Date(year, month - 1, day);
      
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      
      return `${weekday}, ${monthName} ${day}, ${year}`;
    };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px] relative">
      
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
                onClick={() => handleMovieClick(movie)}
                className="w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 group-hover:ring-stream-aqua"
              />
            ) : (
              <div 
                onClick={() => handleMovieClick(movie)}
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

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col md:flex-row overflow-hidden relative">
            
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-10"
            >
              <span className="material-symbols-rounded text-3xl">close</span>
            </button>

            <div className="w-full md:w-1/2 bg-gray-100 flex-shrink-0">
               {selectedMovie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`} 
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
               ) : (
                 <div className="w-full h-64 md:h-full flex items-center justify-center text-gray-400">
                    No Poster
                 </div>
               )}
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stream-deep mb-2">{selectedMovie.title}</h3>
                <p className="text-sm text-gray-500 mb-4 font-bold">Released: {formatReleaseDate(selectedMovie.release_date)}</p>
                
                {selectedMovie.credits?.cast?.length > 0 && (
                  <p className="text-sm text-gray-800 mb-2">
                    <span className="font-bold text-stream-deep">Starring: </span> 
                    {selectedMovie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ')}
                  </p>
                )}

                {selectedMovie['watch/providers']?.results?.US?.flatrate && (
                  <p className="text-sm text-gray-800 mb-4">
                    <span className="font-bold text-stream-deep">Stream On: </span> 
                    {selectedMovie['watch/providers'].results.US.flatrate.map(provider => provider.provider_name).join(', ')}
                  </p>
                )}

                <div className="max-h-40 overflow-y-auto mb-6 pr-2 mt-4 border-t border-gray-100 pt-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedMovie.overview || 'No description available.'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleAddToList(selectedMovie.title)}
                className="w-full py-3 bg-stream-aqua text-stream-deep font-bold rounded-lg hover:bg-stream-aqua/80 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded">add_circle</span>
                Add to StreamList
              </button>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
}