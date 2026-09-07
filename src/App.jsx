import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="min-h-screen bg-stream-foam relative overflow-hidden">
      <Navbar />
      
      <main className="max-w-6xl mx-auto relative z-10">
        <Outlet />
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