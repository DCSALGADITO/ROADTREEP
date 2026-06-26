const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Hamburger Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Empêcher le scroll quand le menu est ouvert
    if(navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Change navbar background on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(219, 234, 254, 0.9)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
    } else {
        navbar.style.background = 'rgba(219, 234, 254, 0.7)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for highlighting nav links based on scroll position
const sections = document.querySelectorAll('section');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let currentId = entry.target.getAttribute('id');
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(currentId)) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// INFINITE CANVAS LOGIC
const albumSection = document.getElementById('album');
const albumWrapper = document.getElementById('album-wrapper');
const infiniteCanvas = document.getElementById('infinite-canvas');
const photoUpload = document.getElementById('photo-upload');
const exitAlbumBtn = document.getElementById('exit-album-btn');

let isDragging = false;
let startX, startY;
let translateX = 0;
let translateY = 0;
let isCanvasActive = false;

if(albumWrapper && infiniteCanvas) {

    albumWrapper.addEventListener('click', (e) => {
        if(!isCanvasActive && !e.target.closest('.add-photo-btn') && !e.target.closest('.exit-album-btn')) {
            isCanvasActive = true;
            albumWrapper.classList.remove('inactive');
            if (albumSection) albumSection.classList.add('fullscreen-active');
        }
    });

    if(exitAlbumBtn) {
        exitAlbumBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isCanvasActive = false;
            albumWrapper.classList.add('inactive');
            if (albumSection) albumSection.classList.remove('fullscreen-active');
            isDragging = false;
            // Recentrer la vue sur le bouton d'ajout au centre (0,0)
            translateX = 0;
            translateY = 0;
            updateCanvasTransform();
        });
    }

    // Pan (Drag)
    albumWrapper.addEventListener('mousedown', (e) => {
        if(!isCanvasActive) return;
        isDragging = true;
        albumWrapper.style.cursor = 'grabbing';
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !isCanvasActive) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateCanvasTransform();
    });

    window.addEventListener('mouseup', () => {
        if(!isCanvasActive) return;
        isDragging = false;
        albumWrapper.style.cursor = 'grab';
    });

    // Trackpad Pan (Scroll)
    albumWrapper.addEventListener('wheel', (e) => {
        if(!isCanvasActive) return; // Allow normal scroll when inactive
        e.preventDefault(); 
        translateX -= e.deltaX;
        translateY -= e.deltaY;
        updateCanvasTransform();
    }, { passive: false });
}

function updateCanvasTransform() {
    if(infiniteCanvas) {
        infiniteCanvas.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
}

// Handle Photo Upload
if(photoUpload) {
    photoUpload.addEventListener('change', (e) => {
        const files = e.target.files;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                addPhotoToCanvas(event.target.result);
            };
            reader.readAsDataURL(file);
        }
        
        // Reset input
        photoUpload.value = '';
    });
}

let zIndexCounter = 1;
let photoCount = 0; // Tracking for concentric rings
const RING_SPACING = 350;

function addPhotoToCanvas(src) {
    const photoDiv = document.createElement('div');
    photoDiv.classList.add('photo-item');
    
    const img = document.createElement('img');
    img.src = src;
    photoDiv.appendChild(img);
    
    photoCount++;
    
    let currentRing = 1;
    let photosInPreviousRings = 0;
    let capacityOfCurrentRing = 6;
    
    // Determine which ring the photo belongs to
    while (photoCount > photosInPreviousRings + capacityOfCurrentRing) {
        photosInPreviousRings += capacityOfCurrentRing;
        currentRing++;
        capacityOfCurrentRing = currentRing * 6;
    }
    
    const photoIndexInRing = photoCount - photosInPreviousRings - 1;
    const angleOffset = (photoIndexInRing / capacityOfCurrentRing) * (Math.PI * 2);
    const radius = currentRing * RING_SPACING;
    
    const x = Math.cos(angleOffset) * radius;
    const y = Math.sin(angleOffset) * radius;
    
    photoDiv.style.left = `${x}px`;
    photoDiv.style.top = `${y}px`;
    photoDiv.style.transform = `translate(-50%, -50%)`;
    photoDiv.style.zIndex = zIndexCounter++;
    
    // Create download button
    const downloadBtn = document.createElement('a');
    downloadBtn.classList.add('download-btn');
    downloadBtn.href = src;
    downloadBtn.download = `roadtreep_${Date.now()}.png`;
    downloadBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    downloadBtn.addEventListener('mousedown', e => e.stopPropagation()); // Prevent dragging
    photoDiv.appendChild(downloadBtn);

    infiniteCanvas.appendChild(photoDiv);
    
    makePhotoDraggable(photoDiv);
}

function makePhotoDraggable(photo) {
    let isDraggingPhoto = false;
    let pStartX, pStartY;
    let initialLeft, initialTop;
    
    photo.addEventListener('mousedown', (e) => {
        if(!isCanvasActive) return; // disable dragging if not active
        e.stopPropagation(); // Prevent canvas dragging
        isDraggingPhoto = true;
        photo.style.zIndex = zIndexCounter++; 
        photo.style.cursor = 'grabbing';
        
        pStartX = e.clientX;
        pStartY = e.clientY;
        
        initialLeft = parseFloat(photo.style.left);
        initialTop = parseFloat(photo.style.top);
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!isDraggingPhoto) return;
        
        // Adjust for canvas scale
        const dx = (e.clientX - pStartX);
        const dy = (e.clientY - pStartY);
        
        photo.style.left = `${initialLeft + dx}px`;
        photo.style.top = `${initialTop + dy}px`;
    });
    
    window.addEventListener('mouseup', () => {
        if(isDraggingPhoto) {
            isDraggingPhoto = false;
            photo.style.cursor = 'pointer';
        }
    });
}
