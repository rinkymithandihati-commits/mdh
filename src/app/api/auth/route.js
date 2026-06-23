import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { password } = await req.json();
    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
