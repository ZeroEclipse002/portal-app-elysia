import { setLayoutValues } from '@/stores/layout'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type SlotItemMapArray, type Swapy, utils } from 'swapy'
import { createSwapy } from 'swapy'

type Item = {
    id: string
    title: string
    type: 'marquee' | 'hero' | 'carousel' | 'list'
    height: number
}

const initialItems: Item[] = [
    {
        id: '1',
        title: 'Marquee Section',
        type: 'marquee',
        height: 80
    },
    {
        id: '2',
        title: 'Hero Section',
        type: 'hero',
        height: 400
    },
    {
        id: '3',
        title: 'Featured Carousel',
        type: 'carousel',
        height: 300
    },
    {
        id: '4',
        title: 'Content List',
        type: 'list',
        height: 400
    }
]

function GridEditor({ preLayout }: { preLayout: number[] }) {
    const [items, setItems] = useState<Item[]>(initialItems)
    const [hasError, setHasError] = useState(false)
    const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(() => {
        if (preLayout.length > 0) {
            return preLayout.map((itemIndex, slotIndex) => ({
                slot: String(slotIndex),
                item: items[itemIndex - 1]?.id || ''
            }))
        }
        return utils.initSlotItemMap(items, 'id')
    })
    const slottedItems = useMemo(() => utils.toSlottedItems(items, 'id', slotItemMap), [items, slotItemMap])
    const swapyRef = useRef<Swapy | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => utils.dynamicSwapy(swapyRef.current, items, 'id', slotItemMap, setSlotItemMap), [items])

    useEffect(() => {
        if (!containerRef.current) {
            console.error('Container ref is not available')
            setHasError(true)
            return
        }

        try {
            swapyRef.current = createSwapy(containerRef.current, {
                manualSwap: true,
                dragAxis: 'y'
            })

            swapyRef.current.onSwap((event) => {
                if (!event.newSlotItemMap?.asArray) {
                    console.error('Invalid slot item map')
                    setHasError(true)
                    return
                }

                try {
                    setLayoutValues(event.newSlotItemMap.asArray.map((item) => item.item))
                    setSlotItemMap(event.newSlotItemMap.asArray)
                } catch (error) {
                    console.error('Error in swap handler:', error)
                    setHasError(true)
                }
            })

            return () => {
                if (swapyRef.current) {
                    swapyRef.current.destroy()
                }
            }
        } catch (error) {
            console.error('Error initializing Swapy:', error)
            setHasError(true)
        }
    }, [])

    const getItemStyle = (type: Item['type']) => {
        switch (type) {
            case 'marquee':
                return 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300'
            case 'hero':
                return 'bg-purple-100 hover:bg-purple-200 border-2 border-purple-300'
            case 'carousel':
                return 'bg-pink-100 hover:bg-pink-200 border-2 border-pink-300'
            case 'list':
                return 'bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300'
            default:
                return 'bg-slate-100 hover:bg-slate-200 border-2 border-slate-300'
        }
    }

    const getMockContent = (type: Item['type']) => {
        switch (type) {
            case 'marquee':
                return (
                    <div className="flex justify-between items-center px-6">
                        <div className="flex gap-4">
                            <div className="w-16 h-4 bg-blue-200 rounded"></div>
                            <div className="w-16 h-4 bg-blue-200 rounded"></div>
                            <div className="w-16 h-4 bg-blue-200 rounded"></div>
                        </div>
                    </div>
                )
            case 'hero':
                return (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-96 h-8 bg-purple-200 rounded"></div>
                        <div className="w-72 h-4 bg-purple-200 rounded"></div>
                        <div className="flex gap-4 mt-4">
                            <div className="w-32 h-10 bg-purple-200 rounded-full"></div>
                            <div className="w-32 h-10 bg-purple-200 rounded-full"></div>
                        </div>
                    </div>
                )
            case 'carousel':
                return (
                    <div className="flex gap-4 items-center px-6">
                        <div className="w-72 h-40 bg-pink-200 rounded-lg"></div>
                        <div className="w-72 h-40 bg-pink-200 rounded-lg"></div>
                        <div className="w-72 h-40 bg-pink-200 rounded-lg"></div>
                    </div>
                )
            case 'list':
                return (
                    <div className="flex flex-col gap-4 px-6">
                        <div className="w-full h-16 bg-emerald-200 rounded-lg"></div>
                        <div className="w-full h-16 bg-emerald-200 rounded-lg"></div>
                        <div className="w-full h-16 bg-emerald-200 rounded-lg"></div>
                    </div>
                )
        }
    }

    return (
        <div className=" min-h-screen">
            <div>
                {hasError && (
                    <div className="bg-red-50 p-4 flex items-center justify-center gap-4">
                        <span className="text-red-600">An error occurred while updating the layout</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                )}
            </div>
            <div className="w-full max-w-5xl mx-auto p-8" ref={containerRef}>
                <div className="flex flex-col gap-4">
                    {slottedItems.map(({ slotId, itemId, item }) => (
                        <div
                            className="w-full rounded-lg data-[swapy-highlighted]:bg-gray-200/50"
                            key={slotId}
                            data-swapy-slot={slotId}
                        >
                            {item && (
                                <div
                                    className={`relative flex items-center justify-center ${getItemStyle(item.type)} rounded-lg w-full transition-colors cursor-move shadow-sm`}
                                    style={{ height: item.height }}
                                    data-swapy-item={itemId}
                                    key={itemId}
                                >
                                    <div className="absolute top-2 left-2 text-sm font-medium text-gray-600">
                                        {item.title}
                                    </div>
                                    {getMockContent(item.type)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GridEditor
