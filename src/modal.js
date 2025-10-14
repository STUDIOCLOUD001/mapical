// GSAP animations on load
gsap.from('header', {
  y: -20,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
});

gsap.from('h1', {
  y: 30,
  opacity: 0,
  duration: 1,
  delay: 0.2,
  ease: 'power3.out'
});

gsap.from('h1 + div', {
  y: 20,
  opacity: 0,
  duration: 0.8,
  delay: 0.4,
  ease: 'power3.out'
});

gsap.from('form', {
  y: 20,
  opacity: 0,
  duration: 0.8,
  delay: 0.6,
  ease: 'power3.out'
});

// Mobile menu functionality
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const hamburger = document.querySelector('.hamburger');

// Enhanced mobile menu opening with GSAP
function openMobileMenu() {
  mobileMenu.classList.add('active');
  mobileMenuOverlay.classList.add('active');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Animate overlay
  gsap.fromTo(mobileMenuOverlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: 'power2.out' }
  );

  // Animate menu slide in
  gsap.fromTo(mobileMenu,
    { x: '100%' },
    { x: '0%', duration: 0.4, ease: 'power3.out' }
  );

  // Stagger animate menu items
  const menuItems = mobileMenu.querySelectorAll('button, a');
  gsap.fromTo(menuItems,
    { opacity: 0, x: 20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.3,
      stagger: 0.05,
      delay: 0.2,
      ease: 'power2.out'
    }
  );
}

// Enhanced mobile menu closing with GSAP
function closeMobileMenuFunc() {
  const menuItems = mobileMenu.querySelectorAll('button, a');

  const tl = gsap.timeline({
    onComplete: () => {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Fade out menu items
  tl.to(menuItems, {
    opacity: 0,
    x: 20,
    duration: 0.2,
    stagger: 0.03,
    ease: 'power2.in'
  })
  // Slide menu out
  .to(mobileMenu, {
    x: '100%',
    duration: 0.3,
    ease: 'power2.in'
  }, '-=0.1')
  // Fade overlay
  .to(mobileMenuOverlay, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in'
  }, '-=0.2');
}

hamburgerBtn.addEventListener('click', openMobileMenu);
closeMobileMenu.addEventListener('click', closeMobileMenuFunc);
mobileMenuOverlay.addEventListener('click', closeMobileMenuFunc);

// Enhanced modal opening - apply filter AFTER animation
// Enhanced modal opening - animate WITHOUT filter, apply AFTER with delay
function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const backdrop = modal;
  const content = modal.querySelector('.modal-content, [class*="modal"]');

  // Instantly show backdrop with filter (no animation)
  gsap.set(backdrop, {
    opacity: 1
  });

  // Only animate the modal content
  if (content) {
    gsap.fromTo(content,
      {
        opacity: 0,
        scale: 0.9,
        y: 20
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'power3.out'
      }
    );
  }
}

// Enhanced modal closing - remove filter BEFORE animation
function closeModal(modal) {
  const backdrop = modal;
  const content = modal.querySelector('.modal-content, [class*="modal"]');

  // Remove filter BEFORE animating for smooth performance
  backdrop.style.filter = 'none';

  const tl = gsap.timeline({
    onComplete: () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      // Restore filter for next open
      backdrop.style.filter = '';
    }
  });

  if (content) {
    tl.to(content, {
      opacity: 0,
      scale: 0.95,
      y: -80,
      duration: 0.25,
      ease: 'power2.in'
    })
    .to(backdrop, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    }, '-=0.1');
  } else {
    tl.to(backdrop, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    });
  }
}

// Mobile menu navigation
document.getElementById('mobileFeatures').addEventListener('click', () => {
  closeMobileMenuFunc();
  setTimeout(() => {
    openModal(featuresModal);
  }, 400);
});

document.getElementById('mobilePrivacy').addEventListener('click', () => {
  closeMobileMenuFunc();
  setTimeout(() => {
    openModal(privacyModal);
  }, 400);
});

document.getElementById('mobileJoinWaitlist').addEventListener('click', () => {
  closeMobileMenuFunc();
  // Scroll to form and focus
  const form = document.getElementById('waitlistForm');
  const emailInput = document.getElementById('emailInput');
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    emailInput.focus();
    form.classList.add('ring-2', 'ring-black', 'ring-opacity-20');
    setTimeout(() => {
      form.classList.remove('ring-2', 'ring-black', 'ring-opacity-20');
    }, 2000);
  }, 500);
});

// Desktop "Get started" button functionality
const getStartedBtn = document.getElementById('getStartedBtn');
if (getStartedBtn) {
  getStartedBtn.addEventListener('click', () => {
    const form = document.getElementById('waitlistForm');
    const emailInput = document.getElementById('emailInput');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      emailInput.focus();
      form.classList.add('ring-2', 'ring-black', 'ring-opacity-20');
      setTimeout(() => {
        form.classList.remove('ring-2', 'ring-black', 'ring-opacity-20');
      }, 2000);
    }, 500);
  });
}

// Modal functionality
const infoBtnMobile = document.getElementById('infoBtnMobile');
const infoBtnDesktop = document.getElementById('infoBtnDesktop');
const infoModal = document.getElementById('infoModal');
const featuresBtn = document.getElementById('featuresBtn');
const featuresModal = document.getElementById('featuresModal');
const privacyBtn = document.getElementById('privacyBtn');
const privacyModal = document.getElementById('privacyModal');
const closeButtons = document.querySelectorAll('.close-modal');

// Open modals with GSAP animations
infoBtnMobile.addEventListener('click', () => openModal(infoModal));
infoBtnDesktop.addEventListener('click', () => openModal(infoModal));
featuresBtn.addEventListener('click', () => openModal(featuresModal));
privacyBtn.addEventListener('click', () => openModal(privacyModal));

// Close modals with GSAP animations
closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const modals = [infoModal, featuresModal, privacyModal];
    modals.forEach(modal => {
      if (modal.classList.contains('active')) {
        closeModal(modal);
      }
    });
  });
});

// Close on backdrop click
[infoModal, featuresModal, privacyModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

// Escape key to close modals and mobile menu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [infoModal, featuresModal, privacyModal].forEach(modal => {
      if (modal.classList.contains('active')) {
        closeModal(modal);
      }
    });
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenuFunc();
    }
  }
});
