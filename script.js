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
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.opacity = '0';
            setTimeout(() => { formContainer.classList.add('is-visible'); }, 100);
        }

        const authForm = document.getElementById('authForm');
        const errorMessage = document.getElementById('errorMessage');
        const formTitle = document.getElementById('formTitle');
        const formActionBtn = document.getElementById('formActionBtn');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const formToggleAction = document.getElementById('formToggleAction');
        const formTogglePrompt = document.getElementById('formTogglePrompt');
        let isLoginMode = true;

        function setFormMode(isLogin) {
            isLoginMode = isLogin;
            errorMessage.classList.add('hidden');
            formTitle.textContent = isLogin ? 'Welcome Back' : 'Create Your Account';
            formActionBtn.textContent = isLogin ? 'Login' : 'Create Account';
            formTogglePrompt.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
            formToggleAction.textContent = isLogin ? 'Sign Up' : 'Login';
            confirmPasswordGroup.classList.toggle('hidden', isLogin);
            confirmPasswordInput.required = !isLogin;
        }

        formToggleAction.addEventListener('click', (e) => {
            e.preventDefault();
            setFormMode(!isLoginMode);
        });

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMessage.classList.add('hidden');
            formActionBtn.disabled = true;

            const email = authForm.email.value;
            const password = authForm.password.value;
            const confirmPassword = confirmPasswordInput.value;

            if (isLoginMode) {
                auth.signInWithEmailAndPassword(email, password)
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => {
                        errorMessage.textContent = error.message;
                        errorMessage.classList.remove('hidden');
                        formActionBtn.disabled = false;
                    });
            } else {
                if (password !== confirmPassword) {
                    errorMessage.textContent = "Passwords do not match.";
                    errorMessage.classList.remove('hidden');
                    formActionBtn.disabled = false;
                    return;
                }
                auth.createUserWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        return db.collection('users').doc(userCredential.user.uid).set({
                            email: userCredential.user.email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    })
                    .then(() => window.location.href = 'profile.html')
                    .catch(error => {
                        errorMessage.textContent = error.message;
                        errorMessage.classList.remove('hidden');
                        formActionBtn.disabled = false;
                    });
            }
        });
        
        setFormMode(true); // Initialize the form in Login mode
    } 
    // ... (script.js ka existing code - firebase config, auth, db initialization, global auth logic, animations) ...

    // --- Page-Specific Logic ---
    // ... (loginpage logic remains the same) ...
    
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

            // --- Tab Handling Logic (NEW) ---
            const tabLinks = document.querySelectorAll('.profile-tabs .tab-link');
            const tabPanes = document.querySelectorAll('.profile-tab-content .tab-pane');

            function activateTab(tabId) {
                tabLinks.forEach(link => {
                    link.classList.remove('active');
                });
                tabPanes.forEach(pane => {
                    pane.classList.add('hidden');
                });

                document.getElementById(`${tabId}Tab`).classList.add('active');
                document.getElementById(`${tabId}Pane`).classList.remove('hidden');
            }

            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = e.target.id.replace('Tab', '');
                    activateTab(tabId);

                    // Fetch data specific to the activated tab (if needed)
                    if (tabId === 'records') fetchUserReports(user.uid);
                    if (tabId === 'conversations') fetchUserConversations(user.uid);
                    if (tabId === 'prescriptions') fetchUserPrescriptions(user.uid);
                    // No explicit fetch for settings yet, as it's static form
                });
            });

            // --- My Records Tab Logic (Existing, with minor updates) ---
            const startAnalysisBtn = document.getElementById('startAnalysisBtn');
            const disclaimerModal = document.getElementById('disclaimerModal');
            const proceedBtn = document.getElementById('proceedBtn');
            const cancelBtn = document.getElementById('cancelBtn'); // NEW: Cancel button for modal
            const recordList = document.getElementById('recordList');
            const emptyStateRecords = document.getElementById('recordsPane').querySelector('.empty-state'); // Specific empty state

            if (startAnalysisBtn) {
                startAnalysisBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.remove('hidden');
                });
            }

            if (proceedBtn) {
                proceedBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                    createDummyReport(user.uid);
                });
            }

            if (cancelBtn) { // NEW: Handle cancel button for modal
                cancelBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                });
            }
            
            const fetchUserReports = (userId) => {
                if (!userId || !recordList) return;
                
                db.collection('users').doc(userId).collection('reports')
                    .orderBy('date', 'desc')
                    .onSnapshot(snapshot => {
                        recordList.innerHTML = ''; // Clear previous records
                        if (snapshot.empty) {
                            if (emptyStateRecords) emptyStateRecords.classList.remove('hidden');
                        } else {
                            if (emptyStateRecords) emptyStateRecords.classList.add('hidden');
                            snapshot.forEach(doc => {
                                const report = doc.data();
                                const reportId = doc.id;
                                const date = report.date.toDate().toLocaleDateString();

                                const recordCard = document.createElement('div');
                                recordCard.className = 'record-card animated-element';
                                recordCard.innerHTML = `
                                    <div>
                                        <h4>Analysis on ${date}</h4>
                                        <p>${report.finding} <span class="record-status risk-${report.risk.toLowerCase()}">${report.risk} Risk</span></p>
                                    </div>
                                    <a href="report.html?id=${reportId}" class="btn btn-cta-main">View Report</a>
                                `;
                                recordList.appendChild(recordCard);
                                observer.observe(recordCard); // Re-observe for animation
                            });
                        }
                    });
            };

            const createDummyReport = (userId) => {
                const dummyReports = [
                    {
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        finding: "Mild Pigmentation Anomaly",
                        confidence: 85,
                        risk: "Low",
                        imageUrl: "https://images.unsplash.com/photo-1615565392322-89587498c4d3?q=80&w=2574&auto=format&fit=crop",
                        details: "Slightly uneven skin tone observed around the cheek area. No significant inflammation or lesions detected.",
                        recommendations: ["Maintain good hydration.", "Use SPF 30+ daily.", "Monitor for changes."],
                        riskBreakdown: [
                            { aspect: 'Color Irregularity', score: 60, level: 'Moderate' },
                            { aspect: 'Texture Deviation', score: 30, level: 'Low' }
                        ],
                        historicalData: [ // Dummy historical data
                            { date: new Date('2023-01-15').toISOString(), riskScore: 5 },
                            { date: new Date('2023-03-20').toISOString(), riskScore: 4 },
                            { date: new Date('2023-05-25').toISOString(), riskScore: 3 }
                        ]
                    },
                    {
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        finding: "Minor Skin Irritation",
                        confidence: 78,
                        risk: "Moderate",
                        imageUrl: "https://images.unsplash.com/photo-1621370802717-b677a83d7a8d?q=80&w=2609&auto=format&fit=crop",
                        details: "Localized redness and minor itching reported. Possibly contact dermatitis.",
                        recommendations: ["Avoid irritants.", "Apply a soothing moisturizer.", "Consult doctor if symptoms persist."],
                        riskBreakdown: [
                            { aspect: 'Inflammation', score: 75, level: 'High' },
                            { aspect: 'Lesion Severity', score: 40, level: 'Low' }
                        ],
                        historicalData: [
                            { date: new Date('2023-02-10').toISOString(), riskScore: 6 },
                            { date: new Date('2023-04-18').toISOString(), riskScore: 7 },
                            { date: new Date('2023-06-01').toISOString(), riskScore: 6 }
                        ]
                    }
                ];

                // Add a random dummy report
                const reportToAdd = dummyReports[Math.floor(Math.random() * dummyReports.length)];

                db.collection('users').doc(userId).collection('reports').add(reportToAdd)
                    .then(() => {
                        console.log("Dummy report added successfully!");
                    })
                    .catch(error => {
                        console.error("Error adding dummy report: ", error);
                    });
            };


            // --- Past Conversations Tab Logic (NEW) ---
            const conversationList = document.getElementById('conversationList');
            const emptyStateConversations = document.getElementById('conversationsPane').querySelector('.empty-state');

            const fetchUserConversations = (userId) => {
                if (!userId || !conversationList) return;

                // Ye yahaan Firebase se data fetch karega. Abhi dummy data dikhate hain.
                // Actual mein ek 'conversations' subcollection hogi users ke andar
                // For now, simulate async fetch with dummy data
                conversationList.innerHTML = ''; // Clear previous conversations

                const dummyConversations = [
                    {
                        id: 'conv1',
                        date: new Date('2023-07-01'),
                        subject: 'Regarding persistent rash on arm',
                        lastMessage: 'Doctor suggested topical cream and follow-up.',
                        status: 'Resolved'
                    },
                    {
                        id: 'conv2',
                        date: new Date('2023-06-15'),
                        subject: 'Inquiry about dry skin patches',
                        lastMessage: 'AI recommended specific moisturizer brands.',
                        status: 'Open'
                    },
                    {
                        id: 'conv3',
                        date: new Date('2023-05-10'),
                        subject: 'Mole check-up',
                        lastMessage: 'AI flagged for doctor review, benign confirmed.',
                        status: 'Resolved'
                    }
                ];

                if (dummyConversations.length === 0) {
                    if (emptyStateConversations) emptyStateConversations.classList.remove('hidden');
                } else {
                    if (emptyStateConversations) emptyStateConversations.classList.add('hidden');
                    dummyConversations.sort((a, b) => b.date - a.date).forEach(conv => {
                        const convCard = document.createElement('div');
                        convCard.className = 'record-card animated-element'; // Reuse record-card style
                        convCard.innerHTML = `
                            <div>
                                <h4>${conv.subject}</h4>
                                <p>Date: ${conv.date.toLocaleDateString()}</p>
                                <p>${conv.lastMessage}</p>
                                <span class="record-status">${conv.status}</span>
                            </div>
                            <button class="btn btn-secondary">View Chat</button>
                        `;
                        conversationList.appendChild(convCard);
                        observer.observe(convCard); // Re-observe for animation
                    });
                }
            };


            // --- Prescriptions Tab Logic (NEW) ---
            const prescriptionList = document.getElementById('prescriptionList');
            const emptyStatePrescriptions = document.getElementById('prescriptionsPane').querySelector('.empty-state');

            const fetchUserPrescriptions = (userId) => {
                if (!userId || !prescriptionList) return;

                // Ye bhi abhi dummy data hai
                prescriptionList.innerHTML = ''; // Clear previous prescriptions

                const dummyPrescriptions = [
                    {
                        id: 'rx1',
                        dateIssued: new Date('2023-07-05'),
                        medication: 'Hydrocortisone Cream 1%',
                        dosage: 'Apply thin layer twice daily',
                        duration: '7 days',
                        prescribedBy: 'Dr. AI Bot (Simulated)',
                        status: 'Active'
                    },
                    {
                        id: 'rx2',
                        dateIssued: new Date('2023-06-20'),
                        medication: 'Moisturizing Lotion',
                        dosage: 'Apply as needed',
                        duration: 'Ongoing',
                        prescribedBy: 'Dr. AI Bot (Simulated)',
                        status: 'Completed'
                    }
                ];

                if (dummyPrescriptions.length === 0) {
                    if (emptyStatePrescriptions) emptyStatePrescriptions.classList.remove('hidden');
                } else {
                    if (emptyStatePrescriptions) emptyStatePrescriptions.classList.add('hidden');
                    dummyPrescriptions.sort((a, b) => b.dateIssued - a.dateIssued).forEach(rx => {
                        const rxCard = document.createElement('div');
                        rxCard.className = 'record-card animated-element'; // Reuse style
                        rxCard.innerHTML = `
                            <div>
                                <h4>${rx.medication}</h4>
                                <p>Issued: ${rx.dateIssued.toLocaleDateString()}</p>
                                <p>Dosage: ${rx.dosage}</p>
                                <p>Duration: ${rx.duration}</p>
                                <p>Prescribed by: ${rx.prescribedBy}</p>
                                <span class="record-status">${rx.status}</span>
                            </div>
                            <button class="btn btn-secondary">Details</button>
                        `;
                        prescriptionList.appendChild(rxCard);
                        observer.observe(rxCard); // Re-observe for animation
                    });
                }
            };
            

            // Initialize with the records tab active on page load
            activateTab('records');
            fetchUserReports(user.uid); // Fetch records initially
        });
    }
    // ... (Other page logic like 'reportpage' remains correct) ...
});
    