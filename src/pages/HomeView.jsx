import React from 'react';
import { Play, Pause, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SongTable } from '../components/SongTable';

export const HomeView = () => {
  const {
    songs,
    artists,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    navigateToArtist,
    navigateToPlaylist,
    user
  } = useMusic();

  const spotlightArtist = artists[0]; // Anirudh Ravichander
  const spotlightTopTrack = songs.find(s => s.artistId === spotlightArtist.id) || songs[0];

  // Quick 6 mixes
  const quickMixTracks = songs.slice(0, 6);

  // Trending songs
  const trendingTracks = songs.slice(0, 10);

  const isSpotlightPlaying = isPlaying && currentTrack?.artistId === spotlightArtist.id;

  return (
    <div className="view-content-wrapper">
      {/* 1. HERO SPOTLIGHT BANNER */}
      <section id="section-hero" className="hero-spotlight-banner">
        <div className="hero-banner-glow" />
        <div className="hero-info-side">
          <div className="hero-badge-tag">
            <Sparkles size={13} />
            <span>Artist Spotlight</span>
          </div>
          <h1 className="hero-artist-name">{spotlightArtist.name}</h1>
          <p className="hero-artist-desc desktop-only">{spotlightArtist.desc}</p>

          <div className="hero-stats-row">
            <div>
              <strong className="stat-number">{spotlightArtist.monthlyListeners}</strong>
              <span className="stat-label">Monthly Listeners</span>
            </div>
            <div className="desktop-only">
              <strong className="stat-number">{spotlightArtist.followers}</strong>
              <span className="stat-label">Followers</span>
            </div>
          </div>

          <div className="hero-actions-row">
            <button
              className="hero-play-btn"
              onClick={() => {
                if (isSpotlightPlaying) {
                  togglePlay();
                } else {
                  playTrack(spotlightTopTrack, songs.filter(s => s.artistId === spotlightArtist.id));
                }
              }}
            >
              {isSpotlightPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" />}
              <span>{isSpotlightPlaying ? 'Pause' : 'Play Hits'}</span>
            </button>

            <button
              className="hero-outline-btn desktop-only"
              onClick={() => navigateToArtist(spotlightArtist)}
            >
              Explore Discography
            </button>
          </div>
        </div>

        <div className="hero-visual-side">
          <img
            src={spotlightArtist.image}
            alt={spotlightArtist.name}
            className="hero-artist-cover"
          />
        </div>
      </section>

      {/* 2. QUICK MIX 6-BOX GRID */}
      <section id="section-quick-mix" className="quick-mix-section">
        <h2 className="section-headline">Good evening, {user ? user.name : 'vishal'}</h2>
        <div className="quick-mix-grid">
          {quickMixTracks.map(track => {
            const isThisPlaying = isPlaying && currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className="quick-card"
                onClick={() => playTrack(track, songs)}
              >
                <img src={track.img} alt={track.title} className="quick-card-img" />
                <div className="quick-card-title">{track.title}</div>
                <button
                  className="quick-card-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisPlaying) {
                      togglePlay();
                    } else {
                      playTrack(track, songs);
                    }
                  }}
                  title={isThisPlaying ? 'Pause' : 'Play'}
                >
                  {isThisPlaying ? (
                    <Pause size={18} fill="#000" color="#000" />
                  ) : (
                    <Play size={18} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2.5 NEW RELEASES & FRESH DROPS (Mobile Swipeable Shelf) */}
      <section id="section-fresh-drops" className="content-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-headline">🔥 Newly Added & Fresh Drops</h2>
            <p style={{ color: 'var(--text-subdued)', fontSize: '0.82rem', marginTop: 3 }}>
              Freshly uploaded songs with official covers
            </p>
          </div>
        </div>
        <div className="card-shelf-grid scrollable-shelf">
          {songs.filter(s => s.isNew).map(track => (
            <div
              key={track.id}
              className="music-card compact-card"
              onClick={() => playTrack(track, songs)}
            >
              <div className="card-image-wrap">
                <img src={track.img} alt={track.title} className="card-cover-img" />
                <button
                  className="card-floating-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track, songs);
                  }}
                  title={`Play ${track.title}`}
                >
                  <Play size={18} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                </button>
              </div>
              <div>
                <div className="card-title-text">{track.title}</div>
                <div className="card-subtitle-text">{track.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED ARTISTS SHELF */}
      <section id="section-artists" className="content-section">
        <div className="section-header-row">
          <h2 className="section-headline">Popular Artists</h2>
        </div>
        <div className="card-shelf-grid scrollable-shelf">
          {artists.map(artist => (
            <div
              key={artist.id}
              className="music-card compact-card artist-shelf-card"
              onClick={() => navigateToArtist(artist)}
              title={`View ${artist.name}'s Discography & Playlist`}
            >
              <div className="card-image-wrap round">
                <img src={artist.image} alt={artist.name} className="card-cover-img" />
                <button
                  className="card-floating-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artistSongs = songs.filter(s => s.artistId === artist.id);
                    if (artistSongs.length > 0) {
                      playTrack(artistSongs[0], artistSongs);
                    }
                  }}
                  title={`Play ${artist.name}`}
                >
                  <Play size={18} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                </button>
              </div>
              <div className="artist-card-info">
                <div className="artist-card-name-row">
                  <span className="artist-name-text">{artist.name}</span>
                  {artist.verified && <CheckCircle2 size={13} className="artist-verified-badge" />}
                </div>
                <div className="card-subtitle-text">Artist</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MADE FOR YOU PLAYLISTS */}
      <section className="content-section">
        <div className="section-header-row">
          <h2 className="section-headline">Made For You</h2>
        </div>
        <div className="card-shelf-grid scrollable-shelf">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="music-card compact-card"
              onClick={() => navigateToPlaylist(pl)}
            >
              <div className="card-image-wrap">
                <img src={pl.cover} alt={pl.name} className="card-cover-img" />
                <button
                  className="card-floating-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const plTracks = songs.filter(s => pl.trackIds.includes(s.id));
                    if (plTracks.length > 0) {
                      playTrack(plTracks[0], plTracks);
                    }
                  }}
                  title={`Play ${pl.name}`}
                >
                  <Play size={18} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                </button>
              </div>
              <div>
                <div className="card-title-text">{pl.name}</div>
                <div className="card-subtitle-text">{pl.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TODAY'S TRENDING TRACKS TABLE */}
      <section className="content-section">
        <div className="section-header-row">
          <h2 className="section-headline">Trending Now on Vinix Music</h2>
        </div>
        <SongTable tracks={trendingTracks} customQueue={songs} />
      </section>
    </div>
  );
};
