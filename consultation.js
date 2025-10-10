document.addEventListener('DOMContentLoaded', () => {

    const doctorsData = [
        {
            id: 1,
            name: 'Dr. Anjali Sharma',
            specialty: 'MD, Dermatology',
            experience: '12 Years',
            rating: '4.9',
            fee: '800',
            imageUrl: 'assets/doc1.jpg' 
        },
        {
            id: 2,
            name: 'Dr. Vikram Singh',
            specialty: 'MBBS, DNB',
            experience: '8 Years',
            rating: '4.8',
            fee: '600',
            imageUrl: 'assets/doc2.jpg'
        },
        {
            id: 3,
            name: 'Dr. Priya Mehta',
            specialty: 'MD, Cosmetology',
            experience: '15 Years',
            rating: '4.9',
            fee: '1000',
            imageUrl: 'assets/doc3.jpg'
        }
    ];

    const doctorListContainer = document.getElementById('doctor-list');
    const bookingModal = document.getElementById('bookingModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const bookingForm = document.getElementById('booking-form');
    const modalDoctorName = document.getElementById('modalDoctorName');
    const modalDoctorSpecialty = document.getElementById('modalDoctorSpecialty');

    // Function to render doctors on the page
    function renderDoctors() {
        if (!doctorListContainer) return;
        doctorListContainer.innerHTML = '';
        doctorsData.forEach(doctor => {
            const doctorCard = `
                <div class="doctor-card animated-element">
                    <img src="${doctor.imageUrl}" alt="${doctor.name}" class="doctor-photo">
                    <h3>${doctor.name}</h3>
                    <p class="specialty">${doctor.specialty}</p>
                    <div class="doctor-stats">
                        <div class="stat-item">
                            <strong>${doctor.experience}</strong>
                            Experience
                        </div>
                        <div class="stat-item">
                            <strong>${doctor.rating} ★</strong>
                            Rating
                        </div>
                    </div>
                    <p class="fee">₹${doctor.fee} <span>/ session</span></p>
                    <button class="btn btn-cta-header book-now-btn" data-id="${doctor.id}">Book Now</button>
                </div>
            `;
            doctorListContainer.innerHTML += doctorCard;
        });
    }

    // Function to open the booking modal
    function openModal(doctor) {
        modalDoctorName.textContent = `Book Appointment with ${doctor.name}`;
        modalDoctorSpecialty.textContent = doctor.specialty;
        bookingModal.classList.remove('hidden');
    }

    // Function to close the booking modal
    function closeModal() {
        bookingModal.classList.add('hidden');
        bookingForm.reset();
    }

    // Event delegation for "Book Now" buttons
    doctorListContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('book-now-btn')) {
            const doctorId = parseInt(e.target.getAttribute('data-id'));
            const selectedDoctor = doctorsData.find(doc => doc.id === doctorId);
            if (selectedDoctor) {
                openModal(selectedDoctor);
            }
        }
    });

    // Event listeners for modal
    closeModalBtn.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeModal();
        }
    });

    // Handle booking form submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const patientName = document.getElementById('patientName').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('timeSlot').value;

        alert(`Booking Confirmed!\n\nPatient: ${patientName}\nDate: ${date}\nTime: ${time}\n\nRedirecting to payment gateway...`);
        closeModal();
        // In a real app, you would integrate a payment gateway here.
    });
    
    // Initial render
    renderDoctors();
    feather.replace(); // To render icons on dynamically added elements
});