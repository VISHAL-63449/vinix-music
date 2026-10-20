import React from 'react';
import { Heart, Play, Pause, Plus } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SongTable } from '../components/SongTable';

export const LibraryView = () => {
  const {
    songs,
    favorites,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    createPlaylist,
    navigateToPlaylist
  } = useMusic();

  const favoriteSongs = songs.filter(s => favorites.includes(s.id));
  const isFavoritesPlaying = isPlaying && favoriteSongs.some(s => s.id === currentTrack?.id);

  const handleCreatePlaylist = () => {
    const name = prompt("Enter new playlist name:", `My Playlist #${playlists.length + 1}`);
    if (name) {
      createPlaylist(name);
    }
  };

  return (
    <div className="view-content-wrapper">
      {/* 1. HERO LIKED SONGS HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 28,
          padding: '24px 0',
          background: 'linear-gradient(180deg, rgba(80, 56, 160, 0.6) 0%, rgba(18, 18, 18, 0) 100%)',
          borderRadius: 12
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #450af5, #c4efd9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
            flexShrink: 0
          }}
        >
          <Heart size={80} fill="#ffffff" color="#ffffff" />
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Playlist
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: -1, margin: '8px 0' }}>
            Liked Songs
          </h1>
          <p style={{ color: 'var(--text-subdued)', fontSize: '0.95rem' }}>
            <strong style={{ color: '#ffffff' }}>vishal</strong> • {favoriteSongs.length} songs
          </p>

          {favoriteSongs.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <button
                className="hero-play-btn"
                onClick={() => {
                  if (isFavoritesPlaying) {
                    togglePlay();
                  } else {
                    playTrack(favoriteSongs[0], favoriteSongs);
                  }
                }}
              >
                {isFavoritesPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" />}
                <span>{isFavoritesPlaying ? 'Pause' : 'Play Liked Songs'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. FAVORITES TABLE */}
      {favoriteSongs.length > 0 ? (
        <section className="content-section">
          <SongTable tracks={favoriteSongs} customQueue={favoriteSongs} />
        </section>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-subdued)' }}>
          <p style={{ fontSize: '1.1rem' }}>Songs you like will appear here.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Save songs by clicking the heart icon on any track.</p>
        </div>
      )}

      {/* 3. YOUR PLAYLISTS */}
      <section className="content-section" style={{ marginTop: 20 }}>
        <div className="section-header-row">
          <h2 className="section-headline">Your Playlists</h2>
          <button
            className="pill-action-btn"
            onClick={handleCreatePlaylist}
          >
            <Plus size={16} />
            <span>New Playlist</span>
          </button>
        </div>

        <div className="card-shelf-grid">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="music-card"
              onClick={() => navigateToPlaylist(pl)}
            >
              <div className="card-image-wrap">
                <img src={pl.cover} alt={pl.name} className="card-cover-img" />
              </div>
              <div>
                <div className="card-title-text">{pl.name}</div>
                <div className="card-subtitle-text">{pl.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
