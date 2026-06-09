document.addEventListener('click', (event) => {
    const isPrevBtn = event.target.classList.contains('prev-btn');
    const isNextBtn = event.target.classList.contains('next-btn');

    if (isNextBtn || isPrevBtn) {
        // Find the closest cycler
        const cycler = event.target.closest('.carousel-wrapper');
        // if (!cycler) return;

        // Get all images within the specific cycler
        const images = cycler.querySelectorAll('.cycler-images img');
        let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));

        // Remove the active class from the current image 
        images[currentIndex].classList.remove('active');

        // Calculate new index based on button clicked
        if (isNextBtn) {
            currentIndex = (currentIndex + 1) % images.length;
        } else if (isPrevBtn) {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
        }

        // Add the active class to the new image
        images[currentIndex].classList.add('active');
    }
})