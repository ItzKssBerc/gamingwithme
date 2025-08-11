import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET a specific service by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.fixedService.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// UPDATE a service
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, price, duration, capacity } = body;

    if (
      !title ||
      !description ||
      price === undefined ||
      duration === undefined ||
      capacity === undefined
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const serviceToUpdate = await prisma.fixedService.findUnique({
      where: { id: params.id },
      select: { providerId: true },
    });

    if (!serviceToUpdate) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (serviceToUpdate.providerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // The body already contains numbers, no need to parse again.
    const updatedService = await prisma.fixedService.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price,
        duration,
        capacity,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE a service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = await prisma.fixedService.findUnique({
      where: {
        id: params.id,
      },
      select: {
        providerId: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.providerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.fixedService.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
