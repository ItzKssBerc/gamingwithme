import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import HorizontalLane from "@/components/HorizontalLane";
import LaneSkeleton from "@/components/LaneSkeleton";

// Cache games for 5 minutes
const getGames = unstable_cache(
  async () => {
    return prisma.game.findMany({
      where: {
        isActive: true,
        igdbRatingCount: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        igdbCoverUrl: true,
        igdbRating: true,
        igdbRatingCount: true,
        genre: true,
      },
      orderBy: [{ igdbRatingCount: "desc" }, { igdbRating: "desc" }],
      take: 12,
    });
  },
  ["home-games"],
  { revalidate: 300 }
);

// Cache gamers for 2 minutes
const getGamers = unstable_cache(
  async () => {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        userTags: { select: { tag: true } },
        reviewsReceived: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return users.map((user) => {
      const totalRating = user.reviewsReceived.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        user.reviewsReceived.length > 0
          ? totalRating / user.reviewsReceived.length
          : 0;

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        bio: user.bio || "No bio available",
        rating: Math.round(averageRating * 10) / 10,
        tags: user.userTags
          .filter((ut) => !ut.tag.startsWith("category:"))
          .map((ut) => ut.tag),
      };
    });
  },
  ["home-gamers"],
  { revalidate: 120 }
);

async function GamesLane() {
  const games = await getGames();
  return (
    <HorizontalLane
      title="Games"
      href="/games"
      type="game"
      initialItems={games}
      apiEndpoint="/api/games?ordering=trending"
    />
  );
}

async function GamersLane() {
  const gamers = await getGamers();
  return (
    <HorizontalLane
      title="Top Gamers"
      href="/gamers"
      type="gamer"
      initialItems={gamers}
      apiEndpoint="/api/gamers"
      emptyMessage="Our community is just starting to grow. Be the first gamer to join this list and show off your profile!"
    />
  );
}

export default function Home() {
  return (
    <div className="pt-4 flex flex-col gap-2">
      <Suspense fallback={<LaneSkeleton title="Games" />}>
        <GamesLane />
      </Suspense>

      <Suspense fallback={<LaneSkeleton title="Top Gamers" />}>
        <GamersLane />
      </Suspense>
    </div>
  );
}
