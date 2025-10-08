"use client"

import { useEffect, useRef, useState } from "react"

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Attempt autoplay by default; browsers may block until user interaction.
    const enabled = localStorage.getItem("bg-audio-enabled")
    const shouldPlay = enabled !== "false"
    if (!shouldPlay) return

    const el = audioRef.current
    if (!el) return

    el.volume = 0.4
    el.loop = true
    el.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsPlaying(false)
      })
  }, [])

  const toggle = async () => {
    const el = audioRef.current
    if (!el) return

    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
      localStorage.setItem("bg-audio-enabled", "false")
    } else {
      el.volume = 0.4
      try {
        await el.play()
        setIsPlaying(true)
        localStorage.setItem("bg-audio-enabled", "true")
      } catch {
        setIsPlaying(false)
      }
    }
  }

  return (
    <div aria-live="polite">
      <audio ref={audioRef} src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/minimalist-piano-intro-303226-8zVaDw55PSAyrdEeNbarJOjpTZUA1b.mp3" preload="auto" loop />
      <button
        type="button"
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground shadow px-4 py-2 text-sm"
      >
        {isPlaying ? "Pause music" : "Play music"}
      </button>
    </div>
  )
}
