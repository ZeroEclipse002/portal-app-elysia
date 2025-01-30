import { useState } from "react";
import type { Post, Priority } from "@/types/post";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
    recent: Post[];
    priority: Priority[];
    initialData: Post | Priority;
}

export function HeroSectionContent({ recent, priority, initialData }: HeroSectionProps) {
    const [state, setState] = useState<"main" | "recent">("main");
    const data = state === "recent" ? recent[0] : priority[0] || initialData;

    return (
        <div className="w-full flex justify-center items-center mb-6">
            <div className="w-[80vw] relative min-h-[80vh] bg-gradient-to-br from-slate-400 to-slate-50 rounded-xl p-16 flex flex-col justify-center items-center shadow-sm">
                <div className="w-fit p-2 flex gap-2 rounded-xl absolute top-10 left-10 bg-white">
                    <button
                        onClick={() => setState("recent")}
                        className={`text-slate-700 mx-2 p-1 rounded-md ${state === "recent"
                                ? "font-bold text-slate-900 bg-slate-200"
                                : ""
                            }`}
                    >
                        Recent
                    </button>
                    <div className="w-[1px] min-h-full bg-black" />
                    <button
                        onClick={() => setState("main")}
                        className={`text-slate-700 mx-2 p-1 rounded-md ${state === "main"
                                ? "font-bold text-slate-900 bg-slate-200"
                                : ""
                            }`}
                    >
                        Main
                    </button>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8 text-center leading-tight">
                    {data.title}
                </h1>

                <Badge
                    variant="outline"
                    className="text-lg md:text-2xl text-slate-600 max-w-3xl text-center mb-12 font-light tracking-wide"
                >
                    {data.shortDescription}
                </Badge>

                <div className="flex gap-6">
                    <a
                        href={data.id || "#"}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg text-lg"
                    >
                        Visit {data.type}
                    </a>
                    <a
                        href={data.id || "#"}
                        className="px-8 py-4 bg-white bg-opacity-50 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-opacity-100 transition-all duration-300 shadow-sm hover:shadow-md text-lg text-slate-700"
                    >
                        {data.type}
                    </a>
                </div>
            </div>
        </div>
    );
}