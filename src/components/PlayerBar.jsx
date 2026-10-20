import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Activity,
  Maximize2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    handleVolumeChange,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
    rightPanel,
    setRightPanel,
    setIsLyricsModalOpen,
    setIsMobilePlayerOpen,
    navigateToArtist,
    artists
  } = useMusic();

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekClick = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(100, pos * 100)));
  };

  const handleVolumeClick = (e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    handleVolumeChange(Math.max(0, Math.min(1, pos)));
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const currentVolume = isMuted ? 0 : volume;

  const currentArtistObj = artists.find(
    a => a.id === currentTrack?.artistId || a.name.toLowerCase() === currentTrack?.artist.toLowerCase()
  );

  return (
    <>
      {/* ─── DESKTOP PLAYER BAR (>= 769px) ─── */}
      <footer className="bottom-player-bar desktop-only" aria-label="Audio Playback Bar">
        {/* LEFT: Current Track Details */}
        <div className="player-left-col">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.img}
                alt={currentTrack.title}
                className="player-thumb-img"
                onClick={() => setRightPanel('nowPlaying')}
              />
              <div className="player-track-info">
                <div
                  className="player-track-title"
                  onClick={() => setRightPanel('nowPlaying')}
                >
                  {currentTrack.title}
                </div>
                <div
                  className="player-track-artist"
                  onClick={() => currentArtistObj && navigateToArtist(currentArtistObj)}
                >
                  {currentTrack.artist}
                </div>
              </div>
              <button
                className={`player-heart-btn ${isFavorite(currentTrack.id) ? 'liked' : ''}`}
                onClick={() => toggleFavorite(currentTrack.id)}
                title={isFavorite(currentTrack.id) ? 'Remove from Favorites' : 'Save to Favorites'}
              >
                <Heart
                  size={18}
                  fill={isFavorite(currentTrack.id) ? '#1ed760' : 'none'}
                  color={isFavorite(currentTrack.id) ? '#1ed760' : 'currentColor'}
                />
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--text-subdued)', fontSize: '0.85rem' }}>Select a track to play</div>
          )}
        </div>

        {/* CENTER: Main Controls & Seekbar */}
        <div className="player-center-col">
          <div className="player-controls-row">
            {/* Shuffle */}
            <button
              className={`player-icon-btn ${isShuffle ? 'active' : ''}`}
              onClick={toggleShuffle}
              title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            >
              <Shuffle size={18} />
            </button>

            {/* Previous */}
            <button
              className="player-icon-btn"
              onClick={prevTrack}
              title="Previous track"
            >
              <SkipBack size={20} />
            </button>

            {/* Play / Pause (Spotify round icon) */}
            <button
              className="player-play-circle-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} fill="#000000" color="#000000" />
              ) : (
                <Play size={18} fill="#000000" color="#000000" style={{ marginLeft: 2 }} />
              )}
            </button>

            {/* Next */}
            <button
              className="player-icon-btn"
              onClick={nextTrack}
              title="Next track"
            >
              <SkipForward size={20} />
            </button>

            {/* Repeat */}
            <button
              className={`player-icon-btn ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={cycleRepeat}
              title={`Repeat mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Seekbar */}
          <div className="player-progress-row">
            <span className="time-stamp">{formatTime(currentTime)}</span>
            <div
              className="custom-range-slider"
              ref={progressBarRef}
              onClick={handleSeekClick}
            >
              <div
                className="slider-filled-track"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="slider-thumb-handle"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            <span className="time-stamp">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Volume & Utilities */}
        <div className="player-right-col">
          {/* Lyrics Toggle */}
          <button
            className="player-icon-btn"
            onClick={() => setIsLyricsModalOpen(true)}
            title="Lyrics"
          >
            <Mic2 size={18} />
          </button>

          {/* Queue Toggle */}
          <button
            className={`player-icon-btn ${rightPanel === 'queue' ? 'active' : ''}`}
            onClick={() => setRightPanel(rightPanel === 'queue' ? 'closed' : 'queue')}
            title="Queue"
          >
            <ListMusic size={18} />
          </button>

          {/* Visualizer Toggle */}
          <button
            className={`player-icon-btn ${rightPanel === 'visualizer' ? 'active' : ''}`}
            onClick={() => setRightPanel(rightPanel === 'visualizer' ? 'closed' : 'visualizer')}
            title="Audio Visualizer"
          >
            <Activity size={18} />
          </button>

          {/* Volume Mute & Slider */}
          <div className="volume-slider-wrap">
            <button
              className="player-icon-btn"
              onClick={toggleMute}
              style={{ marginRight: 8 }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || currentVolume === 0 ? (
                <VolumeX size={18} />
              ) : currentVolume < 0.5 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <div
              className="custom-range-slider"
              ref={volumeBarRef}
              onClick={handleVolumeClick}
            >
              <div
                className="slider-filled-track"
                style={{ width: `${currentVolume * 100}%` }}
              />
              <div
                className="slider-thumb-handle"
                style={{ left: `${currentVolume * 100}%` }}
              />
            </div>
          </div>

          {/* Fullscreen Lyrics / Canvas */}
          <button
            className="player-icon-btn"
            onClick={() => setIsLyricsModalOpen(true)}
            title="Full screen view"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </footer>

      {/* ─── MOBILE FLOATING MINI PLAYER (<= 768px) ─── */}
      {currentTrack && (
        <div
          className="mobile-mini-player mobile-only"
          onClick={() => setIsMobilePlayerOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open now playing full screen"
        >
          {/* Progress thin line on top/bottom */}
          <div className="mobile-mini-progress-bar">
            <div
              className="mobile-mini-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mobile-mini-content">
            <img
              src={currentTrack.img}
              alt={currentTrack.title}
              className="mobile-mini-thumb"
            />

            <div className="mobile-mini-text">
              <div className="mobile-mini-title">{currentTrack.title}</div>
              <div className="mobile-mini-artist">{currentTrack.artist}</div>
            </div>

            <div className="mobile-mini-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`player-heart-btn ${isFavorite(currentTrack.id) ? 'liked' : ''}`}
                onClick={() => toggleFavorite(currentTrack.id)}
              >
                <Heart
                  size={20}
                  fill={isFavorite(currentTrack.id) ? '#1ed760' : 'none'}
                  color={isFavorite(currentTrack.id) ? '#1ed760' : 'currentColor'}
                />
              </button>

              <button
                className="mobile-mini-play-btn"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={18} fill="#fff" color="#fff" />
                ) : (
                  <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
