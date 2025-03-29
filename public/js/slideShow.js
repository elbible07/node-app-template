// Background slideshow functionality
document.addEventListener('DOMContentLoaded', function() {
    // Slideshow elements
    const slides = document.querySelectorAll('.slideshow-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    // Set initial state
    setActiveSlide(0);
    
    // Auto change slides every 7 seconds
    setInterval(nextSlide, 7000);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveSlide(index);
        });
    });
    
    // Functions to handle slides
    function nextSlide() {
        let nextIndex = currentSlide + 1;
        if (nextIndex >= slides.length) {
            nextIndex = 0;
        }
        setActiveSlide(nextIndex);
    }
    
    function setActiveSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Update current slide index
        currentSlide = index;
        
        // Update feature text based on slide (optional)
        updateFeatureText(index);
    }
    
    function updateFeatureText(index) {
        const featureTitle = document.querySelector('.feature-text h2');
        const featureDesc = document.querySelector('.feature-text p');
        
        // Different text for each slide
        switch(index) {
            case 0:
                featureTitle.textContent = 'Connect with other sports fans';
                featureDesc.textContent = 'Join discussions, share game highlights, and follow your favorite teams all in one place.';
                break;
            case 1:
                featureTitle.textContent = 'Never miss a game';
                featureDesc.textContent = 'Get real-time updates, scores, and notifications for all your favorite sports and teams.';
                break;
            case 2:
                featureTitle.textContent = 'Share your sports moments';
                featureDesc.textContent = 'Post photos and videos from games you attend and connect with fans who share your passion.';
                break;
        }
    }
});