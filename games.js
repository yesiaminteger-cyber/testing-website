document.querySelector('.search-bar button').addEventListener('click', function() {
    const searchTerm = document.querySelector('.search-bar input').value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const genre = card.querySelector('p').innerText.toLowerCase();
        
        if (title.includes(searchTerm) || genre.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Allow 'Enter' key to search
document.querySelector('.search-bar input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.querySelector('.search-bar button').click();
    }
});

// Play buttons - simulated
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const gameName = this.closest('.game-card').querySelector('h3').innerText;
        alert(`Launching ${gameName}... (Note: Since this is a template, you should add your actual game files in folders like /games/space-battle/index.html to make them playable)`);
    });
});
