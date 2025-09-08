let isPageLoaded = false
let colorCycleAnimation

// Check if page is already loaded
if (document.readyState === "complete") {
  isPageLoaded = true
}

// Listen for page load
window.addEventListener("load", () => {
  isPageLoaded = true
})

// Start preloader when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("preloaderLogo")
  const overlay = document.getElementById("preloader")
  const stop1 = document.querySelector("#paint0_linear_100_1559 stop:first-child")
  const stop2 = document.querySelector("#paint0_linear_100_1559 stop:last-child")

  if (!logo || !overlay) return

  const colorPalette = [
    { color1: "#FF9D53", color2: "#F56900" },
    { color1: "#e4d8ca", color2: "#d5c3ad" },
    { color1: "#8ef78d", color2: "#42e560" },
    { color1: "#bd98fa", color2: "#9960f7" },
  ]

  // Style the logo
  Object.assign(logo.style, {
    width: "120px",
    height: "120px",
    position: "fixed",
    top: "50%",
    left: "50%",
    margin: "-60px 0 0 -60px",
    transformOrigin: "center center",
    opacity: "0",
    transform: "scale(0.8)",
    filter: "blur(0px)",
    willChange: "transform, opacity, filter",
  })
  overlay.style.willChange = "opacity"

  // Initial fade in animation
  const initialTl = gsap.timeline()
  initialTl.to(logo, {
    scale: 1,
    opacity: 1,
    duration: 1.5,
    ease: "power2.out",
  })

  function createColorCycleLoop() {
    if (!stop1 || !stop2) return

    colorCycleAnimation = gsap.timeline({ repeat: -1 })

    colorPalette.forEach((colors, index) => {
      colorCycleAnimation.to([stop1, stop2], {
        attr: {
          "stop-color": (i) => (i === 0 ? colors.color1 : colors.color2),
        },
        duration: 0.8,
        ease: "power2.inOut",
      })
    })
  }

  initialTl.call(() => {
    createColorCycleLoop()
    checkForPageLoad()
  })

  function checkForPageLoad() {
    if (isPageLoaded) {
      triggerExitAnimation()
    } else {
      // Check again in 100ms
      setTimeout(checkForPageLoad, 100)
    }
  }

  function triggerExitAnimation() {
    // Kill the color cycle loop
    if (colorCycleAnimation) {
      colorCycleAnimation.kill()
    }

    const exitTl = gsap.timeline()

    exitTl
      .to(logo, {
        scale: 35,
        filter: "blur(120px)",
        duration: 2.5,
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      })

      .to(
        [stop1, stop2].filter(Boolean),
        {
          attr: { "stop-color": (i) => (i === 0 ? "#000000" : "#242424") },
          duration: 2.5,
        },
        "<",
      )

      .to(
        overlay,
        {
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => {
            overlay.style.display = "none"
          },
        },
        "-=2.2",
      )

    const LEAD = 1.4
    const fireAt = Math.max(0, exitTl.duration() - LEAD)
    exitTl.call(
      () => {
        overlay.style.pointerEvents = "none"
        if (logo) logo.style.display = "none"
        document.dispatchEvent(new CustomEvent("preloaderComplete"))
      },
      null,
      fireAt,
    )
  }
})
