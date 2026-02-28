import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, stripeAccountId: true, email: true, username: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let stripeAccountId = user.stripeAccountId;

        // 1. Create account if not exists
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    userId: session.user.id
                },
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'manual', // Can be changed later
                        },
                    },
                },
            });
            stripeAccountId = account.id;

            // Use direct prisma client since generate might not have finished the TS types yet,
            // but the DB has the field. We'll use cast to any if needed to avoid TS errors
            await (prisma.user as any).update({
                where: { id: session.user.id },
                data: { stripeAccountId }
            });
        }

        // 2. Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.NEXTAUTH_URL}/profile?stripe=refresh`,
            return_url: `${process.env.NEXTAUTH_URL}/profile?stripe=success`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.error("Stripe Connect Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
