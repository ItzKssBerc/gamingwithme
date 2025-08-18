
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Force the route to be evaluated in the Node.js runtime
export const runtime = 'nodejs';

// Helper function to get the path to the db.json file
function getDbPath() {
  return path.join(process.cwd(), 'app', 'lib', 'db.json');
}

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const dbPath = getDbPath();

  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data);

    const coach = db.coaches[username];
    const services = db.services[username] || [];
    const availability = db.availability[username] || {};

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    return NextResponse.json({ coach, services, availability });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}
