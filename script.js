// DOM Elements
const madeForYouContainer = document.getElementById('made-for-you');
const recentlyPlayedContainer = document.getElementById('recently-played');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

// Player State
let isPlaying = false;
let currentSongIndex = 0;
let progress = 0;
let progressInterval;

// Initialize
function init() {
    renderMadeForYou();
    renderRecentlyPlayed();
    loadSong(currentSongIndex);
}

// Render Functions
function renderMadeForYou() {
    madeForYouContainer.innerHTML = madeForYou.map(item => createCard(item)).join('');
}

function renderRecentlyPlayed() {
    // For demo, just using the first 4 songs as recently played
    const recentSongs = songs.slice(0, 4).map(song => ({
        id: song.id,
        title: song.title,
        desc: song.artist,
        img: song.img
    }));
    recentlyPlayedContainer.innerHTML = recentSongs.map(item => createCard(item)).join('');
}

function createCard(item) {
    return `
        <div class="card">
            <div class="play-btn-overlay">
                <i class="fa-solid fa-play"></i>
            </div>
            <img src="${item.img}" alt="${item.title}" class="card-img">
            <div class="card-title">${item.title}</div>
            <div class="card-desc">${item.desc}</div>
        </div>
    `;
}

// Player Logic
function loadSong(index) {
    const song = songs[index];
    document.getElementById('current-song-img').src = song.img;
    document.getElementById('current-song-title').textContent = song.title;
    document.getElementById('current-song-artist').textContent = song.artist;
    totalDurationEl.textContent = song.duration;

    // Reset progress
    progress = 0;
    updateProgressUI();

    if (isPlaying) {
        startProgress();
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    updatePlayButton();

    if (isPlaying) {
        startProgress();
    } else {
        clearInterval(progressInterval);
    }
}

function updatePlayButton() {
    if (isPlaying) {
        playPauseIcon.classList.remove('fa-circle-play');
        playPauseIcon.classList.add('fa-circle-pause');
    } else {
        playPauseIcon.classList.remove('fa-circle-pause');
        playPauseIcon.classList.add('fa-circle-play');
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
}

// Progress Simulation
function startProgress() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        progress += 0.5; // Simulate 0.5% progress every 100ms
        if (progress >= 100) {
            progress = 0;
            nextSong(); // Auto play next
        }
        updateProgressUI();
        updateTimeUI();
    }, 1000);
}

function updateProgressUI() {
    progressBar.style.width = `${progress}%`;
}

function updateTimeUI() {
    // Simulate time update based on percentage
    // In a real app, this would use audio.currentTime
    const [min, sec] = songs[currentSongIndex].duration.split(':').map(Number);
    const totalSeconds = min * 60 + sec;
    const currentSeconds = Math.floor((progress / 100) * totalSeconds);

    const currentMin = Math.floor(currentSeconds / 60);
    const currentSec = currentSeconds % 60;
    currentTimeEl.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')}`;
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
document.getElementById('next-btn').addEventListener('click', nextSong);
document.getElementById('prev-btn').addEventListener('click', prevSong);

// Start
init();
