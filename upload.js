// Upload logic for GameHub
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('gameFile');
const thumbInput = document.getElementById('gameThumb');
const progress = document.getElementById('uploadProgress');
const submitBtn = document.getElementById('submitBtn');
const fileNameDisplay = document.getElementById('fileName');

// Check Auth State on load
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        alert('You must be logged in to upload games.');
        location.href = 'index.html';
        return;
    }
    
    // Check if Google is linked
    const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');
    if (!isGoogleLinked) {
        alert('Please link your Google account first.');
        location.href = 'index.html';
        return;
    }
});

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) fileNameDisplay.innerText = file.name;
};

uploadForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) return;

    const title = document.getElementById('gameTitle').value;
    const genre = document.getElementById('gameGenre').value;
    const gameFile = fileInput.files[0];
    const thumbFile = thumbInput.files[0];

    if (!gameFile || !thumbFile) return alert('Please select all files');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Uploading...';
    progress.style.display = 'block';

    try {
        // 1. Upload Thumbnail
        const thumbRef = storage.ref(`thumbnails/${Date.now()}_${thumbFile.name}`);
        const thumbSnapshot = await thumbRef.put(thumbFile);
        const thumbnailUrl = await thumbSnapshot.ref.getDownloadURL();

        // 2. Upload Game File
        const gameRef = storage.ref(`games/${Date.now()}_${gameFile.name}`);
        const uploadTask = gameRef.put(gameFile);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const perc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progress.value = perc;
            }, 
            (error) => { throw error; }, 
            async () => {
                const gameUrl = await uploadTask.snapshot.ref.getDownloadURL();
                
                // 3. Save to Firestore
                await db.collection('games').add({
                    title,
                    genre,
                    thumbnailUrl,
                    url: gameUrl,
                    storagePath: gameRef.fullPath,
                    uploaderId: user.uid,
                    uploaderName: user.displayName || user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert('Game deployed successfully!');
                location.href = 'index.html';
            }
        );

    } catch (error) {
        alert('Upload failed: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerText = 'Deploy Game';
    }
};
