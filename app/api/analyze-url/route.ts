import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

/**
 * Extracts the 11-character video ID from any YouTube URL format:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://youtube.com/shorts/VIDEO_ID
 *  - https://youtube.com/embed/VIDEO_ID
 *  - Raw VIDEO_ID (11 chars)
 */
function extractVideoId(input: string): string | null {
  const cleaned = input.trim();

  // Raw 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) return cleaned;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,          // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,      // youtu.be/
    /\/shorts\/([a-zA-Z0-9_-]{11})/,       // /shorts/
    /\/embed\/([a-zA-Z0-9_-]{11})/,        // /embed/
    /\/v\/([a-zA-Z0-9_-]{11})/,            // /v/
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Strips WebVTT/TTML formatting to return plain text.
 * Handles timestamps, cue identifiers, WEBVTT header, and HTML tags.
 */
function parseWebVTT(vtt: string): string {
  const lines = vtt.split('\n');
  const textLines: string[] = [];
  const timelineRegex = /^\d{2}:\d{2}:\d{2}[\.,]\d{3}\s*-->/;
  const cueIdRegex = /^\d+$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === 'WEBVTT') continue;
    if (timelineRegex.test(trimmed)) continue;
    if (cueIdRegex.test(trimmed)) continue;
    // Strip HTML tags like <00:00:01.000><c>text</c>
    const clean = trimmed.replace(/<[^>]+>/g, '').trim();
    if (clean) textLines.push(clean);
  }

  // De-duplicate consecutive repeated lines (common in WebVTT)
  const deduped: string[] = [];
  for (const line of textLines) {
    if (deduped[deduped.length - 1] !== line) {
      deduped.push(line);
    }
  }

  return deduped.join(' ');
}

/**
 * Fetches a YouTube transcript via RapidAPI (bypasses Vercel IP blocks).
 * Uses the "YouTube Captions, Transcript, Subtitles, Video Combiner" API.
 */
async function fetchTranscriptViaRapidAPI(videoId: string): Promise<string> {
  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) throw new Error("RAPID_API_KEY environment variable is not set.");

  const RAPID_HOST = "youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com";

  // Try English first, then auto-generated, then fall back to any available language
  const languagesToTry = ['en', 'en-US', 'en-GB'];

  let lastError: Error | null = null;

  for (const lang of languagesToTry) {
    try {
      const url = `https://${RAPID_HOST}/download-webvtt/${videoId}?language=${lang}&response_mode=default`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': RAPID_HOST,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        lastError = new Error(`RapidAPI responded with ${res.status}: ${await res.text()}`);
        continue;
      }

      const text = await res.text();

      // If the response is empty or just a WEBVTT header with no content, try next lang
      if (!text || text.trim() === 'WEBVTT' || text.trim().length < 50) {
        lastError = new Error(`Empty transcript for language: ${lang}`);
        continue;
      }

      const plainText = parseWebVTT(text);
      if (plainText.length < 30) {
        lastError = new Error(`Parsed transcript too short for lang: ${lang}`);
        continue;
      }

      return plainText;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // Last resort: try without a language param (API picks whatever is available)
  try {
    const url = `https://${RAPID_HOST}/download-webvtt/${videoId}?response_mode=default`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPID_HOST,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const text = await res.text();
      const plainText = parseWebVTT(text);
      if (plainText.length >= 30) return plainText;
    }
  } catch (err) {
    lastError = err instanceof Error ? err : new Error(String(err));
  }

  // Build a friendly error message
  const errMsg = lastError?.message?.toLowerCase() ?? '';
  if (errMsg.includes('404') || errMsg.includes('not found')) {
    throw new Error("No captions found for this video. Try a video that has CC (closed captions) enabled.");
  }
  if (errMsg.includes('403') || errMsg.includes('401')) {
    throw new Error("RapidAPI authentication failed. Check your RAPID_API_KEY.");
  }
  if (errMsg.includes('empty') || errMsg.includes('short')) {
    throw new Error("Captions are turned off on this video. Try a different video that has CC (closed captions) enabled.");
  }

  throw new Error(lastError?.message ?? "Failed to fetch transcript from RapidAPI.");
}

export async function POST(req: NextRequest) {
  try {
    // 1. The Bouncer
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // 2. Extract the video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Paste a link like: https://youtube.com/watch?v=..." },
        { status: 400 }
      );
    }

    // 3. Fetch the transcript via RapidAPI
    let sampleText: string;
    try {
      const fullTranscript = await fetchTranscriptViaRapidAPI(videoId);
      sampleText = fullTranscript.slice(0, 15000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch transcript.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // 4. The Profiler — using Gemini 2.5 Flash
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an elite psychological profiler for YouTubers.
      Read the following video transcript and extract the creator's exact "Personality DNA".
      Identify their tone, pacing, vocabulary, humor style, and overall vibe.
      
      CRITICAL RULES:
      - Keep it concise, punchy, and strictly under 40 words.
      - DO NOT describe what the video is about. Only describe HOW they speak.
      - Output the result as a raw description (e.g., "Fast-paced, highly sarcastic, uses slang like 'bro', dry humor").
      
      Transcript to analyze:
      "${sampleText}"
    `;

    const result = await model.generateContent(prompt);
    const dna = result.response.text().trim();

    return NextResponse.json({ dna });

  } catch (error: unknown) {
    console.error("[YOUTUBE_ANALYZE_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Analysis Failed: ${error.message}` : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}