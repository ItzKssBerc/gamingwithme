import { prisma } from "@/lib/prisma";
import HorizontalLane from "@/components/HorizontalLane";

async function getGames() {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: [
      { igdbRatingCount: 'desc' },
      { igdbRating: 'desc' }
    ],
    take: 12,
  });
  return games;
}

async function getGamers() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      userGames: { include: { game: true } },
      userLanguages: true,
      userTags: true,
      reviewsReceived: { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  return users.map(user => {
    const totalRating = user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = user.reviewsReceived.length > 0 ? totalRating / user.reviewsReceived.length : 0;

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar || null,
      bio: user.bio || 'No bio available',
      rating: Math.round(averageRating * 10) / 10,
      tags: user.userTags.filter(ut => !ut.tag.startsWith('category:')).map(ut => ut.tag),
    };
  });
}

export default async function Home() {
  const [games, gamers] = await Promise.all([getGames(), getGamers()]);

  return (
    <>
      <div className="pt-4 flex flex-col gap-2"> {/* Further reduced top padding for tighter fit with nav */}
        <HorizontalLane
          title="Games"
          href="/games"
          type="game"
          initialItems={games}
          apiEndpoint="/api/games?ordering=trending"
        />

        <HorizontalLane
          title="Top Gamers"
          href="/gamers"
          type="gamer"
          initialItems={gamers}
          apiEndpoint="/api/gamers"
          emptyMessage="Our community is just starting to grow. Be the first gamer to join this list and show off your profile!"
        />
      </div>
    </>
  );
}
