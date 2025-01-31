import { useEffect, useRef, useState } from 'react';
import { Image } from 'astro:assets';

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

    const updateCarousel = () => {
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    };

    const goToNext = () => {
        setCurrentIndex(current =>
            current < data.length - 1 ? current + 1 : 0
        );
    };

    const goToPrev = () => {
        setCurrentIndex(current =>
            current > 0 ? current - 1 : data.length - 1
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
            <div
                ref={containerRef}
                className="flex transition-transform duration-300 w-full"
            >
                {data.map((item, index) => (
                    <div key={index} className="w-full flex-shrink-0 min-w-full">
                        <img
                            src={item.image}
                            alt={item.alt || ""}
                            loading="eager"
                            className="w-full h-[40vh] object-cover"
                        />
                    </div>
                ))}
            </div>

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
        </div>
    );
} 