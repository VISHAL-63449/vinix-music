import React from 'react';
import { Home, Search, Library, Activity } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab, rightPanel, setRightPanel } = useMusic();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        className={`mobile-nav-btn ${activeTab === 'home' && rightPanel !== 'visualizer' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('home');
          if (rightPanel === 'visualizer') setRightPanel('closed');
        }}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('search');
          if (rightPanel === 'visualizer') setRightPanel('closed');
        }}
      >
        <Search size={22} />
        <span>Search</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'library' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('library');
          if (rightPanel === 'visualizer') setRightPanel('closed');
        }}
      >
        <Library size={22} />
        <span>Your Library</span>
      </button>

      <button
        className={`mobile-nav-btn ${rightPanel === 'visualizer' ? 'active' : ''}`}
        onClick={() => setRightPanel(rightPanel === 'visualizer' ? 'closed' : 'visualizer')}
      >
        <Activity size={22} />
        <span>Visualizer</span>
      </button>
    </nav>
  );
};
