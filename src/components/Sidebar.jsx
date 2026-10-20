import React, { useState } from 'react';
import { Home, Search, Library, Plus, Heart, Music2, Mic2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    playlists,
    artists,
    favorites,
    selectedPlaylist,
    selectedArtist,
    navigateToPlaylist,
    navigateToArtist,
    createPlaylist
  } = useMusic();

  const [libraryFilter, setLibraryFilter] = useState('all'); // 'all' | 'playlists' | 'artists'

  const handleCreatePlaylist = () => {
    const name = prompt("Enter new playlist name:", `My Playlist #${playlists.length + 1}`);
    if (name) {
      createPlaylist(name);
    }
  };

  return (
    <aside className="left-sidebar" aria-label="Main Navigation">
      {/* Brand & Main Navigation Box */}
      <div className="sidebar-box sidebar-nav-box">
        <div
          className="brand-header"
          title="Vinix Music — Home"
          onClick={() => {
            setActiveTab('home');
            const mainScroll = document.querySelector('.main-view-scroll');
            if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="./vinix-logo.png" alt="Vinix Music Logo" className="brand-logo-img" />
          <img src="./vinix-title-transparent.png" alt="Vinix Music" className="brand-title-text-img" />
          <span className="brand-badge">PRO</span>
        </div>

        <nav>
          <ul className="nav-links-list">
            <li>
              <button
                className={`nav-item-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                <Home size={22} />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item-btn ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                <Search size={22} />
                <span>Search</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Library Box */}
      <div className="sidebar-box sidebar-library-box">
        <div className="library-header">
          <button
            className="library-title-btn"
            onClick={() => setActiveTab('library')}
            title="Expand Your Library"
          >
            <Library size={22} />
            <span>Your Library</span>
          </button>
          <button
            className="create-pl-btn"
            onClick={handleCreatePlaylist}
            title="Create playlist"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Library Category Filters */}
        <div className="library-filters-row">
          <button
            className={`filter-chip ${libraryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setLibraryFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-chip ${libraryFilter === 'playlists' ? 'active' : ''}`}
            onClick={() => setLibraryFilter('playlists')}
          >
            Playlists
          </button>
          <button
            className={`filter-chip ${libraryFilter === 'artists' ? 'active' : ''}`}
            onClick={() => setLibraryFilter('artists')}
          >
            Artists
          </button>
        </div>

        {/* Library Items Scroll list */}
        <div className="library-items-scroll">
          {/* Liked Songs Pinned Item */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists') && (
            <button
              className={`library-item-row ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Heart size={20} fill="#ffffff" color="#ffffff" />
              </div>
              <div className="library-item-info">
                <div className="library-item-title">Liked Songs</div>
                <div className="library-item-subtitle">Playlist • {favorites.length} songs</div>
              </div>
            </button>
          )}

          {/* Playlists */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists') &&
            playlists.map(pl => {
              const isSelected = activeTab === 'playlist' && selectedPlaylist?.id === pl.id;
              return (
                <button
                  key={pl.id}
                  className={`library-item-row ${isSelected ? 'active' : ''}`}
                  onClick={() => navigateToPlaylist(pl)}
                >
                  <img src={pl.cover} alt={pl.name} className="library-item-img" />
                  <div className="library-item-info">
                    <div className="library-item-title">{pl.name}</div>
                    <div className="library-item-subtitle">Playlist • {pl.curator}</div>
                  </div>
                </button>
              );
            })}

          {/* Artists */}
          {(libraryFilter === 'all' || libraryFilter === 'artists') &&
            artists.map(art => {
              const isSelected = activeTab === 'artist' && selectedArtist?.id === art.id;
              return (
                <button
                  key={art.id}
                  className={`library-item-row ${isSelected ? 'active' : ''}`}
                  onClick={() => navigateToArtist(art)}
                >
                  <img src={art.image} alt={art.name} className="library-item-img round" />
                  <div className="library-item-info">
                    <div className="library-item-title">{art.name}</div>
                    <div className="library-item-subtitle">Artist</div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </aside>
  );
};
