import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // 1. The Bouncer: Protect your API from random spam
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // 2. The Heist: Rip the transcript from YouTube
    const transcriptData = await YoutubeTranscript.fetchTranscript(url);
    
    // Combine all the subtitle pieces into one massive string
    const fullText = transcriptData.map(item => item.text).join(' ');
    
    // Cap it at ~15,000 characters so we don't blow up our Gemini token limit on 3-hour podcasts
    const sampleText = fullText.slice(0, 15000); 

    // 3. The Profiler: Ask Gemini to figure out their personality
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

    // 4. Send the exact DNA profile back to the frontend
    return NextResponse.json({ dna });

  } catch (error: any) {
    console.error("[YOUTUBE_ANALYZE_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Analysis Failed: ${error.message}` : "Failed to analyze video. Make sure it has captions." },
      { status: 500 }
    );
  }
}