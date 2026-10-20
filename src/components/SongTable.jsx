import React from 'react';
import { Play, Pause, Heart, Clock, MoreHorizontal } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const SongTable = ({ tracks = [], showAlbum = true, customQueue = null }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    isFavorite,
    navigateToArtist
  } = useMusic();

  const formatPlays = (num) => {
    if (!num) return '-';
    return num.toLocaleString();
  };

  return (
    <div className="track-table-container">
      <div className="track-table-header">
        <span className="col-index">#</span>
        <span className="col-title-wrap">Title</span>
        {showAlbum && <span className="col-album">Album</span>}
        <span className="col-plays">Plays</span>
        <span className="col-duration">
          <Clock size={16} />
        </span>
        <span className="col-actions"></span>
      </div>

      <div className="track-table-body">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          const isLiked = isFavorite(track.id);

          return (
            <div
              key={track.id || index}
              className={`track-table-row ${isCurrent ? 'active' : ''}`}
              onDoubleClick={() => playTrack(track, customQueue || tracks)}
            >
              {/* Index or Play icon */}
              <div
                className="col-index"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    playTrack(track, customQueue || tracks);
                  }
                }}
              >
                {isCurrent && isPlaying ? (
                  <Pause size={16} fill="#1ed760" color="#1ed760" />
                ) : (
                  <span className="index-num">{index + 1}</span>
                )}
              </div>

              {/* Title & Artist */}
              <div className="col-title-wrap">
                <img src={track.img} alt={track.title} className="track-thumb-img" />
                <div className="track-title-block">
                  <div
                    className="track-main-title"
                    onClick={() => playTrack(track, customQueue || tracks)}
                  >
                    {track.title}
                  </div>
                  <div
                    className="track-artist-sub"
                    onClick={(e) => {
                      e.stopPropagation();
                      // navigate to artist if found
                    }}
                  >
                    {track.artist}
                  </div>
                </div>
              </div>

              {/* Album */}
              {showAlbum && <div className="col-album">{track.album || 'Single'}</div>}

              {/* Plays */}
              <div className="col-plays">{formatPlays(track.plays)}</div>

              {/* Duration */}
              <div className="col-duration">{track.duration}</div>

              {/* Actions */}
              <div className="col-actions">
                <button
                  className={`table-icon-btn ${isLiked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                >
                  <Heart
                    size={16}
                    fill={isLiked ? '#1ed760' : 'none'}
                    color={isLiked ? '#1ed760' : 'currentColor'}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
