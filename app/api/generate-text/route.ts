import type { NextRequest } from "next/server"
import { generateText } from "ai"

const PRESETS: Record<string, { title: string; prompt: string }> = {
  greeting: {
    title: "Warm Greeting",
    prompt:
      "Write a brief, warm greeting that directly addresses a person named akash. Keep it to 2-3 sentences. Friendly, concise, and positive.",
  },
  status: {
    title: "Project Status",
    prompt: "Craft a short and encouraging project status nudge for akash. 2-3 sentences, supportive tone, no jargon.",
  },
  onboarding: {
    title: "Onboarding Welcome",
    prompt: "Create a short onboarding welcome for akash. 2-3 sentences, clear and upbeat, avoid corporate clichés.",
  },
  tip: {
    title: "Daily Tip",
    prompt: "Share a quick, practical productivity tip addressed to akash. 2-3 sentences, conversational, no emojis.",
  },
  reminder: {
    title: "Gentle Reminder",
    prompt: "Write a gentle reminder for akash to take a short break and hydrate. 2-3 sentences, kind and respectful.",
  },
}

export async function POST(req: NextRequest) {
  try {
    const { presetId } = await req.json()
    const preset = PRESETS[presetId as keyof typeof PRESETS] ?? PRESETS.greeting

    // Use Gemini via Vercel AI SDK. The gateway handles provider config.
    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      prompt: `${preset.prompt} Always include the name "akash" naturally in the text.`,
    })

    return Response.json({ text: text?.trim() ?? "" })
  } catch {
    return Response.json({ error: "Failed to generate text." }, { status: 500 })
  }
}
