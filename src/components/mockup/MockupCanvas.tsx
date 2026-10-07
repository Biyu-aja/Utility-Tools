/**
 * Folder: src/components/mockup/
 * Description: 3D canvas viewport rendering the device mockup in 3D perspective space with backdrop.
 * This file: MockupCanvas.tsx
 */

import { forwardRef, useState } from 'react'
import type { MockupState } from '../../types/mockup'
import { MockupDeviceFrame } from './MockupDeviceFrame'
import { UploadCloud } from 'lucide-react'

interface Props {
  state: MockupState
  onImageDrop?: (file: File) => void
}

export const MockupCanvas = forwardRef<HTMLDivElement, Props>(({ state, onImageDrop }, ref) => {
  const { canvas, transform, zoomLevel } = state
  const [isDragOver, setIsDragOver] = useState(false)

  // Backdrop style
  const getCanvasBackground = (): React.CSSProperties => {
    if (canvas.bgType === 'transparent') {
      return {
        background: 'transparent',
      }
    }
    if (canvas.bgType === 'solid') {
      return {
        backgroundColor: canvas.bgColor,
      }
    }
    return {
      background: canvas.bgGradient,
    }
  }

  // Aspect ratio container dimensions/classes
  const getAspectClass = () => {
    switch (canvas.aspectRatio) {
      case '1:1':
        return 'aspect-square min-w-[500px] max-w-[800px]'
      case '16:9':
        return 'aspect-video min-w-[700px] max-w-[1100px]'
      case '4:3':
        return 'aspect-4/3 min-w-[600px] max-w-[960px]'
      case '9:16':
        return 'aspect-9/16 min-w-[420px] max-w-[520px]'
      case '3:2':
        return 'aspect-3/2 min-w-[640px] max-w-[900px]'
      default:
        return 'min-w-[420px] min-h-[500px] max-w-[1200px] w-full'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageDrop?.(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      className="flex-1 w-full h-full min-h-[550px] flex items-center justify-center p-4 sm:p-8 overflow-auto relative select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Zoom scale wrapper */}
      <div
        className="transition-transform duration-100 flex items-center justify-center"
        style={{
          transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
          transformOrigin: 'center center',
        }}
      >
        {/* Main Capture Element Ref */}
        <div
          ref={ref}
          className={`relative flex items-center justify-center overflow-hidden transition-all duration-200 ${getAspectClass()} ${
            canvas.bgType === 'transparent' ? 'border-2 border-dashed border-zinc-700/40 rounded-3xl' : 'shadow-2xl'
          }`}
          style={{
            ...getCanvasBackground(),
            padding: `${canvas.canvasPadding}px`,
            borderRadius: canvas.bgType !== 'transparent' ? `${canvas.borderRadius}px` : '28px',
          }}
        >
          {/* Subtle Grid Pattern for Transparent PNG Preview */}
          {canvas.bgType === 'transparent' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #71717a 25%, transparent 25%), linear-gradient(-45deg, #71717a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #71717a 75%), linear-gradient(-45deg, transparent 75%, #71717a 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            />
          )}

          {/* 3D Perspective Transformation Stage */}
          <div
            className="relative flex items-center justify-center transition-all duration-150"
            style={{
              perspective: `${transform.perspective}px`,
              perspectiveOrigin: 'center center',
            }}
          >
            <div
              className="relative flex items-center justify-center transition-all duration-150"
              style={{
                transform: `
                  rotateX(${transform.rotateX}deg)
                  rotateY(${transform.rotateY}deg)
                  rotateZ(${transform.rotateZ}deg)
                  scale(${transform.scale})
                  scaleX(${transform.flipX ? -1 : 1})
                  scaleY(${transform.flipY ? -1 : 1})
                `,
                transformStyle: 'preserve-3d',
              }}
            >
              <MockupDeviceFrame state={state} />
            </div>
          </div>

          {/* Drag & Drop Overlay Indicator */}
          {isDragOver && (
            <div className="absolute inset-0 z-50 bg-primary/25 backdrop-blur-xs border-3 border-dashed border-primary rounded-3xl flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in duration-150">
              <UploadCloud className="w-12 h-12 animate-bounce" />
              <p className="font-bold text-lg">Lepaskan Gambar di Sini!</p>
              <p className="text-xs text-white/80">Gambar akan otomatis dipasang ke layar frame</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MockupCanvas.displayName = 'MockupCanvas'
