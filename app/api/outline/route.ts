import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { title, mode } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required to generate an outline" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast API for quick inline generation

    const prompt = `
      You are an elite YouTube strategist. 
      The user wants to make a ${mode === "shorts" ? "short-form (<60s)" : "long-form (10min+)"} video based on this topic:
      "${title}"
      
      Generate a rapid, high-level blueprint outline for this video.
      Keep it strictly to 3-5 bullet points. Do not include any fluff or introductory text. Just raw bullet points they can expand on.
      Make the first point a "Hook" idea.
    `;

    const result = await model.generateContent(prompt);
    const generatedOutline = result.response.text().trim();

    return NextResponse.json({ outline: generatedOutline });
  } catch (error) {
    console.error("[OUTLINE_API_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
