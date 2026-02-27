document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect & Mobile Menu
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
        });
    });

    // 2. Intersection Observer for Smooth Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 0px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Interactive Playlist
    const songs = document.querySelectorAll('.song-item');
    songs.forEach(song => {
        song.addEventListener('click', () => {
            // Remove playing state from all songs
            songs.forEach(s => {
                s.classList.remove('playing');
                s.querySelector('.fa-solid').classList.replace('fa-pause', 'fa-play');
            });

            // Add playing state to clicked song
            song.classList.add('playing');
            song.querySelector('.fa-solid').classList.replace('fa-play', 'fa-pause');

            const title = song.querySelector('h4').innerText;
            const artist = song.querySelector('p').innerText;
            console.log(`Now playing: ${title} by ${artist}`);
        });
    });

    // 4. Lightbox Gallery for Moi and Kin sections
    const photoFrames = document.querySelectorAll('.photo-frame');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    photoFrames.forEach(frame => {
        frame.addEventListener('click', () => {
            const img = frame.querySelector('img');
            const caption = frame.querySelector('figcaption').innerText;

            lightboxImg.src = img.src;
            lightboxCaption.innerText = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    const closeLightboxFunc = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightboxImg.src = '';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }, 400); // Wait for transition
    };

    closeLightbox.addEventListener('click', closeLightboxFunc);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightboxFunc();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightboxFunc();
        }
    });
});