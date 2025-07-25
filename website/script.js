// Landing page interactions and functionality

// Update pricing to $149/year
const ANNUAL_PRICE = 149;

// Smooth scrolling for navigation links
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Start trial function
function startTrial() {
    // In production, this would trigger the actual download/installation
    // For now, we'll show instructions
    
    const modal = createModal(
        'Start Your Free Trial',
        `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="margin-bottom: 1rem;">Ready to download CodeContext Pro!</h3>
            <p style="margin-bottom: 2rem; color: #666;">
                Run this command in your terminal to install and start your 7-day free trial:
            </p>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; font-family: monospace; border: 1px solid #ddd;">
                npm install -g codecontext-pro && codecontext-pro license trial
            </div>
            <p style="font-size: 0.875rem; color: #666; margin-bottom: 2rem;">
                No credit card required. Your trial starts immediately and includes all features.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="copyInstallCommand()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Copy Command
                </button>
                <button onclick="closeModal()" style="background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
        `
    );
    
    // Track trial start event
    trackEvent('trial_started', {
        source: 'landing_page',
        button_location: event.target.closest('section')?.className || 'unknown'
    });
}

// Purchase function
function purchase() {
    const modal = createModal(
        'Get CodeContext Pro - $149/year',
        `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">💳</div>
            <h3 style="margin-bottom: 1rem;">Choose your payment method</h3>
            <p style="margin-bottom: 2rem; color: #666;">
                Secure payment processing with 30-day money-back guarantee
            </p>
            
            <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                <button onclick="purchaseWithStripe()" style="background: #6772e5; color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>💳</span> Pay with Card (Stripe)
                </button>
                <button onclick="purchaseWithPayPal()" style="background: #0070ba; color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>🅿️</span> Pay with PayPal
                </button>
                <button onclick="purchaseWithCrypto()" style="background: #f7931a; color: white; border: none; padding: 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>₿</span> Pay with Crypto
                </button>
            </div>
            
            <div style="font-size: 0.875rem; color: #666; margin-bottom: 2rem;">
                <p>✅ Instant license delivery via email</p>
                <p>✅ Works on one machine at a time</p>
                <p>✅ 30-day money-back guarantee</p>
                <p>✅ Lifetime updates included</p>
            </div>
            
            <button onclick="closeModal()" style="background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                Cancel
            </button>
        </div>
        `
    );
    
    trackEvent('purchase_intent', {
        price: ANNUAL_PRICE,
        source: 'landing_page'
    });
}

// Payment method handlers
function purchaseWithStripe() {
    // In production, integrate with Stripe
    showPaymentProcessing('Stripe');
    trackEvent('payment_method_selected', { method: 'stripe' });
    
    // Simulate payment processing
    setTimeout(() => {
        showPaymentSuccess();
    }, 3000);
}

function purchaseWithPayPal() {
    // In production, integrate with PayPal
    showPaymentProcessing('PayPal');
    trackEvent('payment_method_selected', { method: 'paypal' });
    
    setTimeout(() => {
        showPaymentSuccess();
    }, 3000);
}

function purchaseWithCrypto() {
    // In production, integrate with crypto payment processor
    showPaymentProcessing('Cryptocurrency');
    trackEvent('payment_method_selected', { method: 'crypto' });
    
    setTimeout(() => {
        showPaymentSuccess();
    }, 3000);
}

function showPaymentProcessing(method) {
    updateModal(
        'Processing Payment...',
        `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
            <h3 style="margin-bottom: 1rem;">Processing your ${method} payment</h3>
            <p style="color: #666; margin-bottom: 2rem;">Please wait while we process your payment securely...</p>
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        `
    );
}

function showPaymentSuccess() {
    updateModal(
        'Payment Successful! 🎉',
        `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h3 style="margin-bottom: 1rem; color: #059669;">Payment Successful!</h3>
            <p style="color: #666; margin-bottom: 2rem;">
                Your CodeContext Pro license has been sent to your email. 
                Check your inbox for installation instructions.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">Next Steps:</h4>
                <ol style="text-align: left; color: #374151; line-height: 1.6;">
                    <li>Check your email for the license key</li>
                    <li>Install: <code style="background: #e5e7eb; padding: 0.25rem; border-radius: 4px;">npm install -g codecontext-pro</code></li>
                    <li>Activate: <code style="background: #e5e7eb; padding: 0.25rem; border-radius: 4px;">codecontext-pro license activate</code></li>
                    <li>Start coding with perfect AI memory!</li>
                </ol>
            </div>
            
            <button onclick="closeModal()" style="background: #059669; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Get Started
            </button>
        </div>
        `
    );
    
    trackEvent('purchase_completed', {
        price: ANNUAL_PRICE,
        timestamp: new Date().toISOString()
    });
}

