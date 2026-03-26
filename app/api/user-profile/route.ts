import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the MASTER KEY to bypass RLS securely (Server-Side ONLY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
       // if PGRST116 (0 rows), user doesn't exist yet (hasn't generated yet)
       if (error.code === 'PGRST116') {
         return NextResponse.json({ credits: null });
       }
       throw error;
    }

    return NextResponse.json({ credits: data?.credits ?? null });
  } catch (error) {
    console.error("[USER_PROFILE_GET_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
