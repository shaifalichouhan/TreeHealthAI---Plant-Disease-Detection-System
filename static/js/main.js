/* ============================================
   TREEHEALTHAI - PREMIUM JAVASCRIPT
   Advanced Interactions & Animations
   ============================================ */

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const analyzeBtn = document.getElementById('analyze-btn');
const removeBtn = document.getElementById('remove-image');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results-section');

// Store uploaded file
let uploadedFile = null;

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */
const navbar = document.querySelector('.navbar-glass');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

/* ============================================
   SMOOTH SCROLL FOR NAVIGATION
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ============================================
   DRAG & DROP FUNCTIONALITY
   ============================================ */

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when dragging over
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('drag-over');
    }, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

/* ============================================
   FILE INPUT CHANGE HANDLER
   ============================================ */
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

/* ============================================
   FILE HANDLING & VALIDATION
   ============================================ */
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('error', '⚠️ Please upload an image file (JPG, PNG, GIF)');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('error', '⚠️ Image size should be less than 10MB');
        return;
    }
    
    uploadedFile = file;
    
    // Preview image with animation
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        
        // Animate transition
        dropArea.style.display = 'none';
        previewSection.classList.remove('d-none');
        previewSection.style.animation = 'fadeIn 0.5s ease';
        
        // Hide results if showing
        resultsSection.classList.add('d-none');
        
        showNotification('success', '✓ Image loaded successfully! Click "Analyze with AI" to continue.');
    };
    reader.readAsDataURL(file);
}

/* ============================================
   REMOVE IMAGE HANDLER
   ============================================ */
removeBtn.addEventListener('click', function() {
    uploadedFile = null;
    fileInput.value = '';
    
    // Animate transition
    previewSection.classList.add('d-none');
    dropArea.style.display = 'block';
    resultsSection.classList.add('d-none');
    
    showNotification('info', 'ℹ️ Image removed. Upload a new one to analyze.');
});

/* ============================================
   ANALYZE BUTTON HANDLER
   ============================================ */
analyzeBtn.addEventListener('click', async function() {
    if (!uploadedFile) {
        showNotification('error', '⚠️ Please upload an image first');
        return;
    }
    
    // Show loading animation
    previewSection.classList.add('d-none');
    loading.classList.remove('d-none');
    resultsSection.classList.add('d-none');
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    try {
        // Send request to Flask backend
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        
        const data = await response.json();
        
        // Hide loading
        loading.classList.add('d-none');
        
        // Display results with animation
        displayResults(data);
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
        
        showNotification('success', '✓ Analysis complete!');
        
    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('d-none');
        previewSection.classList.remove('d-none');
        showNotification('error', '❌ Error analyzing image. Please try again.');
    }
});

/* ============================================
   DISPLAY RESULTS FUNCTION
   ============================================ */
function displayResults(data) {
    // Show results section
    resultsSection.classList.remove('d-none');
    resultsSection.style.animation = 'fadeInUp 0.6s ease';
    
    // Update disease name with typing effect
    typeWriter(document.getElementById('disease-name'), data.disease_name, 50);
    
    // Update description
    document.getElementById('disease-description').textContent = data.description;
    
    // Update confidence score with animation
    const confidence = Math.round(data.confidence * 100);
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceText = document.getElementById('confidence-text');
    
    // Animate confidence bar
    setTimeout(() => {
        confidenceBar.style.width = confidence + '%';
        animateCounter(confidenceText, 0, confidence, 1500);
    }, 500);
    
    // Set confidence bar color based on value
    if (confidence >= 80) {
        confidenceBar.style.background = 'var(--gradient-success)';
    } else if (confidence >= 60) {
        confidenceBar.style.background = 'var(--gradient-warning)';
    } else {
        confidenceBar.style.background = 'var(--gradient-danger)';
    }
    
    // Update health status badge
    const healthBadge = document.getElementById('health-badge');
    const statusHeader = document.getElementById('status-header');
    
    if (data.health_status === 'Healthy') {
        healthBadge.textContent = '✓ Healthy Plant';
        healthBadge.className = 'health-status-badge status-healthy';
        statusHeader.style.background = 'var(--gradient-success)';
    } else if (data.health_status === 'Mild Disease') {
        healthBadge.textContent = '⚠ Mild Disease Detected';
        healthBadge.className = 'health-status-badge status-mild';
        statusHeader.style.background = 'var(--gradient-warning)';
    } else {
        healthBadge.textContent = '⚠ Critical - Needs Attention';
        healthBadge.className = 'health-status-badge status-critical';
        statusHeader.style.background = 'var(--gradient-danger)';
    }
    
    // Update causes list
    const causesList = document.getElementById('causes-list');
    causesList.innerHTML = '';
    data.causes.forEach((cause, index) => {
        setTimeout(() => {
            const li = document.createElement('li');
            li.textContent = cause;
            li.style.animation = 'fadeInUp 0.5s ease';
            causesList.appendChild(li);
        }, 100 * index);
    });
    
    // Update prevention list
    const preventionList = document.getElementById('prevention-list');
    preventionList.innerHTML = '';
    data.prevention.forEach((item, index) => {
        setTimeout(() => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.animation = 'fadeInUp 0.5s ease';
            preventionList.appendChild(li);
        }, 100 * (index + data.causes.length));
    });
    
    // Update treatment list
    const treatmentList = document.getElementById('treatment-list');
    treatmentList.innerHTML = '';
    data.treatment.forEach((item, index) => {
        setTimeout(() => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.animation = 'fadeInUp 0.5s ease';
            treatmentList.appendChild(li);
        }, 100 * (index + data.causes.length + data.prevention.length));
    });
}