// Demo video player
function playDemo() {
    const modal = createModal(
        'CodeContext Pro Demo',
        `
        <div style="padding: 1rem;">
            <div style="background: #1a1a1a; border-radius: 8px; padding: 2rem; text-align: center; color: white; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎬</div>
                <h3 style="margin-bottom: 1rem;">Demo Video Coming Soon</h3>
                <p style="color: #ccc; margin-bottom: 2rem;">
                    We're creating an amazing demo video that shows CodeContext Pro in action. 
                    In the meantime, start your free trial to experience it yourself!
                </p>
                <button onclick="startTrial()" style="background: #2563eb; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 1rem;">
                    Start Free Trial
                </button>
                <button onclick="closeModal()" style="background: #374151; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
        `
    );
    
    trackEvent('demo_viewed', { source: 'landing_page' });
}

// Copy install command to clipboard
function copyInstallCommand() {
    const command = 'npm install -g codecontext-pro && codecontext-pro license trial';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(command).then(() => {
            showNotification('Command copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = command;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Command copied to clipboard!', 'success');
    }
    
    trackEvent('install_command_copied');
}

// Modal management
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 90%; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);">
            <div style="padding: 1.5rem; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">${title}</h2>
                <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">×</button>
            </div>
            <div id="modal-content">${content}</div>
        </div>
    `;
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    return modal;
}

function updateModal(title, content) {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.querySelector('h2').textContent = title;
        modal.querySelector('#modal-content').innerHTML = content;
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscapeKey);
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#059669' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-weight: 500;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Analytics tracking
function trackEvent(eventName, properties = {}) {
    // In production, integrate with analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Example: Mixpanel
    if (typeof mixpanel !== 'undefined') {
        mixpanel.track(eventName, properties);
    }
}

// Scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.feature-card, .problem-card, .testimonial, .faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimations();
    
    // Track page view
    trackEvent('page_viewed', {
        page: 'landing',
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    });
    
    // Add click tracking to CTA buttons
    document.querySelectorAll('.cta-button-primary, .cta-button-secondary').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('cta_clicked', {
                button_text: button.textContent.trim(),
                button_location: button.closest('section')?.className || 'unknown'
            });
        });
    });
});

// Handle form submissions and newsletter signup
function handleNewsletterSignup(email) {
    // In production, integrate with email service
    trackEvent('newsletter_signup', { email });
    showNotification('Thanks for subscribing! We\'ll keep you updated.', 'success');
}

// Pricing calculator
function calculateSavings() {
    const hoursSavedPerWeek = 5; // Conservative estimate
    const hourlyRate = 75; // Average developer hourly rate
    const weeklySavings = hoursSavedPerWeek * hourlyRate;
    const annualSavings = weeklySavings * 52;
    const roi = ((annualSavings - ANNUAL_PRICE) / ANNUAL_PRICE) * 100;
    
    return {
        hoursSavedPerWeek,
        weeklySavings,
        annualSavings,
        roi: Math.round(roi)
    };
}

// Display ROI calculator
function showROICalculator() {
    const savings = calculateSavings();
    
    const modal = createModal(
        'CodeContext Pro ROI Calculator',
        `
        <div style="padding: 2rem; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
            <h3 style="margin-bottom: 2rem;">Your Potential Savings</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border: 1px solid #86efac;">
                    <div style="font-size: 2rem; font-weight: 700; color: #059669;">${savings.hoursSavedPerWeek}h</div>
                    <div style="color: #374151; font-weight: 500;">Hours saved per week</div>
                </div>
                <div style="background: #eff6ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #93c5fd;">
                    <div style="font-size: 2rem; font-weight: 700; color: #2563eb;">$${savings.weeklySavings.toLocaleString()}</div>
                    <div style="color: #374141; font-weight: 500;">Weekly value</div>
                </div>
                <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border: 1px solid #fcd34d;">
                    <div style="font-size: 2rem; font-weight: 700; color: #d97706;">$${savings.annualSavings.toLocaleString()}</div>
                    <div style="color: #374151; font-weight: 500;">Annual value</div>
                </div>
                <div style="background: #f3e8ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #c4b5fd;">
                    <div style="font-size: 2rem; font-weight: 700; color: #7c3aed;">${savings.roi}%</div>
                    <div style="color: #374151; font-weight: 500;">ROI</div>
                </div>
            </div>
            
            <p style="color: #666; margin-bottom: 2rem; line-height: 1.6;">
                Based on saving 5 hours per week at $75/hour. CodeContext Pro pays for itself in less than 2 weeks!
            </p>
            
            <button onclick="startTrial()" style="background: #2563eb; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 1rem;">
                Start Free Trial
            </button>
            <button onclick="closeModal()" style="background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 1rem 2rem; border-radius: 8px; cursor: pointer;">
                Close
            </button>
        </div>
        `
    );
}

// Export functions for global access
window.startTrial = startTrial;
window.purchase = purchase;
window.playDemo = playDemo;
window.scrollToDemo = scrollToDemo;
window.copyInstallCommand = copyInstallCommand;
window.closeModal = closeModal;
window.purchaseWithStripe = purchaseWithStripe;
window.purchaseWithPayPal = purchaseWithPayPal;
window.purchaseWithCrypto = purchaseWithCrypto;
window.showROICalculator = showROICalculator;