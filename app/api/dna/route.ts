import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("saved_dna")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ dnas: data });
  } catch (error) {
    console.error("[DNA_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch saved DNAs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, dna } = await req.json();
    if (!name || !dna) {
      return NextResponse.json({ error: "Name and DNA are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_dna")
      .insert([{ user_id: userId, name, dna }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ dna: data });
  } catch (error) {
    console.error("[DNA_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to save DNA" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("saved_dna")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // ensure users can only delete their own

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DNA_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete DNA" }, { status: 500 });
  }
}
