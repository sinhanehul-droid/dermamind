// =================================================================
// --- PASTE YOUR FIREBASE CONFIG KEYS FROM THE WEBSITE HERE ---
//   This is the most important step. Your app will not work without it.
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyAyJNPQfCNYyDqmjcWuYO_MGeA6BF2teXY",
    authDomain: "dermamind-a362c.firebaseapp.com",
    projectId: "dermamind-a362c",
    storageBucket: "dermamind-a362c.firebasestorage.app",
    messagingSenderId: "1032399514731",
    appId: "1:1032399514731:web:c7c7a2b29214a94b16952e"
  };
// =================================================================


// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();

    const pageId = document.body.id;

    // --- Global Elements & Logic ---
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    const allLogoutBtns = document.querySelectorAll('#logoutBtn'); // Select all logout buttons
    const header = document.querySelector('.main-header');

    // Auth state listener to update header on every page
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is logged in
            if (loginBtn) loginBtn.classList.add('hidden');
            if (profileBtn) profileBtn.classList.remove('hidden');
            allLogoutBtns.forEach(btn => btn.classList.remove('hidden'));
        } else {
            // User is logged out
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (profileBtn) profileBtn.classList.add('hidden');
            allLogoutBtns.forEach(btn => btn.classList.add('hidden'));
        }
    });

    // Logout functionality (works on all pages)
    allLogoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    });
    
    // Header scroll effect
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10));
    }
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.animated-element');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // --- Page-Specific Logic ---
    if (pageId === 'homepage') {
        const heroAuthBtn = document.getElementById('heroAuthBtn');
        auth.onAuthStateChanged(user => {
            if (user) {
                heroAuthBtn.textContent = 'Go to Profile';
                heroAuthBtn.href = 'profile.html';
            } else {
                heroAuthBtn.textContent = 'Login / Signup';
                heroAuthBtn.href = 'login.html';
            }
        });
    } 
    else if (pageId === 'loginpage') {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.opacity = '0';
            setTimeout(() => { formContainer.classList.add('is-visible'); }, 100);
        }

        const authForm = document.getElementById('authForm');
        const switchToSignup = document.getElementById('switchToSignup');
        const formTitle = document.getElementById('formTitle');
        const formActionBtn = document.getElementById('formActionBtn');
        const formToggleText = document.getElementById('formToggleText');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        let isLoginMode = true;

        function setFormMode(isLogin) {
            isLoginMode = isLogin;
            formTitle.textContent = isLogin ? 'Welcome Back' : 'Create Your Account';
            formActionBtn.textContent = isLogin ? 'Login' : 'Create Account';
            formToggleText.querySelector('span').textContent = isLogin ? "Don't have an account?" : "Already have an account?";
            switchToSignup.textContent = isLogin ? 'Sign Up' : 'Login';
            confirmPasswordGroup.classList.toggle('hidden', isLogin);
            confirmPasswordInput.required = !isLogin;
        }

        switchToSignup.addEventListener('click', (e) => { e.preventDefault(); setFormMode(!isLoginMode); });

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authForm.email.value;
            const password = authForm.password.value;
            
            if (isLoginMode) {
                // REAL LOGIN LOGIC
                auth.signInWithEmailAndPassword(email, password)
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => alert("Login Failed: " + error.message));
            } else {
                // REAL SIGNUP LOGIC
                if (password !== confirmPasswordInput.value) {
                    alert("Passwords do not match.");
                    return;
                }
                auth.createUserWithEmailAndPassword(email, password)
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => alert("Signup Failed: " + error.message));
            }
        });
    } 
    else if (pageId === 'profilepage') {
        auth.onAuthStateChanged(user => {
            if (!user) {
                // If user is not logged in, force redirect to login page
                window.location.href = 'login.html';
            } else {
                // User is logged in, so we run the profile page logic
                document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.email}!`;
                
                const startAnalysisBtn = document.getElementById('startAnalysisBtn');
                const disclaimerModal = document.getElementById('disclaimerModal');
                const proceedBtn = document.getElementById('proceedBtn');
                const recordList = document.getElementById('recordList');
                const emptyState = document.getElementById('emptyState');

                if(startAnalysisBtn) startAnalysisBtn.addEventListener('click', () => disclaimerModal.classList.remove('hidden'));
                if(proceedBtn) proceedBtn.addEventListener('click', () => {
                    disclaimerModal.classList.add('hidden');
                    // SIMULATION: Add a new report to the database for the current user
                    db.collection('users').doc(user.uid).collection('reports').add({
                        finding: "Simulated Analysis",
                        risk: "Moderate",
                        confidence: Math.floor(Math.random() * 20 + 80),
                        date: new Date()
                    });
                });

                function fetchReports(userId) {
                    const reportsRef = db.collection('users').doc(userId).collection('reports').orderBy('date', 'desc');
                    reportsRef.onSnapshot(snapshot => {
                        if (snapshot.empty) {
                            if(recordList) recordList.innerHTML = emptyState.outerHTML;
                        } else {
                            let cardsHTML = '';
                            snapshot.forEach(doc => {
                                const report = doc.data();
                                const date = report.date.toDate().toLocaleDateString();
                                cardsHTML += `<div class="record-card">...</div>`; // Card HTML
                            });
                            if(recordList) recordList.innerHTML = cardsHTML;
                        }
                    });
                }
                
                fetchReports(user.uid);
            }
        });
    }
});