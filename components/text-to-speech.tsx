"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

type Preset = {
  id: string
  title: string
  description: string
}

const PRESETS: Preset[] = [
  { id: "greeting", title: "Warm Greeting", description: "Friendly hello addressed to akash." },
  { id: "status", title: "Project Status", description: "Encouraging nudge for progress." },
  { id: "onboarding", title: "Onboarding Welcome", description: "Short welcome for a new journey." },
  { id: "tip", title: "Daily Tip", description: "Quick, practical productivity tip." },
  { id: "reminder", title: "Gentle Reminder", description: "Kind reminder to pause and hydrate." },
]

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function TextToSpeech() {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [lastVoice, setLastVoice] = React.useState<string>("")

  React.useEffect(() => {
    function loadVoices() {
      const list = window.speechSynthesis.getVoices()
      setVoices(list)
    }
    loadVoices()
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const englishVoices = React.useMemo(
    () => voices.filter((v) => (v.lang || "").toLowerCase().startsWith("en")),
    [voices],
  )

  function speak(text: string) {
    if (typeof window === "undefined") return
    const synth = window.speechSynthesis
    if (synth.speaking) synth.cancel()

    const chosen = pickRandom(englishVoices) || pickRandom(voices)
    const utterance = new SpeechSynthesisUtterance(text)
    if (chosen) {
      utterance.voice = chosen
      setLastVoice(`${chosen.name} (${chosen.lang})`)
    } else {
      setLastVoice("System default")
    }
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    synth.speak(utterance)
  }

  async function handleGenerateAndSpeak(presetId: string) {
    try {
      setLoadingId(presetId)
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      })
      const data = await res.json()
      if (!res.ok || !data?.text) {
        throw new Error(data?.error || "Generation failed")
      }
      speak(data.text)
    } catch (err) {
      console.error("[v0] TTS error:", err)
    } finally {
      setLoadingId(null)
    }
  }

  function stopSpeaking() {
    if (typeof window === "undefined") return
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel()
  }

  return (
    <section
      aria-labelledby="tts-title"
      className="mx-auto w-full max-w-3xl rounded-lg border bg-background/60 p-6 shadow-sm backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="tts-title" className="text-pretty text-xl font-semibold">
          AI Text to Speech (Random Voices)
        </h2>
        <div className="text-sm text-muted-foreground">Last voice: {lastVoice || "—"}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PRESETS.map((preset) => (
          <div key={preset.id} className="rounded-md border p-4">
            <div className="mb-2 font-medium">{preset.title}</div>
            <p className="mb-3 text-sm text-muted-foreground">{preset.description}</p>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleGenerateAndSpeak(preset.id)} disabled={loadingId === preset.id}>
                {loadingId === preset.id ? "Generating..." : "Generate & Speak"}
              </Button>
              <Button variant="secondary" onClick={stopSpeaking}>
                Stop
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Each playback randomly selects a voice available in your browser. Text is generated with Gemini and personalized
        for akash.
      </p>
    </section>
  )
}
