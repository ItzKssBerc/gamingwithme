import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        })

        return NextResponse.json({ available: !user })
    } catch (error) {
        console.error("Check username error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
