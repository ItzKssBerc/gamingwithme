import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "clan" TEXT;`);
        return NextResponse.json({ success: true, message: 'Column added successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
