import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function StreamInput() { 
  const { isAuthenticated, currentUser, movieList, setMovieList } = useOutletContext();
  const [movieInput, setMovieInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(null);
  const [editFormValue, setEditFormValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieInput.trim() || !currentUser) return;
    
    const newTitle = movieInput.trim();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/add-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, movie_title: newTitle })
      });
      
      if (response.ok) {
        setMovieList([...movieList, { title: newTitle, completed: false }]);
        setMovieInput(''); 
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const handleStartEdit = (movieTitle) => {
    setEditingTitle(movieTitle);
    setEditFormValue(movieTitle);
  };

  const handleSaveEdit = async (oldTitle) => {
    if (!editFormValue.trim() || editFormValue === oldTitle) {
      setEditingTitle(null);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/edit-movie', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUser.id, 
          old_title: oldTitle, 
          new_title: editFormValue.trim() 
        })
      });

      if (response.ok) {
        setMovieList(movieList.map(movie => 
          movie.title === oldTitle ? { ...movie, title: editFormValue.trim() } : movie
        ));
        setEditingTitle(null);
      }
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  const handleToggleComplete = async (movie) => {
    if (!currentUser) return;
    
    const newStatus = !movie.completed;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/toggle-complete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: currentUser.id, 
          movie_title: movie.title,
          completed: newStatus
        })
      });

      if (response.ok) {
        setMovieList(movieList.map(m => 
          m.title === movie.title ? { ...m, completed: newStatus } : m
        ));
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleRemoveFromList = async (movieTitle) => {
    if (!currentUser) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/remove-movie', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, movie_title: movieTitle })
      });

      if (response.ok) {
        setMovieList((prevList) => prevList.filter((movie) => movie.title !== movieTitle));
      }
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-3xl font-bold text-stream-deep mb-2 flex items-center gap-2">
        <span className="material-symbols-rounded text-stream-aqua">water_drop</span>
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
          placeholder="Add a movie to your stream..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stream-aqua"
        />
        <button type="submit" className="px-6 py-2 bg-stream-aqua text-stream-deep font-semibold rounded-lg hover:bg-stream-aqua/80 transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-rounded">add</span> Add
        </button>
      </form>
      
      {movieList && movieList.length > 0 ? (
        <ul className="space-y-3">
          {movieList.map((movie, index) => {
            const isEditing = editingTitle === movie.title;

            return (
              <li key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm transition-all">
                
                <div className="flex items-center gap-3 flex-1">
                  <button 
                    onClick={() => handleToggleComplete(movie)}
                    className={`transition-colors flex items-center ${movie.completed ? 'text-green-500' : 'text-gray-400 hover:text-stream-aqua'}`}
                  >
                    <span className="material-symbols-rounded">
                      {movie.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>

                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editFormValue}
                      onChange={(e) => setEditFormValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-stream-aqua rounded focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className={`text-stream-deep font-medium transition-all ${movie.completed ? 'line-through text-gray-400' : ''}`}>
                      {movie.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {isEditing ? (
                    <button onClick={() => handleSaveEdit(movie.title)} className="text-stream-aqua hover:text-blue-600 transition-colors flex items-center">
                      <span className="material-symbols-rounded text-xl">save</span>
                    </button>
                  ) : (
                    <button onClick={() => handleStartEdit(movie.title)} className="text-gray-400 hover:text-amber-500 transition-colors flex items-center">
                      <span className="material-symbols-rounded text-xl">edit</span>
                    </button>
                  )}
                  <button onClick={() => handleRemoveFromList(movie.title)} className="text-gray-400 hover:text-red-500 transition-colors flex items-center">
                    <span className="material-symbols-rounded text-xl">delete</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-400 italic mt-8">Your stream is empty.</p>
      )}
    </div>
  );
}