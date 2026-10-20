import React from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { GENRES } from '../data/musicData';
import { SongTable } from '../components/SongTable';

export const SearchView = () => {
  const {
    songs,
    artists,
    searchQuery,
    setSearchQuery,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    navigateToArtist,
    navigateToGenre
  } = useMusic();

  const query = searchQuery.trim().toLowerCase();

  const filteredSongs = query
    ? songs.filter(
        s =>
          s.title.toLowerCase().includes(query) ||
          s.artist.toLowerCase().includes(query) ||
          s.album.toLowerCase().includes(query) ||
          s.genre.toLowerCase().includes(query)
      )
    : [];

  const filteredArtists = query
    ? artists.filter(
        a =>
          a.name.toLowerCase().includes(query) ||
          a.genres.some(g => g.toLowerCase().includes(query))
      )
    : [];

  const topSongResult = filteredSongs[0];
  const isTopSongPlaying = isPlaying && currentTrack?.id === topSongResult?.id;

  return (
    <div className="view-content-wrapper">
      {query ? (
        <>
          {filteredSongs.length > 0 || filteredArtists.length > 0 ? (
            <>
              {/* TOP RESULT & SONGS SPLIT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24 }}>
                {/* Top Result Card */}
                {topSongResult && (
                  <div>
                    <h2 className="section-headline" style={{ marginBottom: 16 }}>Top Result</h2>
                    <div
                      className="music-card"
                      style={{ padding: 24, height: 'auto', background: 'var(--bg-elevated)' }}
                      onClick={() => playTrack(topSongResult, filteredSongs)}
                    >
                      <img
                        src={topSongResult.img}
                        alt={topSongResult.title}
                        style={{ width: 92, height: 92, borderRadius: 8, objectFit: 'cover', marginBottom: 12 }}
                      />
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{topSongResult.title}</h3>
                      <p style={{ color: 'var(--text-subdued)', fontSize: '0.9rem', marginTop: 4 }}>
                        Song • <span style={{ color: '#fff', fontWeight: 600 }}>{topSongResult.artist}</span>
                      </p>
                      <button
                        className="card-floating-play-btn"
                        style={{ position: 'relative', marginTop: 16, opacity: 1, transform: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTopSongPlaying) {
                            togglePlay();
                          } else {
                            playTrack(topSongResult, filteredSongs);
                          }
                        }}
                      >
                        {isTopSongPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: 2 }} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Top 4 Matching Songs */}
                <div>
                  <h2 className="section-headline" style={{ marginBottom: 16 }}>Songs</h2>
                  <SongTable tracks={filteredSongs.slice(0, 5)} customQueue={filteredSongs} />
                </div>
              </div>

              {/* Matching Artists */}
              {filteredArtists.length > 0 && (
                <section className="content-section">
                  <h2 className="section-headline">Artists</h2>
                  <div className="card-shelf-grid">
                    {filteredArtists.map(artist => (
                      <div
                        key={artist.id}
                        className="music-card"
                        onClick={() => navigateToArtist(artist)}
                      >
                        <div className="card-image-wrap round">
                          <img src={artist.image} alt={artist.name} className="card-cover-img" />
                        </div>
                        <div>
                          <div className="card-title-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{artist.name}</span>
                            {artist.verified && <CheckCircle2 size={14} color="#38bdf8" fill="#38bdf8" />}
                          </div>
                          <div className="card-subtitle-text">Artist</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Song Matches */}
              {filteredSongs.length > 5 && (
                <section className="content-section">
                  <h2 className="section-headline">All Results for "{searchQuery}"</h2>
                  <SongTable tracks={filteredSongs} customQueue={filteredSongs} />
                </section>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No results found for "{searchQuery}"</h3>
              <p style={{ color: 'var(--text-subdued)', marginTop: 8 }}>
                Please make sure your words are spelled correctly, or try searching for another artist or song.
              </p>
            </div>
          )}
        </>
      ) : (
        /* BROWSE ALL GENRES & MOODS (Spotify Style) */
        <section className="content-section">
          <h2 className="section-headline">Browse All</h2>
          <div className="genres-grid">
            {GENRES.map(genre => (
              <div
                key={genre.id}
                className="genre-card"
                style={{ backgroundColor: genre.color }}
                onClick={() => navigateToGenre(genre)}
              >
                <h3 className="genre-card-title">{genre.name}</h3>
                <img src={genre.img} alt={genre.name} className="genre-card-img" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
