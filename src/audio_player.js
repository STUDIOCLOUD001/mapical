class MapicalCompactPlayer {
  constructor(audioSrc = "/assets/audio/your-audio.mp3") {
    this.audio = new Audio(audioSrc)
    this.audio.preload = "metadata"

    this.isPlaying = false
    this.currentTime = 0
    this.totalTime = 0
    this.wavePoints = []
    this.isLooping = true

    this.tracks = [
      {
        title: "Audio recordings",
        artist: "You",
        duration: 0,
        cover: "undefined",
        src: audioSrc,
      },
    ]

    this.currentTrack = 0
    this.initializeElements()
    this.bindEvents()
    this.setupAudioEvents()
    this.updateDisplay()

    setTimeout(() => {
      this.initializeWaves()
    }, 200)

    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        this.initializeWaves()
      }, 250)
    })
  }

  setupAudioEvents() {
    this.audio.addEventListener("loadedmetadata", () => {
      this.totalTime = Math.floor(this.audio.duration)
      this.tracks[this.currentTrack].duration = this.totalTime
      const startPosition = this.totalTime / 3
      this.audio.currentTime = startPosition
      this.currentTime = Math.floor(startPosition)
      this.updateDisplay()
    })

    this.audio.addEventListener("timeupdate", () => {
      if (!this.seeking) {
        this.currentTime = Math.floor(this.audio.currentTime)
        this.updateDisplay()
      }
    })

    this.audio.addEventListener("ended", () => {
      if (this.isLooping) {
        this.audio.currentTime = 0
        this.currentTime = 0
        this.audio.play()
        this.updateDisplay()
      } else {
        this.nextTrack()
      }
    })

    this.audio.addEventListener("error", (e) => {
      console.error("Audio error:", e)
      this.isPlaying = false
      this.updatePlayButton()
    })
  }

  initializeElements() {
    this.playPauseBtn = document.getElementById("playPauseBtn")
    this.trackTitle = document.getElementById("trackTitle")
    this.trackArtist = document.getElementById("trackArtist")
    this.container = document.querySelector(".player-container")
    this.playhead = document.getElementById("playhead")
    this.waveContainer = document.getElementById("waveContainer")
    this.waveSvg = document.getElementById("waveSvg")
  }

  bindEvents() {
    this.playPauseBtn.addEventListener("click", () => this.togglePlayPause())

    const waveContainer = document.getElementById("waveContainer")
    waveContainer.addEventListener("click", (e) => this.seekToWave(e))

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault()
        this.togglePlayPause()
      }
      if (e.code === "ArrowRight") {
        this.nextTrack()
      }
      if (e.code === "ArrowLeft") {
        this.previousTrack()
      }
    })

    const loopBtn = document.getElementById("loopBtn")
    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        const isLooping = this.toggleLoop()
        loopBtn.classList.toggle("active", isLooping)
      })
    }
  }

  calculateWaveY(x, width) {
    const height = this.waveContainer ? this.waveContainer.offsetHeight : 60
    const centerY = height / 2
    const normalizedX = x / width
    const wave1 = Math.sin(normalizedX * Math.PI * 3) * 2.5
    const wave2 = Math.sin(normalizedX * Math.PI * 6 + 1) * 1.2
    const wave3 = Math.sin(normalizedX * Math.PI * 9 + 2) * 0.8
    const envelope = Math.sin(normalizedX * Math.PI) * 0.8 + 0.2
    return centerY + (wave1 + wave2 + wave3) * envelope
  }

  initializeWaves() {
    const container = document.getElementById("waveContainer")
    if (!container) return

    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight
    const width = Math.max(60, containerWidth)
    const height = Math.max(20, containerHeight)

    console.log("✦ Container dimensions:", { containerWidth, containerHeight, width, height })
    console.log("✦ SVG elements exist:", {
      waveSvg: !!this.waveSvg,
      waveBackground: !!document.getElementById("waveBackground"),
      waveActive: !!document.getElementById("waveActive"),
    })

    if (this.waveSvg) {
      this.waveSvg.setAttribute("viewBox", `0 0 ${width} ${height}`)
      this.waveSvg.setAttribute("preserveAspectRatio", "none")
    }

    const points = []
    this.wavePoints = []

    for (let x = 0; x <= width; x += 2) {
      const y = this.calculateWaveY(x, width)
      points.push(`${x},${y}`)
      this.wavePoints.push({ x, y })
    }

    const wavePath = `M ${points.join(" L ")}`

    console.log("✦ Generated wave path:", wavePath.substring(0, 100) + "...")

    const waveBackground = document.getElementById("waveBackground")
    const waveActive = document.getElementById("waveActive")

    if (waveBackground) {
      waveBackground.setAttribute("d", wavePath)
      console.log("✦ Set waveBackground path")
    } else {
      console.error("✦ waveBackground element not found")
    }

    if (waveActive) {
      waveActive.setAttribute("d", wavePath)
      console.log("✦ Set waveActive path")
    } else {
      console.error("✦ waveActive element not found")
    }

    this.updateWaveProgress()
  }

  updateWaveProgress() {
    const progress = this.totalTime > 0 ? this.currentTime / this.totalTime : 0
    const progressPercent = progress * 100 + "%"

    console.log("✦ Progress update:", {
      currentTime: this.currentTime,
      totalTime: this.totalTime,
      progress,
      progressPercent,
    })

    const progressClip = document.getElementById("progressClip")
    if (progressClip) {
      const rect = progressClip.querySelector("rect")
      if (rect) {
        rect.setAttribute("width", progressPercent)
        console.log("✦ Updated progress clip width to:", progressPercent)
      }
    }

    if (this.wavePoints.length > 0) {
      const container = document.getElementById("waveContainer")
      const width = container.offsetWidth
      const targetX = progress * width

      let closestPoint = this.wavePoints[0]
      let minDistance = Math.abs(this.wavePoints[0].x - targetX)

      for (let i = 1; i < this.wavePoints.length; i++) {
        const distance = Math.abs(this.wavePoints[i].x - targetX)
        if (distance < minDistance) {
          minDistance = distance
          closestPoint = this.wavePoints[i]
        }
      }

      this.playhead.style.left = `${closestPoint.x}px`
      this.playhead.style.top = `${closestPoint.y}px`
    }
  }

  toggleBarAnimation() {
    const bars = document.querySelectorAll(".bar")
    bars.forEach((bar) => {
      if (this.isPlaying) {
        bar.classList.add("playing")
      } else {
        bar.classList.remove("playing")
      }
    })
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying

    if (this.isPlaying) {
      this.audio.play().catch((e) => {
        console.error("Playback failed:", e)
        this.isPlaying = false
        this.updatePlayButton()
        return
      })
      this.startProgress()
    } else {
      this.audio.pause()
      this.stopProgress()
    }

    this.updatePlayButton()
    this.toggleBarAnimation()
  }

  updatePlayButton() {
    const playIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>`

    const pauseIcon =
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>`

    this.playPauseBtn.innerHTML = this.isPlaying ? pauseIcon : playIcon
    this.playPauseBtn.setAttribute("aria-label", this.isPlaying ? "Pause" : "Play")

    const waveActive = document.getElementById("waveActive")

    if (this.isPlaying) {
      this.playPauseBtn.classList.add("playing")
      waveActive.classList.add("playing")
      this.playhead.classList.add("playing")
    } else {
      this.playPauseBtn.classList.remove("playing")
      waveActive.classList.remove("playing")
      this.playhead.classList.remove("playing")
    }
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length
    this.loadTrack()
  }

  previousTrack() {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length
    this.loadTrack()
  }

  loadTrack() {
    const track = this.tracks[this.currentTrack]

    this.container.classList.add("loading")

    this.audio.pause()
    this.audio.src = track.src
    this.audio.load()

    setTimeout(() => {
      this.trackTitle.textContent = track.title
      this.trackArtist.textContent = track.artist
      this.currentTime = Math.floor(this.totalTime / 3)
      this.isPlaying = false
      this.updatePlayButton()
      this.toggleBarAnimation()

      this.container.classList.remove("loading")
      this.updateDisplay()

      setTimeout(() => this.initializeWaves(), 100)
    }, 300)
  }

  seekToWave(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width

    const seekTime = this.totalTime * percentage
    this.seeking = true
    this.audio.currentTime = seekTime
    this.currentTime = Math.floor(seekTime)

    setTimeout(() => {
      this.seeking = false
    }, 100)

    this.updateDisplay()
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  startProgress() {
  }

  stopProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
    }
  }

  updateDisplay() {
    this.updateWaveProgress()

    const track = this.tracks[this.currentTrack]
    if (this.trackTitle) {
      this.trackTitle.textContent = track.title
    }
    if (this.trackArtist) {
      this.trackArtist.textContent = track.artist
    }
  }

  toggleLoop() {
    this.isLooping = !this.isLooping
    return this.isLooping
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    new MapicalCompactPlayer("/assets/audio/your-audio.mp3")
  }, 150)
})
