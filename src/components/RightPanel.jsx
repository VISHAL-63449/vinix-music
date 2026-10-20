import React from 'react';
import { X, Heart, ListMusic, Activity, Mic2, Disc, Play } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { AudioVisualizer } from './AudioVisualizer';
import { SAMPLE_LYRICS } from '../data/musicData';

export const RightPanel = () => {
  const {
    currentTrack,
    artists,
    queue,
    queueIndex,
    rightPanel,
    setRightPanel,
    toggleFavorite,
    isFavorite,
    playTrack,
    navigateToArtist,
    currentTime,
    setIsLyricsModalOpen
  } = useMusic();

  if (rightPanel === 'closed') return null;

  const currentArtistObj = artists.find(
    a => a.id === currentTrack?.artistId || a.name.toLowerCase() === currentTrack?.artist.toLowerCase()
  );

  const upcomingQueue = queue.slice(queueIndex + 1, queueIndex + 8);
  const lyricsList = currentTrack?.id ? SAMPLE_LYRICS[currentTrack.id] : null;

  return (
    <aside className="right-sidebar-panel" aria-label="Now Playing View">
      {/* Header with View Tabs & Close */}
      <div className="right-panel-header">
        <div className="right-panel-tabs">
          <button
            className={`right-tab-btn ${rightPanel === 'nowPlaying' ? 'active' : ''}`}
            onClick={() => setRightPanel('nowPlaying')}
          >
            Now Playing
          </button>
          <button
            className={`right-tab-btn ${rightPanel === 'queue' ? 'active' : ''}`}
            onClick={() => setRightPanel('queue')}
          >
            Queue
          </button>
          <button
            className={`right-tab-btn ${rightPanel === 'visualizer' ? 'active' : ''}`}
            onClick={() => setRightPanel('visualizer')}
          >
            Visualizer
          </button>
        </div>

        <button
          className="table-icon-btn"
          onClick={() => setRightPanel('closed')}
          title="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="right-panel-content">
        {/* TAB 1: NOW PLAYING */}
        {rightPanel === 'nowPlaying' && (
          <>
            {/* Big Artwork */}
            <div className="now-playing-cover-box">
              <img
                src={currentTrack?.img}
                alt={currentTrack?.title}
                className="now-playing-cover-img"
              />
            </div>

            {/* Track Info & Like */}
            <div className="now-playing-info-row">
              <div>
                <h3 className="np-track-name">{currentTrack?.title}</h3>
                <p
                  className="np-artist-name"
                  style={{ cursor: 'pointer' }}
                  onClick={() => currentArtistObj && navigateToArtist(currentArtistObj)}
                >
                  {currentTrack?.artist}
                </p>
              </div>
              <button
                className={`table-icon-btn ${isFavorite(currentTrack?.id) ? 'liked' : ''}`}
                onClick={() => toggleFavorite(currentTrack?.id)}
              >
                <Heart
                  size={22}
                  fill={isFavorite(currentTrack?.id) ? '#1ed760' : 'none'}
                  color={isFavorite(currentTrack?.id) ? '#1ed760' : 'currentColor'}
                />
              </button>
            </div>

            {/* Mini Audio Visualizer preview */}
            <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', color: 'var(--text-subdued)' }}>
                <span>Live Audio Wave</span>
                <span style={{ color: '#1ed760', fontWeight: 700 }}>24-BIT FLAC</span>
              </div>
              <AudioVisualizer height={70} barCount={24} />
            </div>

            {/* About the Artist Card */}
            {currentArtistObj && (
              <div className="about-artist-mini-card">
                <img
                  src={currentArtistObj.banner || currentArtistObj.image}
                  alt={currentArtistObj.name}
                  className="about-artist-banner"
                />
                <div className="about-artist-body">
                  <div className="about-artist-head">{currentArtistObj.name}</div>
                  <div className="about-artist-listeners">
                    {currentArtistObj.monthlyListeners} monthly listeners
                  </div>
                  <p className="about-artist-bio">{currentArtistObj.desc}</p>
                  <button
                    className="hero-outline-btn"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', alignSelf: 'flex-start', marginTop: 4 }}
                    onClick={() => navigateToArtist(currentArtistObj)}
                  >
                    View Artist
                  </button>
                </div>
              </div>
            )}

            {/* Mini Lyrics Preview Card */}
            {lyricsList && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.15), rgba(18, 18, 18, 0.9))',
                  border: '1px solid rgba(30, 215, 96, 0.3)',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer'
                }}
                onClick={() => setIsLyricsModalOpen(true)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1ed760' }}>Lyrics</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subdued)' }}>Click to expand</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 }}>
                  "{lyricsList[0]?.text}"
                </p>
              </div>
            )}
          </>
        )}

        {/* TAB 2: QUEUE */}
        {rightPanel === 'queue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subdued)', textTransform: 'uppercase', marginBottom: 8 }}>
                Now Playing
              </div>
              <div className="library-item-row active" style={{ borderRadius: 6, padding: 8 }}>
                <img src={currentTrack?.img} alt={currentTrack?.title} className="library-item-img" />
                <div className="library-item-info">
                  <div className="library-item-title" style={{ color: '#1ed760' }}>{currentTrack?.title}</div>
                  <div className="library-item-subtitle">{currentTrack?.artist}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subdued)', textTransform: 'uppercase', marginBottom: 8 }}>
                Next In Queue ({upcomingQueue.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {upcomingQueue.map((t, idx) => (
                  <button
                    key={t.id || idx}
                    className="library-item-row"
                    onClick={() => playTrack(t, queue)}
                  >
                    <img src={t.img} alt={t.title} className="library-item-img" />
                    <div className="library-item-info">
                      <div className="library-item-title">{t.title}</div>
                      <div className="library-item-subtitle">{t.artist}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISUALIZER */}
        {rightPanel === 'visualizer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Immersive Soundstage</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subdued)' }}>
              Real-time FFT audio spectrum analyzer rendering live harmonics directly from the media element.
            </p>
            <AudioVisualizer height={220} barCount={32} />
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>Audio Engine Info</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subdued)', lineHeight: 1.6 }}>
                <div>• Format: Lossless Stereo MP3 / 320kbps</div>
                <div>• Sample Rate: 44.1 kHz</div>
                <div>• FFT Bins: 128 (Float32Array)</div>
                <div>• Dynamic Ambient Sync: Active</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
