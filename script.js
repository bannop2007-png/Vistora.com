const API_URL = 'https://vistora-api.bannop2007.workers.dev';

let currentUser = null;
let videos = [];
let currentFilter = 'all';
let currentSort = 'date';
let displayedVideos = 6;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUser();
    await loadVideos();
    setupEventListeners();
});

async function loadUser() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/api/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                updateUserAvatar();
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
        }
    }
}

function updateUserAvatar() {
    if (currentUser) {
        const avatar = document.querySelector('.user-avatar img');
        if (avatar) {
            avatar.src = currentUser.avatar || 'https://via.placeholder.com/32';
        }
    }
}

async function loadVideos() {
    try {
        const response = await fetch(`${API_URL}/api/videos`);
        if (response.ok) {
            videos = await response.json();
            displayVideos();
        }
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        loadDemoVideos();
    }
}

function loadDemoVideos() {
    videos = [
        {
            id: 1,
            title: "iPhone 15 Pro Max — Обзор",
            channel: "TechMaster",
            views: "125K",
            date: "2025-02-15",
            duration: "12:34",
            thumbnail: "https://via.placeholder.com/320x180/ff0000/ffffff?text=iPhone",
            category: "tech"
        },
        {
            id: 2,
            title: "CS2 — Гайд для новичков",
            channel: "GamePro",
            views: "89K",
            date: "2025-02-14",
            duration: "25:10",
            thumbnail: "https://via.placeholder.com/320x180/00ff00/ffffff?text=CS2",
            category: "games"
        }
    ];
    displayVideos();
}

function displayVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    let filteredVideos = [...videos];
    
    if (currentFilter !== 'all') {
        filteredVideos = filteredVideos.filter(v => v.category === currentFilter);
    }
    
    filteredVideos.sort((a, b) => {
        switch(currentSort) {
            case 'date': return new Date(b.date) - new Date(a.date);
            case 'views': return parseInt(b.views) - parseInt(a.views);
            default: return 0;
        }
    });

    const videosToShow = filteredVideos.slice(0, displayedVideos);
    
    grid.innerHTML = videosToShow.map(video => `
        <a href="video.html?id=${video.id}" class="video-card">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <span class="video-duration">${video.duration}</span>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-channel">${video.channel}</div>
                <div class="video-stats">
                    <span>${video.views} просмотров</span>
                    <span>•</span>
                    <span>${getTimeAgo(video.date)}</span>
                </div>
            </div>
        </a>
    `).join('');
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'сегодня';
    if (diff === 1) return 'вчера';
    if (diff < 7) return `${diff} дня назад`;
    return date.toLocaleDateString();
}

function setupEventListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.category;
            displayedVideos = 6;
            displayVideos();
        });
    });

    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSort = e.target.dataset.sort;
            displayVideos();
        });
    });

    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
        displayedVideos += 6;
        displayVideos();
    });

    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('closed');
    });

    document.getElementById('searchForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('searchInput').value;
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
}

async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
            return { success: true };
        } else {
            const error = await response.json();
            return { success: false, error: error.message };
        }
    } catch (error) {
        return { success: false, error: 'Ошибка соединения' };
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
            return { success: true };
        } else {
            const error = await response.json();
            return { success: false, error: error.message };
        }
    } catch (error) {
        return { success: false, error: 'Ошибка соединения' };
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
