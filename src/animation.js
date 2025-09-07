/**
 * Mapical Hero Section - Coordinated Animation Magic - © Mapical 2025
 */

class MapicalAnimations {
  constructor() {
    this.gsap = window.gsap
    this.masterTimeline = null
    this.floatingAnimation = null
    this.photoCycleAnimation = null
    this.elements = {}

    this.init()
  }

  init() {
    // Configure GSAP
    this.gsap.config({ force3D: true })
    // Cache DOM elements
    this.cacheElements()
    // Setup initial states
    this.setupInitialStates()
    // Add cursor blink styles
    this.addCursorStyles()
    // Create master timeline
    this.createMasterTimeline()
    // Setup event listeners
    this.setupEventListeners()
  }

  cacheElements() {
    this.elements = {
      content: document.querySelector(".hero__01__content"),
      navigation: document.querySelector(".navigation"),
      earthHalo: document.querySelector(".earth-halo"),
      particleField: document.querySelector(".particle-field"),
      footer: document.querySelector("footer"),
      calLetters: document.querySelector(".cal-letters"),
      mapicalI: document.querySelector("#Mapical_i"),
      stem: document.querySelector("#Stem"),
      mediaCards: document.querySelectorAll(".hero__01__mediaCard"),
      mediaCardsContainer: document.querySelector(".hero__01__mediaCards"),
    }
  }

  setupInitialStates() {
    const hiddenElements = ["content", "navigation", "earthHalo", "footer"]

    hiddenElements.forEach((key) => {
      if (this.elements[key]) {
        this.gsap.set(this.elements[key], {
          opacity: 0,
          y: 30,
          force3D: true,
          willChange: "transform, opacity",
        })
      }
    })

    if (this.elements.particleField) {
      this.gsap.set(this.elements.particleField, {
        scale: 0,
        force3D: true,
        willChange: "transform",
      })
    }

    this.gsap.set(this.elements.mediaCards, {
      opacity: 0,
      scale: 0.8,
      force3D: true,
      willChange: "transform, opacity",
    })
  }

