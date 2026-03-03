import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        })

        return NextResponse.json({ available: !user })
    } catch (error) {
        console.error("Check email error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
