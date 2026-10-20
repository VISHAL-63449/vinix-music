import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, Heart, Share2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SongTable } from '../components/SongTable';

export const ArtistView = () => {
  const {
    songs,
    selectedArtist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay
  } = useMusic();

  const [isFollowing, setIsFollowing] = useState(false);

  if (!selectedArtist) return null;

  const artistTracks = songs.filter(s => s.artistId === selectedArtist.id || s.artist?.toLowerCase().includes(selectedArtist.name?.toLowerCase()));
  const isArtistPlaying = isPlaying && artistTracks.some(s => s.id === currentTrack?.id);

  // Group albums
  const albums = Array.from(new Set(artistTracks.map(s => s.album))).filter(Boolean);

  return (
    <div className="view-content-wrapper" style={{ paddingTop: 16 }}>
      {/* 1. CINEMATIC ARTIST HEADER */}
      <div className="artist-hero-header">
        {/* Background Image with Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${selectedArtist.banner || selectedArtist.image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 25%',
            filter: 'brightness(0.65)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(18,18,18,0.2) 0%, rgba(18,18,18,0.95) 100%)'
          }}
        />

        {/* Artist Header Info */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {selectedArtist.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>
              <CheckCircle2 size={18} fill="#38bdf8" color="#000" />
              <span style={{ color: '#fff' }}>Verified Artist</span>
            </div>
          )}

          <h1 className="artist-hero-title">
            {selectedArtist.name}
          </h1>

          <p className="artist-hero-listeners">
            {selectedArtist.monthlyListeners} monthly listeners
          </p>
        </div>
      </div>

      {/* 2. PLAY / FOLLOW ACTION BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {artistTracks.length > 0 && (
          <button
            className="player-play-circle-btn"
            style={{ width: 56, height: 56, background: '#1ed760' }}
            onClick={() => {
              if (isArtistPlaying) {
                togglePlay();
              } else {
                playTrack(artistTracks[0], artistTracks);
              }
            }}
            title={isArtistPlaying ? 'Pause' : 'Play'}
          >
            {isArtistPlaying ? (
              <Pause size={24} fill="#000" color="#000" />
            ) : (
              <Play size={24} fill="#000" color="#000" style={{ marginLeft: 3 }} />
            )}
          </button>
        )}

        <button
          className="hero-outline-btn"
          style={{ borderRadius: 9999, padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700 }}
          onClick={() => setIsFollowing(prev => !prev)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <button
          className="table-icon-btn"
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
          title="Share Artist"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* 3. POPULAR SONGS TABLE */}
      <section className="content-section">
        <h2 className="section-headline">Popular</h2>
        <SongTable tracks={artistTracks} customQueue={artistTracks} />
      </section>

      {/* 4. DISCOGRAPHY / ALBUMS */}
      {albums.length > 0 && (
        <section className="content-section">
          <h2 className="section-headline">Discography</h2>
          <div className="card-shelf-grid">
            {albums.map((albumName, idx) => {
              const albumTrack = artistTracks.find(s => s.album === albumName) || artistTracks[0];
              return (
                <div
                  key={idx}
                  className="music-card"
                  onClick={() => playTrack(albumTrack, artistTracks.filter(s => s.album === albumName))}
                >
                  <div className="card-image-wrap">
                    <img src={albumTrack.img} alt={albumName} className="card-cover-img" />
                    <button className="card-floating-play-btn">
                      <Play size={20} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                    </button>
                  </div>
                  <div>
                    <div className="card-title-text">{albumName}</div>
                    <div className="card-subtitle-text">{selectedArtist.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ABOUT THE ARTIST */}
      <section className="content-section">
        <h2 className="section-headline">About</h2>
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: 12,
            padding: 32,
            maxWidth: 720,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 12 }}>
            {selectedArtist.tagline || selectedArtist.name}
          </div>
          <p style={{ color: 'var(--text-subdued)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {selectedArtist.desc}
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedArtist.monthlyListeners}</div>
              <div style={{ color: 'var(--text-subdued)', fontSize: '0.8rem' }}>Monthly Listeners</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedArtist.followers.toLocaleString()}</div>
              <div style={{ color: 'var(--text-subdued)', fontSize: '0.8rem' }}>Followers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
