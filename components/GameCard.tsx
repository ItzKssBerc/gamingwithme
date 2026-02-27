import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

interface GameCardProps {
    game: {
        id: string;
        name: string;
        slug: string;
        igdbCoverUrl: string | null;
        igdbRating?: number | null;
        genre?: string | null;
    };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
    return (
        <Link href={`/games/${game.slug}`} className="group flex-shrink-0 w-40 transition-transform duration-300 hover:scale-105">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
                {game.igdbCoverUrl ? (
                    <Image
                        src={game.igdbCoverUrl.replace('t_thumb', 't_cover_big')}
                        alt={game.name}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
                        No Image
                    </div>
                )}

                {/* Hover overlay with detail */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {game.igdbRating && (
                        <div className="mb-1 flex items-center gap-1 text-xs font-bold text-yellow-400">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {Math.round(game.igdbRating)}
                        </div>
                    )}
                    <p className="text-xs text-white/70 line-clamp-1">{game.genre}</p>
                </div>
            </div>
            <h3 className="mt-2 text-sm font-semibold truncate text-white group-hover:text-primary transition-colors">
                {game.name}
            </h3>
        </Link>
    );
};

export default GameCard;
