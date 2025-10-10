(function() {
  'use strict';

  // Wait for GSAP to be available
  function initPreloader() {
    if (typeof window.gsap === 'undefined') {
      console.error('[Preloader] GSAP is required. Load GSAP before this script.');
      return;
    }

    const gsap = window.gsap;

    // Create preloader container
    const preloader = document.createElement('div');
    preloader.id = 'coordinate-preloader';
    preloader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f3ed;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create logo/text element
    const logo = document.createElement('div');
    logo.style.cssText = `
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff, #ff0000);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
    `;
    logo.textContent = '';

    // Create coordinates display
    const coordinates = document.createElement('div');
    coordinates.style.cssText = `
      font-size: 120%;
      color: #a6a6a6;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.05em;
    `;
    coordinates.textContent = '0.000°S, 0.000°W';

    // Append elements
    preloader.appendChild(logo);
    preloader.appendChild(coordinates);
    document.body.appendChild(preloader);

    // Animation state
    const state = {
      lat: 0,
      lng: 0,
      colorPosition: 0
    };

    const targetLat = -7.946;
    const targetLng = 14.375;

    // Format coordinates
    function formatCoordinate(value, isLat) {
      const abs = Math.abs(value);
      const direction = isLat ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
      return `${abs.toFixed(3)}°${direction}`;
    }

    function updateCoordinates() {
      coordinates.textContent = `${formatCoordinate(state.lat, true)}, ${formatCoordinate(state.lng, false)}`;
    }

    // Start animations
    const tl = gsap.timeline();

    // Fade in logo
    tl.from(logo, {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: 'power2.out'
    });

    // Animate color gradient
    tl.to(state, {
      colorPosition: 300,
      duration: 2,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        logo.style.backgroundPosition = `${state.colorPosition}% 0`;
      }
    }, 0);

    // Animate coordinates counting up
    tl.to(state, {
      lat: targetLat,
      lng: targetLng,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: updateCoordinates
    }, 0.3);

    // Track loading state
    let isLoaded = false;
    let minTimeElapsed = false;

    // Minimum display time
    setTimeout(() => {
      minTimeElapsed = true;
      if (isLoaded) exitPreloader();
    }, 2000);

    // Wait for page load
    function onLoad() {
      isLoaded = true;
      if (minTimeElapsed) exitPreloader();
    }

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    // Exit animation
    function exitPreloader() {
      gsap.to(logo, {
        scale: 3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
      });

      gsap.to(coordinates, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.in'
      });

      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          preloader.remove();
        }
      });
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader);
  } else {
    initPreloader();
  }
})();
