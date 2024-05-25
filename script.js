document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    if (query) {
        searchAll(query);
    }
});

function searchAll(query) {
    const wikipediaEndpoint = `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
    const youTubeEndpoint = `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&part=snippet&type=video`;
    const gitHubEndpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;

    Promise.all([
        fetch(wikipediaEndpoint).then(response => response.json()),
        fetch(youTubeEndpoint).then(response => response.json()),
        fetch(gitHubEndpoint).then(response => response.json())
    ])
    .then(([wikipediaData, youTubeData, gitHubData]) => {
        const allResults = mergeResults(wikipediaData.query.search, youTubeData.items, gitHubData.items);
        displayAllResults(allResults);
    })
    .catch(error => console.error('Error:', error));
}

function mergeResults(wikipediaResults, youTubeResults, gitHubResults) {
    const mergedResults = [...wikipediaResults, ...youTubeResults, ...gitHubResults];
    return mergedResults;
}

function displayAllResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        let title, description, url;

        if (result.title && result.snippet) {
            title = result.title;
            description = result.snippet;
            url = `https://en.wikipedia.org/?curid=${result.pageid}`;
        } else if (result.id && result.snippet) {
            title = result.snippet.title;
            description = result.snippet.description;
            url = `https://www.youtube.com/watch?v=${result.id.videoId}`;
        } else if (result.full_name && result.html_url) {
            title = result.full_name;
            description = result.description;
            url = result.html_url;
        }
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <h3><a href="${url}" target="_blank">${title}</a></h3>
            <p>${description}</p>
        `;
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.onclick = () => saveToFavorites(title, url);
        resultItem.appendChild(saveButton);
        resultsContainer.appendChild(resultItem);
    });
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

document.addEventListener('DOMContentLoaded', displayFavorites);
