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


// --- Utility Functions ---

/**
 * Saves a conversation to Firestore.
 * @param {string} userId - The user's UID.
 * @param {Array<Object>} chatHistory - Array of {sender: 'user'/'ai', message: string}
 * @param {string} initialImage - Base64 or identifier of the uploaded image.
 */
const saveConversationToFirestore = async (userId, chatHistory, initialImage) => {
    if (!userId) return console.error("Cannot save conversation: User not authenticated.");

    try {
        const conversationRef = await db.collection('users').doc(userId).collection('conversations').add({
            date: firebase.firestore.FieldValue.serverTimestamp(),
            initialImage: initialImage || 'No image uploaded',
            chatHistory: chatHistory,
            subject: chatHistory.length > 0 ? chatHistory[0].message.substring(0, 50) + '...' : 'New Consultation',
            status: 'Pending Recommendation',
        });
        console.log("Conversation saved with ID: ", conversationRef.id);
        return conversationRef.id;
    } catch (error) {
        console.error("Error saving conversation: ", error);
        return null;
    }
};

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
                    const tabId = e.target.id.replace('Tab', '').replace('sTab', ''); 
                    activateTab(tabId);

                    if (tabId === 'records') fetchUserReports(user.uid);
                    if (tabId === 'conversations') fetchUserConversations(user.uid);
                    if (tabId === 'prescriptions') fetchUserPrescriptions(user.uid);
                });
            });

            const startAnalysisBtn = document.getElementById('startAnalysisBtn');
            const startNewChatBtn = document.getElementById('startNewChatBtn');
            const disclaimerModal = document.getElementById('disclaimerModal');
            const proceedBtn = document.getElementById('proceedBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            if (startAnalysisBtn) {
                startAnalysisBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.remove('hidden');
                });
            }
            
            if (startNewChatBtn) {
                 startNewChatBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.remove('hidden');
                });
            }

            if (proceedBtn) {
                proceedBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                    window.location.href = 'chatbot.html';
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    if (disclaimerModal) disclaimerModal.classList.add('hidden');
                });
            }
            
            const recordList = document.getElementById('recordList');
            const emptyStateRecords = document.getElementById('recordsPane').querySelector('.empty-state');
            const conversationList = document.getElementById('conversationList');
            const emptyStateConversations = document.getElementById('conversationsPane').querySelector('.empty-state');
            const prescriptionList = document.getElementById('prescriptionList');
            const emptyStatePrescriptions = document.getElementById('prescriptionsPane').querySelector('.empty-state');

            const fetchUserReports = (userId) => {
                if (!userId || !recordList) return;
                
                db.collection('users').doc(userId).collection('reports')
                    .orderBy('date', 'desc')
                    .onSnapshot(snapshot => {
                        recordList.innerHTML = ''; 
                        const reports = [];
                        snapshot.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));

                        if (reports.length === 0) {
                            emptyStateRecords.classList.remove('hidden');
                        } else {
                            emptyStateRecords.classList.add('hidden');
                            reports.forEach(report => {
                                const date = (report.date.toDate ? report.date.toDate() : new Date()).toLocaleDateString();
                                const riskClass = (report.risk || 'low').toLowerCase().replace(' ', '-');

                                const recordCard = document.createElement('div');
                                recordCard.className = 'record-card animated-element';
                                recordCard.innerHTML = `
                                    <div>
                                        <h4>Analysis on ${date}</h4>
                                        <p>${report.finding || 'N/A'} <span class="record-status risk-${riskClass}">${report.risk || 'Low'} Risk</span></p>
                                    </div>
                                    <a href="report.html?id=${report.id}" class="btn btn-cta-main">View Report</a>
                                `;
                                recordList.appendChild(recordCard);
                                observer.observe(recordCard); 
                            });
                        }
                    });
            };

            const fetchUserConversations = (userId) => {
                if (!userId || !conversationList) return;

                db.collection('users').doc(userId).collection('conversations')
                    .orderBy('date', 'desc')
                    .onSnapshot(snapshot => {
                        conversationList.innerHTML = '';
                        const conversations = [];
                        snapshot.forEach(doc => conversations.push({ id: doc.id, ...doc.data() }));

                        if (conversations.length === 0) {
                            emptyStateConversations.classList.remove('hidden');
                        } else {
                            emptyStateConversations.classList.add('hidden');
                            conversations.forEach(conv => {
                                const date = (conv.date.toDate ? conv.date.toDate() : new Date()).toLocaleDateString();
                                const convCard = document.createElement('div');
                                convCard.className = 'record-card animated-element'; 
                                convCard.innerHTML = `
                                    <div>
                                        <h4>${conv.subject || 'Consultation'}</h4>
                                        <p>Date: ${date}</p>
                                        <p>Status: <span class="record-status">${conv.status || 'Complete'}</span></p>
                                    </div>
                                    <a href="chatbot.html?convId=${conv.id}" class="btn btn-secondary">View Chat</a>
                                `;
                                conversationList.appendChild(convCard);
                                observer.observe(convCard);
                            });
                        }
                    });
            };

            const fetchUserPrescriptions = (userId) => {
                if (!userId || !prescriptionList) return;
                prescriptionList.innerHTML = ''; 
                
                const dummyPrescriptions = [
                    { id: 'rx1', dateIssued: new Date(), medication: 'Custom Moisturizer Plan', dosage: 'Morning and Evening Application', status: 'Active' },
                    { id: 'rx2', dateIssued: new Date('2023-06-20'), medication: 'Sunscreen Protocol', dosage: 'Apply every 2 hours when exposed to sun', status: 'Completed' }
                ];

                if (dummyPrescriptions.length === 0) {
                    emptyStatePrescriptions.classList.remove('hidden');
                } else {
                    emptyStatePrescriptions.classList.add('hidden');
                    dummyPrescriptions.sort((a, b) => b.dateIssued - a.dateIssued).forEach(rx => {
                        const rxCard = document.createElement('div');
                        rxCard.className = 'record-card animated-element'; 
                        rxCard.innerHTML = `
                            <div>
                                <h4>${rx.medication}</h4>
                                <p>Issued: ${rx.dateIssued.toLocaleDateString()}</p>
                                <p>Dosage: ${rx.dosage}</p>
                                <p>Status: <span class="record-status">${rx.status}</span></p>
                            </div>
                            <button class="btn btn-secondary">Details</button>
                        `;
                        prescriptionList.appendChild(rxCard);
                        observer.observe(rxCard);
                    });
                }
            };
            

            activateTab('records');
            fetchUserReports(user.uid); 
        });
    }

    else if (pageId === 'chatbotpage') {
        const chatWindow = document.getElementById('chat-window');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const imageUpload = document.getElementById('imageUpload');
        const previewImage = document.getElementById('previewImage');
        const fileNameSpan = document.getElementById('fileName');
        const findDoctorsBtn = document.getElementById('findDoctorsBtn');

        let chatHistory = [];
        let uploadedImageBase64 = null;
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('convId');

        if (conversationId) {
             auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection('users').doc(user.uid).collection('conversations').doc(conversationId).get()
                        .then(doc => {
                            if (doc.exists) {
                                const convData = doc.data();
                                chatHistory = convData.chatHistory;
                                chatHistory.forEach(msg => appendMessage(msg.sender, msg.message));
                                // Show doctors button after loading old chat
                                findDoctorsBtn.classList.remove('hidden');
                            } else {
                                appendMessage('system', 'Conversation not found.');
                            }
                        });
                }
            });
        }


        const appendMessage = (sender, message) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}`;
            const icon = sender === 'user' ? 'user' : 'cpu';
            msgDiv.innerHTML = `
                <div class="icon"><i data-feather="${icon}"></i></div>
                <div class="text"><p>${message}</p></div>
            `;
            chatWindow.appendChild(msgDiv);
            feather.replace();
            chatWindow.scrollTop = chatWindow.scrollHeight;
        };

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameSpan.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewImage.classList.remove('hidden');
                    uploadedImageBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        const getAiResponse = async (userMessage) => {
            appendMessage('ai', 'Thinking...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            if(chatWindow.lastChild) chatWindow.lastChild.remove();
            
            let aiResponseText;
            
            if (!uploadedImageBase64) {
                 aiResponseText = "Image upload nahi hua hai. Analysis shuru karne ke liye kripya pehle ek image upload karein aur apne skin concern ke baare mein bataayein. Main iske baad aapko doctors ke paas jaane ki salaah de sakta hoon.";
            } else {
                 aiResponseText = "Image analysis complete. Based on our preliminary AI assessment, we advise you to consult a certified dermatologist for a definitive diagnosis. Main ab aapko is area ke liye **recommended doctors** dikha sakta hoon.";
            }

            appendMessage('ai', aiResponseText);
            
            findDoctorsBtn.classList.remove('hidden');
        };

        const sendMessage = () => {
            const message = userInput.value.trim();
            if (message === '') return;

            appendMessage('user', message);
            chatHistory.push({ sender: 'user', message: message });
            userInput.value = '';

            getAiResponse(message);
        };

        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        findDoctorsBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (user) {
                const imageRef = uploadedImageBase64 ? 'Image Uploaded' : 'No Image';
                const conversationId = await saveConversationToFirestore(user.uid, chatHistory, imageRef);
                window.location.href = `doctors.html?convId=${conversationId}`; 
            } else {
                window.location.href = 'doctors.html';
            }
        });
    }
    
    else if (pageId === 'doctorspage') {
        const detectLocationBtn = document.getElementById('detectLocationBtn');
        const searchDoctorsBtn = document.getElementById('searchDoctorsBtn');
        const locationInput = document.getElementById('locationInput');
        const doctorList = document.getElementById('doctorList');
        const statusMessage = document.getElementById('statusMessage');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        const DUMMY_DOCTORS = [
            { name: "Dr. Anjali Sharma", specialty: "Dermatologist & Cosmetologist", rating: 4.9, address: "123 Skin Care Ave, Near City Center" },
            { name: "Dr. Rohan Gupta", specialty: "Clinical Dermatology", rating: 4.5, address: "45 Health Rd, Downtown Area" },
            { name: "Dr. Priya Singh", specialty: "Pediatric Dermatology", rating: 4.8, address: "789 Wellness St, North End" },
            { name: "Dr. Vikram Rao", specialty: "Dermato-Oncology", rating: 4.7, address: "101 Cure Ln, Innovation Park" },
        ];

        const displayDoctors = (doctors) => {
            doctorList.innerHTML = '';
            loadingState.classList.add('hidden');
            if (doctors.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                doctors.forEach(doc => {
                    const card = document.createElement('div');
                    card.className = 'doctor-card animated-element is-visible';
                    const stars = '★'.repeat(Math.round(doc.rating));
                    card.innerHTML = `
                        <h4>${doc.name}</h4>
                        <p>${doc.specialty}</p>
                        <p class="rating">${stars} (${doc.rating})</p>
                        <p>${doc.address}</p>
                        <a href="#" class="btn btn-cta-main">Book Appointment</a>
                    `;
                    doctorList.appendChild(card);
                });
            }
        };

        const fetchDoctors = (location) => {
            loadingState.classList.remove('hidden');
            emptyState.classList.add('hidden');
            statusMessage.textContent = `Finding specialists in ${location}...`;

            setTimeout(() => {
                statusMessage.textContent = `Found ${DUMMY_DOCTORS.length} dermatologists near ${location}.`;
                displayDoctors(DUMMY_DOCTORS);
            }, 1500);
        };

        detectLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                statusMessage.textContent = 'Detecting location...';
                loadingState.classList.remove('hidden');
                navigator.geolocation.getCurrentPosition(position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const mockLocation = `(Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)})`;
                    locationInput.value = 'Current Location';
                    fetchDoctors('Your Current Location');
                }, error => {
                    console.error("Geolocation error:", error);
                    statusMessage.textContent = 'Error: Geolocation failed. Please enter your location manually.';
                    loadingState.classList.add('hidden');
                });
            } else {
                statusMessage.textContent = 'Geolocation is not supported by your browser.';
            }
        });

        searchDoctorsBtn.addEventListener('click', () => {
            const location = locationInput.value.trim();
            if (location) {
                fetchDoctors(location);
            } else {
                statusMessage.textContent = 'Please enter a location.';
            }
        });

        locationInput.addEventListener('input', () => {
            if (locationInput.value.trim().length > 2) {
                searchDoctorsBtn.classList.remove('hidden');
                detectLocationBtn.classList.add('hidden');
            } else {
                searchDoctorsBtn.classList.add('hidden');
                detectLocationBtn.classList.remove('hidden');
                doctorList.innerHTML = '';
                emptyState.classList.remove('hidden');
                loadingState.classList.add('hidden');
                statusMessage.textContent = '';
            }
        });
        displayDoctors([]);
    }
});