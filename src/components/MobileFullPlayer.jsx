import React from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListMusic,
  Activity,
  Share2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { AudioVisualizer } from './AudioVisualizer';
import { SAMPLE_LYRICS } from '../data/musicData';

export const MobileFullPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isMobilePlayerOpen,
    setIsMobilePlayerOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
    setIsLyricsModalOpen,
    ambientColor,
    rightPanel,
    setRightPanel
  } = useMusic();

  if (!isMobilePlayerOpen || !currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const isLiked = isFavorite(currentTrack.id);
  const lyricsList = SAMPLE_LYRICS[currentTrack.id];

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(100, pos * 100)));
  };

  return (
    <div
      className="mobile-full-player-overlay"
      style={{
        '--player-ambient': ambientColor || '#1ed760'
      }}
    >
      {/* Dynamic Ambient Background Wash */}
      <div className="mobile-player-ambient-bg" />

      {/* Top Bar with Dismiss */}
      <div className="mobile-player-header">
        <button
          className="mobile-player-icon-btn"
          onClick={() => setIsMobilePlayerOpen(false)}
          title="Collapse"
        >
          <ChevronDown size={28} />
        </button>

        <div className="mobile-player-header-title">
          <span>PLAYING FROM YOUR LIBRARY</span>
          <h4>{currentTrack.album || 'Single'}</h4>
        </div>

        <button
          className="mobile-player-icon-btn"
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              alert("Track link copied!");
            }
          }}
          title="Share"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Big Centered Album Art */}
      <div className="mobile-player-art-wrap">
        <img
          src={currentTrack.img}
          alt={currentTrack.title}
          className="mobile-player-art-img"
        />
      </div>

      {/* Track Details & Heart */}
      <div className="mobile-player-track-details">
        <div className="mobile-player-info">
          <h2 className="mobile-player-title">{currentTrack.title}</h2>
          <p className="mobile-player-artist">{currentTrack.artist}</p>
        </div>
        <button
          className={`player-heart-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => toggleFavorite(currentTrack.id)}
          title={isLiked ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            size={26}
            fill={isLiked ? '#1ed760' : 'none'}
            color={isLiked ? '#1ed760' : 'currentColor'}
          />
        </button>
      </div>

      {/* Seekbar */}
      <div className="mobile-player-progress-area">
        <div className="custom-range-slider" onClick={handleSeek}>
          <div
            className="slider-filled-track"
            style={{ width: `${progressPercent}%`, background: '#1ed760' }}
          />
          <div
            className="slider-thumb-handle"
            style={{ left: `${progressPercent}%`, opacity: 1 }}
          />
        </div>
        <div className="mobile-player-timestamps">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="mobile-player-controls-row">
        <button
          className={`player-icon-btn ${isShuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
        >
          <Shuffle size={22} />
        </button>

        <button className="player-icon-btn" onClick={prevTrack}>
          <SkipBack size={32} />
        </button>

        <button
          className="mobile-player-play-btn"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause size={28} fill="#000" color="#000" />
          ) : (
            <Play size={28} fill="#000" color="#000" style={{ marginLeft: 3 }} />
          )}
        </button>

        <button className="player-icon-btn" onClick={nextTrack}>
          <SkipForward size={32} />
        </button>

        <button
          className={`player-icon-btn ${repeatMode !== 'off' ? 'active' : ''}`}
          onClick={cycleRepeat}
        >
          {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
        </button>
      </div>

      {/* Quick Drawer Cards (Lyrics & Visualizer) */}
      <div className="mobile-player-bottom-actions">
        {lyricsList && (
          <div
            className="mobile-lyrics-drawer-card"
            onClick={() => {
              setIsMobilePlayerOpen(false);
              setIsLyricsModalOpen(true);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1ed760' }}>Lyrics</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subdued)' }}>Tap to expand</span>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
              "{lyricsList[0]?.text}"
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="mobile-action-pill"
            onClick={() => {
              setIsMobilePlayerOpen(false);
              setRightPanel('visualizer');
            }}
          >
            <Activity size={16} />
            <span>Audio Visualizer</span>
          </button>

          <button
            className="mobile-action-pill"
            onClick={() => {
              setIsMobilePlayerOpen(false);
              setIsLyricsModalOpen(true);
            }}
          >
            <Mic2 size={16} />
            <span>Lyrics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
