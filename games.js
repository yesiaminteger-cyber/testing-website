// Game loading and discovery for GameHub
const gameGrid = document.getElementById('gameGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Initial Load
async function loadGames() {
    gameGrid.innerHTML = '<div class="loading-state"><p>Searching for amazing games...</p></div>';
    
    try {
        const snapshot = await db.collection('games').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            gameGrid.innerHTML = '<div class="loading-state"><p>No games found. Be the first to upload one!</p></div>';
            return;
        }

        renderGames(snapshot.docs);
    } catch (error) {
        gameGrid.innerHTML = `<div class="loading-state"><p>Error loading games: ${error.message}</p></div>`;
    }
}

function renderGames(docs) {
    gameGrid.innerHTML = '';
    
    docs.forEach(doc => {
        const game = doc.data();
        const card = document.createElement('div');
        card.className = 'game-card glass';
        card.innerHTML = `
            <div class="thumbnail">
                <img src="${game.thumbnailUrl || 'https://via.placeholder.com/300x200?text=No+Thumbnail'}" alt="${game.title}">
                ${ canDelete(game.uploaderId) ? `<button class="delete-btn" onclick="deleteGame('${doc.id}', '${game.storagePath}')"><i class="fas fa-trash"></i> Delete</button>` : '' }
            </div>
            <div class="info">
                <h3>${game.title}</h3>
                <p>${game.genre} • Uploaded by ${game.uploaderName || 'Anonymous'}</p>
                <button class="primary-btn play-btn" onclick="playGame('${game.url}')">Play Now</button>
            </div>
        `;
        gameGrid.appendChild(card);
    });
}

function canDelete(uploaderId) {
    if (!currentUser) return false;
    // Condition: Own game OR admin email
    return currentUser.uid === uploaderId || currentUser.email === 'yesiaminteger@gmail.com';
}

async function deleteGame(id, storagePath) {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
        // Delete from Firestore
        await db.collection('games').doc(id).delete();
        // Delete from Storage if path exists
        if (storagePath) {
            await storage.ref(storagePath).delete();
        }
        alert('Game deleted successfully!');
        loadGames();
    } catch (error) {
        alert('Failed to delete game: ' + error.message);
    }
}

function playGame(url) {
    window.open(url, '_blank');
}

// Search Logic
searchBtn.onclick = () => {
    const term = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(term) ? 'block' : 'none';
    });
};

searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') searchBtn.click();
};

// Start Loading
window.addEventListener('load', loadGames);
window.addEventListener('userStateChanged', loadGames); // Custom event can be trigged to reload
