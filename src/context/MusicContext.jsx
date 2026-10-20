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

  // Synthetic / Procedural Audio Refs
  const isSyntheticPlayingRef = useRef(false);
  const synthTimerRef = useRef(null);
  const synthOscRef = useRef(null);
  const synthGainRef = useRef(null);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('vr_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const stopSyntheticAudio = () => {
    isSyntheticPlayingRef.current = false;
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthOscRef.current) {
      try {
        synthOscRef.current.stop();
        synthOscRef.current.disconnect();
      } catch (e) {}
      synthOscRef.current = null;
    }
  };

  const startSyntheticAudio = (track) => {
    stopSyntheticAudio();
    isSyntheticPlayingRef.current = true;
    setIsPlaying(true);
    const targetDur = track?.durationSec || 210;
    setDuration(targetDur);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
      }

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      const targetVol = isMuted ? 0 : volume * 0.12;
      gain.gain.setValueAtTime(targetVol, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyserRef.current);

      osc.start();
      synthOscRef.current = osc;
      synthGainRef.current = gain;

      let step = 0;
      const notes = [220, 261.63, 329.63, 392.00, 329.63, 261.63];
      const tempo = setInterval(() => {
        if (!isSyntheticPlayingRef.current || !synthOscRef.current) {
          clearInterval(tempo);
          return;
        }
        step = (step + 1) % notes.length;
        synthOscRef.current.frequency.setTargetAtTime(notes[step], ctx.currentTime, 0.08);
      }, 500);

      const startTime = Date.now() - (currentTime * 1000);
      synthTimerRef.current = setInterval(() => {
        if (!isSyntheticPlayingRef.current) return;
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= targetDur) {
          stopSyntheticAudio();
          handleTrackEnd();
        } else {
          setCurrentTime(elapsed);
        }
      }, 250);
    } catch (err) {
      console.warn("Synth fallback error:", err);
      synthTimerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.25;
          if (next >= targetDur) {
            stopSyntheticAudio();
            handleTrackEnd();
            return 0;
          }
          return next;
        });
      }, 250);
    }
  };

  // Audio Setup
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      if (!isSyntheticPlayingRef.current) {
        setIsPlaying(false);
      }
    };
    const onTimeUpdate = () => {
      if (!isSyntheticPlayingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      handleTrackEnd();
    };
    const onError = (e) => {
      console.warn("Audio error encountered:", e);
      const previewSrc = './assets/audio-preview.mp3';
      if (!audio.src.includes('audio-preview.mp3')) {
        console.log("Switching to preview audio stream...");
        audio.src = previewSrc;
        audio.load();
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn("Audio preview prevented, activating procedural synth:", err);
          startSyntheticAudio(currentTrack);
        });
      } else {
        startSyntheticAudio(currentTrack);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

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
      stopSyntheticAudio();
    };
  }, []);

  // Web Audio Context initialization on first play (browser requirement)
  const initWebAudio = () => {
    if (isAudioInitializedRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      const analyser = analyserRef.current || ctx.createAnalyser();
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
      console.warn("Web Audio API media element connect note:", err);
    }
  };

  // Play / Pause toggler
  const togglePlay = () => {
    const audio = audioRef.current;

    if (isSyntheticPlayingRef.current) {
      if (isPlaying) {
        stopSyntheticAudio();
        setIsPlaying(false);
      } else {
        startSyntheticAudio(currentTrack);
      }
      return;
    }

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      initWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audio.play().catch(err => {
        console.warn("Audio play prevented, activating procedural sound:", err);
        startSyntheticAudio(currentTrack);
      });
    }
  };

  // Play a specific track
  const playTrack = (track, newQueue = null) => {
    if (!track) return;
    stopSyntheticAudio();
    const audio = audioRef.current;
    if (!audio) return;

    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.durationSec || 210);

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
      console.warn("Primary track playback failed, switching to fallback:", err);
      audio.src = './assets/audio-preview.mp3';
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(fallbackErr => {
        console.warn("Fallback prevented, activating synth:", fallbackErr);
        startSyntheticAudio(track);
      });
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
    const target = (percent / 100) * (duration || 210);
    setCurrentTime(target);
    if (audioRef.current && !isSyntheticPlayingRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleVolumeChange = (newVal) => {
    const vol = Math.max(0, Math.min(1, newVal));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (synthGainRef.current && audioContextRef.current) {
      synthGainRef.current.gain.setValueAtTime(vol * 0.12, audioContextRef.current.currentTime);
    }
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume;
      if (synthGainRef.current && audioContextRef.current) {
        synthGainRef.current.gain.setValueAtTime(volume * 0.12, audioContextRef.current.currentTime);
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      if (synthGainRef.current && audioContextRef.current) {
        synthGainRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }
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
      cover: currentTrack?.img || "./vinix-logo.png",
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
