document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("preloader");
  const logo = document.getElementById("preloaderLogo");
  const bar = document.querySelector("#progressBar span");

  if (!overlay || !logo) return;

  // Ensure SVG scales from center
  logo.style.transformOrigin = "50% 50%";
  logo.style.transformBox = "fill-box";
  logo.style.opacity = "1"; // make sure logo is visible

  const stop1 = document.querySelector("#paint0_linear_100_1559 stop:first-child");
  const stop2 = document.querySelector("#paint0_linear_100_1559 stop:last-child");

  const colorPalette = [
    { color1: "#FF9D53", color2: "#F56900" },
    { color1: "#e4d8ca", color2: "#d5c3ad" },
    { color1: "#8ef78d", color2: "#42e560" },
    { color1: "#bd98fa", color2: "#9960f7" },
  ];

  const assets = [...document.images];
  let loaded = 0;

  function updateProgress() {
    loaded++;
    const percent = Math.round((loaded / assets.length) * 100);
    if (bar) bar.style.width = percent + "%";

    if (loaded >= assets.length) finishPreloader();
  }

  function finishPreloader() {
    const tl = gsap.timeline();

    // Intro scale animation
    tl.to(logo, { scale: 1, duration: 1, ease: "power2.out" });

    // Animate gradient stops
    if (stop1 && stop2) {
      colorPalette.forEach((colors, index) => {
        tl.to([stop1, stop2], {
          attr: {
            "stop-color": (i) => (i === 0 ? colors.color1 : colors.color2)
          },
          duration: 0.5,
          ease: "power2.inOut",
        }, index * 0.2);
      });
    }

    // Logo exit animation
    tl.to(logo, { scale: 10, filter: "blur(80px)", duration: 1.5, ease: "power2.inOut" }, "-=0.5");

    // Fade out overlay
    tl.to(overlay, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        overlay.style.display = "none";
        document.dispatchEvent(new Event("preloaderComplete"));
      },
    }, "-=1.2");
  }

  if (assets.length) {
    assets.forEach(img => {
      if (img.complete) updateProgress();
      else {
        img.addEventListener("load", updateProgress);
        img.addEventListener("error", updateProgress);
      }
    });
  } else {
    // No images? Run animation immediately
    finishPreloader();
  }
});
