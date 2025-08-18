
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Force the route to be evaluated in the Node.js runtime
export const runtime = 'nodejs';

// Helper function to get the path to the db.json file
function getDbPath() {
  return path.join(process.cwd(), 'app', 'lib', 'db.json');
}

// GET all bookings (can be filtered by user)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const dbPath = getDbPath();

  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);

    let bookings = db.bookings;

    if (username) {
      bookings = bookings.filter(booking => booking.user === username);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read bookings' }, { status: 500 });
  }
}

// POST a new booking
export async function POST(request: Request) {
  const dbPath = getDbPath();

  try {
    const bookingDetails = await request.json();
    const { coachUsername, serviceId, date, time, user } = bookingDetails;

    if (!coachUsername || !serviceId || !date || !time || !user) {
        return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);

    // Check if the time slot is available
    const dateString = new Date(date).toISOString().split('T')[0];
    const availableTimes = db.availability[coachUsername]?.[dateString] || [];
    if (!availableTimes.includes(time)) {
      return NextResponse.json({ error: 'Time slot not available' }, { status: 409 });
    }

    // Create new booking
    const newBooking = {
      id: uuidv4(),
      ...bookingDetails,
      status: 'confirmed'
    };

    // Add booking to the list
    db.bookings.push(newBooking);

    // Remove the booked time slot from availability
    db.availability[coachUsername][dateString] = availableTimes.filter(t => t !== time);

    // Write updated data back to the file
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json(newBooking, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
