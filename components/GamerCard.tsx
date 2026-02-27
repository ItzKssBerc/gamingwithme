import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface GamerCardProps {
    gamer: {
        id: string;
        username: string;
        avatar: string | null;
        bio: string;
        rating: number;
        tags: string[];
    };
}

const GamerCard: React.FC<GamerCardProps> = ({ gamer }) => {
    return (
        <Link href={`/profile/${gamer.username}`} className="group flex-shrink-0 w-52 transition-transform duration-300 hover:scale-105">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors">
                        {gamer.avatar ? (
                            <Image
                                src={gamer.avatar}
                                alt={gamer.username}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400 font-bold text-xl uppercase">
                                {gamer.username.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                            {gamer.username}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            {gamer.rating > 0 ? gamer.rating : "New"}
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-xs text-zinc-400 line-clamp-2 h-8 leading-relaxed">
                    {gamer.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1">
                    {gamer.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default GamerCard;
