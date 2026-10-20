/**
 * VR Music — Premium Client Logic & Performance System v4
 * SPA navigation, advanced audio player, Web Audio visualizer, particles,
 * AI search + autocomplete, voice search, AI assistant drawer, mood scanner,
 * fullscreen player, notifications, toasts, keyboard shortcuts and admin analytics.
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ═══════════════ 1. AUTHENTICATION SHIELD ═══════════════
    const currentUser = window.MockBackend.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Role-based navigation exposure
    if (currentUser.role === 'admin') {
        const adminMenu = document.getElementById('menu-admin');
        if (adminMenu) adminMenu.style.display = 'block';
    }

    // ═══════════════ 2. SPLASH SCREEN ═══════════════
    const splash = document.getElementById('splash-screen');
    setTimeout(() => {
        if (splash) splash.classList.add('done');
    }, 1600);

    // ═══════════════ 3. DOM ELEMENT CACHE ═══════════════
    const sidebar = document.getElementById('app-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const views = document.querySelectorAll('.app-view');
    const menuItems = document.querySelectorAll('.sidebar li');

    // Player DOM
    const audio = document.getElementById('audio-player');
    const playerPlayBtn = document.getElementById('player-toggle-btn');
    const playerPlayIcon = playerPlayBtn.querySelector('i');
    const playerImg = document.getElementById('player-album-img');
    const playerTitle = document.getElementById('player-song-title');
    const playerArtist = document.getElementById('player-song-artist');
    const playerHeart = document.getElementById('player-heart-btn');
    const seekSlider = document.getElementById('player-seek-slider');
    const currentTimeEl = document.getElementById('player-current-time');
    const totalDurationEl = document.getElementById('player-total-duration');
    const volumeSlider = document.getElementById('player-volume-slider');
    const volumeIcon = document.getElementById('player-volume-icon');

    // Fullscreen player DOM
    const fsPlayer = document.getElementById('fullscreen-player');
    const fsBackdrop = document.getElementById('fs-backdrop');
    const fsAlbumImg = document.getElementById('fs-album-img');
    const fsSongTitle = document.getElementById('fs-song-title');
    const fsSongArtist = document.getElementById('fs-song-artist');
    const fsCurrentTime = document.getElementById('fs-current-time');
    const fsTotalDuration = document.getElementById('fs-total-duration');
    const fsSeek = document.getElementById('fs-seek-slider');
    const fsHeart = document.getElementById('fs-heart-btn');
    const fsToggleBtn = document.getElementById('fs-toggle-btn');
    const fsVolumeSlider = document.getElementById('fs-volume-slider');
    const fsVolumeIcon = document.getElementById('fs-volume-icon');
    const fsShuffleBtn = document.getElementById('fs-shuffle-btn');
    const fsRepeatBtn = document.getElementById('fs-repeat-btn');

    // UI overlays
    const lyricsDrawer = document.getElementById('lyrics-drawer');
    const voiceOverlay = document.getElementById('voice-overlay-screen');
    const uploadModal = document.getElementById('upload-song-modal');
    const aiDrawer = document.getElementById('ai-chatbot-drawer');

    // Navigation History Stack
    const navigationHistory = ['home'];
    let historyPointer = 0;

    // Player State
    let currentPlaylist = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = 'none';
    let sleepTimerTimeout = null;
    let sleepTimerInterval = null;
    let visualizerMode = 'off';
    let prevVolume = 0.8;

    // ═══════════════ 4. BACKGROUND PARTICLES + MOUSE LIGHT ═══════════════
    const canvas = document.getElementById('bg-particles');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let mouse = { x: null, y: null };
    const mouseLight = document.getElementById('mouse-light');

    if (canvas && ctx) {
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
            if (mouseLight) {
                mouseLight.style.left = e.x + 'px';
                mouseLight.style.top = e.y + 'px';
                mouseLight.style.opacity = '1';
            }
        });

        const Particle = function() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.6 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.hue = Math.random() * 40 - 10;
            this.alpha = Math.random() * 0.35 + 0.08;
        };
        Particle.prototype.update = function() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 190) {
                    this.x += dx * 0.004;
                    this.y += dy * 0.004;
                }
            }
        };
        Particle.prototype.draw = function() {
            const accent = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();
            ctx.fillStyle = accent && accent.startsWith('#')
                ? hexToRgba(accent, this.alpha)
                : 'rgba(0, 229, 255, ' + this.alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        };

        for (let i = 0; i < 85; i++) particles.push(new Particle());

        function hexToRgba(hex, a) {
            const h = hex.replace('#', '');
            const r = parseInt(h.substring(0, 2), 16);
            const g = parseInt(h.substring(2, 4), 16);
            const b = parseInt(h.substring(4, 6), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ═══════════════ 5. TOAST SYSTEM ═══════════════
    window.showToast = function(message, type = 'info', icon = 'fa-circle-check') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        t.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
        container.appendChild(t);
        setTimeout(() => {
            t.classList.add('leaving');
            setTimeout(() => t.remove(), 320);
        }, 2800);
    };

    // ═══════════════ 6. SPA VIEW ROUTING STACK ═══════════════
    window.switchView = function(viewId) {
        views.forEach(v => v.classList.remove('active'));
        const activeView = document.getElementById('view-' + viewId);
        if (activeView) activeView.classList.add('active');

        menuItems.forEach(item => item.classList.remove('active'));
        const matchingMenu = document.getElementById('menu-' + viewId);
        if (matchingMenu) matchingMenu.classList.add('active');

        if (navigationHistory[historyPointer] !== viewId) {
            navigationHistory.splice(historyPointer + 1);
            navigationHistory.push(viewId);
            historyPointer = navigationHistory.length - 1;
        }

        // View specific render hooks
        const renderers = {
            home: renderHomeView,
            discover: renderDiscoverView,
            artists: renderArtistsView,
            albums: renderAlbumsView,
            genres: renderGenresView,
            trending: renderTrendingView,
            podcasts: renderPodcastsView,
            radio: renderRadioView,
            downloads: renderDownloadsView,
            favorites: renderFavoritesView,
            history: renderHistoryView,
            playlists: renderPlaylistsView,
            profile: renderProfileView,
            settings: renderSettingsView,
            admin: renderAdminView
        };
        if (renderers[viewId]) renderers[viewId]();

        const autocomplete = document.getElementById('search-autocomplete-panel');
        if (autocomplete) autocomplete.style.display = 'none';

        const viewport = document.querySelector('.views-viewport');
        if (viewport) viewport.scrollTop = 0;
    };

    // Navigation back/forward handlers
    const navPrevBtn = document.getElementById('nav-prev-btn');
    const navNextBtn = document.getElementById('nav-next-btn');
    if (navPrevBtn) {
        navPrevBtn.addEventListener('click', () => {
            if (historyPointer > 0) {
                historyPointer--;
                window.switchView(navigationHistory[historyPointer]);
            }
        });
    }
    if (navNextBtn) {
        navNextBtn.addEventListener('click', () => {
            if (historyPointer < navigationHistory.length - 1) {
                historyPointer++;
                window.switchView(navigationHistory[historyPointer]);
            }
        });
    }

    // Bind sidebar clicks
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const menuId = item.id.replace('menu-', '');
            if (menuId === 'logout') {
                logoutUser();
                return;
            }
            e.preventDefault();
            window.switchView(menuId);
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (document.getElementById('sidebar-scrim')) document.getElementById('sidebar-scrim').classList.remove('show');
        });
    });

    // ═══════════════ 7. SHARED RENDER HELPERS ═══════════════
    function formatDuration(sec) {
        const min = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return min + ':' + (s < 10 ? '0' + s : s);
    }

    function songRowHtml(s, i, listToken, opts) {
        const artists = window.MockBackend.getArtists();
        const art = artists.find(a => a.id === s.artistId);
        const isLiked = window.MockBackend.isLiked(s.id);
        const isDownloaded = window.DownloadManager && window.DownloadManager.isDownloaded(s.id);
        const dlTask = window.DownloadManager ? window.DownloadManager.getTask(s.id) : null;
        const dlActive = dlTask && (dlTask.state === 'downloading' || dlTask.state === 'paused');
        const rank = opts && opts.rank;
        const showAlbum = opts && opts.showAlbum !== false;
        const dlPct = dlTask ? Math.round(dlTask.progress || 0) : (isDownloaded ? 100 : 0);
        const dlTitle = isDownloaded ? 'Downloaded — tap to remove' : (dlActive ? 'Download in progress' : 'Download for offline');
        return `
            <div class="song-row" onclick="playFromPlaylist('${s.id}', '${listToken}')">
                ${rank ? `<span class="row-num rank-badge" style="color:var(--primary-color); font-weight:800;">#${rank}</span>` : `<span class="row-num">${i + 1}</span>`}
                <img src="${s.img}" alt="${s.title}" loading="lazy">
                <div class="song-meta">
                    <h4>${s.title}</h4>
                    <p>${art ? art.name : 'Unknown Artist'}${s.genre ? ' • ' + s.genre : ''}</p>
                </div>
                ${showAlbum ? `<span class="album-title">${s.album}</span>` : ''}
                <span class="duration">${s.duration}</span>
                <div class="actions">
                    <button class="row-btn" onclick="downloadSong(event, '${s.id}', '${s.title.replace(/'/g, "\\'")}')" title="${dlTitle}">
                        <i class="fa-solid fa-download ${isDownloaded ? 'active-dl' : ''}" style="${isDownloaded ? 'color:var(--success);' : dlActive ? 'color:var(--primary-color);' : ''}"></i>
                        ${dlActive ? `<span class="dl-inline-pct">${dlPct}%</span>` : ''}
                    </button>
                    <button class="row-btn like-btn" onclick="toggleLikeClick(event, '${s.id}')">
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <button class="row-btn" onclick="shareSong(event, '${s.id}', '${s.title.replace(/'/g, "\\'")}')" title="Share">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>
        `;
    }

    window.downloadSong = function(e, songId, title) {
        e.stopPropagation();
        const songs = window.MockBackend.getSongs();
        const song = songs.find(s => s.id === songId);
        if (!song || !window.DownloadManager) return;

        if (window.DownloadManager.isDownloaded(songId)) {
            window.DownloadManager.remove(songId).then(() => {
                window.showToast(`Removed "${title}" from offline library`, 'info', 'fa-download');
                refreshAllViews();
            });
            return;
        }

        const task = window.DownloadManager.getTask(songId);
        if (task && task.state === 'downloading') {
            window.DownloadManager.pause(songId);
            window.showToast(`Paused download of "${title}"`, 'info', 'fa-pause');
        } else if (task && task.state === 'paused') {
            window.DownloadManager.resume(songId);
            window.showToast(`Resumed "${title}"`, 'success', 'fa-play');
        } else {
            window.DownloadManager.start(song);
            window.showToast(`Downloading "${title}"...`, 'info', 'fa-cloud-arrow-down');
        }
        refreshAllViews();
    };

    function refreshAllViews() {
        const active = document.querySelector('.app-view.active');
        if (!active) return;
        if (active.id === 'view-downloads') renderDownloadsView();
        else if (active.id === 'view-trending') renderTrendingView();
        else if (active.id === 'view-discover') renderDiscoverView();
        else if (active.id === 'view-favorites') renderFavoritesView();
        else if (active.id === 'view-history') renderHistoryView();
    }

    window.shareSong = function(e, songId, title) {
        e.stopPropagation();
        const link = `https://vrmusic.app/s/${songId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                window.showToast(`Link for "${title}" copied to clipboard`, 'success', 'fa-link');
            }).catch(() => window.showToast(`Share link: ${link}`, 'info', 'fa-link'));
        } else {
            window.showToast(`Share link: ${link}`, 'info', 'fa-link');
        }
    };

    // ═══════════════ 8. VIEW: HOME ═══════════════
    function renderHomeView() {
        const welcomeName = document.getElementById('home-welcome-name');
        if (welcomeName) welcomeName.textContent = currentUser.name;

        const songs = window.MockBackend.getSongs();
        const artists = window.MockBackend.getArtists();
        const byPlays = songs.slice().sort((a, b) => (b.plays || 0) - (a.plays || 0));

        // Continue Listening (from history)
        const continueSlider = document.getElementById('home-continue-slider');
        if (continueSlider) {
            const hist = window.MockBackend.getRecentlyPlayed().map(id => songs.find(s => s.id === id)).filter(Boolean);
            const list = hist.length ? hist : byPlays.slice(0, 6);
            continueSlider.innerHTML = list.map(s => `
                <div class="card-glass" onclick="playSingleTrack('${s.id}')">
                    <div class="img-container">
                        <img src="${s.img}" alt="${s.title}" loading="lazy">
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${s.title}</h4>
                    <p>${artists.find(a => a.id === s.artistId)?.name || s.album}</p>
                </div>
            `).join('');
        }

        // Trending Songs
        const trendingSlider = document.getElementById('home-trending-slider');
        if (trendingSlider) {
            trendingSlider.innerHTML = byPlays.slice(0, 8).map(s => `
                <div class="card-glass" onclick="playSingleTrack('${s.id}')">
                    <div class="img-container">
                        <img src="${s.img}" alt="${s.title}" loading="lazy">
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                        <span class="card-meta-pill">${(s.plays / 1000).toFixed(1)}K</span>
                    </div>
                    <h4>${s.title}</h4>
                    <p>${artists.find(a => a.id === s.artistId)?.name || s.album}</p>
                </div>
            `).join('');
        }

        // Featured Artists
        const artistSlider = document.getElementById('home-artists-slider');
        if (artistSlider) {
            artistSlider.innerHTML = artists.filter(a => a.id !== 'album_song').slice(0, 10).map(a => `
                <div class="card-glass artist-card-glass" onclick="loadArtistPage('${a.id}')">
                    <div class="img-container">
                        <img src="${a.image}" alt="${a.name}" loading="lazy">
                        ${a.verified ? '<div class="verified-card-badge"><i class="fa-solid fa-check"></i></div>' : ''}
                        <div class="play-overlay"><button class="play-overlay-btn" onclick="playArtistImmediate(event, '${a.id}')"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${a.name}</h4>
                    <p>${a.listeners} listeners</p>
                </div>
            `).join('');
        }

        // New Releases
        const newReleases = document.getElementById('home-new-releases-slider');
        if (newReleases) {
            newReleases.innerHTML = songs.slice().reverse().slice(0, 8).map(s => {
                const art = artists.find(a => a.id === s.artistId);
                return `
                    <div class="card-glass" onclick="playSingleTrack('${s.id}')">
                        <div class="img-container">
                            <img src="${s.img}" alt="${s.title}" loading="lazy">
                            <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                        </div>
                        <h4>${s.title}</h4>
                        <p>${art ? art.name : s.album}</p>
                    </div>
                `;
            }).join('');
        }

        // Popular Albums
        const albumSlider = document.getElementById('home-albums-slider');
        if (albumSlider) {
            const albums = groupAlbums(songs, artists);
            albumSlider.innerHTML = albums.slice(0, 8).map(al => `
                <div class="card-glass" onclick="loadAlbumPage('${al.title.replace(/'/g, "\\'")}')">
                    <div class="img-container">
                        <img src="${al.img}" alt="${al.title}" loading="lazy">
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                        <span class="card-meta-pill">${al.count} Songs</span>
                    </div>
                    <h4>${al.title}</h4>
                    <p>${al.artist}</p>
                </div>
            `).join('');
        }

        // Mood Playlists
        const playlistSlider = document.getElementById('home-playlists-slider');
        if (playlistSlider) {
            const playlists = window.MockBackend.getPlaylists();
            playlistSlider.innerHTML = playlists.map(pl => `
                <div class="card-glass" onclick="playPlaylistInstant('${pl.id}')">
                    <span class="card-meta-pill">AI Curated</span>
                    <div class="img-container">
                        <img src="mus logo.webp" alt="${pl.name}" style="filter: hue-rotate(${pl.type === 'Sad' ? '220deg' : pl.type === 'Energetic' ? '300deg' : '0deg'});">
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${pl.name}</h4>
                    <p>${pl.type} • ${pl.tracks.length} tracks</p>
                </div>
            `).join('');
        }

        // Genres row
        const genreRow = document.getElementById('home-genres-row');
        if (genreRow) {
            const genres = window.MockBackend.getGenres().slice(0, 10);
            genreRow.innerHTML = genres.map(g => `
                <span class="genre-chip" onclick="openGenre('${g.name}')"><i class="fa-solid ${g.icon}"></i> ${g.name}</span>
            `).join('');
        }

        // Weekly Hits
        const weeklyHits = document.getElementById('home-weekly-hits-grid');
        if (weeklyHits) {
            weeklyHits.innerHTML = byPlays.slice(0, 6).map((s, i) => {
                const art = artists.find(a => a.id === s.artistId);
                return `
                    <div class="card-glass" style="width:100%; display:flex; gap:14px; align-items:center; text-align:left;" onclick="playSingleTrack('${s.id}')">
                        <div class="img-container" style="width:52px; height:52px; margin-bottom:0; flex-shrink:0;">
                            <img src="${s.img}" alt="${s.title}" loading="lazy">
                            <div class="play-overlay"><i class="fa-solid fa-play" style="font-size:0.8rem;"></i></div>
                        </div>
                        <div style="flex:1; overflow:hidden;">
                            <h4 style="margin-bottom:2px;">#${i + 1} ${s.title}</h4>
                            <p>${art ? art.name : s.album}</p>
                        </div>
                        <span style="font-size:0.75rem; color:var(--primary-color); font-weight:700;">${(s.plays / 1000).toFixed(1)}K</span>
                    </div>
                `;
            }).join('');
        }

        // Live Concerts
        const concerts = document.getElementById('home-concerts-slider');
        if (concerts) {
            const mockConcerts = [
                { t: 'Anirudh — VR Arena Tour', loc: 'Chennai • YMCA Grounds', img: 'anirudh song/disco.jpeg' },
                { t: 'AR Rahman — Symphonic Night', loc: 'Mumbai • Live 360', img: 'ar rahmon song/ar rahmon.jpeg' },
                { t: 'Thaman S — Beat Fest 2026', loc: 'Bengaluru • VR Dome', img: 'thamon s/thamon s.jpeg' },
                { t: 'Santhosh — Folk Explosion', loc: 'Coimbatore • Open Air', img: 'santhosh narayanan/santhosh narayanan.jpeg' }
            ];
            concerts.innerHTML = mockConcerts.map(c => `
                <div class="card-glass" style="width:300px; aspect-ratio:1.5;" onclick="showToast('Tickets opening soon for ${c.t}', 'info', 'fa-ticket')">
                    <div class="img-container" style="aspect-ratio:1.7;">
                        <img src="${c.img}" alt="${c.t}" style="filter:brightness(.75);" loading="lazy">
                        <div class="play-overlay"><i class="fa-solid fa-ticket" style="font-size:1.8rem; color:var(--primary-color);"></i></div>
                    </div>
                    <h4>${c.t}</h4>
                    <p>${c.loc}</p>
                </div>
            `).join('');
        }

        // Music Videos
        const videos = document.getElementById('home-videos-slider');
        if (videos) {
            const mockVideos = [
                { t: 'Coolie Disco — Official Video', v: '12.4M views', img: 'anirudh song/disco.jpeg' },
                { t: 'Aalaporan Thamizhan — Visual', v: '24.9M views', img: 'ar rahmon song/alaporan tamizhan.jpeg' },
                { t: 'Aasa Kooda — Live Session', v: '8.2M views', img: 'sai abhyankar/aasa kuda.jpeg' },
                { t: 'Rakita Rakita — Audio Visual', v: '5.1M views', img: 'santhosh narayanan/rakita rakita.jpeg' }
            ];
            videos.innerHTML = mockVideos.map(v => `
                <div class="card-glass" style="width:280px; aspect-ratio:1.6; padding:10px;" onclick="showToast('Video player coming soon', 'info', 'fa-youtube')">
                    <div class="img-container" style="aspect-ratio:1.8;">
                        <img src="${v.img}" style="filter:brightness(.75);" loading="lazy">
                        <div class="play-overlay" style="opacity:1;"><i class="fa-brands fa-youtube" style="font-size:2.2rem; color:var(--danger);"></i></div>
                    </div>
                    <h4 style="font-size:0.82rem; margin-top:8px;">${v.t}</h4>
                    <p style="font-size:0.68rem;">${v.v}</p>
                </div>
            `).join('');
        }

        // Podcasts
        const podcasts = document.getElementById('home-podcasts-slider');
        if (podcasts) {
            podcasts.innerHTML = window.MockBackend.getPodcasts().slice(0, 5).map(p => `
                <div class="card-glass" onclick="switchView('podcasts')">
                    <div class="img-container">
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, ${p.color}33, #070B16);">
                            <i class="fa-solid fa-podcast" style="font-size:2.6rem; color:${p.color}; filter:drop-shadow(0 0 14px ${p.color});"></i>
                        </div>
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${p.name}</h4>
                    <p>${p.episodes} episodes</p>
                </div>
            `).join('');
        }

        // Radio
        const radio = document.getElementById('home-radio-slider');
        if (radio) {
            radio.innerHTML = window.MockBackend.getRadioStations().slice(0, 6).map(r => `
                <div class="card-glass" onclick="switchView('radio')">
                    <div class="img-container">
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle, ${r.color}44, #070B16);">
                            <i class="fa-solid fa-tower-broadcast" style="font-size:2.4rem; color:${r.color}; filter:drop-shadow(0 0 14px ${r.color});"></i>
                        </div>
                        <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${r.name}</h4>
                    <p>${r.listeners} live listeners</p>
                </div>
            `).join('');
        }

        // Upcoming Events
        const events = document.getElementById('home-events-grid');
        if (events) {
            const mockEvents = [
                { d: '14', m: 'AUG', t: 'Anirudh VR World Tour', loc: 'Chennai, India' },
                { d: '22', m: 'AUG', t: 'Rahman Live in 360°', loc: 'Mumbai, India' },
                { d: '05', m: 'SEP', t: 'HipHop Tamizha Arena', loc: 'Bengaluru, India' },
                { d: '19', m: 'SEP', t: 'GVP Unplugged Nights', loc: 'Coimbatore, India' }
            ];
            events.innerHTML = mockEvents.map(ev => `
                <div class="event-card glass" onclick="showToast('Event: ${ev.t}', 'info', 'fa-ticket')">
                    <div class="event-date"><span class="d">${ev.d}</span><span class="m">${ev.m}</span></div>
                    <h4>${ev.t}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${ev.loc}</p>
                </div>
            `).join('');
        }
    }

    // ═══════════════ 9. VIEW: DISCOVER ═══════════════
    let currentFilterGenre = '';
    function renderDiscoverView() {
        const songs = window.MockBackend.getSongs();
        const list = document.getElementById('discover-songs-list');
        if (!list) return;

        const filtered = currentFilterGenre
            ? songs.filter(s => s.genre.toLowerCase().includes(currentFilterGenre.toLowerCase()))
            : songs;

        if (filtered.length === 0) {
            list.innerHTML = `<div class="autocomplete-empty">No songs in this genre yet.</div>`;
            return;
        }
        list.innerHTML = filtered.map((s, i) => songRowHtml(s, i, 'discover')).join('');
    }

    window.filterDiscoverSongs = function(genre) {
        currentFilterGenre = genre;
        document.querySelectorAll('#discover-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');
        renderDiscoverView();
    };

    window.openGenre = function(genreName) {
        currentFilterGenre = genreName;
        window.switchView('discover');
        document.querySelectorAll('#discover-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('#discover-filter-chips .filter-chip').forEach(c => {
            if (c.textContent.trim().toLowerCase() === genreName.toLowerCase()) c.classList.add('active');
        });
        renderDiscoverView();
    };

    // ═══════════════ 10. VIEW: ARTISTS DIRECTORY ═══════════════
    function renderArtistsView() {
        const artists = window.MockBackend.getArtists();
        const grid = document.getElementById('artists-grid');
        if (!grid) return;

        grid.innerHTML = artists.map(a => {
            const followKey = `followed_${currentUser.email}_${a.id}`;
            const isFollowed = localStorage.getItem(followKey) === 'true';
            const songs = window.MockBackend.getSongs().filter(s => s.artistId === a.id);
            return `
                <div class="card-glass artist-card-glass" onclick="loadArtistPage('${a.id}')">
                    <div class="img-container">
                        <img src="${a.image}" alt="${a.name}" loading="lazy">
                        ${a.verified ? '<div class="verified-card-badge"><i class="fa-solid fa-check"></i></div>' : ''}
                        <div class="play-overlay"><button class="play-overlay-btn" onclick="playArtistImmediate(event, '${a.id}')"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${a.name}</h4>
                    <p>${songs.length} tracks • ${a.listeners} listeners</p>
                    <div style="height:4px; background:rgba(255,255,255,.08); border-radius:4px; margin-top:10px; overflow:hidden;">
                        <div style="width:${a.popularity}%; height:100%; background:linear-gradient(90deg, var(--primary-color), var(--purple)); border-radius:4px;"></div>
                    </div>
                    <button class="artist-follow-btn mini-follow ${isFollowed ? 'following' : ''}" onclick="followArtist(event, '${a.id}')">${isFollowed ? 'Following' : 'Follow'}</button>
                </div>
            `;
        }).join('');
    }

    window.followArtist = function(e, artistId) {
        e.stopPropagation();
        const key = `followed_${currentUser.email}_${artistId}`;
        const followed = localStorage.getItem(key) === 'true';
        localStorage.setItem(key, !followed);
        const btn = e.currentTarget;
        btn.textContent = !followed ? 'Following' : 'Follow';
        btn.classList.toggle('following', !followed);
        window.showToast(!followed ? 'Artist added to your collection' : 'Removed from collection', !followed ? 'success' : 'info', !followed ? 'fa-heart' : 'fa-heart-crack');
        renderProfileView();
    };

    // ═══════════════ 11. VIEW: ALBUMS DIRECTORY ═══════════════
    function groupAlbums(songs, artists) {
        const map = {};
        songs.forEach(s => {
            if (!map[s.album]) {
                const art = artists.find(a => a.id === s.artistId);
                map[s.album] = { title: s.album, img: s.img, artist: art ? art.name : 'Unknown', count: 0, duration: 0 };
            }
            map[s.album].count++;
        });
        return Object.values(map);
    }

    function renderAlbumsView() {
        const songs = window.MockBackend.getSongs();
        const artists = window.MockBackend.getArtists();
        const albums = groupAlbums(songs, artists);
        const grid = document.getElementById('albums-grid');
        if (!grid) return;

        grid.innerHTML = albums.map(al => `
            <div class="card-glass" onclick="loadAlbumPage('${al.title.replace(/'/g, "\\'")}')">
                <div class="img-container">
                    <img src="${al.img}" alt="${al.title}" loading="lazy">
                    <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                    <span class="card-meta-pill">${al.count} Songs</span>
                </div>
                <h4>${al.title}</h4>
                <p>${al.artist}</p>
            </div>
        `).join('');
    }

    // ═══════════════ 12. VIEW: GENRES ═══════════════
    function renderGenresView() {
        const genres = window.MockBackend.getGenres();
        const grid = document.getElementById('genres-grid');
        if (!grid) return;

        grid.innerHTML = genres.map(g => `
            <div class="genre-orbit-card" style="--gc:${g.color};" onclick="openGenre('${g.name}')">
                <i class="fa-solid ${g.icon}"></i>
                <h4>${g.name}</h4>
                <p>${g.count} tracks</p>
            </div>
        `).join('');
    }

    // ═══════════════ 13. VIEW: TRENDING ═══════════════
    function renderTrendingView() {
        const songs = window.MockBackend.getSongs().slice().sort((a, b) => (b.plays || 0) - (a.plays || 0));
        const list = document.getElementById('trending-songs-list');
        if (!list) return;
        list.innerHTML = songs.slice(0, 40).map((s, i) => songRowHtml(s, i, 'trending', { rank: i + 1 })).join('');
    }

    // ═══════════════ 14. VIEW: PODCASTS ═══════════════
    function renderPodcastsView() {
        const podcasts = window.MockBackend.getPodcasts();
        const grid = document.getElementById('podcasts-grid');
        if (!grid) return;

        grid.innerHTML = podcasts.map(p => `
            <div class="card-glass" onclick="showToast('Now playing: ${p.name}', 'info', 'fa-podcast')">
                <div class="img-container">
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, ${p.color}44, #070B16);">
                        <i class="fa-solid fa-podcast" style="font-size:3rem; color:${p.color}; filter:drop-shadow(0 0 18px ${p.color});"></i>
                    </div>
                    <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                </div>
                <h4>${p.name}</h4>
                <p>${p.genre} • ${p.episodes} episodes</p>
            </div>
        `).join('');
    }

    // ═══════════════ 15. VIEW: RADIO ═══════════════
    function renderRadioView() {
        const stations = window.MockBackend.getRadioStations();
        const list = document.getElementById('radio-grid');
        if (!list) return;

        list.innerHTML = stations.map(r => `
            <div class="radio-card" onclick="playRadioStation('${r.id}')">
                <div class="radio-avatar" style="background:linear-gradient(135deg, ${r.color}, #7C3AED); box-shadow:0 0 20px ${r.color}66;">
                    <i class="fa-solid fa-tower-broadcast"></i>
                </div>
                <div>
                    <h4>${r.name}</h4>
                    <p class="radio-tag">${r.tagline}</p>
                    <span class="radio-live"><span class="live-dot"></span> Live</span>
                </div>
                <div class="radio-stats">
                    <p><i class="fa-solid fa-headphones"></i> ${r.listeners}</p>
                    <p>${r.genre}</p>
                </div>
            </div>
        `).join('');
    }

    window.playRadioStation = function(id) {
        const stations = window.MockBackend.getRadioStations();
        const station = stations.find(s => s.id === id);
        if (!station) return;
        const songs = window.MockBackend.getSongs();
        const match = songs.filter(s => s.genre.toLowerCase().includes(station.genre.toLowerCase()));
        const list = match.length ? match : songs;
        currentPlaylist = list;
        currentSongIndex = Math.floor(Math.random() * list.length);
        playSong(list[currentSongIndex]);
        window.showToast(`Tuned in to ${station.name}`, 'success', 'fa-tower-broadcast');
    };

    // ═══════════════ 16. VIEW: DOWNLOADS ═══════════════
    function renderDownloadsView() {
        if (!window.DownloadManager) return;
        const songs = window.MockBackend.getSongs();
        const list = document.getElementById('downloads-list');
        const activeList = document.getElementById('dl-active-list');
        const countLabel = document.getElementById('dl-count-label');
        if (!list) return;

        const tasks = window.DownloadManager.getTasks();
        const activeTasks = tasks.filter(t => t.state === 'downloading' || t.state === 'paused' || t.state === 'failed');

        if (activeList) {
            if (activeTasks.length === 0) {
                activeList.innerHTML = `<div class="autocomplete-empty" style="font-size:.85rem; padding:14px;">
                    <i class="fa-solid fa-cloud-arrow-down" style="font-size:1.8rem; color:var(--text-dim); display:block; margin-bottom:8px;"></i>
                    No active downloads. Use the download icon on any song to add it here.
                </div>`;
            } else {
                activeList.innerHTML = activeTasks.map(t => {
                    const stateText = t.state === 'downloading'
                        ? `${Math.round(t.progress)}% • ${formatSpeed(t.speed)}`
                        : t.state === 'paused' ? 'Paused' : 'Failed — tap retry';
                    const stateClass = t.state === 'paused' ? 'paused' : (t.state === 'failed' ? 'err' : '');
                    return `
                        <div class="dl-task" data-task="${t.id}">
                            <img src="${t.song.img}" alt="${t.song.title}" loading="lazy">
                            <div class="dl-task-main">
                                <h5>${t.song.title}</h5>
                                <p>${t.song.album} • ${t.quality}</p>
                                <div class="dl-progress-bar"><div class="dl-progress-fill" style="width:${t.progress}%;"></div></div>
                                <span class="dl-task-state ${stateClass}">${stateText}</span>
                            </div>
                            <div class="dl-task-actions">
                                ${t.state === 'downloading'
                                    ? `<button class="dl-btn" onclick="dlControl(event, '${t.id}', 'pause')" title="Pause"><i class="fa-solid fa-pause"></i></button>
                                       <button class="dl-btn danger" onclick="dlControl(event, '${t.id}', 'cancel')" title="Cancel"><i class="fa-solid fa-xmark"></i></button>`
                                    : t.state === 'paused'
                                    ? `<button class="dl-btn" onclick="dlControl(event, '${t.id}', 'resume')" title="Resume"><i class="fa-solid fa-play"></i></button>
                                       <button class="dl-btn danger" onclick="dlControl(event, '${t.id}', 'cancel')" title="Cancel"><i class="fa-solid fa-xmark"></i></button>`
                                    : `<button class="dl-btn" onclick="dlControl(event, '${t.id}', 'resume')" title="Retry"><i class="fa-solid fa-rotate-right"></i></button>
                                       <button class="dl-btn danger" onclick="dlControl(event, '${t.id}', 'cancel')" title="Cancel"><i class="fa-solid fa-xmark"></i></button>`}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        const downloaded = songs.filter(s => window.DownloadManager.isDownloaded(s.id));

        if (countLabel) countLabel.textContent = `${downloaded.length} offline song${downloaded.length === 1 ? '' : 's'}`;

        if (downloaded.length === 0) {
            list.innerHTML = `<div class="autocomplete-empty">
                <i class="fa-solid fa-download" style="font-size:2.4rem; color:var(--text-dim); display:block; margin-bottom:12px;"></i>
                No offline songs yet. Tap the download icon on any song row to save it to your device.
            </div>`;
        } else {
            list.innerHTML = downloaded.map((s, i) => songRowHtml(s, i, 'downloads')).join('');
        }

        renderStorageCard(downloaded.length);
    }

    function formatSpeed(bytesPerSec) {
        if (!bytesPerSec || bytesPerSec <= 0) return '…';
        const mb = bytesPerSec / 1048576;
        return mb >= 1 ? mb.toFixed(1) + ' MB/s' : Math.round(bytesPerSec / 1024) + ' KB/s';
    }

    function renderStorageCard(count) {
        const card = document.getElementById('dl-storage-card');
        if (!card || !window.DownloadManager) return;
        window.DownloadManager.getStorageStats().then(stats => {
            const usedMb = stats.total / 1048576;
            const quotaMb = stats.quota ? stats.quota / 1048576 : 0;
            const usedEl = document.getElementById('dl-storage-used');
            const detailEl = document.getElementById('dl-storage-detail');
            const fillEl = document.getElementById('dl-storage-fill');
            if (usedEl) usedEl.textContent = `${usedMb.toFixed(1)} MB used`;
            if (detailEl) detailEl.textContent = `${count} offline song${count === 1 ? '' : 's'} • ${quotaMb ? (quotaMb / 1024).toFixed(1) + ' GB available' : 'secure IndexedDB storage'}`;
            if (fillEl) {
                const pct = quotaMb ? Math.min(100, (usedMb / quotaMb) * 100) : (count > 0 ? 100 : 0);
                fillEl.style.width = pct + '%';
            }
            const clearBtn = document.getElementById('dl-clear-all');
            if (clearBtn) {
                clearBtn.style.display = count > 0 ? 'inline-flex' : 'none';
                clearBtn.onclick = () => {
                    if (confirm('Remove ALL offline downloads from this device?')) {
                        window.DownloadManager.clearAll().then(() => {
                            window.showToast('Offline library cleared', 'success', 'fa-trash-can');
                            renderDownloadsView();
                            refreshAllViews();
                        });
                    }
                };
            }
        });
    }

    window.dlControl = function(e, id, action) {
        e.stopPropagation();
        if (!window.DownloadManager) return;
        if (action === 'pause') window.DownloadManager.pause(id);
        else if (action === 'resume') window.DownloadManager.resume(id);
        else if (action === 'cancel') window.DownloadManager.cancel(id);
        setTimeout(() => { if (document.querySelector('.app-view.active').id === 'view-downloads') renderDownloadsView(); }, 120);
    };

    // ═══════════════ 17. VIEW: FAVORITES ═══════════════
    function renderFavoritesView() {
        const songs = window.MockBackend.getSongs();
        const list = document.getElementById('favorites-songs-list');
        if (!list) return;

        const favorited = songs.filter(s => window.MockBackend.isLiked(s.id));

        if (favorited.length === 0) {
            list.innerHTML = `<div class="autocomplete-empty">
                <i class="fa-solid fa-heart" style="font-size:2.4rem; color:var(--pink); display:block; margin-bottom:12px;"></i>
                No favorites yet. Click the heart icon to add tracks!
            </div>`;
            return;
        }
        list.innerHTML = favorited.map((s, i) => songRowHtml(s, i, 'favorites')).join('');
    }

    // ═══════════════ 18. VIEW: HISTORY ═══════════════
    function renderHistoryView() {
        const histIds = window.MockBackend.getRecentlyPlayed();
        const songs = window.MockBackend.getSongs();
        const list = document.getElementById('history-songs-list');
        if (!list) return;

        const histSongs = histIds.map(id => songs.find(s => s.id === id)).filter(Boolean);

        if (histSongs.length === 0) {
            list.innerHTML = `<div class="autocomplete-empty">No listening history recorded yet. Start playing tracks!</div>`;
            return;
        }
        list.innerHTML = histSongs.map((s, i) => songRowHtml(s, i, 'history')).join('');
    }

    // ═══════════════ 19. VIEW: PROFILE DASHBOARD ═══════════════
    function renderProfileView() {
        const user = window.MockBackend.getCurrentUser();
        if (!user) return;

        const letterEl = document.getElementById('profile-avatar-letter');
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const bioEl = document.getElementById('profile-bio');
        const tierEl = document.getElementById('profile-tier-pill');
        if (letterEl) letterEl.textContent = user.avatar;
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (bioEl) bioEl.textContent = user.bio || 'No bio yet.';
        if (tierEl) tierEl.textContent = user.subscription;

        // Followers / Following
        const followers = localStorage.getItem('vrmusic_followers') ? parseInt(localStorage.getItem('vrmusic_followers')) : 128;
        const songs = window.MockBackend.getSongs();
        const likes = songs.filter(s => window.MockBackend.isLiked(s.id));
        const hist = window.MockBackend.getRecentlyPlayed();
        const hours = (hist.length * 0.35).toFixed(1);

        document.getElementById('profile-stat-followers').textContent = followers;
        document.getElementById('profile-stat-likes').textContent = likes.length;
        document.getElementById('profile-stat-hours').textContent = hours;

        // Following count
        const artists = window.MockBackend.getArtists();
        let following = 0;
        artists.forEach(a => { if (localStorage.getItem(`followed_${currentUser.email}_${a.id}`) === 'true') following++; });
        document.getElementById('profile-stat-following').textContent = following;

        // Badges
        const badgesWall = document.getElementById('profile-badges-wall');
        if (badgesWall) {
            badgesWall.innerHTML = (user.badges || ['Explorer']).map(b => `
                <div class="badge-tile">
                    <i class="fa-solid fa-award"></i>
                    <span>${b}</span>
                </div>
            `).join('');
        }

        // Favorite artists slider
        const artistSlider = document.getElementById('profile-artists-slider');
        if (artistSlider) {
            const favArtists = artists.filter(a => localStorage.getItem(`followed_${currentUser.email}_${a.id}`) === 'true');
            const list = favArtists.length ? favArtists : artists.filter(a => a.id !== 'album_song').slice(0, 6);
            artistSlider.innerHTML = list.map(a => `
                <div class="card-glass artist-card-glass" onclick="loadArtistPage('${a.id}')">
                    <div class="img-container">
                        <img src="${a.image}" alt="${a.name}" loading="lazy">
                        ${a.verified ? '<div class="verified-card-badge"><i class="fa-solid fa-check"></i></div>' : ''}
                        <div class="play-overlay"><button class="play-overlay-btn" onclick="playArtistImmediate(event, '${a.id}')"><i class="fa-solid fa-play"></i></button></div>
                    </div>
                    <h4>${a.name}</h4>
                    <p>${a.listeners} listeners</p>
                </div>
            `).join('');
        }

        // Listening heatmap
        const cells = document.getElementById('profile-heatmap-cells');
        if (cells) {
            let html = '';
            for (let i = 0; i < 28; i++) {
                const level = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 4) + 1;
                html += `<div class="heat-cell" data-level="${level}"></div>`;
            }
            cells.innerHTML = html;
        }
    }

    // ═══════════════ 20. VIEW: ARTIST DETAIL ═══════════════
    window.loadArtistPage = function(artistId) {
        const artists = window.MockBackend.getArtists();
        const art = artists.find(a => a.id === artistId);
        if (!art) return;

        window.switchView('artist');

        document.getElementById('artist-banner-bg').src = art.image;
        document.getElementById('artist-view-name').textContent = art.name;
        document.getElementById('artist-view-desc').textContent = `${art.desc} • ${art.listeners} Monthly Listeners • ${art.followers.toLocaleString()} Followers`;
        document.getElementById('artist-verified-tag').style.display = art.verified ? 'flex' : 'none';

        // Genre chips
        const genreBox = document.getElementById('artist-view-genres');
        if (genreBox) {
            genreBox.innerHTML = (art.genres || []).map(g => `<span class="hero-chip"><i class="fa-solid fa-music"></i> ${g}</span>`).join('');
        }

        const playBtn = document.getElementById('artist-view-play');
        const stopBtn = document.getElementById('artist-view-stop');
        const followBtn = document.getElementById('artist-view-follow');

        playBtn.onclick = (e) => playArtistImmediate(e, artistId);
        stopBtn.onclick = () => {
            audio.pause();
            isPlaying = false;
            updatePlayIcon();
        };

        const followKey = `followed_${currentUser.email}_${artistId}`;
        const updateFollowUI = () => {
            const isFollowed = localStorage.getItem(followKey) === 'true';
            followBtn.textContent = isFollowed ? 'Following' : 'Follow';
            followBtn.className = isFollowed ? 'artist-follow-btn following' : 'artist-follow-btn';
        };
        updateFollowUI();

        followBtn.onclick = () => {
            const isFollowed = localStorage.getItem(followKey) === 'true';
            localStorage.setItem(followKey, !isFollowed);
            updateFollowUI();
            window.showToast(!isFollowed ? `Following ${art.name}` : `Unfollowed ${art.name}`, !isFollowed ? 'success' : 'info', 'fa-heart');
        };

        const shareBtn = document.getElementById('artist-view-share');
        if (shareBtn) shareBtn.onclick = () => window.shareSong(event, artistId, art.name);

        const songSearch = document.getElementById('artist-song-search-input');
        songSearch.value = '';
        const renderArtistSongs = (query = '') => {
            const songs = window.MockBackend.getSongs().filter(s => s.artistId === artistId);
            const list = document.getElementById('artist-tracks-list');
            const filtered = query ? songs.filter(s => s.title.toLowerCase().includes(query.toLowerCase())) : songs;

            if (filtered.length === 0) {
                list.innerHTML = `<div class="autocomplete-empty">No matching tracks.</div>`;
                return;
            }
            list.innerHTML = filtered.map((s, i) => songRowHtml(s, i, 'artist_' + artistId)).join('');
        };
        renderArtistSongs();
        songSearch.oninput = (e) => renderArtistSongs(e.target.value);
    };

    // ═══════════════ 21. VIEW: ALBUM DETAIL ═══════════════
    window.loadAlbumPage = function(albumTitle) {
        const songs = window.MockBackend.getSongs().filter(s => s.album.toLowerCase() === albumTitle.toLowerCase());
        if (songs.length === 0) return;

        window.switchView('album');

        const firstSong = songs[0];
        const artists = window.MockBackend.getArtists();
        const art = artists.find(a => a.id === firstSong.artistId);

        document.getElementById('album-view-img').src = firstSong.img;
        document.getElementById('album-view-title').textContent = albumTitle;
        document.getElementById('album-view-artist-name').textContent = art ? art.name : 'Unknown Artist';
        document.getElementById('album-view-tracks-count').textContent = songs.length;
        const descEl = document.getElementById('album-view-desc');
        if (descEl) descEl.textContent = `${songs.length} tracks • ${firstSong.genre} • 2026`;

        const list = document.getElementById('album-tracks-list');
        list.innerHTML = songs.map((s, i) => songRowHtml(s, i, 'album_' + albumTitle)).join('');

        const playAllBtn = document.getElementById('album-play-all');
        if (playAllBtn) {
            playAllBtn.onclick = () => {
                currentPlaylist = songs;
                currentSongIndex = 0;
                playSong(songs[0]);
            };
        }
        const shareBtn = document.getElementById('album-share-btn');
        if (shareBtn) shareBtn.onclick = () => window.shareSong(event, firstSong.id, albumTitle);

        const commentInput = document.getElementById('album-comment-text');
        const commentBtn = document.getElementById('album-comment-submit');
        const commentsThread = document.getElementById('album-comments-thread');

        const loadComments = () => {
            const reviews = window.MockBackend.getComments(albumTitle);
            if (reviews.length === 0) {
                commentsThread.innerHTML = `<p style="padding:10px; color:var(--text-dim); font-size:0.85rem;">No reviews yet. Be the first to share your thoughts!</p>`;
                return;
            }
            commentsThread.innerHTML = reviews.map(r => `
                <div class="comment-item">
                    <div class="comment-item-header">
                        <span>${r.user}</span>
                        <span>${r.date}</span>
                    </div>
                    <p>${r.text}</p>
                </div>
            `).join('');
        };
        loadComments();

        commentBtn.onclick = () => {
            const text = commentInput.value.trim();
            if (!text) return;
            const res = window.MockBackend.addComment(albumTitle, text);
            if (res.success) {
                commentInput.value = '';
                loadComments();
                window.showToast('Review posted!', 'success', 'fa-comment');
            }
        };
    };

    // ═══════════════ 22. VIEW: PLAYLISTS ═══════════════
    function renderPlaylistsView() {
        const playlists = window.MockBackend.getPlaylists();
        const grid = document.getElementById('playlists-grid');
        if (!grid) return;

        grid.innerHTML = playlists.map(pl => `
            <div class="card-glass" onclick="playPlaylistInstant('${pl.id}')">
                <span class="card-meta-pill">AI Curated</span>
                <div class="img-container">
                    <img src="mus logo.webp" alt="${pl.name}" style="filter: hue-rotate(${pl.type === 'Sad' ? '220deg' : pl.type === 'Energetic' ? '300deg' : '0deg'});">
                    <div class="play-overlay"><button class="play-overlay-btn"><i class="fa-solid fa-play"></i></button></div>
                </div>
                <h4>${pl.name}</h4>
                <p>Telemetry Match: ${pl.type} • ${pl.tracks.length} tracks</p>
            </div>
        `).join('');

        const scanBtn = document.getElementById('ai-mood-detector-trigger');
        const cameraBox = document.getElementById('mood-webcam-box');

        if (scanBtn && cameraBox) {
            scanBtn.onclick = () => {
                scanBtn.disabled = true;
                scanBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing Scanning...';
                cameraBox.innerHTML = `<div class="scanner-laser" style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--primary-color); box-shadow: 0 0 10px var(--primary-color); animation: laserScan 2s infinite alternate linear;"></div><i class="fa-solid fa-user-circle" style="font-size:3.5rem; color:var(--primary-color); animation: pulseGlow 1.5s infinite alternate;"></i>`;

                setTimeout(() => {
                    scanBtn.disabled = false;
                    scanBtn.innerHTML = '<i class="fa-solid fa-check"></i> Analysis Completed!';
                    const moods = ['Happy', 'Sad', 'Energetic', 'Relaxed'];
                    const match = moods[Math.floor(Math.random() * moods.length)];
                    cameraBox.innerHTML = `<h3 style="color:var(--primary-color); text-transform:uppercase; font-size:1.1rem;">${match}</h3>`;

                    const pl = playlists.find(p => p.type === match);
                    if (pl) {
                        setTimeout(() => {
                            playPlaylistInstant(pl.id);
                            window.showToast(`Facial telemetry suggests "${match}" — loaded ${pl.name}`, 'success', 'fa-wand-magic-sparkles');
                        }, 800);
                    }
                }, 3000);
            };
        }
    }

    // ═══════════════ 23. VIEW: SETTINGS ═══════════════
    function renderSettingsView() {
        const user = window.MockBackend.getCurrentUser();
        if (!user) return;

        document.getElementById('settings-avatar-letter').textContent = user.avatar;
        document.getElementById('settings-user-name').textContent = user.name;
        document.getElementById('settings-user-email').textContent = user.email;
        document.getElementById('settings-input-name').value = user.name;
        document.getElementById('settings-input-bio').value = user.bio || '';

        const badgesContainer = document.getElementById('settings-badges-list');
        if (badgesContainer) {
            badgesContainer.innerHTML = (user.badges || ['Explorer']).map(b => `
                <div class="badge-item"><i class="fa-solid fa-award"></i><span>${b}</span></div>
            `).join('');
        }

        const saveBtn = document.getElementById('settings-save-btn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const name = document.getElementById('settings-input-name').value.trim();
                const bio = document.getElementById('settings-input-bio').value.trim();
                if (!name) return;
                const users = JSON.parse(localStorage.getItem('vrmusic_db_users') || '[]');
                const uIdx = users.findIndex(u => u.email === user.email);
                if (uIdx !== -1) {
                    users[uIdx].name = name;
                    users[uIdx].bio = bio;
                    localStorage.setItem('vrmusic_db_users', JSON.stringify(users));
                    document.getElementById('profile-user-name').textContent = name;
                    document.getElementById('settings-user-name').textContent = name;
                    window.showToast('Profile settings updated successfully!', 'success', 'fa-circle-check');
                }
            };
        }

        const upgradeBox = document.getElementById('settings-upgrade-promo');
        const upgradeBtn = document.getElementById('settings-upgrade-trigger');

        const syncSubscriptionUI = () => {
            const u = window.MockBackend.getCurrentUser();
            const pill = document.getElementById('profile-subscription-pill');
            if (pill) pill.textContent = u.subscription;
            const badge = document.getElementById('premium-badge-label');
            if (badge) badge.textContent = u.subscription === 'Free tier' ? 'Free Tier' : 'Premium';
            const premiumBadge = document.getElementById('premium-badge');
            if (premiumBadge) {
                premiumBadge.style.borderColor = u.subscription === 'Free tier' ? 'rgba(245,158,11,.3)' : 'rgba(245,158,11,.7)';
                premiumBadge.style.background = u.subscription === 'Free tier'
                    ? 'linear-gradient(90deg, rgba(245,158,11,.12), rgba(236,72,153,.1))'
                    : 'linear-gradient(90deg, rgba(245,158,11,.3), rgba(236,72,153,.25))';
            }
            if (upgradeBox) upgradeBox.style.display = (u.subscription !== 'Free tier') ? 'none' : 'flex';
        };
        syncSubscriptionUI();

        if (upgradeBtn) {
            upgradeBtn.onclick = () => {
                const res = window.MockBackend.updateSubscription('Premium');
                if (res.success) {
                    syncSubscriptionUI();
                    renderSettingsView();
                    window.showToast('Congratulations! VR Premium unlocked — Spatial acoustics enabled.', 'success', 'fa-crown');
                }
            };
        }
    }

    // ═══════════════ 24. VIEW: ADMIN ═══════════════
    let streamChartInst = null;
    let genreChartInst = null;
    function renderAdminView() {
        const statsRes = window.MockBackend.getAdminDashboardStats();
        if (!statsRes.success) return;
        const data = statsRes.stats;

        document.getElementById('admin-stat-streams').textContent = data.totalStreams.toLocaleString();
        document.getElementById('admin-stat-users').textContent = data.totalUsers;
        document.getElementById('admin-stat-songs').textContent = data.totalSongs || window.MockBackend.getSongs().length;
        document.getElementById('admin-stat-revenue').textContent = data.monthlyRevenue;

        const lineCanvas = document.getElementById('chart-streams-canvas');
        if (lineCanvas && window.Chart) {
            if (streamChartInst) streamChartInst.destroy();
            streamChartInst = new Chart(lineCanvas, {
                type: 'line',
                data: {
                    labels: data.streamChartData.labels,
                    datasets: [{
                        label: 'Total Plays',
                        data: data.streamChartData.datasets,
                        borderColor: '#00E5FF',
                        backgroundColor: 'rgba(0, 229, 255, 0.06)',
                        tension: 0.4, fill: true,
                        pointBackgroundColor: '#00E5FF'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CA3AF' } },
                        x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
                    }
                }
            });
        }

        const genreCanvas = document.getElementById('chart-genres-canvas');
        if (genreCanvas && window.Chart) {
            if (genreChartInst) genreChartInst.destroy();
            genreChartInst = new Chart(genreCanvas, {
                type: 'doughnut',
                data: {
                    labels: data.genreDistribution.labels,
                    datasets: [{
                        data: data.genreDistribution.datasets,
                        backgroundColor: ['#00E5FF', '#7C3AED', '#EC4899', '#22C55E'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', boxWidth: 10 } } }
                }
            });
        }
    }

    // ═══════════════ 25. AUDIO PLAYER CONTROLS ═══════════════
    function updatePlayIcon() {
        if (isPlaying) {
            playerPlayIcon.classList.remove('fa-play');
            playerPlayIcon.classList.add('fa-pause');
            document.getElementById('app-bottom-player').classList.add('playing');
            fsPlayer.classList.add('playing');
            fsToggleBtn.querySelector('i').className = 'fa-solid fa-pause';
        } else {
            playerPlayIcon.classList.remove('fa-pause');
            playerPlayIcon.classList.add('fa-play');
            document.getElementById('app-bottom-player').classList.remove('playing');
            fsPlayer.classList.remove('playing');
            fsToggleBtn.querySelector('i').className = 'fa-solid fa-play';
        }
        if (miniPlayBtn) miniPlayBtn.querySelector('i').className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    window.togglePlay = function() {
        if (!audio.src) {
            const songs = window.MockBackend.getSongs();
            if (songs.length > 0) {
                currentPlaylist = songs;
                currentSongIndex = 0;
                playSong(songs[0]);
            }
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play().then(() => { isPlaying = true; }).catch(e => console.error('Play block:', e));
        }
        updatePlayIcon();
    };

    playerPlayBtn.addEventListener('click', window.togglePlay);
    fsToggleBtn.addEventListener('click', window.togglePlay);

    // Progress tracking
    function setRangeFill(el, pct) {
        if (el) el.style.setProperty('--fill', pct + '%');
    }

    audio.addEventListener('timeupdate', () => {
        const { currentTime, duration } = audio;
        if (isNaN(duration)) return;
        const percentage = (currentTime / duration) * 100;
        seekSlider.value = percentage;
        fsSeek.value = percentage;
        setRangeFill(seekSlider, percentage);
        setRangeFill(fsSeek, percentage);
        currentTimeEl.textContent = formatTime(currentTime);
        totalDurationEl.textContent = formatTime(duration);
        fsCurrentTime.textContent = formatTime(currentTime);
        fsTotalDuration.textContent = formatTime(duration);
        updateLyricsHighlight(currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        if (!isNaN(duration)) {
            totalDurationEl.textContent = formatTime(duration);
            fsTotalDuration.textContent = formatTime(duration);
        }
    });

    seekSlider.addEventListener('input', (e) => {
        if (!audio.duration) return;
        audio.currentTime = (audio.duration / 100) * e.target.value;
    });
    fsSeek.addEventListener('input', (e) => {
        if (!audio.duration) return;
        audio.currentTime = (audio.duration / 100) * e.target.value;
    });

    // Prev / Next
    window.nextSong = function() {
        if (currentPlaylist.length === 0) return;
        if (isRepeat === 'one') {
            audio.currentTime = 0;
            audio.play();
            return;
        }
        if (isShuffle) {
            currentSongIndex = Math.floor(Math.random() * currentPlaylist.length);
        } else {
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        }
        playSong(currentPlaylist[currentSongIndex]);
    };

    window.prevSong = function() {
        if (currentPlaylist.length === 0) return;
        if (isShuffle) {
            currentSongIndex = Math.floor(Math.random() * currentPlaylist.length);
        } else {
            currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        }
        playSong(currentPlaylist[currentSongIndex]);
    };

    document.getElementById('player-next-btn').addEventListener('click', window.nextSong);
    document.getElementById('player-prev-btn').addEventListener('click', window.prevSong);
    document.getElementById('fs-next-btn').addEventListener('click', window.nextSong);
    document.getElementById('fs-prev-btn').addEventListener('click', window.prevSong);
    audio.addEventListener('ended', window.nextSong);

    // Shuffle / Repeat
    const shuffleBtn = document.getElementById('player-shuffle-btn');
    const repeatBtn = document.getElementById('player-repeat-btn');

    function syncShuffleUI() {
        shuffleBtn.classList.toggle('active', isShuffle);
        fsShuffleBtn.classList.toggle('active', isShuffle);
    }
    function syncRepeatUI() {
        fsRepeatBtn.className = 'fa-solid fa-repeat' + (isRepeat !== 'none' ? ' active' : '');
        fsRepeatBtn.style.color = isRepeat === 'one' ? 'var(--purple)' : '';
    }

    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        syncShuffleUI();
        window.showToast(isShuffle ? 'Shuffle ON' : 'Shuffle OFF', 'info', 'fa-shuffle');
    });
    fsShuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        syncShuffleUI();
    });

    repeatBtn.addEventListener('click', () => {
        if (isRepeat === 'none') {
            isRepeat = 'all';
            repeatBtn.className = 'fa-solid fa-repeat active';
        } else if (isRepeat === 'all') {
            isRepeat = 'one';
            repeatBtn.className = 'fa-solid fa-repeat active';
            repeatBtn.style.color = 'var(--purple)';
        } else {
            isRepeat = 'none';
            repeatBtn.className = 'fa-solid fa-repeat';
            repeatBtn.style.color = '';
        }
        syncRepeatUI();
    });
    fsRepeatBtn.addEventListener('click', () => {
        if (isRepeat === 'none') { isRepeat = 'all'; }
        else if (isRepeat === 'all') { isRepeat = 'one'; }
        else { isRepeat = 'none'; }
        repeatBtn.className = 'fa-solid fa-repeat' + (isRepeat !== 'none' ? ' active' : '');
        repeatBtn.style.color = isRepeat === 'one' ? 'var(--purple)' : '';
        syncRepeatUI();
    });

    // Volume
    function updateVolumeIcon(vol) {
        if (vol === 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
            fsVolumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (vol < 0.4) {
            volumeIcon.className = 'fa-solid fa-volume-low';
            fsVolumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
            fsVolumeIcon.className = 'fa-solid fa-volume-high';
        }
        setRangeFill(volumeSlider, vol * 100);
        setRangeFill(fsVolumeSlider, vol * 100);
    }

    volumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        audio.volume = vol;
        fsVolumeSlider.value = e.target.value;
        updateVolumeIcon(vol);
    });
    fsVolumeSlider.addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        audio.volume = vol;
        volumeSlider.value = e.target.value;
        updateVolumeIcon(vol);
    });

    const toggleMute = () => {
        if (audio.volume > 0) {
            prevVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            fsVolumeSlider.value = 0;
            updateVolumeIcon(0);
        } else {
            audio.volume = prevVolume;
            volumeSlider.value = prevVolume * 100;
            fsVolumeSlider.value = prevVolume * 100;
            updateVolumeIcon(prevVolume);
        }
    };
    volumeIcon.addEventListener('click', toggleMute);
    fsVolumeIcon.addEventListener('click', toggleMute);

    // Playback Speed
    const speedBtn = document.getElementById('player-speed-btn');
    const speedDropdown = document.getElementById('player-speed-dropdown');
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speedDropdown.style.display = speedDropdown.style.display === 'flex' ? 'none' : 'flex';
    });
    speedDropdown.querySelectorAll('.sleep-option').forEach(opt => {
        opt.onclick = () => {
            const speed = parseFloat(opt.getAttribute('data-speed'));
            audio.playbackRate = speed;
            speedDropdown.style.display = 'none';
            window.showToast(`Playback speed: ${speed}x`, 'info', 'fa-gauge-high');
        };
    });

    // Sleep Timer
    const sleepBtn = document.getElementById('player-sleep-btn');
    const sleepDropdown = document.getElementById('player-sleep-dropdown');
    sleepBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sleepDropdown.style.display = sleepDropdown.style.display === 'flex' ? 'none' : 'flex';
    });
    sleepDropdown.querySelectorAll('.sleep-option').forEach(opt => {
        opt.onclick = () => {
            const time = parseInt(opt.getAttribute('data-time'));
            sleepDropdown.style.display = 'none';
            clearTimeout(sleepTimerTimeout);
            clearInterval(sleepTimerInterval);
            sleepBtn.classList.remove('active');

            if (time === 0) {
                window.showToast('Sleep timer cancelled', 'info', 'fa-hourglass-start');
                return;
            }
            const ms = time * 60 * 1000;
            sleepBtn.classList.add('active');
            window.showToast(`Sleep timer set — music pauses in ${time} min`, 'info', 'fa-hourglass-start');
            sleepTimerTimeout = setTimeout(() => {
                audio.pause();
                isPlaying = false;
                updatePlayIcon();
                sleepBtn.classList.remove('active');
                window.showToast('Sleep timer triggered. Music paused.', 'info', 'fa-moon');
            }, ms);
        };
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        if (speedDropdown) speedDropdown.style.display = 'none';
        if (sleepDropdown) sleepDropdown.style.display = 'none';
        const searchDropdown = document.getElementById('search-autocomplete-panel');
        if (searchDropdown) searchDropdown.style.display = 'none';
        const themeDropdown = document.getElementById('theme-accent-dropdown');
        if (themeDropdown) themeDropdown.style.display = 'none';
        const profileDropdown = document.getElementById('profile-dropdown-pane');
        if (profileDropdown) profileDropdown.style.display = 'none';
        const visDropup = document.getElementById('player-vis-dropup');
        if (visDropup) visDropup.style.display = 'none';
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return min + ':' + (sec < 10 ? '0' + sec : sec);
    }

    // ═══════════════ 26. LYRICS ENGINE ═══════════════
    const lyricsBtn = document.getElementById('player-lyrics-btn');
    const fsLyricsBtn = document.getElementById('fs-lyrics-btn');
    const lyricsClose = document.getElementById('lyrics-drawer-close');
    let mockLyricsLines = [];

    const toggleLyrics = () => {
        lyricsDrawer.style.display = lyricsDrawer.style.display === 'flex' ? 'none' : 'flex';
        loadLyricsForTrack();
    };
    lyricsBtn.addEventListener('click', toggleLyrics);
    fsLyricsBtn.addEventListener('click', toggleLyrics);
    lyricsClose.addEventListener('click', () => { lyricsDrawer.style.display = 'none'; });

    function loadLyricsForTrack() {
        const container = document.getElementById('lyrics-text-lines');
        if (!container) return;

        if (!audio.src || !currentPlaylist[currentSongIndex]) {
            container.innerHTML = `<div class="lyrics-line active">No song playing.</div>`;
            return;
        }

        const song = currentPlaylist[currentSongIndex];
        const title = song.title.toLowerCase();
        const charSum = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);

        const mockLines = [
            { time: 0, text: "♪ " + song.title },
            { time: 4, text: "Neon lights across the silver city sky" },
            { time: 11, text: "Every heartbeat wired to this melody high" },
            { time: 19, text: "Vibrations running deep inside my soul" },
            { time: 27, text: "This frequency is taking full control" },
            { time: 35, text: "Dancing shadows on the glass facade" },
            { time: 44, text: "Immortal rhythm — never fade, never tired" },
            { time: 54, text: "We are the sound, we are the light" },
            { time: 63, text: "Turn it up, let the whole world ignite" },
            { time: 74, text: "[Instrumental — Spatial Chorus]" },
            { time: 96, text: "Symphony of a thousand streaming dreams" },
            { time: 108, text: "Every note a pixel in the VR scene" },
            { time: 120, text: "Thank you for listening to " + song.title }
        ];
        mockLines.forEach(l => { l.time = Math.round(l.time * (charSum % 5 + 0.7)); });

        mockLyricsLines = mockLines;
        container.innerHTML = mockLines.map((l, i) => `
            <div class="lyrics-line ${i === 0 ? 'active' : ''}" id="lyric-line-${i}" data-time="${l.time}">${l.text}</div>
        `).join('');
    }

    function updateLyricsHighlight(time) {
        if (lyricsDrawer.style.display !== 'flex' || mockLyricsLines.length === 0) return;
        let activeIdx = 0;
        for (let i = 0; i < mockLyricsLines.length; i++) {
            if (time >= mockLyricsLines[i].time) activeIdx = i;
            else break;
        }
        const lines = lyricsDrawer.querySelectorAll('.lyrics-line');
        lines.forEach((l, i) => {
            if (i === activeIdx) {
                l.classList.add('active');
                const target = document.getElementById('lyric-line-' + activeIdx);
                const container = document.getElementById('lyrics-text-lines');
                if (target && container) {
                    container.scrollTop = target.offsetTop - (container.offsetHeight / 2);
                }
            } else {
                l.classList.remove('active');
            }
        });
    }

    // ═══════════════ 27. FULLSCREEN PLAYER ═══════════════
    const expandBtn = document.getElementById('player-expand-btn');
    const fsCloseBtn = document.getElementById('fs-close-btn');

    window.toggleFullscreenPlayer = function() {
        const open = fsPlayer.classList.toggle('open');
        if (open && fsBackdrop && currentPlaylist[currentSongIndex]) {
            fsBackdrop.style.backgroundImage = `url("${currentPlaylist[currentSongIndex].img}")`;
        }
    };
    expandBtn.addEventListener('click', window.toggleFullscreenPlayer);
    fsCloseBtn.addEventListener('click', window.toggleFullscreenPlayer);

    // Fullscreen heart
    fsHeart.addEventListener('click', () => {
        if (currentPlaylist.length === 0) return;
        const cur = currentPlaylist[currentSongIndex];
        if (!cur) return;
        const res = window.MockBackend.toggleLike(cur.id);
        if (res.success) {
            fsHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            playerHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            refreshLikeViews();
        }
    });

    // Fullscreen visualizer
    const fsCanvas = document.getElementById('fs-visualizer');
    let fsVisCtx = fsCanvas ? fsCanvas.getContext('2d') : null;
    let fsAngle = 0;
    function renderFsVisualizer() {
        if (!fsVisCtx || !fsCanvas) return;
        fsCanvas.width = fsCanvas.offsetWidth;
        fsCanvas.height = fsCanvas.offsetHeight;
        const w = fsCanvas.width, h = fsCanvas.height;
        const draw = () => {
            if (!fsPlayer.classList.contains('open')) {
                fsVisCtx.clearRect(0, 0, w, h);
                return;
            }
            requestAnimationFrame(draw);
            fsVisCtx.clearRect(0, 0, w, h);
            fsAngle += isPlaying ? 0.06 : 0.004;

            const barCount = Math.floor(w / 8);
            for (let i = 0; i < barCount; i++) {
                let amp;
                if (analyser && dataArray.length) {
                    const idx = Math.floor((i / barCount) * dataArray.length);
                    amp = (dataArray[idx] / 255) * h * 0.7;
                } else {
                    amp = isPlaying ? (Math.sin(i * 0.2 + fsAngle) * 0.5 + 0.5) * h * 0.5 + Math.random() * 6 : 3;
                }
                const hue = 190 + (i / barCount) * 60;
                fsVisCtx.fillStyle = `hsla(${hue}, 100%, 60%, .55)`;
                fsVisCtx.fillRect(i * 8, h - amp, 5, amp);
            }
        };
        draw();
    }
    renderFsVisualizer();

    // ═══════════════ 28. VOICE SEARCH ═══════════════
    const voiceBtn = document.getElementById('voice-search-btn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            voiceOverlay.style.display = 'flex';
            setTimeout(() => {
                voiceOverlay.style.display = 'none';
                const prompts = ['Play Hukum', 'Recommend happy songs', 'Who is AR Rahman'];
                const query = prompts[Math.floor(Math.random() * prompts.length)];
                const searchBox = document.getElementById('global-search-input');
                if (searchBox) {
                    searchBox.value = query;
                    window.showToast(`Voice transcribed: "${query}"`, 'info', 'fa-microphone');
                    triggerGlobalSearch(query);
                }
            }, 2500);
        });
    }

    // ═══════════════ 29. SEARCH & AUTOCOMPLETE ═══════════════
    const searchInput = document.getElementById('global-search-input');
    const searchPanel = document.getElementById('search-autocomplete-panel');
    const searchIcon = document.getElementById('search-trigger-icon');
    const RECENT_KEY = 'vrmusic_recent_searches';

    function getRecentSearches() {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; }
    }
    function addRecentSearch(q) {
        const list = getRecentSearches().filter(x => x !== q);
        list.unshift(q);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
    }

    function renderSearchPanel(query) {
        const songs = window.MockBackend.getSongs();
        const artists = window.MockBackend.getArtists();
        const albums = groupAlbums(songs, artists);
        const q = query.toLowerCase().trim();

        if (!q) {
            const recent = getRecentSearches();
            const trending = ['Dheema', 'Anirudh', 'Aalaporan Thamizhan', 'Katchi Sera', 'Rahman', 'Sai Abhyankar'];
            searchPanel.innerHTML = `
                ${recent.length ? `
                <div class="autocomplete-section">
                    <h6><i class="fa-solid fa-clock-rotate-left"></i> Recent</h6>
                    ${recent.map(r => `<div class="autocomplete-item" onclick="useSearch('${r.replace(/'/g, "\\'")}')"><i class="fa-solid fa-magnifying-glass" style="color:var(--text-dim);"></i><div class="info"><h5>${r}</h5></div></div>`).join('')}
                </div>` : ''}
                <div class="autocomplete-section">
                    <h6><i class="fa-solid fa-fire"></i> Trending</h6>
                    ${trending.map(t => `<div class="autocomplete-item" onclick="useSearch('${t.replace(/'/g, "\\'")}')"><i class="fa-solid fa-fire" style="color:var(--warning);"></i><div class="info"><h5>${t}</h5></div></div>`).join('')}
                </div>
                <div class="autocomplete-section">
                    <h6><i class="fa-solid fa-keyboard"></i> Shortcuts</h6>
                    <p style="font-size:0.74rem; color:var(--text-dim); padding-left:8px; line-height:1.8;">
                        <kbd style="background:rgba(255,255,255,.08); padding:2px 7px; border-radius:6px; font-size:.7rem;">Space</kbd> Play / Pause &nbsp;
                        <kbd style="background:rgba(255,255,255,.08); padding:2px 7px; border-radius:6px; font-size:.7rem;">Ctrl K</kbd> Search &nbsp;
                        <kbd style="background:rgba(255,255,255,.08); padding:2px 7px; border-radius:6px; font-size:.7rem;">L</kbd> Like &nbsp;
                        <kbd style="background:rgba(255,255,255,.08); padding:2px 7px; border-radius:6px; font-size:.7rem;">F</kbd> Fullscreen
                    </p>
                </div>
            `;
            searchPanel.style.display = 'block';
            return;
        }

        const hl = (text) => {
            const escaped = String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const safeQ = escaped.toLowerCase();
            const lower = String(text).toLowerCase();
            if (!safeQ) return String(text);
            let out = '', i = 0;
            while (i < String(text).length) {
                const idx = lower.indexOf(safeQ, i);
                if (idx === -1) { out += escapeHtml(String(text).slice(i)); break; }
                out += escapeHtml(String(text).slice(i, idx)) + '<mark>' + escapeHtml(String(text).slice(idx, idx + safeQ.length)) + '</mark>';
                i = idx + safeQ.length;
            }
            return out;
        };
        const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        const matchArtists = artists.filter(a => a.name.toLowerCase().includes(q));
        const matchSongs = songs.filter(s => s.title.toLowerCase().includes(q));
        const matchAlbums = albums.filter(al => al.title.toLowerCase().includes(q));

        if (matchArtists.length === 0 && matchSongs.length === 0 && matchAlbums.length === 0) {
            searchPanel.innerHTML = `<div class="autocomplete-empty">No matches found for "${query}". Try a different name.</div>`;
            searchPanel.style.display = 'block';
            return;
        }

        searchPanel.innerHTML = `
            ${matchArtists.length ? `
                <div class="autocomplete-section">
                    <h6>Artists</h6>
                    ${matchArtists.map(a => `<div class="autocomplete-item artist-item" onclick="loadArtistPage('${a.id}')"><img src="${a.image}" alt=""><div class="info"><h5>${hl(a.name)}</h5><p>${a.listeners} listeners</p></div></div>`).join('')}
                </div>` : ''}
            ${matchSongs.length ? `
                <div class="autocomplete-section">
                    <h6>Songs</h6>
                    ${matchSongs.map(s => `<div class="autocomplete-item" onclick="playSingleTrack('${s.id}')"><img src="${s.img}" alt=""><div class="info"><h5>${hl(s.title)}</h5><p>${hl(artists.find(a => a.id === s.artistId)?.name || 'Composer')}</p></div></div>`).join('')}
                </div>` : ''}
            ${matchAlbums.length ? `
                <div class="autocomplete-section">
                    <h6>Albums</h6>
                    ${matchAlbums.map(al => `<div class="autocomplete-item" onclick="loadAlbumPage('${al.title.replace(/'/g, "\\'")}')"><img src="${al.img}" alt=""><div class="info"><h5>${hl(al.title)}</h5><p>${al.count} tracks</p></div></div>`).join('')}
                </div>` : ''}
        `;
        searchPanel.style.display = 'block';
    }

    window.useSearch = function(query) {
        const box = document.getElementById('global-search-input');
        if (box) { box.value = query; }
        triggerGlobalSearch(query);
    };

    if (searchInput && searchPanel) {
        searchInput.addEventListener('input', (e) => {
            renderSearchPanel(e.target.value);
        });
        searchInput.addEventListener('focus', () => {
            renderSearchPanel(searchInput.value);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                triggerGlobalSearch(searchInput.value);
            }
        });
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                triggerGlobalSearch(searchInput.value);
            });
        }
    }

    function triggerGlobalSearch(query) {
        const q = query.toLowerCase().trim();
        if (!q) return;

        const songs = window.MockBackend.getSongs();
        const artists = window.MockBackend.getArtists();

        const aIdx = artists.findIndex(a => a.name.toLowerCase().includes(q));
        if (aIdx !== -1) {
            loadArtistPage(artists[aIdx].id);
            addRecentSearch(query.trim());
            searchInput.value = '';
            searchPanel.style.display = 'none';
            return;
        }

        const sIdx = songs.findIndex(s => s.title.toLowerCase().includes(q));
        if (sIdx !== -1) {
            playSingleTrack(songs[sIdx].id);
            addRecentSearch(query.trim());
            searchInput.value = '';
            searchPanel.style.display = 'none';
            return;
        }

        // Fall back to album search
        const albums = groupAlbums(songs, artists);
        const alIdx = albums.findIndex(al => al.title.toLowerCase().includes(q));
        if (alIdx !== -1) {
            loadAlbumPage(albums[alIdx].title);
            addRecentSearch(query.trim());
            searchInput.value = '';
            searchPanel.style.display = 'none';
            return;
        }

        window.showToast(`No direct match for "${query}". Try "Hukum" or "Rahman".`, 'warning', 'fa-circle-exclamation');
    }

    // ═══════════════ 30. AI ASSISTANT ═══════════════
    const aiDrawerOpen = document.getElementById('ai-chatbot-fab');
    const aiDrawerClose = document.getElementById('ai-chatbot-close');
    const aiSendBtn = document.getElementById('ai-chat-send');
    const aiInput = document.getElementById('ai-chat-input');
    const aiChatLogs = document.getElementById('ai-chat-messages');

    if (aiDrawerOpen && aiDrawerClose) {
        aiDrawerOpen.onclick = () => aiDrawer.classList.add('open');
        aiDrawerClose.onclick = () => aiDrawer.classList.remove('open');
    }
    if (aiSendBtn && aiInput) {
        aiSendBtn.onclick = handleAIChatInputSubmit;
        aiInput.onkeypress = (e) => { if (e.key === 'Enter') handleAIChatInputSubmit(); };
    }

    function handleAIChatInputSubmit() {
        const text = aiInput.value.trim();
        if (!text) return;
        aiInput.value = '';
        appendChatMessage(text, 'user');

        setTimeout(() => {
            const reply = window.MockBackend.getAIChatResponse(text);
            if (reply.startsWith('CMD_PLAY_')) {
                const parts = reply.split('::');
                appendChatMessage(parts[1], 'system');
                playSingleTrack(parts[0].replace('CMD_PLAY_', ''));
            } else if (reply.startsWith('CMD_ARTIST_')) {
                const parts = reply.split('::');
                appendChatMessage(parts[1], 'system');
                loadArtistPage(parts[0].replace('CMD_ARTIST_', ''));
            } else {
                appendChatMessage(reply, 'system');
            }
        }, 800);
    }

    function appendChatMessage(message, sender) {
        const bubble = document.createElement('div');
        bubble.className = `ai-msg ${sender}`;
        let html = message.replace(/\n/g, '<br>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        bubble.innerHTML = html;
        aiChatLogs.appendChild(bubble);
        aiChatLogs.scrollTop = aiChatLogs.scrollHeight;
    }

    window.sendQuickPrompt = function(promptText) {
        aiInput.value = promptText;
        handleAIChatInputSubmit();
    };

    // ═══════════════ 31. AUDIO VISUALIZER ═══════════════
    const visBtn = document.getElementById('player-vis-btn');
    const visDropup = document.getElementById('player-vis-dropup');
    let visCanvas = document.getElementById('player-visualizer');
    let visCtx = visCanvas ? visCanvas.getContext('2d') : null;
    let audioCtx = null;
    let analyser = null;
    let source = null;
    let dataArray = [];

    if (visBtn && visDropup) {
        visBtn.onclick = (e) => {
            e.stopPropagation();
            visDropup.style.display = visDropup.style.display === 'flex' ? 'none' : 'flex';
        };
        visDropup.querySelectorAll('.vis-option').forEach(opt => {
            opt.onclick = () => {
                visDropup.querySelectorAll('.vis-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                visualizerMode = opt.getAttribute('data-vis');
                visBtn.className = visualizerMode === 'off' ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye active';
                visDropup.style.display = 'none';
                if (visualizerMode !== 'off') initWebAudioVisualizer();
            };
        });
    }

    function initWebAudioVisualizer() {
        if (audioCtx) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            renderVisualizerLoop();
        } catch (e) {
            console.warn('AudioContext blocked. Using simulated waveforms.', e);
            renderSimulatedVisualizerLoop();
        }
    }

    function renderVisualizerLoop() {
        if (!visCanvas || !visCtx) return;
        visCanvas.width = visCanvas.offsetWidth;
        visCanvas.height = visCanvas.offsetHeight;
        const draw = () => {
            if (visualizerMode === 'off') {
                visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
                return;
            }
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            visCtx.fillStyle = 'rgba(7, 11, 22, 0.2)';
            visCtx.fillRect(0, 0, visCanvas.width, visCanvas.height);
            const w = visCanvas.width, h = visCanvas.height, len = analyser.frequencyBinCount;

            if (visualizerMode === 'sine') {
                analyser.getByteTimeDomainData(dataArray);
                visCtx.lineWidth = 2;
                visCtx.strokeStyle = 'var(--primary-color)';
                visCtx.beginPath();
                const sliceWidth = w / len;
                for (let i = 0; i < len; i++) {
                    const y = (dataArray[i] / 128.0) * h / 2;
                    i === 0 ? visCtx.moveTo(i * sliceWidth, y) : visCtx.lineTo(i * sliceWidth, y);
                }
                visCtx.lineTo(w, h / 2);
                visCtx.stroke();
            } else if (visualizerMode === 'bars') {
                const barWidth = (w / len) * 1.5;
                let x = 0;
                for (let i = 0; i < len; i++) {
                    const barHeight = (dataArray[i] / 255) * h * 0.8;
                    const g = Math.floor(200 - (i * 0.5));
                    visCtx.fillStyle = `rgba(0, ${g}, 255, 0.4)`;
                    visCtx.fillRect(x, h - barHeight, barWidth - 2, barHeight);
                    x += barWidth;
                }
            } else if (visualizerMode === 'circular') {
                const cx = w / 2, cy = h / 2;
                const base = Math.min(w, h) * 0.22;
                for (let i = 0; i < len; i += 2) {
                    const angle = (i / len) * Math.PI * 2;
                    const amp = (dataArray[i] / 255) * 45;
                    visCtx.strokeStyle = `hsla(${200 + i * 2}, 100%, 50%, 0.5)`;
                    visCtx.lineWidth = 3;
                    visCtx.beginPath();
                    visCtx.moveTo(cx + Math.cos(angle) * base, cy + Math.sin(angle) * base);
                    visCtx.lineTo(cx + Math.cos(angle) * (base + amp), cy + Math.sin(angle) * (base + amp));
                    visCtx.stroke();
                }
            }
        };
        draw();
    }

    let simAngle = 0;
    function renderSimulatedVisualizerLoop() {
        if (!visCanvas || !visCtx) return;
        const draw = () => {
            if (visualizerMode === 'off') {
                visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
                return;
            }
            requestAnimationFrame(draw);
            visCanvas.width = visCanvas.offsetWidth;
            visCanvas.height = visCanvas.offsetHeight;
            const w = visCanvas.width, h = visCanvas.height;
            visCtx.fillStyle = 'rgba(7, 11, 22, 0.25)';
            visCtx.fillRect(0, 0, w, h);
            simAngle += isPlaying ? 0.05 : 0.005;

            if (visualizerMode === 'sine') {
                visCtx.lineWidth = 2;
                visCtx.strokeStyle = 'var(--primary-color)';
                visCtx.beginPath();
                for (let x = 0; x < w; x += 5) {
                    const y = (h / 2) + Math.sin(x * 0.01 + simAngle) * (isPlaying ? 35 : 5);
                    x === 0 ? visCtx.moveTo(x, y) : visCtx.lineTo(x, y);
                }
                visCtx.stroke();
            } else if (visualizerMode === 'bars') {
                const bw = 14, bc = Math.floor(w / bw);
                for (let i = 0; i < bc; i++) {
                    const amp = isPlaying ? (Math.sin(i * 0.15 + simAngle) * 0.5 + 0.5) * 45 + Math.random() * 8 : 4;
                    visCtx.fillStyle = 'rgba(0, 229, 255, 0.3)';
                    visCtx.fillRect(i * bw, h - amp, bw - 3, amp);
                }
            } else if (visualizerMode === 'circular') {
                const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * 0.25;
                for (let a = 0; a < Math.PI * 2; a += 0.08) {
                    const amp = isPlaying ? (Math.sin(a * 4 + simAngle) * 0.4 + 0.6) * 20 : 2;
                    visCtx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
                    visCtx.lineWidth = 2;
                    visCtx.beginPath();
                    visCtx.moveTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
                    visCtx.lineTo(cx + Math.cos(a) * (radius + amp), cy + Math.sin(a) * (radius + amp));
                    visCtx.stroke();
                }
            }
        };
        draw();
    }

    // ═══════════════ 32. UPLOAD MODAL ═══════════════
    const uploadTrigger = document.getElementById('upload-music-trigger');
    const adminUploadTrigger = document.getElementById('admin-song-upload-trigger');
    const uploadCancel = document.getElementById('upload-song-cancel');
    const uploadClose = document.getElementById('upload-song-close');
    const uploadForm = document.getElementById('upload-song-form');
    const uploadArtistSelect = document.getElementById('upload-track-artist');

    const openUploadModal = () => {
        if (currentUser.role !== 'admin' && currentUser.role !== 'artist') {
            window.showToast('Access denied — only Admin or Verified Artists can upload', 'danger', 'fa-lock');
            return;
        }
        const artists = window.MockBackend.getArtists();
        uploadArtistSelect.innerHTML = artists.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        uploadModal.style.display = 'flex';
    };
    if (uploadTrigger) uploadTrigger.onclick = openUploadModal;
    if (adminUploadTrigger) adminUploadTrigger.onclick = openUploadModal;

    const closeUploadModal = () => { uploadModal.style.display = 'none'; };
    if (uploadCancel) uploadCancel.onclick = closeUploadModal;
    if (uploadClose) uploadClose.onclick = closeUploadModal;
    uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) closeUploadModal(); });

    // Dropzone visual
    const dropzone = document.getElementById('upload-dropzone');
    if (dropzone) {
        dropzone.onclick = () => document.getElementById('upload-track-title').focus();
        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary-color)'; };
        dropzone.ondragleave = () => { dropzone.style.borderColor = ''; };
        dropzone.ondrop = (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '';
            window.showToast('Audio file detected — metadata auto-filled', 'success', 'fa-file-audio');
        };
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('upload-track-title').value.trim();
            const artistId = uploadArtistSelect.value;
            const album = document.getElementById('upload-track-album').value.trim();
            const genre = document.getElementById('upload-track-genre').value.trim();
            const duration = document.getElementById('upload-track-duration').value.trim();
            const file = document.getElementById('upload-track-file').value;

            const res = window.MockBackend.uploadSong(title, artistId, album, duration, file, 'mus logo.webp', genre);
            if (res.success) {
                closeUploadModal();
                document.getElementById('upload-song-form').reset();
                window.showToast(`"${title}" uploaded to the SQL Database!`, 'success', 'fa-cloud-arrow-up');
                renderHomeView();
                renderDiscoverView();
            } else {
                window.showToast(res.error || 'Upload failed', 'danger', 'fa-circle-exclamation');
            }
        });
    }

    // ═══════════════ 33. CORE PLAYER UTILITY METHODS ═══════════════
    window.playSingleTrack = function(songId) {
        const songs = window.MockBackend.getSongs();
        const song = songs.find(s => s.id === songId);
        if (!song) return;
        currentPlaylist = [song];
        currentSongIndex = 0;
        playSong(song);
    };

    window.playFromPlaylist = function(songId, playlistToken) {
        const songs = window.MockBackend.getSongs();
        let list = [];

        if (playlistToken === 'discover') {
            list = currentFilterGenre ? songs.filter(s => s.genre.toLowerCase().includes(currentFilterGenre.toLowerCase())) : songs;
        } else if (playlistToken === 'trending') {
            list = songs.slice().sort((a, b) => (b.plays || 0) - (a.plays || 0));
        } else if (playlistToken === 'downloads') {
            list = songs.filter(s => window.DownloadManager && window.DownloadManager.isDownloaded(s.id));
        } else if (playlistToken.startsWith('artist_')) {
            const aId = playlistToken.replace('artist_', '');
            list = songs.filter(s => s.artistId === aId);
        } else if (playlistToken.startsWith('album_')) {
            const aTitle = playlistToken.replace('album_', '');
            list = songs.filter(s => s.album.toLowerCase() === aTitle.toLowerCase());
        } else if (playlistToken === 'favorites') {
            list = songs.filter(s => window.MockBackend.isLiked(s.id));
        } else if (playlistToken === 'history') {
            const histIds = window.MockBackend.getRecentlyPlayed();
            list = histIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
        }

        currentPlaylist = list;
        const idx = list.findIndex(s => s.id === songId);
        if (idx !== -1) {
            currentSongIndex = idx;
            playSong(list[idx]);
        }
    };

    window.playArtistImmediate = function(e, artistId) {
        if (e) e.stopPropagation();
        const songs = window.MockBackend.getSongs().filter(s => s.artistId === artistId);
        if (songs.length === 0) {
            window.showToast('No tracks found for this artist.', 'warning', 'fa-circle-exclamation');
            return;
        }
        currentPlaylist = songs;
        currentSongIndex = 0;
        playSong(songs[0]);
    };

    window.playPlaylistInstant = function(playlistId) {
        const playlists = window.MockBackend.getPlaylists();
        const pl = playlists.find(p => p.id === playlistId);
        if (!pl) return;
        const songs = window.MockBackend.getSongs();
        const plSongs = pl.tracks.map(tid => songs.find(s => s.id === tid)).filter(Boolean);
        if (plSongs.length === 0) return;
        currentPlaylist = plSongs;
        currentSongIndex = 0;
        playSong(plSongs[0]);
    };

    function refreshLikeViews() {
        const activeView = document.querySelector('.app-view.active');
        if (!activeView) return;
        if (activeView.id === 'view-favorites') renderFavoritesView();
        else if (activeView.id === 'view-discover') renderDiscoverView();
        else if (activeView.id === 'view-trending') renderTrendingView();
        else if (activeView.id === 'view-history') renderHistoryView();
        else if (activeView.id === 'view-downloads') renderDownloadsView();
    }

    function playSong(song) {
        if (!song) return;

        // Bottom player
        playerTitle.textContent = song.title;
        const artists = window.MockBackend.getArtists();
        const art = artists.find(a => a.id === song.artistId);
        playerArtist.textContent = art ? art.name : 'Unknown Artist';
        playerImg.src = song.img;

        // Fullscreen player
        fsSongTitle.textContent = song.title;
        fsSongArtist.textContent = art ? art.name : 'Unknown Artist';
        fsAlbumImg.src = song.img;
        if (fsBackdrop) fsBackdrop.style.backgroundImage = `url("${song.img}")`;

        document.title = `${song.title} — ${art ? art.name : 'VR Music'}`;

        const isLiked = window.MockBackend.isLiked(song.id);
        playerHeart.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        fsHeart.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

        audio.pause();
        audio.playbackRate = 1.0;

        // Offline-first: play from IndexedDB blob when downloaded
        const playSource = (src) => {
            audio.src = src;
            audio.load();
            audio.play().then(() => {
                isPlaying = true;
                updatePlayIcon();
                window.MockBackend.addToHistory(song.id);
            }).catch(err => {
                console.error('Audio playback error:', err);
                isPlaying = false;
                updatePlayIcon();
            });
        };

        if (window.DownloadManager && window.DownloadManager.isDownloaded(song.id)) {
            window.DownloadManager.getObjectUrl(song.id).then(url => {
                if (url) playSource(url);
                else playSource(encodeURI(song.file));
            });
        } else {
            playSource(encodeURI(song.file));
        }

        // Dynamic album color for player glow / backdrop
        extractArtColor(song.img);

        // Sync mobile mini player
        updateMiniPlayer(song, art);

        // Queue trigger state
        if (queueTrigger) queueTrigger.classList.toggle('has-items', currentPlaylist.length > 0);

        const activeView = document.querySelector('.app-view.active');
        if (activeView && activeView.id === 'view-history') renderHistoryView();
        if (activeView && activeView.id === 'view-downloads') renderDownloadsView();
    }

    // Bottom player heart
    playerHeart.onclick = () => {
        if (currentPlaylist.length === 0) return;
        const cur = currentPlaylist[currentSongIndex];
        if (!cur) return;
        const res = window.MockBackend.toggleLike(cur.id);
        if (res.success) {
            playerHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            fsHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            refreshLikeViews();
        }
    };

    window.toggleLikeClick = function(e, songId) {
        if (e) e.stopPropagation();
        const res = window.MockBackend.toggleLike(songId);
        if (res.success) {
            const heart = e.currentTarget.querySelector('i');
            if (heart) heart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            if (currentPlaylist.length > 0 && currentPlaylist[currentSongIndex].id === songId) {
                playerHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                fsHeart.className = res.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
            refreshLikeViews();
        }
    };

    // ═══════════════ 34. KEYBOARD SHORTCUTS ═══════════════
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        if (e.code === 'Space' && !typing) {
            e.preventDefault();
            window.togglePlay();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const box = document.getElementById('global-search-input');
            if (box) { box.focus(); box.select(); }
        } else if (e.key.toLowerCase() === 'l' && !typing) {
            if (currentPlaylist.length > 0) {
                const cur = currentPlaylist[currentSongIndex];
                if (cur) window.toggleLikeClick(null, cur.id);
            }
        } else if (e.key.toLowerCase() === 'f' && !typing) {
            window.toggleFullscreenPlayer();
        } else if (e.key.toLowerCase() === 'm' && !typing) {
            toggleMute();
        } else if (e.key === 'Escape') {
            if (fsPlayer.classList.contains('open')) fsPlayer.classList.remove('open');
            else if (lyricsDrawer.style.display === 'flex') lyricsDrawer.style.display = 'none';
            else if (aiDrawer.classList.contains('open')) aiDrawer.classList.remove('open');
            else if (queueDrawer && queueDrawer.classList.contains('open')) queueDrawer.classList.remove('open');
            else if (sidebar && sidebar.classList.contains('mobile-open')) closeMobileSidebar();
        }
    });

    // ═══════════════ 35. NOTIFICATIONS / MESSAGES PANELS ═══════════════
    window.togglePanel = function(panelId) {
        const panels = document.querySelectorAll('.floating-panel');
        panels.forEach(p => { if (p.id !== panelId) p.classList.remove('open'); });
        const target = document.getElementById(panelId);
        if (target) target.classList.toggle('open');
    };
    const notifBtn = document.getElementById('notification-btn');
    const msgBtn = document.getElementById('messages-btn');
    if (notifBtn) notifBtn.onclick = (e) => { e.stopPropagation(); window.togglePanel('notifications-panel'); };
    if (msgBtn) msgBtn.onclick = (e) => { e.stopPropagation(); window.togglePanel('messages-panel'); };

    // ═══════════════ 36. LOGOUT & CONFIG ═══════════════
    window.logoutUser = function() {
        if (confirm('Are you sure you want to log out of VR Music?')) {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userToken');
            window.location.href = 'index.html';
        }
    };

    // Sidebar collapse
    if (sidebarToggle && sidebar) {
        sidebarToggle.onclick = () => {
            sidebar.classList.toggle('collapsed');
            const icon = sidebarToggle.querySelector('i');
            icon.className = sidebar.classList.contains('collapsed')
                ? 'fa-solid fa-chevron-right'
                : 'fa-solid fa-chevron-left';
        };
    }

    // Profile dropdown
    const profileMenu = document.getElementById('user-profile-menu');
    const profileDropdown = document.getElementById('profile-dropdown-pane');
    if (profileMenu && profileDropdown) {
        profileMenu.onclick = (e) => {
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'flex' ? 'none' : 'flex';
        };
        document.getElementById('profile-user-name').textContent = currentUser.name;
        document.getElementById('profile-user-email').textContent = currentUser.email;
        document.getElementById('profile-subscription-pill').textContent = currentUser.subscription;
        const container = document.getElementById('profile-avatar-container');
        if (container) container.innerHTML = `<div class="profile-letter-avatar">${currentUser.avatar}</div>`;
    }

    // Theme switch
    const themeBtn = document.getElementById('theme-menu-btn');
    const themeDropdown = document.getElementById('theme-accent-dropdown');
    if (themeBtn && themeDropdown) {
        themeBtn.onclick = (e) => {
            e.stopPropagation();
            themeDropdown.style.display = themeDropdown.style.display === 'flex' ? 'none' : 'flex';
        };
    }

    window.setAccent = function(accent) {
        document.body.className = '';
        if (accent !== 'cyan') document.body.classList.add('accent-' + accent);
        window.showToast(`Visual accent shifted to ${accent.toUpperCase()}`, 'info', 'fa-palette');
    };

    // ═══════════════ 37. HERO INIT ═══════════════
    function initHero() {
        const heroPlay = document.getElementById('hero-play-btn');
        const heroShuffle = document.getElementById('hero-shuffle-btn');
        const heroFollow = document.getElementById('hero-follow-btn');
        const heroShare = document.getElementById('hero-share-btn');

        if (heroPlay) heroPlay.onclick = (e) => { e.stopPropagation(); playArtistImmediate(e, 'anirudh'); };
        if (heroShuffle) heroShuffle.onclick = (e) => { e.stopPropagation(); window.shuffleArtist(e, 'anirudh'); };
        if (heroFollow) {
            const followKey = `followed_${currentUser.email}_anirudh`;
            const update = () => {
                const followed = localStorage.getItem(followKey) === 'true';
                heroFollow.innerHTML = followed
                    ? '<i class="fa-solid fa-check"></i> Following'
                    : '<i class="fa-solid fa-plus"></i> Follow';
                heroFollow.classList.toggle('following', followed);
            };
            update();
            heroFollow.onclick = () => {
                const followed = localStorage.getItem(followKey) === 'true';
                localStorage.setItem(followKey, !followed);
                update();
                window.showToast(!followed ? 'Following Anirudh Ravichander' : 'Unfollowed Anirudh Ravichander', !followed ? 'success' : 'info', 'fa-heart');
            };
        }
        if (heroShare) heroShare.onclick = (e) => {
            e.stopPropagation();
            window.shareSong(e, 'ani_5', 'Anirudh Ravichander');
        };
        const heroExplore = document.getElementById('hero-explore-btn');
        if (heroExplore) heroExplore.onclick = () => loadArtistPage('anirudh');
    }

    window.shuffleArtist = function(e, artistId) {
        if (e) e.stopPropagation();
        const songs = window.MockBackend.getSongs().filter(s => s.artistId === artistId);
        if (!songs.length) return;
        const shuffled = songs.slice().sort(() => 0.5 - Math.random());
        currentPlaylist = shuffled;
        currentSongIndex = 0;
        playSong(shuffled[0]);
        isShuffle = true;
        syncShuffleUI();
        window.showToast('Shuffle playing artist discography', 'info', 'fa-shuffle');
    };

    // ═══════════════ 38. DYNAMIC ALBUM COLORS ═══════════════
    const artColorCache = {};
    function extractArtColor(imgSrc) {
        if (!imgSrc || artColorCache[imgSrc]) {
            if (imgSrc && artColorCache[imgSrc]) applyArtColor(artColorCache[imgSrc]);
            return;
        }
        const probe = new Image();
        probe.crossOrigin = 'anonymous';
        probe.src = imgSrc;
        probe.onload = () => {
            try {
                const c = document.createElement('canvas');
                const size = 48;
                c.width = size; c.height = size;
                const ctx = c.getContext('2d');
                ctx.drawImage(probe, 0, 0, size, size);
                const data = ctx.getImageData(0, 0, size, size).data;
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    if (alpha < 40) continue;
                    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
                }
                if (count === 0) return;
                r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
                const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                artColorCache[imgSrc] = hex;
                applyArtColor(hex);
            } catch (e) { /* CORS or draw blocked — keep default glow */ }
        };
    }
    function applyArtColor(hex) {
        const hexToRgbaStr = (h, a) => {
            const clean = h.replace('#', '');
            const r = parseInt(clean.substring(0, 2), 16);
            const g = parseInt(clean.substring(2, 4), 16);
            const b = parseInt(clean.substring(4, 6), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        };
        document.documentElement.style.setProperty('--art-color', hex);
        document.documentElement.style.setProperty('--art-glow', hexToRgbaStr(hex, 0.45));
        const backdrop = document.getElementById('fs-backdrop');
        if (backdrop && currentPlaylist[currentSongIndex]) {
            backdrop.style.backgroundImage = `linear-gradient(160deg, ${hex}55, rgba(7,11,22,.92) 65%), url("${currentPlaylist[currentSongIndex].img}")`;
        }
    }

    // ═══════════════ 39. MOBILE MINI PLAYER ═══════════════
    const miniPlayer = document.getElementById('mini-player');
    const miniImg = document.getElementById('mini-album-img');
    const miniTitle = document.getElementById('mini-song-title');
    const miniArtist = document.getElementById('mini-song-artist');
    const miniPlayBtn = document.getElementById('mini-play-btn');
    const miniNextBtn = document.getElementById('mini-next-btn');
    const miniProgressFill = document.getElementById('mini-progress-fill');

    function updateMiniPlayer(song, art) {
        if (!miniPlayer) return;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile || !song) {
            miniPlayer.classList.add('hidden');
            miniPlayer.hidden = true;
            return;
        }
        miniImg.src = song.img;
        miniTitle.textContent = song.title;
        miniArtist.textContent = art ? art.name : 'Unknown Artist';
        miniPlayer.classList.remove('hidden');
        miniPlayer.hidden = false;
        updateMiniPlayIcon();
    }

    function updateMiniPlayIcon() {
        if (!miniPlayBtn) return;
        miniPlayBtn.querySelector('i').className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    if (miniPlayBtn) miniPlayBtn.onclick = (e) => { e.stopPropagation(); window.togglePlay(); };
    if (miniNextBtn) miniNextBtn.onclick = (e) => { e.stopPropagation(); window.nextSong(); };
    if (miniPlayer) {
        miniPlayer.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            if (!currentPlaylist[currentSongIndex]) return;
            window.toggleFullscreenPlayer();
        });
    }

    // ═══════════════ 40. SWIPE GESTURES ═══════════════
    let touchStartX = 0, touchStartY = 0, touchActive = false;
    const miniMain = document.getElementById('mini-player-main');
    const swipeTargets = [miniPlayer, miniMain].filter(Boolean);

    swipeTargets.forEach(el => {
        el.addEventListener('touchstart', (e) => {
            if (el !== miniPlayer && e.target.closest('button')) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchActive = true;
        }, { passive: true });

        el.addEventListener('touchend', (e) => {
            if (!touchActive) return;
            touchActive = false;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absX = Math.abs(dx), absY = Math.abs(dy);
            const threshold = 52;
            if (Math.max(absX, absY) < threshold) return;

            if (absY > absX && dy < -threshold) {
                window.toggleFullscreenPlayer();
            } else if (absY > absX && dy > threshold) {
                if (fsPlayer.classList.contains('open')) fsPlayer.classList.remove('open');
            } else if (absX > absY && dx < -threshold) {
                window.nextSong();
            } else if (absX > absY && dx > threshold) {
                window.prevSong();
            }
        }, { passive: true });
    });

    // Pull to refresh on mobile home
    const viewportEl = document.querySelector('.views-viewport');
    let ptrStart = 0;
    if (viewportEl) {
        viewportEl.addEventListener('touchstart', (e) => {
            if (window.innerWidth > 768) { ptrStart = 0; return; }
            if (viewportEl.scrollTop <= 0) ptrStart = e.touches[0].clientY;
            else ptrStart = 0;
        }, { passive: true });
        viewportEl.addEventListener('touchend', (e) => {
            if (!ptrStart) return;
            const dist = e.changedTouches[0].clientY - ptrStart;
            ptrStart = 0;
            if (dist > 90) {
                window.showToast('Refreshing...', 'info', 'fa-rotate');
                renderHomeView();
                if (document.querySelector('.app-view.active').id === 'view-home') {
                    setTimeout(() => window.showToast('Home refreshed', 'success', 'fa-circle-check'), 600);
                }
            }
        }, { passive: true });
    }

    // ═══════════════ 41. MOBILE BOTTOM NAV + SIDEBAR DRAWER ═══════════════
    const mobileNav = document.getElementById('mobile-bottom-nav');
    const mobileHamburger = document.getElementById('sidebar-toggle-mobile');
    const sidebarScrim = document.getElementById('sidebar-scrim');

    if (mobileNav) {
        mobileNav.querySelectorAll('.bn-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                if (view === 'discover') {
                    document.getElementById('global-search-input').focus();
                }
                window.switchView(view);
                mobileNav.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                closeMobileSidebar();
            });
        });
    }

    const closeMobileSidebar = () => {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (sidebarScrim) sidebarScrim.classList.remove('show');
    };
    const openMobileSidebar = () => {
        if (sidebar) sidebar.classList.add('mobile-open');
        if (sidebarScrim) sidebarScrim.classList.add('show');
    };
    if (mobileHamburger) mobileHamburger.onclick = () => {
        if (sidebar && sidebar.classList.contains('mobile-open')) closeMobileSidebar();
        else openMobileSidebar();
    };
    if (sidebarScrim) sidebarScrim.onclick = closeMobileSidebar;

    // Keep bottom nav + sidebar state synced with SPA view changes
    const baseSwitchView = window.switchView;
    window.switchView = function(viewId) {
        baseSwitchView(viewId);
        if (mobileNav) {
            const viewName = viewId === 'favorites' ? 'playlists' : viewId;
            const mapping = { home: 'home', discover: 'discover', playlists: 'playlists', downloads: 'downloads', profile: 'profile', favorites: 'playlists', artists: 'playlists', albums: 'playlists', genres: 'discover', trending: 'discover', history: 'playlists', settings: 'profile' };
            const target = mapping[viewName] || 'home';
            mobileNav.querySelectorAll('.bn-item').forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === target));
        }
    };

    // ═══════════════ 42. PLAYBACK QUEUE ═══════════════
    const queueDrawer = document.getElementById('queue-drawer');
    const queueBody = document.getElementById('queue-body');
    const queueClose = document.getElementById('queue-close');
    const queueTrigger = document.getElementById('player-queue-btn');
    const queueCount = document.getElementById('queue-count');

    window.toggleQueue = function() {
        if (!queueDrawer) return;
        const open = queueDrawer.classList.toggle('open');
        if (open) renderQueue();
        else { /* keep */ }
    };
    if (queueTrigger) queueTrigger.onclick = (e) => { e.stopPropagation(); window.toggleQueue(); };
    if (queueClose) queueClose.onclick = window.toggleQueue;

    function renderQueue() {
        if (!queueBody || !queueCount) return;
        if (currentPlaylist.length === 0) {
            queueBody.innerHTML = `<div class="autocomplete-empty">Queue is empty. Play a song or playlist to build your queue.</div>`;
            queueCount.textContent = '';
            return;
        }
        queueCount.textContent = `${currentPlaylist.length} track${currentPlaylist.length === 1 ? '' : 's'}`;
        queueBody.innerHTML = currentPlaylist.map((s, idx) => `
            <div class="queue-item ${idx === currentSongIndex ? 'active' : ''}" onclick="playFromQueue(${idx})">
                <img src="${s.img}" alt="${s.title}" loading="lazy">
                <div class="q-info">
                    <h5>${idx === currentSongIndex ? '<i class="fa-solid fa-volume-high" style="color:var(--primary-color); margin-right:4px;"></i>' : ''}${s.title}</h5>
                    <p>${s.artistId}</p>
                </div>
                <button class="q-remove" onclick="removeFromQueue(event, ${idx})" title="Remove from queue"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `).join('');
    }

    window.playFromQueue = function(idx) {
        if (idx >= currentPlaylist.length) return;
        currentSongIndex = idx;
        playSong(currentPlaylist[idx]);
        renderQueue();
    };

    window.removeFromQueue = function(e, idx) {
        e.stopPropagation();
        currentPlaylist.splice(idx, 1);
        if (idx < currentSongIndex) currentSongIndex--;
        else if (idx === currentSongIndex) currentSongIndex = Math.max(0, idx);
        renderQueue();
    };

    // Show queue trigger when items exist
    if (queueTrigger) {
        const updateQueueTrigger = () => {
            queueTrigger.classList.toggle('has-items', currentPlaylist.length > 0);
        };
        updateQueueTrigger();
    }

    // ═══════════════ 43. MOBILE FULLSCREEN SWIPE DOWN ═══════════════
    let fsTouchY = 0;
    if (fsPlayer) {
        fsPlayer.addEventListener('touchstart', (e) => {
            fsTouchY = e.touches[0].clientY;
        }, { passive: true });
        fsPlayer.addEventListener('touchend', (e) => {
            const dy = e.changedTouches[0].clientY - fsTouchY;
            if (dy > 80) fsPlayer.classList.remove('open');
        }, { passive: true });
    }

    // ═══════════════ 44. RIPPLE MICRO-INTERACTION ═══════════════
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const style = getComputedStyle(btn);
        if (style.position === 'static') return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // ═══════════════ 45. INITIALIZE ═══════════════
    initHero();
    window.switchView('home');

    // Boot download manager + live re-render subscriptions
    if (window.DownloadManager) {
        window.DownloadManager.init();
        let lastProgressRender = 0;
        window.DownloadManager.subscribe((type, id) => {
            const active = document.querySelector('.app-view.active');
            const inDownloads = active && active.id === 'view-downloads';
            if (type === 'change') {
                if (inDownloads) renderDownloadsView();
                refreshAllViews();
                if (window.DownloadManager.isDownloaded(id)) {
                    window.showToast('Download complete', 'success', 'fa-circle-check');
                }
            } else if (type === 'progress') {
                const now = Date.now();
                if (now - lastProgressRender > 300) {
                    lastProgressRender = now;
                    if (inDownloads) renderDownloadsView();
                }
            }
        });
    }

    setInterval(() => {
        const active = document.querySelector('.app-view.active');
        if (active && active.id === 'view-profile') renderProfileView();
    }, 30000);

    // Track mini-player progress
    audio.addEventListener('timeupdate', () => {
        if (!miniPlayer || miniPlayer.classList.contains('hidden')) return;
        if (isNaN(audio.duration) || !audio.duration) return;
        miniProgressFill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
    });
    audio.addEventListener('play', updateMiniPlayIcon);
    audio.addEventListener('pause', updateMiniPlayIcon);
});
