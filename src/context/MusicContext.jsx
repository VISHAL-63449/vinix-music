import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SONGS, ARTISTS, PLAYLISTS, SAMPLE_LYRICS } from '../data/musicData';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [songs] = useState(SONGS);
  const [artists] = useState(ARTISTS);
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('vr_custom_playlists');
    if (saved) {
      try {
        return [...PLAYLISTS, ...JSON.parse(saved)];
      } catch (e) {
        return PLAYLISTS;
      }
    }
    return PLAYLISTS;
  });

  // Player State
  const [currentTrack, setCurrentTrack] = useState(() => SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(SONGS);
  const [queueIndex, setQueueIndex] = useState(0);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('vr_favorites');
      return saved ? JSON.parse(saved) : ["ani_1", "ani_4", "arr_4", "sai_2"];
    } catch {
      return ["ani_1", "ani_4", "arr_4", "sai_2"];
    }
  });

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'search' | 'library' | 'artist' | 'playlist'
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchGenre, setSearchGenre] = useState(null);

  // Right sidebar panel
  const [rightPanel, setRightPanel] = useState('nowPlaying'); // 'nowPlaying' | 'queue' | 'visualizer' | 'lyrics' | 'closed'
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);

  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vinix_user');
      return savedUser !== null ? JSON.parse(savedUser) : {
        name: 'vishal',
        email: 'vishal@vinix.com',
        avatar: 'V',
        plan: 'Vinix Pro • Lossless'
      };
    } catch {
      return {
        name: 'vishal',
        email: 'vishal@vinix.com',
        avatar: 'V',
        plan: 'Vinix Pro • Lossless'
      };
    }
  });

  const signOut = () => {
    setUser(null);
    localStorage.setItem('vinix_user', 'null');
  };

  const signIn = (name = 'vishal') => {
    const newUser = {
      name: name || 'vishal',
      email: `${(name || 'vishal').toLowerCase()}@vinix.com`,
      avatar: (name || 'V').charAt(0).toUpperCase(),
      plan: 'Vinix Pro • Lossless'
    };
    setUser(newUser);
    localStorage.setItem('vinix_user', JSON.stringify(newUser));
  };

  // Audio References
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isAudioInitializedRef = useRef(false);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('vr_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Audio Setup
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      handleTrackEnd();
    };
    const onError = (e) => {
      console.warn("Audio error encountered:", e);
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Initial source
    if (SONGS[0]) {
      audio.src = SONGS[0].file;
    }

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Web Audio Context initialization on first play (browser requirement)
  const initWebAudio = () => {
    if (isAudioInitializedRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      isAudioInitializedRef.current = true;
    } catch (err) {
      console.warn("Web Audio API could not connect to media element directly:", err);
    }
  };

  // Play / Pause toggler
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      initWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audio.play().catch(err => {
        console.warn("Audio play prevented:", err);
      });
    }
  };

  // Play a specific track
  const playTrack = (track, newQueue = null) => {
    if (!track) return;
    const audio = audioRef.current;
    if (!audio) return;

    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentTrack(track);

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(s => s.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex(s => s.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        setQueue(prev => [track, ...prev]);
        setQueueIndex(0);
      }
    }

    audio.src = track.file;
    audio.load();
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Playback could not start:", err);
    });
  };

  // Next Track
  const nextTrack = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length === 0) return;

    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === 'all') {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setQueueIndex(nextIdx);
    const track = queue[nextIdx];
    if (track) {
      playTrack(track);
    }
  };

  // Previous Track
  const prevTrack = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    const track = queue[prevIdx];
    if (track) {
      playTrack(track);
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextTrack();
    }
  };

  const seekTo = (percent) => {
    if (!audioRef.current || !duration) return;
    const target = (percent / 100) * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleVolumeChange = (newVal) => {
    const vol = Math.max(0, Math.min(1, newVal));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFavorite = (trackId) => {
    setFavorites(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const isFavorite = (trackId) => favorites.includes(trackId);

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Navigation Helpers
  const navigateToArtist = (artist) => {
    if (!artist) return;
    setSelectedArtist(artist);
    setActiveTab('artist');
    const scrollContainer = document.querySelector('.main-view-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab('playlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToGenre = (genre) => {
    setSearchGenre(genre);
    setSearchQuery(genre.name);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createPlaylist = (name) => {
    const newPl = {
      id: `pl_user_${Date.now()}`,
      name: name || `My Playlist #${playlists.length + 1}`,
      description: "Custom user playlist created on Vinix Music",
      cover: currentTrack?.img || "/vinix-logo.png",
      trackIds: [currentTrack?.id].filter(Boolean),
      curator: "You",
      color: "#1DB954"
    };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    const userOnly = updated.filter(p => p.id.startsWith('pl_user_'));
    localStorage.setItem('vr_custom_playlists', JSON.stringify(userOnly));
    navigateToPlaylist(newPl);
  };

  // Dynamic ambient color from current track
  const ambientColor = currentTrack?.accent || '#1DB954';

  return (
    <MusicContext.Provider
      value={{
        songs,
        artists,
        playlists,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        favorites,
        activeTab,
        selectedArtist,
        selectedPlaylist,
        searchQuery,
        searchGenre,
        rightPanel,
        isLyricsModalOpen,
        isMobilePlayerOpen,
        ambientColor,
        analyser: analyserRef.current,
        user,
        signOut,
        signIn,
        setActiveTab,
        setSelectedArtist,
        setSelectedPlaylist,
        setSearchQuery,
        setSearchGenre,
        setRightPanel,
        setIsLyricsModalOpen,
        setIsMobilePlayerOpen,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        seekTo,
        handleVolumeChange,
        toggleMute,
        toggleFavorite,
        isFavorite,
        toggleShuffle,
        cycleRepeat,
        navigateToArtist,
        navigateToPlaylist,
        navigateToGenre,
        createPlaylist
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
