import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const bookingId = session.metadata?.bookingId;

            if (bookingId) {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: "confirmed",
                        stripePaymentIntentId: session.payment_intent as string,
                    },
                });
                console.log(`Booking ${bookingId} confirmed via Stripe`);
            }
            break;
        }

        case "account.updated": {
            const account = event.data.object as Stripe.Account;
            // If the coach has finished onboarding and can receive payouts
            if (account.details_submitted && account.payouts_enabled) {
                const userId = account.metadata?.userId;
                if (userId) {
                    await (prisma.user as any).update({
                        where: { id: userId },
                        data: { stripeOnboardingComplete: true }
                    });
                    console.log(`User ${userId} Stripe onboarding complete`);
                }
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
