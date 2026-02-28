interface GridSkeletonProps {
    count?: number;
    type?: "game" | "gamer";
}

export default function GridSkeleton({ count = 5, type = "game" }: GridSkeletonProps) {
    if (type === "gamer") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-12 gap-y-10">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="block">
                        <div
                            className="relative h-[250px] w-full mx-auto overflow-hidden bg-zinc-800/80 border border-white/10 rounded-2xl flex flex-col animate-pulse"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Banner */}
                            <div className="h-16 w-full bg-zinc-700/50 flex-shrink-0" />
                            {/* Avatar */}
                            <div className="flex justify-center mt-4">
                                <div className="h-16 w-16 rounded-full bg-zinc-700/80 border-2 border-zinc-600/50" />
                            </div>
                            {/* Name */}
                            <div className="flex flex-col items-center gap-2 mt-3 px-4">
                                <div className="h-3 w-20 rounded-full bg-zinc-700/80" />
                                <div className="flex gap-2 mt-2">
                                    <div className="h-5 w-14 rounded-md bg-zinc-700/60" />
                                    <div className="h-5 w-10 rounded-md bg-zinc-700/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="w-full aspect-[3/4] max-w-[260px] mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
                    style={{ animationDelay: `${i * 60}ms` }}
                />
            ))}
        </div>
    );
}

