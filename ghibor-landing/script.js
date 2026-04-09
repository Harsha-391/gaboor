// Custom Cursor Logic
const cursor = document.querySelector('.custom-cursor');
const hoverElements = document.querySelectorAll('a, button, .product-card, .menu-toggle');

document.addEventListener('mousemove', (e) => {
    // We use requestAnimationFrame via GSAP or standard to move cursor smoothly
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
    });
});

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

// Get ScrollTrigger to sync with Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0, 0)

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// =========================================
// GSAP ANIMATIONS
// =========================================

// Page Load Timeline
const tl = gsap.timeline();

tl.from('.hero-image', {
    scale: 1.2,
    duration: 2,
    ease: 'power3.out'
})
.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power4.out'
}, "-=1.5")
.from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 1,
}, "-=1")
.from('.hero-cta', {
    opacity: 0,
    x: -20,
    duration: 1,
}, "-=0.8")
.from('.navbar', {
    y: -50,
    opacity: 0,
    duration: 1,
}, "-=1.2");

// Image Parallax Effect in Products
gsap.utils.toArray('.product-image-container').forEach(container => {
    const img = container.querySelector('img');
    
    gsap.to(img, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
            trigger: container,
            start: "top bottom", 
            end: "bottom top",
            scrub: true
        }
    });
});

// About Section Text Reveal
gsap.from('.about-title', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top 70%',
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.about-desc', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top 60%',
    },
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

gsap.from('.abstract-shape', {
    scrollTrigger: {
        trigger: '.about-visual',
        start: 'top 70%',
    },
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: 'elastic.out(1, 0.5)'
});
