'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Upload, Star, Loader2, Trash2, GripVertical, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaGalleryProps {
  images: string[]
  onReorder: (images: string[]) => void
  onRemove: (index: number) => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploading: boolean
  uploadingCount?: number // number of files queued — shows that many shimmer cells
}

function SortableImage({
  url,
  index,
  isFeatured,
  onRemove,
  onMakeFeatured,
}: {
  url: string
  index: number
  isFeatured: boolean
  onRemove: (index: number) => void
  onMakeFeatured: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square">
      <div
        className={cn(
          'relative w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-200',
          isFeatured ? 'border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' : 'border-transparent hover:border-white/10',
          isDragging ? 'scale-[0.94] opacity-40 shadow-2xl shadow-black/80' : 'opacity-100'
        )}
      >
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Featured badge — always visible on first image */}
        {isFeatured && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-[3px] rounded-full bg-white text-black text-[9px] font-black uppercase tracking-[0.12em] shadow-xl">
            <Star className="w-2.5 h-2.5 fill-black" />
            Featured
          </div>
        )}

        {/* Order number — visible on hover */}
        {!isFeatured && (
          <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/52 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMakeFeatured(index)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-150',
                isFeatured
                  ? 'bg-white text-black cursor-default'
                  : 'bg-zinc-900 border border-white/10 text-zinc-300 hover:bg-white hover:text-black hover:border-transparent'
              )}
              title={isFeatured ? 'Featured image' : 'Set as featured'}
            >
              <Star className={cn('w-3.5 h-3.5', isFeatured && 'fill-black')} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-red-500/90 hover:border-red-500 hover:text-white transition-all duration-150 shadow-lg"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 hover:bg-zinc-800 transition-all select-none"
          >
            <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Drag</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadShimmer() {
  return (
    <div className="aspect-square rounded-2xl border border-white/5 overflow-hidden bg-zinc-950 flex flex-col items-center justify-center gap-2">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-800 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
        </div>
      </div>
      <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Uploading</span>
    </div>
  )
}

export default function MediaGallery({
  images,
  onReorder,
  onRemove,
  onUpload,
  uploading,
  uploadingCount = 1,
}: MediaGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string)
      const newIndex = images.indexOf(over.id as string)
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  const handleMakeFeatured = (index: number) => {
    if (index === 0) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onReorder(next)
  }

  return (
    <section className="premium-card p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Product Media</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {images.length > 0
              ? `${images.length} image${images.length !== 1 ? 's' : ''} · drag to reorder · first image is featured`
              : 'Upload images — the first one becomes the featured image'}
          </p>
        </div>
        <label
          className={cn(
            'luxury-button bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:bg-zinc-100 transition-all',
            uploading && 'opacity-60 pointer-events-none'
          )}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? 'Uploading...' : 'Add Images'}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={onUpload}
            accept="image/*"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <SortableContext items={images} strategy={rectSortingStrategy}>
            {images.map((url, idx) => (
              <SortableImage
                key={url}
                url={url}
                index={idx}
                isFeatured={idx === 0}
                onRemove={onRemove}
                onMakeFeatured={handleMakeFeatured}
              />
            ))}
          </SortableContext>

          {/* Upload shimmers — one per file being uploaded */}
          {uploading && Array.from({ length: uploadingCount }).map((_, i) => (
            <UploadShimmer key={`shimmer-${i}`} />
          ))}

          {/* Empty upload zone */}
          {!uploading && images.length < 8 && (
            <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/30 hover:border-zinc-600 hover:bg-zinc-900/40 transition-all duration-200 cursor-pointer group">
              <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl group-hover:border-white/10 group-hover:scale-105 transition-all duration-200">
                <ImagePlus className="w-5 h-5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
              </div>
              <span className="mt-2.5 text-[9px] font-bold text-zinc-600 group-hover:text-zinc-500 uppercase tracking-widest transition-colors">
                Add Image
              </span>
              <input type="file" multiple className="hidden" onChange={onUpload} accept="image/*" />
            </label>
          )}
        </div>
      </DndContext>
    </section>
  )
}
