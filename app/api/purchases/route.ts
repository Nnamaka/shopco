import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { PurchaseStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.containerId ||
      !data.paymentReference ||
      !data.amount ||
      !data.buyerEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new purchase record
    const purchase = await prisma.purchase.create({
      data: {
        containerId: data.containerId,
        paymentId: data.paymentReference,
        amount: new Decimal(data.amount),
        buyerEmail: data.buyerEmail,
        status: data.status || PurchaseStatus.PAYMENT_RECEIVED,
        // Add any other fields your Purchase model requires
      },
    });

    // Update container availability
    await prisma.container.update({
      where: { id: data.containerId },
      data: { isAvailable: false },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
