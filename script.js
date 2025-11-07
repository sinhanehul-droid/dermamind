// =================================================================
// --- PASTE YOUR FIREBASE CONFIG KEYS FROM THE WEBSITE HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyAyJNPQfCNYyDqmjcWuYO_MGeA6BF2teXY",
  authDomain: "dermamind-a362c.firebaseapp.com",
  projectId: "dermamind-a362c",
  storageBucket: "dermamind-a362c.firebasestorage.app",
  messagingSenderId: "1032399514731",
  appId: "1:1032399514731:web:2262a35546a6d3a016952e"
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

    // --- Global Auth & UI Logic ---
    // Desktop buttons
    const allLoginBtns = document.querySelectorAll('#loginBtn');
    const allProfileBtns = document.querySelectorAll('#profileBtn');
    const allLogoutBtns = document.querySelectorAll('#logoutBtn');
    
    // Mobile buttons
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileProfileBtn = document.getElementById('mobileProfileBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    // Hero button
    const heroAuthBtn = document.getElementById('heroAuthBtn');

    auth.onAuthStateChanged(user => {
        const isLoggedIn = !!user;

        // Toggle Desktop Buttons
        allLoginBtns.forEach(btn => btn.classList.toggle('hidden', isLoggedIn));
        allProfileBtns.forEach(btn => btn.classList.toggle('hidden', !isLoggedIn));
        allLogoutBtns.forEach(btn => btn.classList.toggle('hidden', !isLoggedIn));
        
        // Toggle Mobile Buttons
        if (mobileLoginBtn) mobileLoginBtn.classList.toggle('hidden', isLoggedIn);
        if (mobileProfileBtn) mobileProfileBtn.classList.toggle('hidden', !isLoggedIn);
        if (mobileLogoutBtn) mobileLogoutBtn.classList.toggle('hidden', !isLoggedIn);

        // Update Hero Button on Homepage
        if (pageId === 'homepage' && heroAuthBtn) {
            heroAuthBtn.textContent = isLoggedIn ? 'Go to Profile' : 'Login / Signup';
            heroAuthBtn.href = isLoggedIn ? 'profile.html' : 'login.html';
        }
    });

    // Logout functionality for ALL logout buttons
    document.querySelectorAll('#logoutBtn, #mobileLogoutBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    });
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    if (mobileMenuBtn && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.toggle('hidden');
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenuOverlay.classList.contains('hidden')) {
                icon.setAttribute('data-feather', 'menu');
            } else {
                icon.setAttribute('data-feather', 'x');
            }
            feather.replace(); // Redraw icons
        });
    }

    // --- Animations ---
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
    animatedElements.forEach(el => { el.style.opacity = '0'; observer.observe(el); });


    // --- Page-Specific Logic ---
    if (pageId === 'loginpage') {
        const authForm = document.getElementById('authForm');
        if (!authForm) {
            console.error("Login form with id='authForm' not found.");
            return;
        }

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const errorMessage = document.getElementById('errorMessage');
        const successMessage = document.getElementById('successMessage');
        const formTitle = document.getElementById('formTitle');
        const formActionBtn = document.getElementById('formActionBtn');
        const formActionBtnText = formActionBtn.querySelector('.btn-text');
        const formActionBtnSpinner = formActionBtn.querySelector('.spinner');
        const formToggleAction = document.getElementById('formToggleAction');
        const formTogglePrompt = document.getElementById('formTogglePrompt');
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        let isLoginMode = true;

        function showMessage(element, message) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
        function hideMessages() {
            errorMessage.classList.add('hidden');
            successMessage.classList.add('hidden');
        }
        function toggleLoader(isLoading) {
            formActionBtn.disabled = isLoading;
            formActionBtnText.classList.toggle('hidden', isLoading);
            formActionBtnSpinner.classList.toggle('hidden', !isLoading);
        }
        function setFormMode(isLogin) {
            isLoginMode = isLogin;
            hideMessages();
            authForm.reset();
            formTitle.textContent = isLogin ? 'Welcome Back' : 'Create Your Account';
            formActionBtnText.textContent = isLogin ? 'Login' : 'Create Account';
            formTogglePrompt.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
            formToggleAction.textContent = isLogin ? 'Sign Up' : 'Login';
            confirmPasswordGroup.classList.toggle('hidden', isLogin);
            confirmPasswordInput.required = !isLogin;
            forgotPasswordLink.style.display = isLogin ? 'block' : 'none';
        }

        formToggleAction.addEventListener('click', (e) => {
            e.preventDefault();
            setFormMode(!isLoginMode);
        });

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideMessages();
            toggleLoader(true);
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (isLoginMode) {
                auth.signInWithEmailAndPassword(email, password)
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => { showMessage(errorMessage, error.message); toggleLoader(false); });
            } else {
                if (password !== confirmPassword) {
                    showMessage(errorMessage, "Passwords do not match.");
                    toggleLoader(false); return;
                }
                auth.createUserWithEmailAndPassword(email, password)
                    .then(userCredential => db.collection('users').doc(userCredential.user.uid).set({
                        email: userCredential.user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }))
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => { showMessage(errorMessage, error.message); toggleLoader(false); });
            }
        });

        googleSignInBtn.addEventListener('click', () => {
            hideMessages();
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(result => {
                    if (result.additionalUserInfo.isNewUser) {
                        return db.collection('users').doc(result.user.uid).set({
                            email: result.user.email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                })
                .then(() => { window.location.href = 'profile.html'; })
                .catch(error => { showMessage(errorMessage, error.message); });
        });

        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideMessages();
            const email = emailInput.value;
            if (!email) {
                showMessage(errorMessage, "Please enter your email to reset password."); return;
            }
            auth.sendPasswordResetEmail(email)
                .then(() => { showMessage(successMessage, "Password reset email sent!"); })
                .catch(error => { showMessage(errorMessage, error.message); });
        });

        setFormMode(true);
    }
    else if (pageId === 'profilepage') {
        auth.onAuthStateChanged(user => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, ${user.email.split('@')[0]}!`;
            }

            const tabLinks = document.querySelectorAll('.profile-tabs .tab-link');
            const tabPanes = document.querySelectorAll('.profile-tab-content .tab-pane');
            function activateTab(tabId) {
                tabLinks.forEach(link => link.classList.remove('active'));
                tabPanes.forEach(pane => {
                    pane.classList.add('hidden'); // Hide all
                    pane.classList.remove('active'); // Remove active
                });
                
                const activeTabLink = document.getElementById(`${tabId}Tab`);
                const activeTabPane = document.getElementById(`${tabId}Pane`);
                
                if (activeTabLink) activeTabLink.classList.add('active');
                if (activeTabPane) {
                    activeTabPane.classList.remove('hidden'); // Show target
                    activeTabPane.classList.add('active'); // Mark as active
                }
            }

            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = e.currentTarget.id.replace('Tab', '');
                    activateTab(tabId);
                    if (tabId === 'records') fetchUserReports(user.uid);
                    if (tabId === 'conversations') fetchUserConversations(user.uid);
                    if (tabId === 'prescriptions') fetchUserPrescriptions(user.uid);
                });
            });

            const startAnalysisBtn = document.getElementById('startAnalysisBtn');
            const disclaimerModal = document.getElementById('disclaimerModal');
            const proceedBtn = document.getElementById('proceedBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            if (startAnalysisBtn) {
                startAnalysisBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.remove('hidden');
                });
            }
            if (proceedBtn) {
                proceedBtn.addEventListener('click', () => {
                    window.location.href = 'derma-mind-python/static/index.html'; 
                });
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                });
            }

            const recordList = document.getElementById('recordList');
            const emptyStateRecords = document.getElementById('emptyStateRecords');
            const fetchUserReports = (userId) => {
                db.collection('users').doc(userId).collection('reports').orderBy('date', 'desc')
                    .onSnapshot(snapshot => {
                        recordList.innerHTML = ''; // Clear list
                        emptyStateRecords.classList.toggle('hidden', !snapshot.empty);
                        snapshot.forEach(doc => {
                            const report = doc.data();
                            const card = document.createElement('div');
                            card.className = 'record-card';
                            card.innerHTML = `
                                <div>
                                    <h4>${report.finding}</h4>
                                    <p>Date: ${report.date.toDate().toLocaleDateString()}</p>
                                </div>
                                <a href="report.html?id=${doc.id}" class="btn btn-cta-main">View Details</a>
                            `;
                            recordList.appendChild(card);
                        });
                    });
            };

            const conversationList = document.getElementById('conversationList');
            const emptyStateConvos = document.getElementById('emptyStateConvos');
            const fetchUserConversations = (userId) => {
                conversationList.innerHTML = ''; // Clear list
                emptyStateConvos.classList.remove('hidden'); // Show empty state
            };

            const prescriptionList = document.getElementById('prescriptionList');
            const emptyStatePrescriptions = document.getElementById('emptyStatePrescriptions');
            const fetchUserPrescriptions = (userId) => {
                prescriptionList.innerHTML = ''; // Clear list
                emptyStatePrescriptions.classList.remove('hidden'); // Show empty state
            };
            
            activateTab('records'); // Start on the records tab
            // fetchUserReports(user.uid); // Already called by activateTab
        });
    }
    else if (pageId === 'reportpage') {
        auth.onAuthStateChanged(user => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const reportId = urlParams.get('id');

            if (!reportId) {
                document.body.innerHTML = '<h1>Report not found.</h1>';
                return;
            }
            
            db.collection('users').doc(user.uid).collection('reports').doc(reportId).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        document.getElementById('reportFinding').textContent = data.finding;
                        document.getElementById('reportConfidence').textContent = `${data.confidence}%`;
                        document.getElementById('reportRisk').textContent = data.risk;
                        document.getElementById('reportImage').src = data.imageUrl;
                        document.getElementById('reportDate').textContent = `Generated on ${data.date.toDate().toLocaleDateString()}`;
                    } else {
                        console.log("No such document!");
                        document.body.innerHTML = '<h1>Report not found or you do not have permission.</h1>';
                    }
                });
        });
    }
});