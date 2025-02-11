import { useState } from "react";
import type { Post, Priority } from "@/types/post";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
    recent: Post[];
    priority: Priority[];
    initialData: Post | Priority;
}

export function HeroSectionContent({ recent, priority, initialData }: HeroSectionProps) {
    const [state, setState] = useState<"main" | "recent">("main");
    const [currentIndex, setCurrentIndex] = useState(0);

    // Get the current data array based on state
    const currentArray = state === "recent" ? recent : priority;
    const data = state === "recent" ? recent[currentIndex] : priority[currentIndex]?.post || initialData;

    // Check if the current view has no content
    const isEmptyView = (state === "recent" && recent.length === 0) ||
        (state === "main" && priority.length === 0);

    const handleNext = () => {
        if (currentIndex < currentArray.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Reset index when switching tabs
    const handleStateChange = (newState: "main" | "recent") => {
        setState(newState);
        setCurrentIndex(0);
    };

    return (
        <div className="w-full flex justify-center items-center mb-6">
            <div className="w-[90vw] md:w-[85vw] lg:w-[80vw] overflow-hidden relative min-h-[85vh] rounded-2xl p-8 md:p-16 flex flex-col justify-center items-center shadow-lg backdrop-blur-sm">
                {data.image && (
                    <div className="absolute -z-10 inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />
                        <img
                            style={{
                                viewTransitionName: "post-image-" + data.id
                            }}
                            src={data.image}
                            alt={data.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="absolute top-8 left-8 md:top-10 md:left-10">
                    <div className="backdrop-blur-md bg-white/80 rounded-full p-1.5 flex gap-3 shadow-sm border border-slate-100">
                        <button
                            onClick={() => handleStateChange("recent")}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${state === "recent"
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            Recent {recent.length > 0 && <span className="ml-1 text-sm opacity-75">({recent.length})</span>}
                        </button>
                        <button
                            onClick={() => handleStateChange("main")}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${state === "main"
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            Main {priority.length > 0 && <span className="ml-1 text-sm opacity-75">({priority.length})</span>}
                        </button>
                    </div>
                </div>

                {!isEmptyView && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={cn(
                                "p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all",
                                currentIndex === 0 && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === currentArray.length - 1}
                            className={cn(
                                "p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all",
                                currentIndex === currentArray.length - 1 && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            →
                        </button>
                    </div>
                )}

                {isEmptyView ? (
                    <div className="text-center flex flex-col justify-center items-center space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold text-white">
                            No Content Available
                        </h1>
                        <Badge
                            variant="outline"
                            className="text-lg md:text-2xl text-white/90 max-w-3xl text-center font-light tracking-wide px-6 py-3"
                        >
                            {state === "recent"
                                ? "No recent posts available at the moment"
                                : "No priority content available at the moment"
                            }
                        </Badge>
                        <button
                            onClick={() => handleStateChange(state === "recent" ? "main" : "recent")}
                            className="px-8 py-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-full hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg hover:scale-105"
                        >
                            View {state === "recent" ? "Main" : "Recent"} Content
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8 text-center max-w-4xl mx-auto">
                        <div className="mb-4">
                            <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                                {currentIndex + 1} of {currentArray.length}
                            </Badge>
                        </div>
                        <h1 style={{
                            viewTransitionName: "post-title-" + data.id
                        }} className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
                            {data.title}
                        </h1>

                        <Badge
                            variant="outline"
                            className="text-lg md:text-2xl max-w-3xl text-center font-light tracking-wide px-6 py-3 text-white/90 border-white/20"
                        >
                            {data.shortDescription || "No short description available"}
                        </Badge>

                        <div className="mt-4 text-white/80 max-w-2xl mx-auto">
                            <p className="text-lg">
                                Posted on {new Date().toLocaleDateString()} • {data.type === 'announcement' ? 'Important Update' : 'Latest News'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8">
                            <a
                                href={data.id ? `/post/${data.id}` : "#"}
                                className="group px-8 py-4 bg-slate-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-lg hover:scale-105 hover:bg-slate-700"
                            >
                                Visit {data.type}
                                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
                            </a>
                            <a
                                href={data.type === "announcement" ? "announcements" : "news"}
                                className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-full hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-lg hover:scale-105 text-slate-700"
                            >
                                View more {data.type}
                            </a>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/20">
                            <div className="grid grid-cols-3 gap-4 text-white/80">
                                <div>
                                    <p className="text-sm uppercase tracking-wider">Category</p>
                                    <p className="font-medium text-white">{data.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-wider">Status</p>
                                    <p className="font-medium text-white">Active</p>
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-wider">ID</p>
                                    <p className="font-medium text-white">{data.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}