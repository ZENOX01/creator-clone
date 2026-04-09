import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; // ADDED: The Bouncer
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the MASTER KEY to bypass RLS securely (Server-Side ONLY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // PHASE 1: THE BOUNCER (Authentication)
    // ---------------------------------------------------------
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Parse the incoming request
    const body = await req.json();
    const { title, outline, dna, mode, settings } = body;

    // Unpack optional settings with safe defaults
    const toneLevel: number = settings?.toneLevel ?? 3;
    const hookStyle: string = settings?.hookStyle ?? "bold-claim";

    const toneInstruction: Record<number, string> = {
      1: "Your tone must be extremely chill, relaxed, and conversational — like chatting with a friend.",
      2: "Your tone should be warm and conversational, easy-going but still engaging.",
      3: "Your tone should be balanced — natural and conversational, neither too aggressive nor too mellow.",
      4: "Your tone should be high-energy, punchy, and fast-paced. Create urgency.",
      5: "Your tone must be SAVAGE — raw, brutally direct, zero sugarcoating. Every word should hit like a fist.",
    };

    const hookInstruction: Record<string, string> = {
      "bold-claim":  "HOOK TYPE: Open with an outrageous, counterintuitive bold claim that makes people stop scrolling instantly.",
      "question":    "HOOK TYPE: Open with a burning question the target audience is secretly asking themselves.",
      "story":       "HOOK TYPE: Open with a gripping 2-sentence personal story — drop the viewer straight into the scene.",
      "data":        "HOOK TYPE: Open with a shocking statistic or data point that completely reframes the topic.",
    };

    if (!title || !dna) {
      return NextResponse.json({ error: "Title and DNA are required" }, { status: 400 });
    }

    // ---------------------------------------------------------
    // PHASE 2: THE LEDGER (Check Supabase Credits)
    // ---------------------------------------------------------
    let { data: user, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    // If this is a brand new user who just logged in, create their row and give 15 credits for the beta
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, credits: 15 }])
        .select()
        .single();
      
      if (insertError || !newUser) throw new Error("Failed to create user database record");
      user = newUser; // Set the user variable to our newly created user
    }

    // ---------------------------------------------------------
    // PHASE 3: THE GATE (Block if empty)
    // ---------------------------------------------------------
    if (!user) {
      throw new Error("User record could not be loaded");
    }

    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "Beta limit reached! 🚀 Thanks for testing — unlimited Pro tier coming soon." }, 
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // PHASE 4: THE ENGINE (Your AI Logic)
    // ---------------------------------------------------------
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // More stable capacity for SaaS

    const formatInstructions = mode === 'long-form' 
      ? `
      FORMAT: LONG-FORM YOUTUBE VIDEO
      - Target Length: 10-15 minutes (approx. 1500-2000 words).
      - Structure: 
        1. THE HOOK (0:00-0:30): High stakes, visually descriptive, introduce the core conflict or promise immediately. NO "Welcome back to my channel".
        2. THE INTRO (0:30-1:30): Validate the hook, establish authority, and create an 'open loop' (a mystery or payoff teased for the end).
        3. THE BODY (1:30-12:00): Break down into 3-5 clear chapters. Use 'pattern interrupts' (suggesting b-roll, text on screen). Keep pacing dynamic.
        4. THE PAYOFF/OUTRO (12:00-End): Deliver on the open loop. Strong Call To Action (CTA).
      - Include visual and audio cues in brackets, like: [B-ROLL: Describe action], [SFX: Whoosh], [TEXT: Bold statement].` 
      : `
      FORMAT: SHORT-FORM (TikTok/Reel/Shorts)
      - Target Length: Under 60 seconds (max 150-180 words).
      - Structure:
        1. THE HOOK (0-3 sec): Visually disruptive, highly controversial, or deeply relatable statement. NO fluff.
        2. THE MEAT (3-45 sec): Rapid-fire value, listicle format, or intense story. Cut out every unnecessary word.
        3. THE LOOP (45-60 sec): End the script in a way that seamlessly loops back into the hook. No "Subscribe for more" standard BS, just pure loop.
      - Include rapid visual pacing cues: [FAST CUT], [POP UP TEXT], [ZOOM IN].`;

    const prompt = `
      You are a 7-figure YouTube scriptwriter and retention expert. You are ghostwriting for a massive creator.
      
      TITLE/CONCEPT: "${title}"
      
      CORE IDEAS & BRAIN DUMP:
      <BRAIN_DUMP>
      ${outline || "No specific bullet points provided. Create a highly engaging original script based on the title."}
      </BRAIN_DUMP>
      
      CRITICAL INSTRUCTION: You MUST embody the specific personality, tone, vocabulary, and pacing of the provided "Creator DNA":
      <CREATOR_DNA>
      ${dna}
      </CREATOR_DNA>
      
      TONE SETTINGS (override everything else if there's a conflict):
      - ${toneInstruction[toneLevel] ?? toneInstruction[3]}
      - ${hookInstruction[hookStyle] ?? hookInstruction["bold-claim"]}
      
      RULES FOR THE SCRIPT:
      1. SCRIPT CONTEXT: You must base the core messaging of the script entirely on the <BRAIN_DUMP> provided above. Do not hallucinate random facts. Just turn the messy ideas into an incredible script.
      2. TONE MATCHING: If the DNA is aggressive, be aggressive. If it's analytical, be analytical. DO NOT break character. NEVER use generic AI words like "delve", "testament", "tapestry", "buckle up", or "dive in".
      3. FORMATTING: Use markdown. Bold important words for vocal emphasis during reading.
      4. SCRIPTING CUES: Provide instructions for the editor using brackets like [B-ROLL: ...], [VFX: ...], [SFX: ...].
      
      ${formatInstructions}
      
      Write the script now. Walk the walk.
    `;



    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    // ---------------------------------------------------------
    // PHASE 5: THE TOLL (Deduct 1 Credit)
    // ---------------------------------------------------------
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: user.credits - 1 })
      .eq('user_id', userId);

    if (updateError) {
      console.error("Warning: Failed to deduct credit in Supabase:", updateError);
    }

    return NextResponse.json({ script: generatedText });

  } catch (error) {
    console.error("[GEMINI_API_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}