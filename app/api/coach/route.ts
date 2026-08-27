import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/playbook";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const passcode = process.env.APP_PASSCODE;

  if (!apiKey) {
    return NextResponse.json(
      { error: "The server is missing its API key. Ask Timmy to check the Vercel settings." },
      { status: 500 }
    );
  }

  let body: { mode?: string; message?: string; context?: string; passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });
  }

  if (passcode && body.passcode !== passcode) {
    return NextResponse.json({ error: "That passcode isn't right." }, { status: 401 });
  }

  const mode = body.mode === "reply" ? "reply" : "draft";
  const message = (body.message || "").trim();
  const context = (body.context || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Paste a message first." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "That's too long. Keep it under 4000 characters." }, { status: 400 });
  }

  const userContent =
    mode === "draft"
      ? `mode: draft\n\nWho she is messaging (may be blank):\n${context || "not given"}\n\nHer draft message:\n${message}`
      : `mode: reply\n\nWhat she sent first (may be blank):\n${context || "not given"}\n\nWhat the prospect replied:\n${message}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Anthropic API error", res.status, detail);
      if (res.status === 401) {
        return NextResponse.json(
          { error: "The API key was rejected. Ask Timmy to check it in Vercel." },
          { status: 502 }
        );
      }
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Too many requests at once. Wait a moment and try again." },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: "Couldn't reach the coach. Try again in a moment." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return NextResponse.json({ mode, result: JSON.parse(text) });
    } catch {
      console.error("Unparseable model output", text);
      return NextResponse.json(
        { error: "The coach returned something unreadable. Try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Request failed", err);
    return NextResponse.json({ error: "Couldn't reach the coach. Try again." }, { status: 502 });
  }
}
