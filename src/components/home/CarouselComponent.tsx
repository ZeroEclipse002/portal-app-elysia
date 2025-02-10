import { useEffect, useRef, useState } from 'react';
import { Image } from 'astro:assets';
import useSWR from 'swr';
import type { HighlightsType } from '@/db/schema';
import { fetcher } from '@/lib/utils';

interface CarouselItem {
    image: string;
    alt: string;
}

interface CarouselProps {
    data: CarouselItem[];
}

export default function CarouselComponent({ data }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
    const { data: highlights, isLoading } = useSWR<HighlightsType[]>("/api/highlights", fetcher)

    const updateCarousel = () => {
        if (containerRef.current && highlights?.length) {
            containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    };

    const goToNext = () => {
        if (!highlights?.length) return;
        setCurrentIndex(current =>
            current < highlights.length - 1 ? current + 1 : 0
        );
    };

    const goToPrev = () => {
        if (!highlights?.length) return;
        setCurrentIndex(current =>
            current > 0 ? current - 1 : highlights.length - 1
        );
    };

    const startAutoRotate = () => {
        stopAutoRotate();
        autoRotateRef.current = setInterval(goToNext, 5000);
    };

    const stopAutoRotate = () => {
        if (autoRotateRef.current) {
            clearInterval(autoRotateRef.current);
        }
    };

    useEffect(() => {
        updateCarousel();
    }, [currentIndex]);

    useEffect(() => {
        startAutoRotate();
        return () => stopAutoRotate();
    }, []);

    return (
        <div className="relative overflow-hidden rounded-lg shadow-sm">
            <div className='absolute z-10 top-5 left-5 bg-white text-black p-2 rounded-lg'>
                Highlights {highlights?.length ? `(${highlights.length})` : ''}
            </div>

            {isLoading ? (
                <div className="w-full h-[40vh] bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">Loading highlights...</div>
                </div>
            ) : (
                <>
                    <div
                        ref={containerRef}
                        className="flex transition-transform duration-300 w-full"
                    >
                        {highlights?.map((item, index) => (
                            <div key={index} className="w-full flex-shrink-0 min-w-full">
                                <a href={item.link || ""} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={item.image}
                                        alt={item.caption || ""}
                                        loading="eager"
                                        className="w-full h-[40vh] object-cover"
                                    />
                                </a>
                                <p className="text-center text-sm text-gray-500">{item.caption}</p>
                            </div>
                        ))}
                    </div>

                    {highlights && highlights.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full hover:bg-gray-50 transition-colors shadow-md text-gray-600 hover:text-gray-900"
                                onClick={() => {
                                    goToPrev();
                                    stopAutoRotate();
                                }}
                                aria-label="Previous slide"
                            >
                                ←
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full hover:bg-gray-50 transition-colors shadow-md text-gray-600 hover:text-gray-900"
                                onClick={() => {
                                    goToNext();
                                    stopAutoRotate();
                                }}
                                aria-label="Next slide"
                            >
                                →
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
} 