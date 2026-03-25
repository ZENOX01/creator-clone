import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';
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

    // 2. Extract the video ID — reject anything that isn't a recognisable YouTube link
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Paste a link like: https://youtube.com/watch?v=..." },
        { status: 400 }
      );
    }

    // 3. The Heist — try multiple language fallbacks for reliability
    let transcriptData;
    const langFallbacks = ['en', 'en-US', 'en-GB', 'en-CA'];
    let lastError: Error | null = null;

    for (const lang of langFallbacks) {
      try {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        if (transcriptData.length > 0) break; // got something, stop trying
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // Last resort: try with no language preference (picks whatever's available)
    if (!transcriptData || transcriptData.length === 0) {
      try {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // Still nothing — give the user a helpful, specific error
    if (!transcriptData || transcriptData.length === 0) {
      const errMsg = lastError?.message?.toLowerCase() ?? '';
      let friendlyError = "No captions found on this video.";

      if (errMsg.includes('disabled') || errMsg.includes('transcript is disabled')) {
        friendlyError = "Captions are turned off on this video. Try a different video that has CC (closed captions) enabled.";
      } else if (errMsg.includes('private') || errMsg.includes('unavailable')) {
        friendlyError = "This video is private or unavailable. Paste a public video URL.";
      } else if (errMsg.includes('shorts')) {
        friendlyError = "YouTube Shorts often don't have captions. Try a regular long-form video instead.";
      }

      return NextResponse.json({ error: friendlyError }, { status: 400 });
    }

    // Flatten and cap to ~15,000 chars
    const fullText = transcriptData.map(item => item.text).join(' ');
    const sampleText = fullText.slice(0, 15000);

    // 4. The Profiler — using 1.5-flash for best free-tier quota headroom
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

  } catch (error: any) {
    console.error("[YOUTUBE_ANALYZE_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Analysis Failed: ${error.message}` : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}