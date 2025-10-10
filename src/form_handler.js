class FormHandler {
  constructor(form) {
    this.form = form instanceof Element ? form : document.querySelector(form)

    if (!this.form) {
      console.warn("FormHandler: Form not found")
      return
    }

    this.emailInput = this.form.querySelector('input[type="email"]')
    this.submitButton = this.form.querySelector('button[type="submit"]')
    this.hpField = this.form.querySelector('input[name="hpField"]')

    this.GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwCZpXmhAeUVAeLXHMikgIc13N-yiiRgfXRt5ACjIS1DqWdg9j04v5STu2sGHyaRpG3/exec"

    this.isSubmitting = false
    this.lastSubmissionTime = 0
    this.DEBOUNCE_TIME = 2000
    this.originalButtonText = this.submitButton?.textContent || "Submit"

    this.init()
  }

  init() {
    if (!this.form) return

    this.form.addEventListener("submit", (e) => this.handleSubmit(e))

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
      return false
    }
    if (now - this.lastSubmissionTime < this.DEBOUNCE_TIME) {
      return false
    }
    return true
  }

  async handleSubmit(e) {
    e.preventDefault()

    if (!this.canSubmit()) {
      return
    }

    this.isSubmitting = true
    this.lastSubmissionTime = Date.now()

    const email = this.emailInput.value.trim()

    if (!email || !this.isValidEmail(email)) {
      this.isSubmitting = false
      this.showError("Please enter a valid email address")
      this.shakeInput()
      return
    }

    this.setLoadingState(true)

    try {
      const honeypot = this.hpField?.value || ""

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

      if (result.success) {
        this.showSuccess()
        this.emailInput.value = ""
      } else if (result.error === "Email already exists") {
        this.showSuccess(true)
        this.emailInput.value = ""
      } else {
        this.showError("Something went wrong. Please try again.")
        this.shakeInput()
      }
    } catch (error) {
      console.error("Error:", error)
      this.showError("Network error. Please check your connection.")
      this.shakeInput()
    } finally {
      this.setLoadingState(false)
      this.isSubmitting = false
    }
  }

  showSuccess(isAlreadyOnList = false) {
    this.createSuccessModal(isAlreadyOnList)
  }

  createSuccessModal(isAlreadyOnList = false) {
    const existingModal = document.getElementById("successModal")
    if (existingModal) existingModal.remove()

    const modalOverlay = document.createElement("div")
    modalOverlay.id = "successModal"
    modalOverlay.className =
      "fixed inset-0 bg-black/10 backdrop-blur-3xl flex items-center justify-center z-50 opacity-0 transition-opacity duration-300"

    const modalContent = document.createElement("div")
    modalContent.className =
      "bg-white/90 backdrop-blur-3xl p-16 rounded-2xl shadow-2xl text-center max-w-md w-[90%] transform scale-90 translate-y-8 opacity-0 transition-all duration-400"

    const successIcon = document.createElement("div")
    successIcon.className =
      "w-16 h-16 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center transform scale-0 transition-transform duration-500"
    successIcon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"></polyline></svg>`

    const successTitle = document.createElement("h3")
    successTitle.className =
      "text-3xl font-normal text-foreground mb-3 opacity-0 translate-y-5 transition-all duration-300"
    successTitle.textContent = isAlreadyOnList ? "You're already on the list!" : "You're on the magic list!"

    const successSubtext = document.createElement("p")
    successSubtext.className =
      "text-muted-foreground text-base leading-relaxed mb-6 opacity-0 translate-y-5 transition-all duration-300"
    successSubtext.textContent = isAlreadyOnList
      ? "No need to sign up again - you're all set!"
      : "That's it. Thanks for joining! Now go outside and have fun."

    const buttonContainer = document.createElement("div")
    buttonContainer.className = "flex flex-col gap-3"

    const shareButton = document.createElement("button")
    shareButton.className =
      "bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 opacity-0 translate-y-5"
    shareButton.textContent = "Pass it on"

    const closeButton = document.createElement("button")
    closeButton.className =
      "bg-gray-300 hover:bg-gray-400 text-foreground px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 opacity-0 translate-y-5"
    closeButton.textContent = "Till next time"

    if (navigator.share) {
      shareButton.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: "Join the Magic List!",
            text: "I just joined this amazing waitlist - you should check it out too!",
            url: window.location.href,
          })
        } catch (error) {
          console.log("Share cancelled:", error)
        }
      })
      buttonContainer.appendChild(shareButton)
    }

    buttonContainer.appendChild(closeButton)
    modalContent.appendChild(successIcon)
    modalContent.appendChild(successTitle)
    modalContent.appendChild(successSubtext)
    modalContent.appendChild(buttonContainer)
    modalOverlay.appendChild(modalContent)
    document.body.appendChild(modalOverlay)

    // Trigger animations
    requestAnimationFrame(() => {
      modalOverlay.classList.remove("opacity-0")

      setTimeout(() => {
        modalContent.classList.remove("scale-90", "translate-y-8", "opacity-0")
        modalContent.classList.add("scale-100", "translate-y-0", "opacity-100")
      }, 100)

      setTimeout(() => {
        successIcon.classList.remove("scale-0")
        successIcon.classList.add("scale-100")
      }, 200)

      setTimeout(() => {
        successTitle.classList.remove("opacity-0", "translate-y-5")
        successTitle.classList.add("opacity-100", "translate-y-0")
      }, 300)

      setTimeout(() => {
        successSubtext.classList.remove("opacity-0", "translate-y-5")
        successSubtext.classList.add("opacity-100", "translate-y-0")
      }, 400)

      setTimeout(() => {
        if (navigator.share) {
          shareButton.classList.remove("opacity-0", "translate-y-5")
          shareButton.classList.add("opacity-100", "translate-y-0")
        }
      }, 500)

      setTimeout(() => {
        closeButton.classList.remove("opacity-0", "translate-y-5")
        closeButton.classList.add("opacity-100", "translate-y-0")
      }, 600)
    })

    const closeModal = () => {
      modalOverlay.classList.add("opacity-0")
      modalContent.classList.add("scale-90", "translate-y-8", "opacity-0")

      setTimeout(() => {
        modalOverlay.remove()
      }, 300)
    }

    closeButton.addEventListener("click", closeModal)
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal()
    })

    this.closeSuccessModal = closeModal
  }

  showError(message) {
    this.hideError()

    const errorEl = document.createElement("div")
    errorEl.id = "formErrorMessage"
    errorEl.className = "text-destructive text-sm mt-2 opacity-0 transition-opacity duration-200"
    errorEl.textContent = message

    this.emailInput.parentElement.insertBefore(errorEl, this.emailInput.nextSibling)

    requestAnimationFrame(() => {
      errorEl.classList.remove("opacity-0")
      errorEl.classList.add("opacity-100")
    })

    this.setInputState("error")
    this.currentErrorMessage = errorEl
  }

  hideError() {
    if (this.currentErrorMessage) {
      this.currentErrorMessage.classList.add("opacity-0")
      setTimeout(() => {
        this.currentErrorMessage?.remove()
        this.currentErrorMessage = null
      }, 200)
    }
  }

  shakeInput() {
    if (!this.emailInput) return

    this.emailInput.style.animation = "shake 0.4s"

    setTimeout(() => {
      this.emailInput.style.animation = ""
    }, 400)
  }

  setInputState(state) {
    if (!this.emailInput) return

    this.emailInput.classList.remove("ring-2", "ring-destructive", "ring-green-500")

    if (state === "error") {
      this.emailInput.classList.add("ring-2", "ring-destructive")
    } else if (state === "success") {
      this.emailInput.classList.add("ring-2", "ring-green-500")
    }
  }

  clearInputState() {
    if (!this.emailInput) return
    this.emailInput.classList.remove("ring-2", "ring-destructive", "ring-green-500")
    this.hideError()
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  setLoadingState(loading) {
    if (!this.submitButton) return

    if (loading) {
      this.submitButton.innerHTML = `
        <span class="shimmer-text">Joining...</span>
      `
      this.submitButton.disabled = true
      this.emailInput.disabled = true
      this.submitButton.classList.add("opacity-90", "cursor-not-allowed")

      if (!document.getElementById("shimmer-style")) {
        const style = document.createElement("style")
        style.id = "shimmer-style"
        style.textContent = `
          .shimmer-text {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.6) 0%,
              rgba(255, 255, 255, 1) 25%,
              rgba(255, 255, 255, 0.6) 50%,
              rgba(255, 255, 255, 1) 75%,
              rgba(255, 255, 255, 0.6) 100%
            );
            background-size: 200% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 2.5s linear infinite;
            display: inline-block;
          }
          @keyframes shimmer {
            0% {
              background-position: 0% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `
        document.head.appendChild(style)
      }
    } else {
      this.submitButton.textContent = this.originalButtonText
      this.submitButton.disabled = false
      this.emailInput.disabled = false
      this.submitButton.classList.remove("opacity-90", "cursor-not-allowed")
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-waitlist-form]")

  forms.forEach((form) => {
    if (!form.hasAttribute("data-form-handler-initialized")) {
      form.setAttribute("data-form-handler-initialized", "true")
      new FormHandler(form)
      console.log("FormHandler initialized")
    }
  })
})
