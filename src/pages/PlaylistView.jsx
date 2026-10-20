import React from 'react';
import { Play, Pause, Shuffle, Heart, MoreHorizontal } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SongTable } from '../components/SongTable';

export const PlaylistView = () => {
  const {
    songs,
    selectedPlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    toggleShuffle,
    isShuffle
  } = useMusic();

  if (!selectedPlaylist) return null;

  const playlistTracks = songs.filter(s => selectedPlaylist.trackIds.includes(s.id));
  const isPlaylistPlaying = isPlaying && playlistTracks.some(s => s.id === currentTrack?.id);

  return (
    <div className="view-content-wrapper" style={{ paddingTop: 16 }}>
      {/* 1. PLAYLIST HERO HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 28,
          padding: '60px 32px 28px 32px',
          background: `linear-gradient(180deg, ${selectedPlaylist.color || '#1ed760'}44 0%, rgba(18, 18, 18, 0) 100%)`,
          margin: '-16px -28px 24px -28px'
        }}
      >
        <img
          src={selectedPlaylist.cover}
          alt={selectedPlaylist.name}
          style={{
            width: 210,
            height: 210,
            borderRadius: 8,
            objectFit: 'cover',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            flexShrink: 0
          }}
        />

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Public Playlist
          </span>
          <h1 style={{ fontSize: '3.6rem', fontWeight: 900, letterSpacing: -1, margin: '6px 0', lineHeight: 1.1 }}>
            {selectedPlaylist.name}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', marginBottom: 12 }}>
            {selectedPlaylist.description}
          </p>
          <div style={{ color: 'var(--text-subdued)', fontSize: '0.9rem' }}>
            <strong style={{ color: '#ffffff' }}>{selectedPlaylist.curator || 'Vinix Music'}</strong> • {playlistTracks.length} songs
          </div>
        </div>
      </div>

      {/* 2. ACTIONS ROW */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        {playlistTracks.length > 0 && (
          <button
            className="player-play-circle-btn"
            style={{ width: 56, height: 56, background: '#1ed760' }}
            onClick={() => {
              if (isPlaylistPlaying) {
                togglePlay();
              } else {
                playTrack(playlistTracks[0], playlistTracks);
              }
            }}
            title={isPlaylistPlaying ? 'Pause' : 'Play'}
          >
            {isPlaylistPlaying ? (
              <Pause size={24} fill="#000" color="#000" />
            ) : (
              <Play size={24} fill="#000" color="#000" style={{ marginLeft: 3 }} />
            )}
          </button>
        )}

        <button
          className={`player-icon-btn ${isShuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
          title="Shuffle playlist"
        >
          <Shuffle size={24} />
        </button>

        <button
          className="table-icon-btn"
          title="Save to Your Library"
        >
          <Heart size={26} />
        </button>
      </div>

      {/* 3. TRACKS TABLE */}
      <section className="content-section">
        <SongTable tracks={playlistTracks} customQueue={playlistTracks} />
      </section>
    </div>
  );
};
