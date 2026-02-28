export default function LaneSkeleton({ title }: { title: string }) {
    return (
        <section className="py-4">
            <div className="w-full px-8 lg:px-12">
                {/* Title row */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-8 w-1 bg-white/[0.1] rounded-full" />
                    <div className="h-7 w-32 bg-white/[0.05] rounded animate-pulse" />
                </div>

                {/* Cards skeleton */}
                <div className="flex gap-6 overflow-hidden pt-4 pb-4 px-4 -mx-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[200px] h-[280px] rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
                            style={{ animationDelay: `${i * 80}ms` }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
