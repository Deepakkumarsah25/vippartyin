import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDcRvznsJaTRRxAhSYKNt7CDhFGkN208Qw',
  authDomain: 'vip-party-9fa0a.firebaseapp.com',
  projectId: 'vip-party-9fa0a',
  storageBucket: 'vip-party-9fa0a.firebasestorage.app',
  messagingSenderId: '755586403860',
  appId: '1:755586403860:web:aa239cc13fcaf7cfe86101',
});

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const button = document.getElementById('googleButton');
const alertBox = document.querySelector('.auth-alert');
if (button && alertBox) {
  const showMessage = (message, type = 'error') => {
    alertBox.textContent = message;
    alertBox.className = `auth-alert show ${type}`;
  };

  const signIn = async () => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    alertBox.className = 'auth-alert';
    button.setAttribute('aria-disabled', 'true');
    button.style.opacity = '0.65';

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);
      const response = await fetch('/auth/google', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          idToken,
          returnTo: button.dataset.returnTo || '/profile',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) {
        throw new Error(data.message || 'Google sign-in could not be completed.');
      }

      showMessage('Google sign-in successful. Redirecting...', 'success');
      window.location.assign(data.redirect || '/profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      showMessage(error.message || 'Google sign-in could not be completed.');
    } finally {
      button.removeAttribute('aria-disabled');
      button.style.opacity = '';
    }
  };

  button.addEventListener('click', signIn);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      signIn();
    }
  });
}
