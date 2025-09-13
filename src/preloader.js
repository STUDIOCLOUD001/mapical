document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("preloaderLogo")
  const overlay = document.getElementById("preloader")
  const percentageEl = document.getElementById("percentage")
  const stop1 = document.querySelector("#paint0_linear_100_1559 stop:first-child")
  const stop2 = document.querySelector("#paint0_linear_100_1559 stop:last-child")

  if (!logo || !overlay) return

  const colorPalette = [
    { color1: "#FF9D53", color2: "#F56900" },
    { color1: "#e4d8ca", color2: "#d5c3ad" },
    { color1: "#8ef78d", color2: "#42e560" },
    { color1: "#bd98fa", color2: "#9960f7" },
  ]

  let isLoaded = false
  let colorCycleTimeline
  let percentageTimeline

  // Declare gsap variable
  const gsap = window.gsap

  const startLat = 0.0
  const startLng = 0.0
  const endLat = -7.946 // South is negative
  const endLng = 14.375 // West is positive in this case
  let currentProgress = 0

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

  function formatCoordinates(lat, lng) {
    const latDir = lat >= 0 ? "N" : "S"
    const lngDir = lng >= 0 ? "E" : "W"
    const formattedLat = Math.abs(lat).toFixed(3)
    const formattedLng = Math.abs(lng).toFixed(3)
    return `${formattedLat}°${latDir}, ${formattedLng}°${lngDir}`
  }

  function updateCoordinates(progress) {
    const currentLat = startLat + (endLat - startLat) * progress
    const currentLng = startLng + (endLng - startLng) * progress
    if (percentageEl) {
      percentageEl.textContent = formatCoordinates(currentLat, currentLng)
    }
  }

  // Initial fade in
  gsap.to(logo, {
    scale: 1,
    opacity: 1,
    duration: 1.5,
    ease: "power2.out",
    onComplete: startColorCycling,
  })

  // Fade in percentage counter
  if (percentageEl) {
    gsap.to(percentageEl, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      delay: 1,
    })
  }

  function startColorCycling() {
    if (isLoaded) return

    colorCycleTimeline = gsap.timeline({ repeat: -1 })

    colorPalette.forEach((colors, index) => {
      if (stop1 && stop2) {
        colorCycleTimeline.to([stop1, stop2], {
          attr: {
            "stop-color": (i) => (i === 0 ? colors.color1 : colors.color2),
          },
          duration: 0.8,
          ease: "power2.inOut",
        })
      }
    })

    if (percentageEl) {
      percentageTimeline = gsap.to(
        {},
        {
          duration: 0.1,
          repeat: -1,
          onRepeat: () => {
            if (!isLoaded) {
              // Simulate realistic loading progress with coordinates
              const increment = Math.random() * 0.02 + 0.005
              currentProgress = Math.min(currentProgress + increment, 0.95)
              updateCoordinates(currentProgress)
            }
          },
        },
      )
    }
  }

  function onPageLoaded() {
    isLoaded = true

    if (percentageEl) {
      gsap.to(
        {},
        {
          duration: 0.5,
          onUpdate: function () {
            const progress = this.progress()
            const finalProgress = 0.95 + progress * 0.05
            updateCoordinates(finalProgress)
          },
          onComplete: () => {
            // Ensure we show the exact final coordinates
            updateCoordinates(1.0)
          },
        },
      )
    }

    // Stop the cycling animations
    if (colorCycleTimeline) colorCycleTimeline.kill()
    if (percentageTimeline) percentageTimeline.kill()

    // Start exit animation after brief delay
    gsap.delayedCall(0.8, startExitAnimation)
  }

  function startExitAnimation() {
    const exitTl = gsap.timeline()

    // Exit animation
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

      // Fade out percentage counter
      .to(
        percentageEl,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=2.5",
      )

      .to(
        overlay,
        {
          opacity: 0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => {
            overlay.style.display = "none"
            overlay.style.pointerEvents = "none"
            document.dispatchEvent(new CustomEvent("preloaderComplete"))
          },
        },
        "-=2.2",
      )
  }

  if (document.readyState === "complete") {
    // Page already loaded
    setTimeout(onPageLoaded, 2000) // Minimum 2 seconds of animation
  } else {
    // Wait for page to load, with minimum display time
    let hasLoaded = false
    let minTimeReached = false

    window.addEventListener("load", () => {
      hasLoaded = true
      if (minTimeReached) onPageLoaded()
    })

    // Minimum 2 seconds display time
    setTimeout(() => {
      minTimeReached = true
      if (hasLoaded) onPageLoaded()
    }, 2000)
  }
})
