// A simple client-side router for our SPA
// It works by changing the URL's hash (#)

const app = document.getElementById('app');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

const API_BASE_URL = 'https://api.jikan.moe/v4';

// --- API Fetching Functions ---

async function fetchTopMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/top/anime?type=movie&filter=bypopularity&limit=24`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch top movies:", error);
        app.innerHTML = `<p style="color: red;">Error fetching movies. Please try again later.</p>`;
    }
}

async function fetchAnimeDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Failed to fetch details for anime ID ${id}:`, error);
        app.innerHTML = `<p style="color: red;">Error fetching movie details.</p>`;
    }
}

async function searchAnime(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime?q=${query}&type=movie&limit=24`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Failed to search for anime "${query}":`, error);
        app.innerHTML = `<p style="color: red;">Error performing search.</p>`;
    }
}


// --- Rendering Functions ---

function renderMovieCard(movie) {
    // Navigate to detail view when card is clicked
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${movie.images.jpg.large_image_url}" alt="${movie.title}">
        <h3>${movie.title}</h3>
    `;
    card.addEventListener('click', () => {
        // Change the hash to trigger the router for the details page
        window.location.hash = `/movie/${movie.mal_id}`;
    });
    return card;
}

function renderHomePage(movies) {
    app.innerHTML = ''; // Clear previous content
    const grid = document.createElement('div');
    grid.id = 'movie-grid';
    movies.forEach(movie => {
        grid.appendChild(renderMovieCard(movie));
    });
    app.appendChild(grid);
}

function renderDetailsPage(movie) {
    app.innerHTML = `
        <div class="movie-details">
            <img src="${movie.images.jpg.large_image_url}" alt="${movie.title}">
            <div>
                <h1>${movie.title}</h1>
                <p><strong>Score:</strong> ${movie.score || 'N/A'} ⭐</p>
                <p><strong>Synopsis:</strong> ${movie.synopsis || 'No synopsis available.'}</p>
                <a href="${movie.url}" target="_blank">View on MyAnimeList</a>
            </div>
        </div>
    `;
}

// --- Router ---

async function router() {
    const hash = window.location.hash;

    // Default route (Home Page)
    if (hash.startsWith('#/search/')) {
        const query = hash.substring(9); // Get search query from hash
        app.innerHTML = '<h2>Searching...</h2>';
        const results = await searchAnime(decodeURIComponent(query));
        renderHomePage(results);
    } else if (hash.startsWith('#/movie/')) {
        const id = hash.substring(8); // Get the movie ID from the hash
        app.innerHTML = '<h2>Loading details...</h2>';
        const movieDetails = await fetchAnimeDetails(id);
        renderDetailsPage(movieDetails);
    } else {
        // Home page route
        app.innerHTML = '<h2>Loading popular movies...</h2>';
        const movies = await fetchTopMovies();
        renderHomePage(movies);
    }
}

// --- Event Listeners ---

// Listen for hash changes to route
window.addEventListener('hashchange', router);

// Load initial route when the page loads
window.addEventListener('DOMContentLoaded', router);

// Handle search form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        // Update hash to trigger a search view
        window.location.hash = `#/search/${encodeURIComponent(searchTerm)}`;
        searchInput.value = '';
    }
});