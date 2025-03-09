import { NextResponse } from "next/server";
import {prisma} from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const container = await prisma.container.findUnique({
      where: { id },
    });
    
    if (!container) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

        
    return NextResponse.json(container);
  } catch (error) {
    console.error("Error fetching container:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}