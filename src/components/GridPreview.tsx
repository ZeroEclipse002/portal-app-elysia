import { layoutValues } from '@/stores/layout'
import { useStore } from '@nanostores/react'
import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

export const GridPreview = ({ preLayout }: { preLayout: number[] }) => {
    const [layout, setLayout] = useState<number[]>(preLayout)

    const layoutVal = useStore(layoutValues)

    const handleSave = () => {
        toast.promise(actions.admin.editGridLayout({ layout: layout }), {
            loading: 'Saving...',
            success: () => {
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
                return 'Grid layout updated successfully'
            },
            error: 'Failed to update grid layout'
        })
    }

    useEffect(() => {
        setLayout(layoutVal)
    }, [layoutVal])

    const blocks = [
        {
            name: "Marquee Block",
            colors: "bg-blue-50 border-blue-200 text-blue-900"
        },
        {
            name: "Hero Block",
            colors: "bg-purple-50 border-purple-200 text-purple-900"
        },
        {
            name: "Carousel Block",
            colors: "bg-pink-50 border-pink-200 text-pink-900"
        },
        {
            name: "List Block",
            colors: "bg-emerald-50 border-emerald-200 text-emerald-900"
        }
    ]

    return (
        <div className="col-span-3 bg-white rounded-lg p-6 h-fit sticky top-8 shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Components</h1>
            <div className="flex flex-col gap-3">
                {layout.map((index) => {
                    const block = blocks[index - 1]
                    if (!block) return null
                    return (
                        <div
                            key={`block-${index}`}
                            className={`border-2 rounded-lg p-4 ${block.colors}`}
                        >
                            {block.name}
                        </div>
                    )
                })}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6">Current Saved Layout</h1>
            <div className="flex flex-col gap-3">
                {preLayout.map((index) => {
                    const block = blocks[index - 1]
                    if (!block) return null
                    return (
                        <div key={`block-${index}`} className={`border-2 rounded-lg p-4 ${block.colors}`}>{block.name}</div>
                    )
                })}
            </div>
            <Button onClick={handleSave} disabled={JSON.stringify(layout) === JSON.stringify(preLayout)} className="mt-6">Save</Button>
        </div>
    )
}