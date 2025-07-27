// app/api/zeocloud/create-meeting/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { lawyerId, lawyerName } = await req.json();

  // Replace with your actual ZeoCloud API logic
  const response = await fetch("https://api.zeocloud.com/meetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ZEOCLOUD_API_KEY}`,
    },
    body: JSON.stringify({
      title: `Consult with ${lawyerName}`,
      userId: lawyerId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }

  return NextResponse.json({ meetingUrl: data.meetingUrl });
}