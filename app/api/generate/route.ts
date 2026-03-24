import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, dna, mode } = body;

    if (!title || !dna) {
      return NextResponse.json(
        { error: "Title and dna are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const formatInstructions = mode === 'long-form' 
      ? "This is a LONG-FORM video. The script should be comprehensive, in-depth, and well-structured, aiming for a 10-15 minute video (1500+ words). Include detailed sections, transitions, and deep dives into the topic, ." 
      : "This is a SHORT-FORM video (TikTok/Reel). The script must be high-energy, fast-paced, and extremely concise, aiming for a 60-second video (around 150-180 words). Start with a massive hook and end abruptly or with a loop.";

    const prompt = `
      You are an elite ghostwriter. 
      Your task is to write a script for the following title: "${title}".
      
      ${formatInstructions}
      
      You absolutely MUST mimic the tone, vocabulary, pacing, and slang of the following DNA provided:
      "${dna}"
      
      You must avoid corporate YouTuber phrases like "Welcome back" or "Delve into".
    `;

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    return NextResponse.json({ script: generatedText });
  } catch (error) {
    console.error("[GEMINI_API_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
