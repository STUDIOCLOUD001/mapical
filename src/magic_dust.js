//// MAGIC DUST ////
class GSAPParticleSystem {
  constructor() {
    this.particleField = document.getElementById("particleField") || document.querySelector(".particle-field")
    this.particles = []
    this.textPoints = []
    this.text = document.querySelector(".liquid-text")
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.gsap = window.gsap

    this.isVisible = true
    this.animationId = null
    this.lastParticleTime = 0
    this.particleInterval = 150 // Throttle particle creation

    if (this.isMobile) {
      console.log("Particle system disabled on mobile device")
      return
    }

    const screenWidth = window.innerWidth
    if (screenWidth <= 768) {
      this.maxParticles = 50
    } else if (screenWidth <= 1200) {
      this.maxParticles = 150
    } else {
      this.maxParticles = 250
    }

    this.init()
  }

  init() {
    if (!this.particleField) return

    this.setupVisibilityAPI()
    this.createParticlePool()
    this.setupInteractions()

    document.fonts.ready.then(() => {
      this.createTextParticleMap()
      this.startParticleAnimation()

      setTimeout(() => {
        this.createTextBurst()
      }, 1000)
    })

    let resizeTimeout
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (this.isVisible) {
          this.createTextParticleMap()
        }
      }, 250)
    })
  }

  setupVisibilityAPI() {
    document.addEventListener("visibilitychange", () => {
      this.isVisible = !document.hidden
      if (!this.isVisible && this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      } else if (this.isVisible && !this.animationId) {
        this.startParticleAnimation()
      }
    })
  }

  createParticlePool() {
    const fragment = document.createDocumentFragment()

    for (let i = 0; i < this.maxParticles; i++) {
      const particle = document.createElement("div")
      particle.className = "magic-particle"
      particle.style.cssText = "display: none; position: absolute; pointer-events: none;"
      fragment.appendChild(particle)
      this.particles.push(particle)
    }

    this.particleField.appendChild(fragment)
  }

  createTextParticleMap() {
    if (!this.text) return

    let canvas = document.getElementById("gsap-text-canvas")
    if (!canvas) {
      canvas = document.createElement("canvas")
      canvas.id = "gsap-text-canvas"
      canvas.style.display = "none"
      document.body.appendChild(canvas)
    }

    const ctx = canvas.getContext("2d")
    const textRect = this.text.getBoundingClientRect()

    const computedStyle = window.getComputedStyle(this.text)
    const fontSize = Number.parseFloat(computedStyle.fontSize)
    const fontFamily = computedStyle.fontFamily.replace(/['"]/g, "")

    canvas.width = Math.min(textRect.width * 1.2, 800)
    canvas.height = Math.min(textRect.height * 1.2, 200)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillText("Mapical", canvas.width / 2, canvas.height / 2)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const points = []

    const samplingDistance = Math.max(4, Math.floor(fontSize / 50))

    for (let y = 0; y < canvas.height; y += samplingDistance) {
      for (let x = 0; x < canvas.width; x += samplingDistance) {
        const i = (y * canvas.width + x) * 4
        if (imageData.data[i + 3] > 128) {
          const offsetX = textRect.left - (canvas.width - textRect.width) / 2
          const offsetY = textRect.top - (canvas.height - textRect.height) / 2
          points.push({ x: offsetX + x, y: offsetY + y })
        }
      }
    }

    this.textPoints = points
  }

  createTextBurst() {
    if (this.textPoints.length === 0 || !this.isVisible) return

    const sampleCount = Math.min(60, this.textPoints.length)
    const sample = this.textPoints.sort(() => 0.5 - Math.random()).slice(0, sampleCount)

    const batchSize = 12
    for (let i = 0; i < sample.length; i += batchSize) {
      setTimeout(
        () => {
          if (!this.isVisible) return
          const batch = sample.slice(i, i + batchSize)
          batch.forEach((point) => {
            const spreadX = (Math.random() - 0.5) * 25
            const spreadY = (Math.random() - 0.5) * 25
            this.createTextParticle(point.x + spreadX, point.y + spreadY)
          })
        },
        (i / batchSize) * 80,
      )
    }
  }

  createTextParticle(x, y) {
    const availableParticle = this.particles.find((p) => p.style.display === "none")
    if (!availableParticle) return

    const rand = Math.random()
    let type = ""
    if (rand < 0.3) type = "tiny"
    else if (rand < 0.6) type = ""
    else if (rand < 0.8) type = "medium"
    else type = "sparkle"

    availableParticle.className = `magic-particle ${type}`

    if (this.gsap && typeof this.gsap !== "undefined") {
      this.gsap.set(availableParticle, {
        x: x,
        y: y,
        opacity: 0,
        scale: 0,
        display: "block",
      })

      const tl = this.gsap.timeline({
        onComplete: () => {
          availableParticle.style.display = "none"
        },
      })

      tl.to(availableParticle, {
        opacity: 0.8,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          availableParticle,
          {
            y: y - 20 - Math.random() * 15,
            x: x + (Math.random() - 0.5) * 40,
            duration: 4 + Math.random() * 2,
            ease: "power1.out",
          },
          0,
        )
        .to(
          availableParticle,
          {
            opacity: 0,
            scale: 0.3,
            duration: 1.5,
            ease: "power2.in",
          },
          "-=1.5",
        )
    } else {
      availableParticle.style.left = `${x}px`
      availableParticle.style.top = `${y}px`
      availableParticle.style.display = "block"
      availableParticle.style.animation = "float-up 4s ease-out forwards"
      setTimeout(() => {
        availableParticle.style.display = "none"
        availableParticle.style.animation = ""
      }, 4000)
    }
  }

  createParticle(x = null, y = null) {
    const availableParticle = this.particles.find((p) => p.style.display === "none")
    if (!availableParticle) return

    if (x === null) x = Math.random() * window.innerWidth
    if (y === null) y = Math.random() * window.innerHeight

    const types = ["tiny", "", "medium", "sparkle"]
    const type = types[Math.floor(Math.random() * types.length)]
    availableParticle.className = `magic-particle ${type}`

    if (this.gsap && typeof this.gsap !== "undefined") {
      this.gsap.set(availableParticle, {
        x: x,
        y: y,
        opacity: 0,
        scale: 0,
        display: "block",
      })

      const tl = this.gsap.timeline({
        onComplete: () => {
          availableParticle.style.display = "none"
        },
      })

      tl.to(availableParticle, {
        opacity: 0.6,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(
          availableParticle,
          {
            y: y - 40 - Math.random() * 30,
            x: x + (Math.random() - 0.5) * 50,
            duration: 2.5 + Math.random() * 1.5,
            ease: "power1.out",
          },
          0,
        )
        .to(
          availableParticle,
          {
            opacity: 0,
            scale: 0.3,
            duration: 0.8,
            ease: "power2.in",
          },
          "-=0.8",
        )
    } else {
      availableParticle.style.left = `${x}px`
      availableParticle.style.top = `${y}px`
      availableParticle.style.display = "block"
      availableParticle.style.animation = "float-up 2.5s ease-out forwards"
      setTimeout(() => {
        availableParticle.style.display = "none"
        availableParticle.style.animation = ""
      }, 2500)
    }
  }

  startParticleAnimation() {
    if (!this.isVisible) return

    let lastTime = 0
    let textBurstTimer = 0
    let ambientTimer = 0
    let textSparkleTimer = 0

    const animate = (currentTime) => {
      if (!this.isVisible) return

      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      if (currentTime - this.lastParticleTime > this.particleInterval) {
        this.createParticle()
        this.lastParticleTime = currentTime
      }

      textBurstTimer += deltaTime
      if (textBurstTimer > 8000) {
        this.createTextBurst()
        textBurstTimer = 0
      }

      ambientTimer += deltaTime
      if (ambientTimer > 400) {
        if (Math.random() < 0.7) {
          this.createParticle()
        }
        ambientTimer = 0
      }

      textSparkleTimer += deltaTime
      if (textSparkleTimer > 2500 && this.textPoints.length > 0) {
        const randomPoints = this.textPoints.sort(() => 0.5 - Math.random()).slice(0, 3)
        randomPoints.forEach((point, index) => {
          setTimeout(() => {
            const spreadX = (Math.random() - 0.5) * 20
            const spreadY = (Math.random() - 0.5) * 20
            this.createTextParticle(point.x + spreadX, point.y + spreadY)
          }, index * 100)
        })
        textSparkleTimer = 0
      }

      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  setupInteractions() {
    const liquidText = document.querySelector(".liquid-text")
    if (!liquidText) return

    let clickTimeout = false
    const handleInteraction = (e) => {
      if (clickTimeout) return
      clickTimeout = true
      setTimeout(() => (clickTimeout = false), 300)

      if (this.gsap && typeof this.gsap !== "undefined") {
        this.gsap.to(liquidText, {
          scale: 0.98,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      } else {
        liquidText.style.transform = "scale(0.99)"
        setTimeout(() => {
          liquidText.style.transform = ""
        }, 150)
      }

      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 150
          const offsetY = (Math.random() - 0.5) * 150
          this.createParticle(clientX + offsetX, clientY + offsetY)
        }, i * 20)
      }
    }

    liquidText.addEventListener("click", handleInteraction)
    liquidText.addEventListener("touchstart", (e) => {
      e.preventDefault()
      handleInteraction(e)
    })
  }

  triggerTextBurst() {
    this.createTextBurst()
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
    this.particles = []
  }
}

// Expose global function
window.initMagicDust = () => {
  const particles = new GSAPParticleSystem()
  return particles
}
