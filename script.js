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
    const allLoginBtns = document.querySelectorAll('#loginBtn');
    const allProfileBtns = document.querySelectorAll('#profileBtn');
    const allLogoutBtns = document.querySelectorAll('#logoutBtn');

    auth.onAuthStateChanged(user => {
        const isLoggedIn = !!user;
        allLoginBtns.forEach(btn => btn.classList.toggle('hidden', isLoggedIn));
        allProfileBtns.forEach(btn => btn.classList.toggle('hidden', !isLoggedIn));
        allLogoutBtns.forEach(btn => btn.classList.toggle('hidden', !isLoggedIn));

        if (document.body.id === 'homepage') {
            const heroAuthBtn = document.getElementById('heroAuthBtn');
            if (heroAuthBtn) {
                heroAuthBtn.textContent = isLoggedIn ? 'Go to Profile' : 'Login / Signup';
                heroAuthBtn.href = isLoggedIn ? 'profile.html' : 'login.html';
            }
        }
    });

    allLogoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    });
    
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
                tabPanes.forEach(pane => pane.classList.add('hidden'));
                const activeTabLink = document.getElementById(`${tabId}Tab`);
                const activeTabPane = document.getElementById(`${tabId}Pane`);
                if (activeTabLink) activeTabLink.classList.add('active');
                if (activeTabPane) activeTabPane.classList.remove('hidden');
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
                proceedBtn.addEventListener('click', () => { window.location.href = 'chatbot.html'; });
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                });
            }

            const recordList = document.getElementById('recordList');
            const emptyStateRecords = document.getElementById('recordsPane').querySelector('.empty-state');
            const fetchUserReports = (userId) => {
                db.collection('users').doc(userId).collection('reports').orderBy('date', 'desc')
                    .onSnapshot(snapshot => {
                        recordList.innerHTML = '';
                        emptyStateRecords.classList.toggle('hidden', !snapshot.empty);
                        snapshot.forEach(doc => {
                            const report = doc.data();
                            const card = document.createElement('div');
                            card.className = 'record-card';
                            card.innerHTML = `<h4>Analysis: ${report.finding}</h4><p>Date: ${report.date.toDate().toLocaleDateString()}</p><a href="report.html?id=${doc.id}" class="btn btn-cta-main">View Details</a>`;
                            recordList.appendChild(card);
                        });
                    });
            };

            const conversationList = document.getElementById('conversationList');
            const emptyStateConvos = document.getElementById('conversationsPane').querySelector('.empty-state');
            const fetchUserConversations = (userId) => {
                conversationList.innerHTML = '';
                emptyStateConvos.classList.remove('hidden');
            };

            const prescriptionList = document.getElementById('prescriptionList');
            const emptyStatePrescriptions = document.getElementById('prescriptionsPane').querySelector('.empty-state');
            const fetchUserPrescriptions = (userId) => {
                prescriptionList.innerHTML = '';
                emptyStatePrescriptions.classList.remove('hidden');
            };
            
            activateTab('records');
            fetchUserReports(user.uid); 
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

            const reportImage = document.getElementById('reportImage');
            const reportFinding = document.getElementById('reportFinding');
            const reportConfidence = document.getElementById('reportConfidence');
            const reportRisk = document.getElementById('reportRisk');
            const reportDate = document.getElementById('reportDate');

            if (!reportId) {
                reportFinding.textContent = 'Report Not Found';
                return;
            }
            
            const reportRef = db.collection('users').doc(user.uid).collection('reports').doc(reportId);
            reportRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    reportFinding.textContent = data.finding || 'N/A';
                    reportConfidence.textContent = `${data.confidence || '--'}%`;
                    reportRisk.textContent = data.risk || 'N/A';
                    reportImage.src = data.imageUrl || 'assets/placeholder.png';
                    if (data.date) {
                       reportDate.textContent = `Generated on ${data.date.toDate().toLocaleDateString()}`;
                    }
                } else {
                    reportFinding.textContent = 'Report data could not be found.';
                }
            }).catch(error => {
                console.error("Error getting report:", error);
                reportFinding.textContent = 'Error loading report.';
            });
        });
    }
});