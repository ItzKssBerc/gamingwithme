import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { coachUsername, bookingId, price, serviceTitle } = await req.json();

        if (!price || price <= 0) {
            return NextResponse.json({ error: "Invalid price for checkout" }, { status: 400 });
        }

        // Fetch coach's Stripe Account ID to enable split payment
        const coach = await prisma.user.findUnique({
            where: { username: coachUsername },
            select: { stripeAccountId: true, stripeOnboardingComplete: true }
        });

        const totalAmount = Math.round(price * 100);
        const platformFeePercent = 0.10; // 10% commission
        const applicationFeeAmount = Math.round(totalAmount * platformFeePercent);

        // Create a Stripe Checkout Session
        const sessionOptions: any = {
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${serviceTitle || 'Coaching Session'} with ${coachUsername}`,
                        },
                        unit_amount: totalAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXTAUTH_URL}/profile/bookings?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/profile/${coachUsername}/book?canceled=true`,
            metadata: {
                bookingId,
                coachUsername,
                userEmail: session.user.email,
            },
        };

        // If coach has a connected and onboarded Stripe account, use split payment
        if (coach?.stripeAccountId && coach?.stripeOnboardingComplete) {
            sessionOptions.payment_intent_data = {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: coach.stripeAccountId,
                },
            };
        }

        const checkoutSession = await stripe.checkout.sessions.create(sessionOptions);

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
