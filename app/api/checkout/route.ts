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
            // Handle free bookings or invalid price
            return NextResponse.json({ error: "Invalid price for checkout" }, { status: 400 });
        }

        // Create a Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${serviceTitle || 'Coaching Session'} with ${coachUsername}`,
                        },
                        unit_amount: Math.round(price * 100), // Stripe expects cents
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
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
