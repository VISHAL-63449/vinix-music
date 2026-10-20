import React from 'react';
import { X, Mic2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SAMPLE_LYRICS } from '../data/musicData';

export const LyricsModal = () => {
  const {
    currentTrack,
    currentTime,
    seekTo,
    isLyricsModalOpen,
    setIsLyricsModalOpen,
    ambientColor
  } = useMusic();

  if (!isLyricsModalOpen || !currentTrack) return null;

  const rawLyrics = SAMPLE_LYRICS[currentTrack.id] || [
    { time: 0, text: `Listening to ${currentTrack.title}` },
    { time: 8, text: `Composed by ${currentTrack.artist}` },
    { time: 20, text: `(Instrumental Groove • Feel the bass & acoustics)` },
    { time: 40, text: `Immerse in high-fidelity sound` },
    { time: 65, text: `Vinix Music Lossless Studio Master` },
    { time: 90, text: `(Solo & Orchestra Breakdown)` }
  ];

  return (
    <div className="lyrics-overlay-modal" role="dialog" aria-label="Lyrics Display">
      {/* Dynamic ambient bloom */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          background: ambientColor || '#1ed760',
          opacity: 0.18,
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none'
        }}
      />

      <div className="lyrics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mic2 size={24} color="#1ed760" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentTrack.title}</h2>
            <p style={{ color: 'var(--text-subdued)', fontSize: '0.85rem' }}>{currentTrack.artist}</p>
          </div>
        </div>

        <button
          className="history-circle-btn"
          onClick={() => setIsLyricsModalOpen(false)}
          title="Close lyrics"
        >
          <X size={20} />
        </button>
      </div>

      <div className="lyrics-content-scroll">
        {rawLyrics.map((line, idx) => {
          const isLineActive =
            currentTime >= line.time &&
            (idx === rawLyrics.length - 1 || currentTime < rawLyrics[idx + 1].time);

          return (
            <div
              key={idx}
              className={`lyric-line ${isLineActive ? 'active' : ''}`}
              onClick={() => seekTo((line.time / (currentTrack.durationSec || 180)) * 100)}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
