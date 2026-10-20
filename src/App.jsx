import React from 'react';
import { useMusic } from './context/MusicContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { RightPanel } from './components/RightPanel';
import { LyricsModal } from './components/LyricsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileFullPlayer } from './components/MobileFullPlayer';
import { HomeView } from './pages/HomeView';
import { SearchView } from './pages/SearchView';
import { LibraryView } from './pages/LibraryView';
import { ArtistView } from './pages/ArtistView';
import { PlaylistView } from './pages/PlaylistView';

export function AppContent() {
  const { activeTab, ambientColor } = useMusic();

  return (
    <div
      className="app-layout"
      style={{
        '--ambient-color': ambientColor || '#1ed760'
      }}
    >
      <div className="app-main-body">
        {/* Left Navigation Sidebar (Desktop) */}
        <Sidebar />

        {/* Center Main Scroll Container */}
        <main className="center-content-panel">
          <TopBar />

          <div className="main-view-scroll">
            {/* Ambient Dynamic Header Bloom */}
            <div className="ambient-gradient-header" />

            {/* Active View */}
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'search' && <SearchView />}
            {activeTab === 'library' && <LibraryView />}
            {activeTab === 'artist' && <ArtistView />}
            {activeTab === 'playlist' && <PlaylistView />}
          </div>
        </main>

        {/* Right Collapsible Panel (Desktop) */}
        <RightPanel />
      </div>

      {/* Persistent Bottom Player Bar & Mobile Mini Player */}
      <PlayerBar />

      {/* Spotify Mobile Bottom Navigation Bar (Mobile only) */}
      <MobileBottomNav />

      {/* Fullscreen Mobile Now Playing Screen */}
      <MobileFullPlayer />

      {/* Synchronized Lyrics Fullscreen Modal */}
      <LyricsModal />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
