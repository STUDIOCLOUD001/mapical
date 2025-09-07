//// MAGIC DUST ////
class GSAPParticleSystem {
  constructor() {
    this.particleField = document.getElementById("particleField") || document.querySelector(".particle-field")
    this.particles = []
    this.textPoints = []
    this.text = document.querySelector(".liquid-text")
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.gsap = window.gsap

    if (this.isMobile) {
      console.log("Particle system disabled on mobile device")
      return
    }

    const screenWidth = window.innerWidth
    if (screenWidth <= 320) {
      this.maxParticles = 0
    } else {
      this.maxParticles = 900
    }

    this.init()
  }

  init() {
    if (!this.particleField) return
    this.createParticlePool()
    this.setupInteractions()

    document.fonts.ready.then(() => {
      this.createTextParticleMap()
      this.startParticleAnimation()

      setTimeout(() => {
        this.createTextBurst()
      }, 1000)
    })

    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.createTextParticleMap()
      }, 100)
    })
  }

  createParticlePool() {
    for (let i = 0; i < this.maxParticles; i++) {
      const particle = document.createElement("div")
      particle.className = "magic-particle"
      particle.style.display = "none"
      this.particleField.appendChild(particle)
      this.particles.push(particle)
    }
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

    const samplingDistance = Math.max(2, Math.floor(fontSize / 70))

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

    const sampleCount = 120
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
    setInterval(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => this.createParticle(), i * 25)
      }
    }, 80)

    setInterval(() => {
      this.createTextBurst()
    }, 5000)

    setInterval(() => {
      for (let i = 0; i < 60; i++) {
        setTimeout(() => this.createParticle(), i * 30)
      }
    }, 3000)

    setInterval(() => {
      if (this.textPoints.length > 0) {
        const randomPoints = this.textPoints.sort(() => 0.5 - Math.random()).slice(0, 5)

        randomPoints.forEach((point, index) => {
          setTimeout(() => {
            const spreadX = (Math.random() - 0.5) * 30
            const spreadY = (Math.random() - 0.5) * 30
            this.createTextParticle(point.x + spreadX, point.y + spreadY)
          }, index * 60)
        })
      }
    }, 3000)

    setInterval(() => {
      if (this.text) {
        const rect = this.text.getBoundingClientRect()
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            const x = rect.left + (Math.random() - 0.5) * rect.width * 3
            const y = rect.top + (Math.random() - 0.5) * rect.height * 3
            this.createParticle(x, y)
          }, i * 40)
        }
      }
    }, 2000)
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
}
