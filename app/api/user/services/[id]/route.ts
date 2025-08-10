import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id;

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const service = await prisma.fixedService.findUnique({
      where: {
        id: serviceId,
        deletedAt: null, // Ensure the service is not soft-deleted
      },
      include: {
        members: {
          include: {
            user: true, // Include the user details for each member
          },
        },
        user: true, // Include the service owner's details
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Format the members data to only include necessary fields
    const formattedMembers = service.members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
    }));

    const response = {
      ...service,
      members: formattedMembers,
    };

    return NextResponse.json({ service: response });
  } catch (error) {
    console.error("Failed to fetch service details:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Backend Error: ${message}` }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const serviceId = params.id;
    const body = await request.json();
    const { isActive } = body;

    // Verify the service belongs to the user
    const service = await prisma.fixedService.findFirst({
      where: {
        id: serviceId,
        providerId: user.id
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update service status
    const updatedService = await prisma.fixedService.update({
      where: { id: serviceId },
      data: { isActive }
    });

    return NextResponse.json({ 
      service: updatedService,
      message: 'Service status updated successfully' 
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const serviceId = params.id;

    // Verify the service belongs to the user
    const service = await prisma.fixedService.findFirst({
      where: {
        id: serviceId,
        providerId: user.id
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Delete the service (this will also delete related orders due to cascade)
    await prisma.fixedService.delete({
      where: { id: serviceId }
    });

    return NextResponse.json({ 
      message: 'Service deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}