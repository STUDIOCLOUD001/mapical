//// MAGIC DUST ////
class GSAPParticleSystem {
  constructor() {
    this.particleField = document.getElementById("particleField") || document.querySelector(".particle-field")
    this.particles = []
    this.textPoints = []
    this.text = document.querySelector(".liquid-text")
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.gsap = window.gsap
    this.animationFrameId = null
    this.intervals = []

    if (this.isMobile) {
      console.log("Particle system disabled on mobile device")
      return
    }

    const screenWidth = window.innerWidth
    if (screenWidth <= 768) {
      this.maxParticles = 150 // Reduced from 900
    } else if (screenWidth <= 1200) {
      this.maxParticles = 300
    } else {
      this.maxParticles = 450 // Still reduced from 900
    }

    this.performanceMode = this.detectPerformanceMode()

    this.init()
  }

  detectPerformanceMode() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (
      connection &&
      connection.effectiveType &&
      (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")
    ) {
      return "low"
    }
    return navigator.hardwareConcurrency < 4 ? "medium" : "high"
  }

  init() {
    if (!this.particleField) return

    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        this.createParticlePool()
        this.setupInteractions()
      })
    } else {
      setTimeout(() => {
        this.createParticlePool()
        this.setupInteractions()
      }, 0)
    }

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
        this.createTextParticleMap()
      }, 250) // Increased debounce time
    })
  }

  createParticlePool() {
    const batchSize = 50
    let created = 0

    const createBatch = () => {
      const end = Math.min(created + batchSize, this.maxParticles)
      for (let i = created; i < end; i++) {
        const particle = document.createElement("div")
        particle.className = "magic-particle"
        particle.style.display = "none"
        this.particleField.appendChild(particle)
        this.particles.push(particle)
      }
      created = end

      if (created < this.maxParticles) {
        requestAnimationFrame(createBatch)
      }
    }

    createBatch()
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

    canvas.width = textRect.width * 1.5
    canvas.height = textRect.height * 1.5
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillText("Mapical", canvas.width / 2, canvas.height / 2)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const points = []

    const baseSampling = Math.max(2, Math.floor(fontSize / 70))
    const samplingDistance =
      this.performanceMode === "low"
        ? baseSampling * 2
        : this.performanceMode === "medium"
          ? baseSampling * 1.5
          : baseSampling

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
    if (this.textPoints.length === 0) return

    const sampleCount = this.performanceMode === "low" ? 60 : this.performanceMode === "medium" ? 90 : 120
    const sample = this.textPoints.sort(() => 0.5 - Math.random()).slice(0, sampleCount)

    const batchSize = 8
    for (let i = 0; i < sample.length; i += batchSize) {
      setTimeout(
        () => {
          const batch = sample.slice(i, i + batchSize)
          batch.forEach((point) => {
            const spreadX = (Math.random() - 0.5) * 25
            const spreadY = (Math.random() - 0.5) * 25
            this.createTextParticle(point.x + spreadX, point.y + spreadY)
          })
        },
        (i / batchSize) * 60,
      )
    }
  }

  createTextParticle(x, y) {
    const availableParticle = this.particles.find((p) => p.style.display === "none")
    if (!availableParticle) return

    const rand = Math.random()
    let type = ""
    if (rand < 0.2) type = "tiny"
    else if (rand < 0.5) type = ""
    else if (rand < 0.7) type = "medium"
    else if (rand < 0.85) type = "sparkle"
    else if (rand < 0.93) type = "blue-sparkle"
    else type = "pink-sparkle"

    availableParticle.className = `magic-particle ${type}`

    if (this.gsap !== "undefined") {
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
        opacity: 0.9,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      })
        .to(
          availableParticle,
          {
            y: y - 25 - Math.random() * 20,
            x: x + (Math.random() - 0.5) * 50,
            duration: 6 + Math.random() * 3,
            ease: "power1.out",
          },
          0,
        )
        .to(
          availableParticle,
          {
            opacity: 0,
            scale: 0.5,
            duration: 2,
            ease: "power2.in",
          },
          "-=2",
        )
    } else {
      availableParticle.style.left = `${x}px`
      availableParticle.style.top = `${y}px`
      availableParticle.style.display = "block"
      availableParticle.style.animation = "float-up 6s ease-out forwards"
      setTimeout(() => {
        availableParticle.style.display = "none"
        availableParticle.style.animation = ""
      }, 6000)
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

    if (this.gsap !== "undefined") {
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
        opacity: 0.7,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          availableParticle,
          {
            y: y - 60 - Math.random() * 40,
            x: x + (Math.random() - 0.5) * 60,
            duration: 3 + Math.random() * 2,
            ease: "power1.out",
          },
          0,
        )
        .to(
          availableParticle,
          {
            opacity: 0,
            scale: 0.5,
            duration: 1,
            ease: "power2.in",
          },
          "-=1",
        )
    } else {
      availableParticle.style.left = `${x}px`
      availableParticle.style.top = `${y}px`
      availableParticle.style.display = "block"
      availableParticle.style.animation = "float-up 3s ease-out forwards"
      setTimeout(() => {
        availableParticle.style.display = "none"
        availableParticle.style.animation = ""
      }, 3000)
    }
  }

  startParticleAnimation() {
    const baseInterval = this.performanceMode === "low" ? 160 : this.performanceMode === "medium" ? 120 : 80

    // Main particle generation
    this.intervals.push(
      setInterval(() => {
        const particleCount = this.performanceMode === "low" ? 2 : 4
        for (let i = 0; i < particleCount; i++) {
          setTimeout(() => this.createParticle(), i * 25)
        }
      }, baseInterval),
    )

    // Text burst
    this.intervals.push(
      setInterval(() => {
        this.createTextBurst()
      }, 5000),
    )

    // Burst particles
    this.intervals.push(
      setInterval(() => {
        const burstCount = this.performanceMode === "low" ? 30 : 60
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => this.createParticle(), i * 30)
        }
      }, 4000),
    ) // Reduced frequency

    // Text point particles
    this.intervals.push(
      setInterval(() => {
        if (this.textPoints.length > 0) {
          const pointCount = this.performanceMode === "low" ? 3 : 5
          const randomPoints = this.textPoints.sort(() => 0.5 - Math.random()).slice(0, pointCount)

          randomPoints.forEach((point, index) => {
            setTimeout(() => {
              const spreadX = (Math.random() - 0.5) * 30
              const spreadY = (Math.random() - 0.5) * 30
              this.createTextParticle(point.x + spreadX, point.y + spreadY)
            }, index * 60)
          })
        }
      }, 3000),
    )

    // Area particles
    this.intervals.push(
      setInterval(() => {
        if (this.text) {
          const rect = this.text.getBoundingClientRect()
          const areaCount = this.performanceMode === "low" ? 8 : 15
          for (let i = 0; i < areaCount; i++) {
            setTimeout(() => {
              const x = rect.left + (Math.random() - 0.5) * rect.width * 3
              const y = rect.top + (Math.random() - 0.5) * rect.height * 3
              this.createParticle(x, y)
            }, i * 40)
          }
        }
      }, 2500),
    ) // Reduced frequency
  }

  setupInteractions() {
    const liquidText = document.querySelector(".liquid-text")
    if (!liquidText) return

    liquidText.addEventListener("click", (e) => {
      if (this.gsap !== "undefined") {
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

      for (let i = 0; i < 60; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 200
          const offsetY = (Math.random() - 0.5) * 200
          this.createParticle(e.clientX + offsetX, e.clientY + offsetY)
        }, i * 12)
      }
    })

    liquidText.addEventListener("touchstart", (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (this.gsap !== "undefined") {
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

      for (let i = 0; i < 60; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 200
          const offsetY = (Math.random() - 0.5) * 200
          this.createParticle(touch.clientX + offsetX, touch.clientY + offsetY)
        }, i * 12)
      }
    })
  }

  triggerTextBurst() {
    this.createTextBurst()
  }

  destroy() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals = []
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.particles.forEach((particle) => particle.remove())
    this.particles = []
  }
}

window.initMagicDust = () => {
  // Only initialize when page is idle or after a delay
  if (window.requestIdleCallback) {
    requestIdleCallback(
      () => {
        window.magicDustInstance = new GSAPParticleSystem()
      },
      { timeout: 2000 },
    )
  } else {
    setTimeout(() => {
      window.magicDustInstance = new GSAPParticleSystem()
    }, 1000)
  }
}

window.addEventListener("beforeunload", () => {
  if (window.magicDustInstance) {
    window.magicDustInstance.destroy()
  }
})
