// Auth logic for GameHub
const adminEmail = 'yesiaminteger@gmail.com';

// State management
let currentUser = null;
let isGuest = false;

// DOM Elements
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('authModal');
const closeModal = document.querySelector('.close-modal');
const guestBtn = document.getElementById('guestBtn');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const googleLinkBtn = document.getElementById('googleLinkBtn');
const userInfoDiv = document.getElementById('user-info');
const uploadLinkUnderNav = document.getElementById('upload-link');

// Initialize Auth State
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        isGuest = false;
        updateUIForUser(user);
    } else {
        const guestSession = sessionStorage.getItem('guestMode');
        if (guestSession) {
            isGuest = true;
            updateUIForGuest();
        } else {
            showAuthModal();
        }
    }
});

function updateUIForUser(user) {
    authBtn.innerText = 'Logout';
    authBtn.onclick = logout;
    
    // Check if user has linked Google (providerData contains provider information)
    const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');
    
    userInfoDiv.innerHTML = `
        <img src="${user.photoURL || 'https://via.placeholder.com/35'}" alt="User">
        <span>${user.displayName || user.email.split('@')[0]}</span>
    `;

    // Only show upload link if Google is linked
    if (isGoogleLinked) {
        uploadLinkUnderNav.classList.remove('hidden');
    } else {
        uploadLinkUnderNav.classList.add('hidden');
        // If they are logged in but not linked, show the link modal
        showStep(2);
    }
    
    authModal.classList.add('hidden');
}

function updateUIForGuest() {
    authBtn.innerText = 'Login / Sign Up';
    authBtn.onclick = showAuthModal;
    userInfoDiv.innerHTML = '<span>Guest Account</span>';
    uploadLinkUnderNav.classList.add('hidden');
}

// Modal Logic
function showAuthModal() {
    authModal.classList.remove('hidden');
    showStep(1);
}

closeModal.onclick = () => authModal.classList.add('hidden');

function showStep(step) {
    document.getElementById('auth-step-1').classList.add('hidden');
    document.getElementById('auth-step-2').classList.add('hidden');
    document.getElementById(`auth-step-${step}`).classList.remove('hidden');
}

// Actions
guestBtn.onclick = () => {
    sessionStorage.setItem('guestMode', 'true');
    isGuest = true;
    updateUIForGuest();
    authModal.classList.add('hidden');
};

// Email Link (OTP) Logic
sendOtpBtn.onclick = async () => {
    const email = document.getElementById('emailInput').value;
    if (!email) return alert('Please enter your email');

    const actionCodeSettings = {
        url: window.location.href, // Re-entry point
        handleCodeInApp: true
    };

    try {
        await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        alert('Verification link sent! Please check your Gmail.');
    } catch (error) {
        alert(error.message);
    }
};

// Handle incoming sign-in link
if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        email = window.prompt('Please provide your email for confirmation');
    }
    firebase.auth().signInWithEmailLink(email, window.location.href)
        .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // User is signed in, now link Google
            showStep(2);
        })
        .catch(error => alert(error.message));
}

// Google Linking Logic
googleLinkBtn.onclick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        // Link the Google account to the current email account
        await currentUser.linkWithPopup(provider);
        alert('Successfully linked with Google! You can now upload games.');
        location.reload();
    } catch (error) {
        alert('Linking failed: ' + error.message);
    }
};

function logout() {
    firebase.auth().signOut();
    sessionStorage.removeItem('guestMode');
    location.reload();
}

// Check if current user is admin
function isAdmin() {
    return currentUser && currentUser.email === adminEmail;
}
