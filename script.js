document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    if (query) {
        searchWikipedia(query);
        searchDictionary(query);
    }
});

function searchWikipedia(query) {
    const endpoint = `api.deepcrawl.com`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            displayResults(data.query.search);
        })
        .catch(error => console.error('Error:', error));
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    results.forEach(result => {
        const url = `https://en.wikipedia.org/?curid=${result.pageid}`;
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <h3><a href="${url}" target="_blank">${result.title}</a></h3>
            <p>${result.snippet}</p>
        `;
        const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = () => saveToFavorites(result.title, url);
    resultItem.appendChild(saveButton);
        resultsContainer.appendChild(resultItem);
    });
}

function searchDictionary(query) {
    const endpoint = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            displayDictionaryResults(data);
        })
        .catch(error => console.error('Error:', error));
}

function displayDictionaryResults(results) {
    const resultsContainer = document.getElementById('results-container');
    const dictionaryResults = document.createElement('div');
    dictionaryResults.className = 'result-item';

    if (!Array.isArray(results) || results.length === 0) {
        dictionaryResults.innerHTML = `<p>No dictionary results found for the query.</p>`;
        resultsContainer.appendChild(dictionaryResults);
        return;
    }

    const meanings = results[0].meanings.map(meaning => {
        const definitions = meaning.definitions.map(def => `<li>${def.definition}</li>`).join('');
        return `<h4>${meaning.partOfSpeech}</h4><ul>${definitions}</ul>`;
    }).join('');

    dictionaryResults.innerHTML = `<h2>Dictionary Results:</h2>${meanings}`;
    resultsContainer.insertBefore(dictionaryResults, resultsContainer.firstChild);
}

function saveToFavorites(title, url) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    favorites[title] = url;
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '<h2>Favorites:</h2>';

    for (const title in favorites) {
        const url = favorites[title];
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'result-item';
        favoriteItem.innerHTML = `
            <h3><a href="${url}" target="_blank">${title}</a></h3>
            <button onclick="removeFromFavorites('${title}')">Remove</button>
        `;
        favoritesContainer.appendChild(favoriteItem);
    }
}

function removeFromFavorites(title) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    delete favorites[title];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Call displayFavorites on page load to show the saved bookmarks
document.addEventListener('DOMContentLoaded', displayFavorites);