  addCursorStyles() {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .cursor-blink {
        animation: blink 1s infinite;
      }
    `
    document.head.appendChild(style)
  }

  createMasterTimeline() {
    this.masterTimeline = this.gsap.timeline({ paused: true })
    const mainTimeline = this.gsap.timeline({
      defaults: { ease: "power2.out", force3D: true },
    })

    this.animateInitialElements(mainTimeline)
    this.animateTypingSequence(mainTimeline)
    this.animateStemTransformation(mainTimeline)
    this.animateMediaCards(mainTimeline)
    this.animateLogoSequence(mainTimeline)

    this.masterTimeline.add(mainTimeline)
  }

  animateInitialElements(timeline) {
    const elementsToAnimate = ["content", "navigation", "earthHalo", "particleField", "footer"]

    timeline.to(this.elements.content, {
      duration: 1.2,
      opacity: 1,
      y: 0,
      ease: "power2.out",
    })

    elementsToAnimate.slice(1).forEach((key) => {
      if (this.elements[key]) {
        const opacity = key === "earthHalo" ? 0.5 : 1
        const scale = key === "particleField" ? 1.2 : undefined

        timeline.to(
          this.elements[key],
          {
            duration: 1.2,
            opacity,
            y: 0,
            scale,
            ease: "power2.out",
          },
          "<",
        )
      }
    })
  }

  animateTypingSequence(timeline) {
    // Split "cal" into letters with cursor
    timeline.call(
      () => {
        this.createLetterSpans()
      },
      null,
      "+=0.3",
    )

    timeline.to({}, { duration: 0.6 })

    // Delete letters in reverse order
    this.animateLetterDeletion(timeline)

    // Type "all"
    timeline.call(
      () => {
        this.typeNewWord("all")
      },
      null,
      "+=0.2",
    )
  }

  createLetterSpans() {
    const letters = this.elements.calLetters.textContent.split("")
    this.elements.calLetters.innerHTML = ""

    letters.forEach((letter, index) => {
      const span = document.createElement("span")
      span.textContent = letter
      span.classList.add(`cal-letter-${index}`)
      if (index === 2) span.classList.add("cursor-blink")
      this.elements.calLetters.appendChild(span)
    })
  }

  animateLetterDeletion(timeline) {
    const deletionOrder = [2, 1, 0]
    const durations = [0.3, 0.25, 0.2]

    deletionOrder.forEach((index, i) => {
      timeline.to(`.cal-letter-${index}`, {
        duration: durations[i],
        opacity: 0,
        scale: 0.95,
        ease: "power1.in",
        onComplete: function () {
          const element = this.targets()[0]
          if (index === 2) element.classList.remove("cursor-blink")
          element.remove()
        },
      })
    })

    // Restore cursor to remaining letter
    timeline.call(() => {
      const remainingL = document.querySelector(".cal-letter-2")
      if (remainingL) remainingL.classList.add("cursor-blink")
    })
  }

  typeNewWord(word) {
    const remainingL = document.querySelector(".cal-letter-2")
    if (remainingL) remainingL.classList.remove("cursor-blink")

    this.elements.calLetters.innerHTML = ""

    const typingTimeline = this.gsap.timeline()
    const typingSpeeds = [0.12, 0.15, 0.1]
    let cumulativeDelay = 0

    word.split("").forEach((letter, index) => {
      cumulativeDelay += typingSpeeds[index]

      typingTimeline.call(
        () => {
          const span = document.createElement("span")
          span.textContent = letter
          span.style.opacity = "0"
          span.style.transform = "translateY(2px)"
          this.elements.calLetters.appendChild(span)

          this.gsap.to(span, {
            opacity: 1,
            y: 0,
            duration: 0.08,
            ease: "power2.out",
            force3D: true,
          })
        },
        null,
        cumulativeDelay,
      )
    })

    // Add and remove cursor blink
    typingTimeline.call(
      () => {
        const lastSpan = this.elements.calLetters.lastElementChild
        if (lastSpan) lastSpan.classList.add("cursor-blink")
      },
      null,
      cumulativeDelay + 0.1,
    )

    typingTimeline.call(
      () => {
        const lastSpan = this.elements.calLetters.lastElementChild
        if (lastSpan) lastSpan.classList.remove("cursor-blink")
      },
      null,
      cumulativeDelay + 0.5,
    )
  }

  animateStemTransformation(timeline) {
    timeline.to(
      this.elements.stem,
      {
        duration: 1.8,
        onStart: () => {
          this.animateStar()
          this.createStemTransform()
        },
        ease: "power2.inOut",
      },
      "+=0.4",
    )

    // Adjust content width
    timeline.to(
      this.elements.content,
      {
        duration: 1.2,
        width: () => (window.innerWidth > 768 ? "75%" : "100%"),
        ease: "power2.out",
        force3D: true,
      },
      "-=2.0",
    )

    // Cleanup stem transform
    timeline.to(
      "#stem-transform",
      {
        duration: 0.3,
        opacity: 0,
        ease: "power1.in",
        onComplete: () => {
          const element = document.getElementById("stem-transform")
          if (element) element.remove()
        },
      },
      "-=2.0",
    )
  }

  animateStar() {
    const star = document.querySelector("#Star")
    if (!star) return

    this.gsap.fromTo(
      star,
      {
        scale: 1,
        translateY: 0,
        translateX: 0,
        rotation: 0,
        transformOrigin: "center center",
      },
      {
        scale: 0,
        translateY: -200,
        translateX: 200,
        rotation: 360,
        duration: 0.8,
        ease: "power2.inOut",
        force3D: true,
      },
    )
  }

  createStemTransform() {
    const transformElement = document.createElement("div")
    transformElement.id = "stem-transform"
    transformElement.className = "hero__01__mediaCard"

    const isMobile = window.innerWidth <= 768
    const styles = {
      position: "absolute",
      background: "var(--white)",
      zIndex: "1",
      opacity: "1",
      willChange: "transform",
      width: "2px",
      height: "20px",
      padding: "0",
      transform: isMobile
        ? "translate(4rem, 5rem) rotate(3deg) scale(0.1)"
        : "translate(12rem, 4rem) rotate(3deg) scale(0.1)",
    }

    Object.assign(transformElement.style, styles)
    this.elements.mediaCardsContainer.appendChild(transformElement)
    this.elements.stem.style.opacity = "0"

    this.gsap.to(transformElement, {
      duration: 1.8,
      transform: isMobile
        ? "translate(4rem, 5rem) rotate(3deg) scale(1)"
        : "translate(12rem, 4rem) rotate(3deg) scale(1)",
      width: isMobile ? "18rem" : "28rem",
      height: isMobile ? "18rem" : "34rem",
      padding: isMobile ? "1rem 1rem 4rem 1rem" : "1rem 1rem 6rem 1rem",
      ease: "power2.inOut",
      force3D: true,
    })
  }

  animateMediaCards(timeline) {
    timeline.to({}, { duration: 0.6 })

    timeline.to(
      this.elements.mediaCards,
      {
        duration: 0.5,
        opacity: 1,
        scale: 1,
        ease: "back.out(1.4)",
        stagger: { amount: 0.8, from: "start" },
        force3D: true,
      },
      "-=1.8",
    )

    timeline.to(
      this.elements.calLetters,
      {
        duration: 0.25,
        opacity: window.innerWidth > 768 ? 0 : 1,
        ease: "power1.out",
        onStart: () => {
          if (window.innerWidth > 768) {
            const cursor = this.elements.calLetters.querySelector(".cursor-blink")
            if (cursor) cursor.classList.remove("cursor-blink")
          }
        },
      },
      "-=1.2",
    )
  }

  animateLogoSequence(timeline) {
    timeline.to(".m-letter", { visibility: "hidden" }, ">-0.1")

    // Logo container animation
    timeline.fromTo(
      "#logocontainer",
      {
        opacity: 0,
        scale: 0.8,
        display: "inline-block",
      },
      {
        opacity: 1,
        scale: 1.02,
        duration: 0.5,
        ease: "back.out(1.4)",
        force3D: true,
        onComplete: () => {
          this.gsap.to("#logocontainer", {
            scale: 1,
            duration: 0.15,
            ease: "power1.out",
            force3D: true,
          })
        },
      },
      ">-0.05",
    )

    // Flower animation
    timeline.fromTo(
      "#flower",
      {
        opacity: 0,
        scale: 0.5,
        display: "inline-block",
      },
      {
        opacity: 1,
        scale: 1.02,
        duration: 0.5,
        ease: "back.out(1.4)",
        force3D: true,
        onStart: () => {
          this.animateFlowerRotation()
        },
        onComplete: () => {
          this.gsap.to("#flower", {
            scale: 1,
            duration: 0.15,
            ease: "power1.out",
            force3D: true,
          })
        },
      },
      "+=0.2",
    )

    // Path animations
    this.animatePathElements(timeline)
  }

  animateFlowerRotation() {
    this.gsap.set("#flower svg", { transformOrigin: "50% 50%" })
    this.gsap.fromTo(
      "#flower svg",
      {
        rotation: 0,
      },
      {
        rotation: 1065,
        duration: 3.5,
        ease: "power4.out",
        force3D: true,
      },
    )
  }

  animatePathElements(timeline) {
    timeline.fromTo(
      "#p_path",
      {
        display: "none",
        opacity: 0,
      },
      {
        display: "block",
        opacity: 1,
        duration: 0.25,
      },
      "+=0.2",
    )

    timeline.fromTo(
      "#mapicalPath",
      {
        strokeDasharray: () => {
          const path = document.querySelector("#mapicalPath")
          return path ? path.getTotalLength() : 0
        },
        strokeDashoffset: () => {
          const path = document.querySelector("#mapicalPath")
          return path ? path.getTotalLength() : 0
        },
      },
      {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: "power2.inOut",
      },
      "+=0.2",
    )

    timeline.fromTo(
      "#mapicalStar",
      {
        opacity: 0,
        filter: "blur(40px)",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.25,
        ease: "back.out(1.4)",
        force3D: true,
      },
      ">0.05",
    )
  }

  startCoordinatedAnimations() {
    this.startFloatingAnimation()
    this.photoCycleAnimation = this.startPhotoCycle()
  }

  startFloatingAnimation() {
    this.floatingAnimation = this.gsap.timeline({ repeat: -1 })

    this.elements.mediaCards.forEach((card, index) => {
      this.floatingAnimation.to(
        card,
        {
          x: "+=4",
          y: "+=4",
          rotation: "+=0.5",
          duration: 3.5 + index * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          force3D: true,
        },
        index * 0.2,
      )
    })
  }

  startPhotoCycle() {
    const imageElement = document.getElementById("polaroid")
    if (!imageElement) return null

    const photos = [
      "assets/images/pic_1.png",
      "assets/images/pic_2.png",
      "assets/images/pic_3.png",
      "assets/images/pic_4.png",
    ]

    let currentIndex = 0
    imageElement.src = photos[currentIndex]

    const flashOverlay = this.createFlashOverlay(imageElement)

    const changeImage = () => {
      const timeline = this.gsap.timeline()

      timeline
        .to(imageElement, {
          opacity: 0,
          duration: 0.15,
          ease: "power1.in",
        })
        .to(flashOverlay, {
          opacity: 0.8,
          duration: 0.08,
          ease: "power1.out",
        })
        .call(() => {
          currentIndex = (currentIndex + 1) % photos.length
          imageElement.src = photos[currentIndex]
        })
        .to(flashOverlay, {
          opacity: 0,
          duration: 0.12,
          ease: "power1.in",
        })
        .to(imageElement, {
          opacity: 1,
          duration: 0.15,
          ease: "power1.out",
        })
    }

    return setInterval(changeImage, 2800)
  }

  createFlashOverlay(imageElement) {
    let flashOverlay = document.querySelector(".photo-flash-overlay")

    if (!flashOverlay) {
      flashOverlay = document.createElement("div")
      flashOverlay.className = "photo-flash-overlay"

      const styles = {
        position: "absolute",
        top: `${imageElement.offsetTop}px`,
        left: `${imageElement.offsetLeft}px`,
        width: `${imageElement.offsetWidth}px`,
        height: `${imageElement.offsetHeight}px`,
        backgroundColor: "white",
        opacity: "0",
        pointerEvents: "none",
        zIndex: "10",
        willChange: "opacity",
      }

      Object.assign(flashOverlay.style, styles)

      const parent = imageElement.parentElement
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative"
      }
      parent.appendChild(flashOverlay)
    }

    return flashOverlay
  }

  setupEventListeners() {
    document.addEventListener("preloaderComplete", () => {
      this.masterTimeline.play()
    })

    // Performance monitoring
    if (typeof PerformanceObserver !== "undefined") {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 16.67) {
            console.warn("✦ Slow animation frame detected:", entry.duration + "ms")
          }
        })
      })
      observer.observe({ entryTypes: ["measure"] })
    }
  }

  cleanup() {
    if (this.masterTimeline) this.masterTimeline.kill()
    if (this.floatingAnimation) this.floatingAnimation.kill()
    if (this.photoCycleAnimation) clearInterval(this.photoCycleAnimation)
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const mapicalAnimations = new MapicalAnimations()
  mapicalAnimations.startCoordinatedAnimations()
  // Global cleanup
  window.cleanupAnimations = () => mapicalAnimations.cleanup()
})