/* ============================================
   TYPING EFFECT ANIMATION
   ============================================ */
function typeWriter(element, text, speed) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    
    function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + '%';
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

/* ============================================
   NOTIFICATION SYSTEM
   ============================================ */
function showNotification(type, message) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Add notification styles dynamically
const notificationStyles = `
<style>
.custom-notification {
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    backdrop-filter: blur(10px);
    max-width: 350px;
}

.custom-notification.show {
    transform: translateX(0);
}

.notification-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.notification-error {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.notification-info {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

@media (max-width: 768px) {
    .custom-notification {
        right: 10px;
        left: 10px;
        max-width: calc(100% - 20px);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

/* ============================================
   BUTTON CLICK ANIMATIONS
   ============================================ */
document.querySelectorAll('.btn-gradient, .btn-upload, .btn-analyze-premium, .btn-hero-primary').forEach(btn => {
    btn.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

/* ============================================
   PARALLAX SCROLL EFFECT
   ============================================ */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

/* ============================================
   INTERSECTION OBSERVER FOR ANIMATIONS
   ============================================ */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card-premium, .tech-card, .stat-card-premium, .step-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

/* ============================================
   CURSOR TRAIL EFFECT (Optional)
   ============================================ */
let cursorTrail = [];
const trailLength = 20;

document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) { // Only on desktop
        cursorTrail.push({ x: e.clientX, y: e.clientY });
        
        if (cursorTrail.length > trailLength) {
            cursorTrail.shift();
        }
    }
});

/* ============================================
   IMAGE PREVIEW ZOOM
   ============================================ */
if (previewImage) {
    previewImage.addEventListener('click', function() {
        this.style.transform = this.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
        this.style.transition = 'transform 0.3s ease';
        this.style.cursor = this.style.transform === 'scale(1.5)' ? 'zoom-out' : 'zoom-in';
    });
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
document.addEventListener('keydown', (e) => {
    // ESC to close preview
    if (e.key === 'Escape' && !previewSection.classList.contains('d-none')) {
        removeBtn.click();
    }
    
    // Enter to analyze (if image is loaded)
    if (e.key === 'Enter' && uploadedFile && !previewSection.classList.contains('d-none')) {
        analyzeBtn.click();
    }
});

/* ============================================
   LOADING SCREEN ON PAGE LOAD
   ============================================ */
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

/* ============================================
   COPY TO CLIPBOARD FUNCTIONALITY
   ============================================ */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('success', '✓ Copied to clipboard!');
    }).catch(() => {
        showNotification('error', '❌ Failed to copy');
    });
}

/* ============================================
   PRINT RESULTS FUNCTION
   ============================================ */
function printResults() {
    window.print();
}

/* ============================================
   CONSOLE WELCOME MESSAGE
   ============================================ */
console.log('%c🌱 TreeHealthAI', 'color: #38ef7d; font-size: 24px; font-weight: bold;');
console.log('%cAI-Powered Plant Disease Detection System', 'color: #667eea; font-size: 14px;');
console.log('%cBuilt with TensorFlow, Flask & ❤️', 'color: #f093fb; font-size: 12px;');
console.log('%c----------------------------------------', 'color: #444;');

/* ============================================
   ERROR HANDLING
   ============================================ */
window.addEventListener('error', (e) => {
    console.error('Error occurred:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */
if (window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`%c⚡ Page loaded in ${pageLoadTime}ms`, 'color: #00f2fe; font-weight: bold;');
        }, 0);
    });
}

/* ============================================
   INITIALIZE APP
   ============================================ */
console.log('%c✅ TreeHealthAI initialized successfully!', 'color: #38ef7d; font-weight: bold;');
