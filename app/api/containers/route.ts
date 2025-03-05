import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const containers = await prisma.container.findMany({
      orderBy: {
        createdAt: "desc", // Optional: order by most recently created
      },
    });
    return NextResponse.json(containers, { status: 200 });
  } catch (error) {
    console.error("Error fetching containers:", error);
    return NextResponse.json(
      { message: "Error fetching containers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      images,
      size,
      condition,
      location,
      isAvailable = true,
      supplierId,
      manufacturerInfo,
      yearManufactured,
      specifications,
    } = body;

    const newContainer = await prisma.container.create({
      data: {
        title,
        description,
        price: new Decimal(price),
        images,
        size,
        condition,
        location,
        isAvailable,
        supplierId,
        manufacturerInfo,
        yearManufactured,
        specifications: specifications
          ? JSON.stringify(specifications)
          : undefined,
      },
    });

    console.log("Created container");
    return NextResponse.json(newContainer, { status: 201 });
  } catch (error) {
    console.error("Could not create container:", error);
    return NextResponse.json(
      { message: "Error creating container" },
      { status: 500 }
    );
  }
}

// Handle PUT (update) request
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const body = await request.json();
    const {
      // id,
      title,
      description,
      price,
      images,
      size,
      condition,
      location,
      isAvailable,
      supplierId,
      manufacturerInfo,
      yearManufactured,
      specifications,
    } = body;

    if (id) {
      const updatedContainer = await prisma.container.update({
        where: { id },
        data: {
          title,
          description,
          price: new Decimal(price),
          images,
          size,
          condition,
          location,
          isAvailable,
          supplierId,
          manufacturerInfo,
          yearManufactured,
          specifications: specifications
            ? JSON.stringify(specifications)
            : undefined,
        },
      });
      return NextResponse.json(updatedContainer, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating container:", error);
    return NextResponse.json(
      { message: "Error updating container" },
      { status: 500 }
    );
  }
}

// Handle DELETE request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Container ID is required" },
        { status: 400 }
      );
    }

    const container = await prisma.container.delete({
      where: { id },
    });

    if (!container) {
      return NextResponse.json(
        { error: "Container not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Container deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting container:", error);
    return NextResponse.json(
      { message: "Error deleting container" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, DELETE",
    },
  });
}
