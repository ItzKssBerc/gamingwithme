"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Loader2, Users, Gamepad2 } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import GameCard from './GameCard';
import GamerCard from './GamerCard';

interface HorizontalLaneProps {
    title: string;
    href?: string;
    type: 'game' | 'gamer';
    initialItems: any[];
    apiEndpoint: string;
    emptyMessage?: string;
}

const HorizontalLane: React.FC<HorizontalLaneProps> = ({ title, href, type, initialItems, apiEndpoint, emptyMessage }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<any[]>(initialItems);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const fetchMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPage = page + 1;
            const separator = apiEndpoint.includes('?') ? '&' : '?';
            const response = await fetch(`${apiEndpoint}${separator}page=${nextPage}&limit=12`);
            const data = await response.json();

            const newItems = type === 'game' ? data.games : data.gamers;

            if (newItems && newItems.length > 0) {
                setItems(prev => {
                    const existingIds = new Set(prev.map((item: any) => item.id.toString()));
                    const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item.id.toString()));
                    return [...prev, ...uniqueNewItems];
                });
                setPage(nextPage);
                setHasMore(data.pagination.hasNext);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching more items:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, page, loading, hasMore, type]);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);

            // Fetch more if we are near the end (80% of the way)
            if (scrollLeft + clientWidth > scrollWidth * 0.8 && hasMore && !loading) {
                fetchMore();
            }
        }
    }, [hasMore, loading, fetchMore]);

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            checkScroll();
            currentRef.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll]);

    // Re-check scroll when items change
    useEffect(() => {
        checkScroll();
    }, [items, checkScroll]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-4 relative group/lane">
            <div className="w-full px-8 lg:px-12">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="h-8 w-1 bg-white/[0.1] rounded-full"></span>
                        {href ? (
                            <Link href={href} className="flex items-center gap-2 group">
                                <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                                    {title}
                                </h2>
                                <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Link>
                        ) : (
                            <h2 className="text-2xl font-bold text-white">
                                {title}
                            </h2>
                        )}
                    </div>
                </div>

                <div className="relative">
                    {/* Empty State */}
                    {items.length === 0 && !loading && emptyMessage && (
                        <div className="py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#0a0a0a] backdrop-blur-sm">
                            <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.05] mb-6 group-hover/lane:scale-110 transition-transform duration-500">
                                {type === 'gamer' ? (
                                    <Users className="h-10 w-10 text-primary" />
                                ) : (
                                    <Gamepad2 className="h-10 w-10 text-primary" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No {type === 'game' ? 'Games' : 'Gamers'} Yet</h3>
                            <p className="text-white/40 text-sm max-w-xs text-center leading-relaxed">
                                {emptyMessage}
                            </p>
                            {href && (
                                <Link
                                    href={href}
                                    className="mt-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-widest hover:bg-primary hover:border-primary transition-all duration-300"
                                >
                                    Explore {type === 'game' ? 'Games' : 'Gamers'}
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Left Arrow */}
                    {showLeftArrow && items.length > 0 && (
                        <div className="absolute left-2 top-[calc(50%-8px)] -translate-y-1/2 z-20 flex items-center justify-center">
                            <Button
                                variant="outline"
                                className="h-10 w-10 p-0 flex items-center justify-center rounded-full border-white/10 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 hover:scale-110 transition-all"
                                onClick={() => scroll('left')}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        </div>
                    )}

                    {/* Right Arrow */}
                    {showRightArrow && items.length > 0 && (
                        <div className="absolute right-2 top-[calc(50%-8px)] -translate-y-1/2 z-20 flex items-center justify-center">
                            {loading ? (
                                <div className="h-10 w-10 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="h-10 w-10 p-0 flex items-center justify-center rounded-full border-white/10 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 hover:scale-110 transition-all"
                                    onClick={() => scroll('right')}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            )}
                        </div>
                    )}

                    <div
                        ref={scrollRef}
                        className={`flex gap-6 overflow-x-auto no-scrollbar pt-4 pb-4 px-4 -mx-4 scroll-smooth ${items.length === 0 ? 'hidden' : ''}`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {items.map((item) => (
                            type === 'game' ? (
                                <GameCard key={item.id} game={item} />
                            ) : (
                                <GamerCard key={item.id} gamer={item} />
                            )
                        ))}

                        {/* Loading placeholder at the end */}
                        {loading && (
                            <div className="flex-shrink-0 flex items-center justify-center w-20">
                                <Loader2 className="h-8 w-8 text-primary animate-spin opacity-50" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HorizontalLane;
