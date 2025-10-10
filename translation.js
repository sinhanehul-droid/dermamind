// --- CENTRAL TRANSLATION DICTIONARY (English to Hindi) ---
const TRANSLATIONS = {
    'en': {
        // --- Global/Navigation ---
        'logo': 'DermaMind AI',
        'find-doctors-btn': 'Find Doctors',
        'back-to-analysis-btn': 'Back to Analysis',
        'logout-btn': 'Logout',
        'profile-nav': 'Profile',
        'about-nav': 'About',
        'how-it-works-nav': 'How It Works',
        'features-nav': 'Features',
        'contact-nav': 'Contact',
        
        // --- Analysis Page (chatbot.html) ---
        'doc-title-analysis': 'Derma Mind - AI Skin Analysis',
        'main-title': 'Derma Mind',
        'subtitle': 'Your AI-Powered Skin Health Assistant',
        'disclaimer-title': 'Medical Disclaimer:',
        'disclaimer-body': 'This AI analysis is for informational purposes only and is not a substitute for professional medical advice.',
        'step-1-title': 'Step 1: Upload a Photo',
        'drop-zone-text': 'Drag & drop your image here, or click to select a file',
        'step-2-title': 'Step 2: Answer Three Questions',
        'q1-label': '1. How does the area feel?',
        'q1-placeholder': 'e.g., Itchy, Painful, Burning',
        'q2-label': '2. How long has this been present?',
        'q2-placeholder': 'e.g., a few days, about 2 weeks',
        'q3-label': '3. Please describe the concern and any recent changes (in color, size, or texture).',
        'q3-placeholder': 'e.g., It started as a small red dot and has become larger and scaly...',
        'submit-btn-text': 'Analyze My Skin',
        'analyzing-text': 'Analyzing...',
        'report-title': 'AI Analysis Report',
        'find-local-doctors': 'Find Local Dermatologists',
        'error-no-image': 'Please upload an image for analysis.',

        // --- Doctors Page (doctors.html) ---
        'doc-title-finder': 'DermaMind AI — Find Dermatologists',
        'finder-heading': 'Find a top dermatologist near you',
        'finder-subheading': 'Start with your State. Then pick a major city via the cards that appear.',
        'state-label': 'State',
        'state-placeholder': 'Type or pick a state (e.g., Maharashtra, Karnataka, Delhi)',
        'city-label': 'Choose a city',
        'search-btn-text-full': 'Search Dermatologists',
        'clear-btn-text': 'Clear',
        'initial-message': 'Your search results will appear here.',
        'no-results': 'Sorry, no top-rated dermatologists found for'
    },
    'hi': {
        // --- Global/Navigation ---
        'logo': 'डरमामइंड एआई',
        'find-doctors-btn': 'डॉक्टर खोजें',
        'back-to-analysis-btn': 'विश्लेषण पर वापस जाएँ',
        'logout-btn': 'लॉग आउट करें',
        'profile-nav': 'प्रोफ़ाइल',
        'about-nav': 'हमारे बारे में',
        'how-it-works-nav': 'यह कैसे काम करता है',
        'features-nav': 'विशेषताएँ',
        'contact-nav': 'संपर्क करें',
        
        // --- Analysis Page (chatbot.html) ---
        'doc-title-analysis': 'डरमा माइंड - एआई त्वचा विश्लेषण',
        'main-title': 'डरमा माइंड',
        'subtitle': 'आपका एआई-संचालित त्वचा स्वास्थ्य सहायक',
        'disclaimer-title': 'चिकित्सा अस्वीकरण:',
        'disclaimer-body': 'यह एआई विश्लेषण केवल सूचना के उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।',
        'step-1-title': 'चरण 1: एक फोटो अपलोड करें',
        'drop-zone-text': 'अपनी छवि यहाँ खींचें और छोड़ें, या फ़ाइल का चयन करने के लिए क्लिक करें',
        'step-2-title': 'चरण 2: तीन प्रश्नों का उत्तर दें',
        'q1-label': '1. यह क्षेत्र कैसा महसूस होता है?',
        'q1-placeholder': 'उदाहरण: खुजली, दर्दनाक, जलन',
        'q2-label': '2. यह कब से मौजूद है?',
        'q2-placeholder': 'उदाहरण: कुछ दिन, लगभग 2 सप्ताह',
        'q3-label': '3. कृपया चिंता और हाल के किसी भी बदलाव (रंग, आकार, या बनावट में) का वर्णन करें।',
        'q3-placeholder': 'उदाहरण: यह एक छोटे से लाल धब्बे के रूप में शुरू हुआ और बड़ा तथा पपड़ीदार हो गया है...',
        'submit-btn-text': 'मेरी त्वचा का विश्लेषण करें',
        'analyzing-text': 'विश्लेषण हो रहा है...',
        'report-title': 'एआई विश्लेषण रिपोर्ट',
        'find-local-doctors': 'स्थानीय त्वचा विशेषज्ञ खोजें',
        'error-no-image': 'कृपया विश्लेषण के लिए एक छवि अपलोड करें।',

        // --- Doctors Page (doctors.html) ---
        'doc-title-finder': 'डरमामइंड एआई — त्वचा विशेषज्ञ खोजें',
        'finder-heading': 'अपने आस-पास के शीर्ष त्वचा विशेषज्ञ खोजें',
        'finder-subheading': 'अपने राज्य से शुरू करें। फिर दिखने वाले कार्ड के माध्यम से एक प्रमुख शहर चुनें।',
        'state-label': 'राज्य',
        'state-placeholder': 'उदाहरण: महाराष्ट्र, कर्नाटक, दिल्ली टाइप करें या चुनें',
        'city-label': 'एक शहर चुनें',
        'search-btn-text-full': 'त्वचा विशेषज्ञ खोजें',
        'clear-btn-text': 'हटाना',
        'initial-message': 'आपके खोज परिणाम यहां दिखाई देंगे।',
        'no-results': 'क्षमा करें, कोई शीर्ष रेटेड त्वचा विशेषज्ञ नहीं मिला'
    }
};

// Global state and translation function
let currentLang = localStorage.getItem('lang') || 'en';

function translatePage(lang, pageId) {
    const translations = TRANSLATIONS[lang];

    // 1. Update document title
    if (pageId === 'chatbotpage') {
        document.title = translations['doc-title-analysis'];
    } else if (pageId === 'doctorspage') {
        document.title = translations['doc-title-finder'];
    } 

    // 2. Translate all elements with data-key
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // 3. Translate placeholders
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-key-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // 4. Update the toggle button text (visual indicator)
    const toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
         toggleBtn.textContent = lang === 'en' ? 'EN / HI' : 'HI / EN';
    }
}

function setupTranslationToggle(pageId) {
    const toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'hi' : 'en';
            localStorage.setItem('lang', currentLang);
            translatePage(currentLang, pageId);

            // Re-render dynamic content if necessary (e.g., search results)
            if (pageId === 'doctorspage' && window.performSearch && window.selectedState && window.selectedCity) {
                 window.performSearch(window.selectedState, window.selectedCity, true);
            }
        });
    }
    // Apply initial translation based on stored preference
    translatePage(currentLang, pageId);
}