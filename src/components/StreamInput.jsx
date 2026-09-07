import { useState } from 'react';

export default function StreamInput() {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    console.log("New StreamList Item:", inputValue);

    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-6">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a movie or show to your stream..."
        className="flex-1 p-3 rounded-lg border border-stream-deep/20 focus:outline-none focus:ring-2 focus:ring-stream-aqua bg-white text-stream-deep shadow-sm"
      />
      <button
        type="submit"
        className="bg-stream-aqua hover:bg-stream-aqua/80 text-stream-deep font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
      >
        <span className="material-symbols-rounded">add</span>
        Add
      </button>
    </form>
  );
}