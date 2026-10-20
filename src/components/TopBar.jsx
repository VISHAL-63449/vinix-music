import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Activity, 
  LogOut, 
  User as UserIcon, 
  LogIn, 
  Bell, 
  Flame, 
  Radio, 
  Headphones, 
  X, 
  Check, 
  Disc3,
  Sliders,
  Music
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const TopBar = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    rightPanel,
    setRightPanel,
    user,
    signOut,
    signIn,
    isPlaying
  } = useMusic();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeTab !== 'search') {
      setActiveTab('search');
    }
  };

  const handleFilterClick = (filterId, sectionId) => {
    setActiveFilter(filterId);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginName.trim()) {
      signIn(loginName.trim());
      setShowLoginModal(false);
      setLoginName('');
    }
  };

  const toggleVisualizer = () => {
    if (window.innerWidth <= 768) {
      setActiveTab(activeTab === 'visualizer' ? 'home' : 'visualizer');
    } else {
      setRightPanel(rightPanel === 'visualizer' ? 'nowPlaying' : 'visualizer');
    }
  };

  return (
    <>
      <header className="top-navigation-bar">
        {/* Left Side: Brand Logo, Name, Badge, & History Nav */}
        <div className="top-bar-left">
          {/* Brand Logo & Title with Lossless Indicator (MOBILE ONLY - Desktop branding is in left sidebar) */}
          <div
            className="brand-header-group mobile-only"
            onClick={() => {
              setActiveTab('home');
              const mainScroll = document.querySelector('.main-view-scroll');
              if (mainScroll) mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="brand-logo-container">
              <img src="/vinix-logo.png" alt="Vinix Music" className="mobile-logo-thumb" />
              <div className="brand-glow-halo" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title-row">
                <img src="/vinix-title-transparent.png" alt="Vinix Music" className="mobile-brand-title-img" />
                <span className="audio-quality-pill">
                  <span className="pulse-dot-green" />
                  <span className="pill-text">HI-RES</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop History Buttons */}
          <div className="history-nav-btns desktop-only">
            <button
              className="history-circle-btn"
              title="Go back"
              onClick={() => setActiveTab('home')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="history-circle-btn"
              title="Go forward"
              onClick={() => setActiveTab('search')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Desktop Search Input with Glass Styling */}
          <div className="search-input-wrapper desktop-only">
            <Search size={17} className="search-input-icon" />
            <input
              type="text"
              className="search-input-field"
              placeholder="What do you want to play?"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (activeTab !== 'search') setActiveTab('search');
              }}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
            <span className="search-shortcut-badge">Ctrl+K</span>
          </div>
        </div>

        {/* Center / Filter Chips (Desktop & Tablet) */}
        <div className="top-bar-center desktop-only">
          <div className="topbar-filter-chips">
            <button
              className={`top-chip-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterClick('all', 'section-hero')}
            >
              <span>All</span>
            </button>
            <button
              className={`top-chip-btn ${activeFilter === 'fresh' ? 'active' : ''}`}
              onClick={() => handleFilterClick('fresh', 'section-fresh-drops')}
            >
              <Flame size={13} className="chip-icon-amber" />
              <span>Fresh Drops</span>
            </button>
            <button
              className={`top-chip-btn ${activeFilter === 'artists' ? 'active' : ''}`}
              onClick={() => handleFilterClick('artists', 'section-artists')}
            >
              <span>Artists</span>
            </button>
            <button
              className={`top-chip-btn ${activeFilter === 'trending' ? 'active' : ''}`}
              onClick={() => handleFilterClick('trending', 'section-quick-mix')}
            >
              <span>Quick Mix</span>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Mobile Search, Live Equalizer, Notifications, Profile */}
        <div className="top-bar-right">
          {/* Mobile Quick Search Button */}
          <button
            className="mobile-header-icon-btn mobile-only"
            onClick={() => setActiveTab('search')}
            title="Search songs, artists"
          >
            <Search size={18} />
          </button>

          {/* Live Animated Equalizer Trigger (Both Desktop & Mobile) */}
          <button
            className={`eq-trigger-btn ${isPlaying ? 'playing' : ''} ${rightPanel === 'visualizer' || activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={toggleVisualizer}
            title={isPlaying ? "Audio Visualizer (Live Sync)" : "Open Live Audio Visualizer"}
          >
            <div className="eq-bars-anim">
              <span className="eq-bar bar-1" />
              <span className="eq-bar bar-2" />
              <span className="eq-bar bar-3" />
            </div>
            <span className="eq-btn-label desktop-only">Visualizer</span>
          </button>

          {/* Notifications / What's New Bell */}
          <div className="notifications-container" ref={notificationsRef}>
            <button
              className="mobile-header-icon-btn bell-btn"
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              title="What's New in Vinix Music"
            >
              <Bell size={18} />
              <span className="notification-ping-dot" />
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="notifications-popover-menu">
                <div className="popover-header">
                  <div className="popover-title">
                    <Sparkles size={15} color="#1ed760" />
                    <span>What's New</span>
                  </div>
                  <span className="popover-badge">3 New</span>
                </div>
                <div className="popover-items-list">
                  <div className="notif-item">
                    <div className="notif-bullet fire">🔥</div>
                    <div className="notif-text">
                      <strong>Aaya Sher</strong> from Jailer 2 just added with Lossless master audio.
                      <span className="notif-time">Just now</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-bullet lossless">⚡</div>
                    <div className="notif-text">
                      <strong>Lossless 24-bit 96kHz</strong> FLAC streaming is enabled on your profile.
                      <span className="notif-time">Today</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-bullet music">🎵</div>
                    <div className="notif-text">
                      <strong>Bindaas (Telugu)</strong> and <strong>One Sun One Moon</strong> now available.
                      <span className="notif-time">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Container */}
          <div className="profile-dropdown-container" ref={dropdownRef}>
            {user ? (
              <button
                className="user-profile-pill"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                title={`${user.name} (Account Menu)`}
                aria-expanded={isDropdownOpen}
              >
                <div className="user-avatar-circle">
                  {user.avatar}
                  <span className="avatar-online-dot" />
                </div>
                <span className="user-name-text desktop-only">{user.name}</span>
              </button>
            ) : (
              <button
                className="pill-action-btn primary"
                onClick={() => setShowLoginModal(true)}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile & Sign Out Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-avatar">
                    {user.avatar}
                  </div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-user-name">{user.name}</div>
                    <div className="dropdown-user-email">{user.email}</div>
                    <div className="dropdown-user-plan">{user.plan}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-audio-info">
                  <div className="audio-spec-row">
                    <span className="spec-label">Audio Quality</span>
                    <span className="spec-val">Lossless 24-bit FLAC</span>
                  </div>
                  <div className="audio-spec-row">
                    <span className="spec-label">Audio Engine</span>
                    <span className="spec-val">WebAudio 3D Spatial</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    toggleVisualizer();
                    setIsDropdownOpen(false);
                  }}
                >
                  <Activity size={16} color="#1ed760" />
                  <span>Open Audio Visualizer</span>
                </button>

                <button
                  className="dropdown-item-btn signout"
                  onClick={() => {
                    signOut();
                    setIsDropdownOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secondary Mobile Filter Chips Bar (Sticky right below top bar on mobile) */}
      <div className="mobile-sub-filter-bar mobile-only">
        <button
          className={`sub-filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all', 'section-hero')}
        >
          All
        </button>
        <button
          className={`sub-filter-chip ${activeFilter === 'fresh' ? 'active' : ''}`}
          onClick={() => handleFilterClick('fresh', 'section-fresh-drops')}
        >
          🔥 Fresh Drops
        </button>
        <button
          className={`sub-filter-chip ${activeFilter === 'artists' ? 'active' : ''}`}
          onClick={() => handleFilterClick('artists', 'section-artists')}
        >
          👑 Artists
        </button>
        <button
          className={`sub-filter-chip ${activeFilter === 'trending' ? 'active' : ''}`}
          onClick={() => handleFilterClick('trending', 'section-quick-mix')}
        >
          📈 Quick Mix
        </button>
        <button
          className="sub-filter-chip"
          onClick={toggleVisualizer}
        >
          ⚡ Visualizer
        </button>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal-card" onClick={e => e.stopPropagation()}>
            <div className="login-modal-header">
              <img src="/vinix-logo.png" alt="Vinix Music" style={{ width: 48, height: 48, borderRadius: 10, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }} />
              <h3>Sign in to Vinix Music</h3>
              <p>Experience ultra high fidelity audio & sync your favorites.</p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Enter your name"
                className="search-input-field"
                style={{ width: '100%', paddingLeft: 16 }}
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="hero-outline-btn"
                  style={{ flex: 1, padding: 10, fontSize: '0.85rem' }}
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hero-play-btn"
                  style={{ flex: 1, padding: 10, fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
