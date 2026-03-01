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
        <Link href={`/profile/${gamer.username}`} className="group flex-shrink-0 w-48 transition-transform duration-300 hover:scale-105">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 group-hover:border-primary transition-all duration-500 shadow-xl">
                        {gamer.avatar ? (
                            <Image
                                src={gamer.avatar}
                                alt={gamer.username}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400 font-bold text-2xl uppercase">
                                {gamer.username.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="w-full">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors tracking-tight">
                            {gamer.username}
                        </h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Profile
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GamerCard;
