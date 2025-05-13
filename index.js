// Local file path
const QUOTES_FILE = 'quotes.json';

let allQuotes = [];
let currentQuote = null;

// Load fav quotes from localStorage
const loadFavorites = () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  return favorites;
};

// Save favorites to localStorage
const saveFavorites = (quote) => {
  let favorites = loadFavorites();
  if (!favorites.find(fav => fav.id === quote.id)) {
    favorites.push(quote);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  displayFavorites();
};

// Display favorites 
const displayFavorites = () => {
  const favorites = loadFavorites();
  const favoritesList = document.getElementById("favorites-list");
  favoritesList.innerHTML = ''; 

  favorites.forEach(quote => {
    const listItem = document.createElement("li");
    listItem.className = 'favorite-quote';
    listItem.innerHTML = `"${quote.text}" – ${quote.author} 
      <button onclick="removeFavorite(${quote.id})">Remove</button>`;
    favoritesList.appendChild(listItem);
  });
};

// Remove a favorite from localStorage
const removeFavorite = (quoteId) => {
  let favorites = loadFavorites();
  favorites = favorites.filter(fav => fav.id !== quoteId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites(); // Re-render favorites list
};

// Function to fetch quotes
async function fetchQuotes() {
  try {
    const response = await fetch(QUOTES_FILE);
    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }
    const data = await response.json();
    allQuotes = data.quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    // Fallback to hardcoded quotes if fetch fails
    allQuotes = [
      { id: 1, text: "Believe in yourself and all that you are.", author: "Christian D. Larson", category: "motivational" },
      { id: 2, text: "Every moment is a fresh beginning.", author: "T.S. Eliot", category: "motivational" }
    ];
  }
}

// Function to get a quote
function getQuote() {
  const categorySelect = document.getElementById("category-select");
  const category = categorySelect.value;

  let filteredQuotes = allQuotes;
  
  // Filter quotes by category
  if (category !== 'all') {
    filteredQuotes = allQuotes.filter(quote => quote.category === category);
  }

  // If no quotes match the category, use all quotes
  if (filteredQuotes.length === 0) {
    filteredQuotes = allQuotes;
  }

  // Select a random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  currentQuote = filteredQuotes[randomIndex];

  // Update the UI
  document.getElementById("quote").textContent = `"${currentQuote.text}"`;
  document.getElementById("author").textContent = `– ${currentQuote.author}`;
}

// Handle the Favorite button click
document.getElementById("favorite-btn").addEventListener("click", () => {
  if (currentQuote) {
    saveFavorites(currentQuote);
    alert("Quote saved to favorites!");
  }
});

// search function for quotes
function searchQuotes() {
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.toLowerCase().trim();
   
  if (!searchTerm) {
    getQuote(); // If search is empty, just show a random quote
    return;
  }
  
  // Search through quotes for the search term
  const matchingQuotes = allQuotes.filter(quote => {
    return quote.text.toLowerCase().includes(searchTerm) || 
           quote.author.toLowerCase().includes(searchTerm);
  });
  
  if (matchingQuotes.length > 0) {
    // Display a random match from the results
    const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
    currentQuote = matchingQuotes[randomIndex];
    
    // Update the UI
    document.getElementById("quote").textContent = `"${currentQuote.text}"`;
    document.getElementById("author").textContent = `– ${currentQuote.author}`;
  } else {
    // No matches found
    document.getElementById("quote").textContent = "No quotes found matching your search.";
    document.getElementById("author").textContent = "";
    currentQuote = null;
  }
}

// Function to toggle theme
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  
  if (body.classList.contains("light-theme")) {
    // Switch to dark theme
    body.classList.remove("light-theme");
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  } else {
    // Switch to light theme
    body.classList.add("light-theme");
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "light");
  }
}

// Add this to your initApp function to load saved theme
function loadSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    document.getElementById("theme-toggle").textContent = "☀️";
  } else {
    document.getElementById("theme-toggle").textContent = "🌙";
  }
}

// Variables for timer
let quoteRotationTimer = null;
let rotationInterval = 10; // Default seconds

// Function to start quote rotation
function startQuoteRotation() {
  // Clear any existing timer
  if (quoteRotationTimer) {
    clearInterval(quoteRotationTimer);
  }
  
  // Get selected interval
  rotationInterval = parseInt(document.getElementById("rotation-interval").value);
  
  // Set new interval
  quoteRotationTimer = setInterval(getQuote, rotationInterval * 1000);
}

// Function to stop quote rotation
function stopQuoteRotation() {
  if (quoteRotationTimer) {
    clearInterval(quoteRotationTimer);
    quoteRotationTimer = null;
  }
}

// Toggle auto-rotation
document.getElementById("auto-rotate").addEventListener("change", (e) => {
  const rotationIntervalSelect = document.getElementById("rotation-interval");
  
  if (e.target.checked) {
    rotationIntervalSelect.disabled = false;
    startQuoteRotation();
  } else {
    rotationIntervalSelect.disabled = true;
    stopQuoteRotation();
  }
});

// Update timer when interval changes
document.getElementById("rotation-interval").addEventListener("change", () => {
  if (document.getElementById("auto-rotate").checked) {
    startQuoteRotation();
  }
});

// Make sure to stop the timer if category changes
document.getElementById("category-select").addEventListener("change", () => {
  // Get a new quote with the new category
  getQuote();
  
  // Restart timer if auto-rotate is enabled
  if (document.getElementById("auto-rotate").checked) {
    startQuoteRotation();
  }
});

// Initialize the app
async function initApp() {
  await fetchQuotes();
  getQuote();
  displayFavorites();
  loadSavedTheme();

  document.getElementById("twitter-btn").addEventListener("click", () => {
    if (currentQuote) {
      const tweetText = encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author}`);
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    }
  });

  document.getElementById("facebook-btn").addEventListener("click", () => {
    if (currentQuote) {
      const url = encodeURIComponent(window.location.href);
      const quoteText = encodeURIComponent(`"${currentQuote.text}" - ${currentQuote.author}`);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quoteText}`, '_blank');
    }
  });

  document.getElementById("search-btn").addEventListener("click", searchQuotes);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
}

initApp();

document.getElementById("new-quote-btn").addEventListener("click", getQuote);

document.getElementById("search-input").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchQuotes();
  }
});