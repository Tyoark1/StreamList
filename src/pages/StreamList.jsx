import StreamInput from '../components/StreamInput';

export default function StreamList() {
  return (
    <div className="p-8 max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-sm border border-stream-deep/10">
      <h1 className="text-3xl font-extrabold text-stream-deep flex items-center gap-2">
        <span className="material-symbols-rounded text-stream-aqua text-4xl">format_list_bulleted</span>
        My StreamList
      </h1>
      <p className="mt-2 text-stream-deep/70 font-medium">
        Build a custom stream and never run dry on what to watch next.
      </p>
      
      <StreamInput />
    </div>
  );
}