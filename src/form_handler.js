class FormHandler {
  constructor(containerSelector = ".navigation") {
    if (typeof containerSelector === "string") {
      this.container = document.querySelector(containerSelector)
    } else if (containerSelector instanceof Element) {
      this.container = containerSelector
    } else {
      console.warn(`FormHandler: Invalid container parameter`)
      return
    }

    if (!this.container) {
      console.warn(`FormHandler: Container not found`)
      return
    }

    this.form = this.container.querySelector(".waitlist-form")
    this.emailInput = this.container.querySelector(".email-input")
    this.joinButton = this.container.querySelector(".join-button")
    this.buttonText = this.container.querySelector(".button-text")
    this.successMessage = this.container.querySelector(".success-message")
    this.errorMessage = this.container.querySelector(".error-message")
    this.errorText = this.container.querySelector(".error-text")
    this.hpField = this.container.querySelector(".hp-field")

    this.GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwCZpXmhAeUVAeLXHMikgIc13N-yiiRgfXRt5ACjIS1DqWdg9j04v5STu2sGHyaRpG3/exec"

    this.isSubmitting = false
    this.lastSubmissionTime = 0
    this.DEBOUNCE_TIME = 2000

    this.init()
  }

  init() {
    if (!this.form) return
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

    if (this.joinButton) {
      this.joinButton.addEventListener("click", (e) => {
        if (this.joinButton.type !== "submit") {
          e.preventDefault()
          this.form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
        }
      })
    }

    if (this.successMessage) {
      this.successMessage.addEventListener("click", () => this.hideSuccess())
    }
    if (this.errorMessage) {
      this.errorMessage.addEventListener("click", () => this.hideError())
    }

    if (this.emailInput) {
      this.emailInput.addEventListener("input", () => {
        this.clearInputState()
        this.hideError()
      })
    }
  }

  canSubmit() {
    const now = Date.now()
    if (this.isSubmitting) {
      console.log("✦ Submission blocked: already submitting")
      return false
    }
    if (now - this.lastSubmissionTime < this.DEBOUNCE_TIME) {
      console.log("✦ Submission blocked: too soon after last submission")
      return false
    }
    return true
  }

  async handleSubmit(e) {
    e.preventDefault()

    if (!this.canSubmit()) {
      console.log("✦ Submission blocked by canSubmit check")
      return
    }

    this.isSubmitting = true
    this.lastSubmissionTime = Date.now()

    const email = this.emailInput.value.trim()

    if (!email || !this.isValidEmail(email)) {
      this.isSubmitting = false
      this.showError("Please enter a valid email address")
      return
    }

    this.setLoadingState(true)

    try {
      const honeypot = this.hpField?.value || ""

      console.log("✦ Submitting email:", email)

      const response = await fetch(this.GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          `email=${encodeURIComponent(email)}` +
          `&clientTimestamp=${encodeURIComponent(new Date().toISOString())}` +
          `&userAgent=${encodeURIComponent(navigator.userAgent)}` +
          `&referrer=${encodeURIComponent(document.referrer)}` +
          `&pageUrl=${encodeURIComponent(window.location.href)}` +
          `&hpField=${encodeURIComponent(honeypot)}`,
      })

      const result = await response.json()

      console.log("✦ Response from script:", result)
      console.log("✦ Response status:", response.status)

      if (result.success) {
        this.showSuccess()
        this.emailInput.value = ""
      } else if (result.error === "Email already exists") {
        this.showMagicMessage()
      } else {
        this.showError("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("✦ Error:", error)
      this.showError("Network error. Please check your connection and try again.")
    } finally {
      this.setLoadingState(false)
      this.isSubmitting = false
    }
  }

  showSuccess() {
    if (!this.successMessage) return

    this.hideError()
    this.setInputState("success")
    this.createSuccessModal()
  }

  createSuccessModal() {
    const existingModal = document.getElementById("successModal")
    if (existingModal) existingModal.remove()

    const modalOverlay = document.createElement("div")
    modalOverlay.id = "successModal"
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.1);
      -webkit-backdrop-filter: blur(6rem);
      backdrop-filter: blur(6rem);
      display: flex; justify-content: center; align-items: center;
      z-index: 1000; opacity: 0;
    `

    const modalContent = document.createElement("div")
    modalContent.style.cssText = `
      padding: 4rem;
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      text-align: center;
      max-width: 400px; width: 90%;
      transform: scale(0.8) translateY(30px);
      opacity: 0;
      -webkit-backdrop-filter: blur(6rem);
      backdrop-filter: blur(6rem);
      background: rgba(253, 252, 251, 0.88);
    `

    const successIcon = document.createElement("div")
    successIcon.style.cssText = `
      width: 60px; height: 60px;
      background: var(--green-500);
      border-radius: 50%;
      margin: 0 auto 2rem;
      display: flex; align-items: center; justify-content: center;
      transform: scale(0);
    `
    successIcon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"></polyline></svg>`

    const successTitle = document.createElement("h3")
    successTitle.style.cssText = `margin: 0 0 0.64rem 0; font-size: 2rem; font-weight: normal; color: var(--neutral-900); opacity:0; transform:translateY(20px);`
    successTitle.textContent = "You're on the magic list!"

    const successSubtext = document.createElement("p")
    successSubtext.style.cssText = `margin:0 0 1.5rem 0; color: var(--neutral-400); font-size: 1.6rem;
    line-height: 1.4; opacity:0; transform:translateY(20px);`
    successSubtext.textContent = "That's it. Thanks for joining! Now go outside and have fun."

    const closeButton = document.createElement("button")
    closeButton.style.cssText = `-webkit-backdrop-filter: blur(6rem); backdrop-filter: blur(6rem);
    background-color: rgba(213, 195, 173, 0.9); border:none; padding: 1.06rem 1.5rem 1rem 1.5rem; border-radius:4rem; color: var(--neutral-50); font-size:1.4rem; font-weight: normal; font-family: var(--font-primary), sans-serif; line-height: 1; cursor:pointer; opacity:0; transform:translateY(20px); transition: background-color 0.2s ease;`
    closeButton.textContent = "Till next time"
    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.background = "rgba(213, 195, 173, 1)"
    })
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.background = "rgba(213, 195, 173, 0.9)"
    })

    const shareButton = document.createElement("button")
    shareButton.style.cssText = `-webkit-backdrop-filter: blur(6rem); backdrop-filter: blur(6rem);
    background-color: rgba(245,105,0,.9); border:none; padding: 1.06rem 1.5rem 1rem 1.5rem; border-radius:4rem; color: var(--neutral-50); font-size:1.4rem; font-weight: normal; font-family: var(--font-primary), sans-serif; line-height: 1; cursor:pointer; opacity:0; transform:translateY(20px); transition: background-color 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 0 auto 1rem auto;`

    // Check if Web Share API is supported
    if (navigator.share) {
      shareButton.innerHTML = `Pass it on`

      shareButton.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: "Join the Magic List!",
            text: "I just joined this amazing waitlist - you should check it out too!",
            url: window.location.href,
          })
        } catch (error) {
          // User cancelled or share failed
          console.log("Share cancelled or failed:", error)
        }
      })

      shareButton.addEventListener("mouseenter", () => {
        shareButton.style.background = "rgba(245,105,0,1)"
      })
      shareButton.addEventListener("mouseleave", () => {
        shareButton.style.background = "rgba(245,105,0,.9)"
      })
    } else {
      shareButton.style.display = "none"
    }

    modalContent.appendChild(successIcon)
    modalContent.appendChild(successTitle)
    modalContent.appendChild(successSubtext)
    if (navigator.share) {
      modalContent.appendChild(shareButton)
    }
    modalContent.appendChild(closeButton)
    modalOverlay.appendChild(modalContent)
    document.body.appendChild(modalOverlay)

    if (typeof window.gsap !== "undefined") {
      const tl = window.gsap.timeline()
      tl.to(modalOverlay, { opacity: 1, duration: 0.3, ease: "power2.out" })
      tl.to(modalContent, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }, "-=0.1")
      tl.to(successIcon, { scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.2")
      tl.to(successTitle, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.1")
      tl.to(successSubtext, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.2")
      if (navigator.share) {
        tl.to(shareButton, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.2")
      }
      tl.to(closeButton, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.15")
      tl.to(successIcon, { scale: 1.1, duration: 0.2, ease: "power2.inOut", yoyo: true, repeat: 1 }, "-=0.1")
    }

    const closeModal = () => {
      if (typeof window.gsap !== "undefined") {
        const closeTl = window.gsap.timeline({
          onComplete: () => {
            modalOverlay.remove()
          },
        })
        const elementsToAnimate = [successTitle, successSubtext]
        if (navigator.share) {
          elementsToAnimate.push(shareButton)
        }
        elementsToAnimate.push(closeButton)
        closeTl.to(elementsToAnimate, {
          opacity: 0,
          y: -20,
          duration: 0.2,
          stagger: 0.05,
          ease: "power2.in",
        })
        closeTl.to(successIcon, { scale: 0, duration: 0.2, ease: "back.in(2)" }, "-=0.1")
        closeTl.to(modalContent, { opacity: 0, scale: 0.8, y: 30, duration: 0.3, ease: "power2.in" }, "-=0.1")
        closeTl.to(modalOverlay, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.2")
      } else {
        modalOverlay.style.opacity = "0"
        setTimeout(() => {
          modalOverlay.remove()
        }, 300)
      }
    }

    closeButton.addEventListener("click", closeModal)
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal()
    })

    this.closeSuccessModal = closeModal
  }

  hideSuccess() {
    if (this.closeSuccessModal) {
      this.closeSuccessModal()
      this.closeSuccessModal = null
    }
    this.clearInputState()
  }

  showError(message) {
    if (!this.errorMessage || !this.errorText) return

    const cleanMessage = message.replace(/^⚠️\s*/, "")
    this.errorText.textContent = cleanMessage
    this.setInputState("error")
    this.errorMessage.classList.remove("magic-message")
    this.errorMessage.classList.add("show")

    setTimeout(() => this.hideError(), 5000)
  }

  showMagicMessage() {
    if (!this.errorMessage || !this.errorText) return

    this.setInputState("success")
    this.errorText.innerHTML = ""

    const plotTwist = document.createElement("span")
    plotTwist.className = "plot-twist"
    plotTwist.textContent = "Plot twist"

    const magicText = document.createElement("span")
    magicText.className = "magic-text"
    magicText.textContent = "magic list"

    this.errorText.appendChild(plotTwist)
    this.errorText.appendChild(document.createTextNode(" - this email is already on our "))
    this.errorText.appendChild(magicText)
    this.errorText.appendChild(document.createTextNode("!"))

    this.errorMessage.classList.add("magic-message")
    this.errorMessage.classList.add("show")
    setTimeout(() => this.hideError(), 5000)
  }

  hideError() {
    if (!this.errorMessage) return

    this.errorMessage.classList.remove("show")
    this.errorMessage.classList.remove("magic-message")

    if (!this.successMessage.classList.contains("show")) {
      this.clearInputState()
    }
  }

  setInputState(state) {
    if (!this.emailInput) return

    this.emailInput.classList.remove("error", "success")
    if (state) this.emailInput.classList.add(state)
  }

  clearInputState() {
    if (!this.emailInput) return
    this.emailInput.classList.remove("error", "success")
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  setLoadingState(loading) {
    if (!this.buttonText) return
    const gsap = window.gsap

    if (loading) {
      if (gsap && gsap.plugins.TextPlugin) {
        gsap.to(this.buttonText, { text: "joining...", duration: 0.3 })
      } else {
        this.buttonText.textContent = "joining..."
      }

      this.emailInput.disabled = true
      this.joinButton.disabled = true
      this.joinButton.classList.add("loading")

      if (gsap) {
        if (!this.joinButton.querySelector(".swipe-overlay")) {
          const overlay = document.createElement("div")
          overlay.className = "swipe-overlay"
          overlay.style.cssText = `
            position:absolute; top:0; left:-100%;
            width:100%; height:100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            pointer-events:none; border-radius:inherit;
          `
          this.joinButton.style.position = "relative"
          this.joinButton.style.overflow = "hidden"
          this.joinButton.appendChild(overlay)
        }

        const overlay = this.joinButton.querySelector(".swipe-overlay")
        gsap.fromTo(overlay, { left: "-100%" }, { left: "100%", duration: 1.5, ease: "power2.inOut", repeat: -1 })
      }
    } else {
      if (gsap) {
        window.gsap.killTweensOf(this.joinButton)
        const overlay = this.joinButton.querySelector(".swipe-overlay")
        if (overlay) {
          window.gsap.killTweensOf(overlay)
          overlay.remove()
        }
      }

      this.joinButton.classList.remove("loading")
      this.joinButton.disabled = false
      this.emailInput.disabled = false

      if (gsap && gsap.plugins.TextPlugin) {
        gsap.to(this.buttonText, { text: "Join the magic", duration: 0.3 })
      } else {
        this.buttonText.textContent = "Join the magic"
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const targetSelectors = [
    "#navigation-privacy",
    "#navigation-home",
    ".navigation",
  ]

  const initializedContainers = new Set()

  targetSelectors.forEach((selector) => {
    const containers = document.querySelectorAll(selector)

    containers.forEach((container) => {
      if (!initializedContainers.has(container) && !container.hasAttribute("data-form-handler-initialized")) {
        container.setAttribute("data-form-handler-initialized", "true")
        initializedContainers.add(container)
        new FormHandler(container)
        console.log(`✦ FormHandler initialized for: ${selector}`)
      }
    })
  })
})
