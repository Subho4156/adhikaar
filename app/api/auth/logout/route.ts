import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    //console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
