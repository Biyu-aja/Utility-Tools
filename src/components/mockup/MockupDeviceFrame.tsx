/**
 * Folder: src/components/mockup/
 * Description: Renders realistic volumetric 3D hardware device frames with smooth multi-layered rounded depth,
 *              brushed metallic lighting, hardware buttons, camera island, and screen mappings.
 * This file: MockupDeviceFrame.tsx
 */

import React from 'react'
import type { MockupState } from '../../types/mockup'
import { Wifi, Battery, Signal } from 'lucide-react'

interface Props {
  state: MockupState
}

export const MockupDeviceFrame: React.FC<Props> = ({ state }) => {
  const { device, orientation, screen, appearance, transform } = state
  const isLandscape = orientation === 'landscape'
  const thickness = appearance.thickness || 16

  // Screen background and image transform styles
  const screenImageStyle: React.CSSProperties = {
    backgroundImage: screen.imageUrl ? `url(${screen.imageUrl})` : undefined,
    backgroundSize: screen.imageFit === 'fill' ? '100% 100%' : screen.imageFit,
    backgroundPosition: `${50 + screen.imagePanX}% ${50 + screen.imagePanY}%`,
    backgroundRepeat: 'no-repeat',
    transform: screen.imageZoom !== 100 ? `scale(${screen.imageZoom / 100})` : undefined,
    transformOrigin: 'center center',
  }

  // Realistic contact shadow underneath device in 3D space
  const shadowDistance = transform.elevation || 28
  const shadowBlur = appearance.shadowBlur || 35
  const shadowOpacity = (appearance.shadowOpacity || 45) / 100

  // Helper to generate volumetric 3D depth slices with perfectly matching rounded corners
  const renderDepthSlices = (width: number, height: number, radius: number, sliceCount = 14) => {
    const slices = []
    const step = thickness / sliceCount
    for (let i = 1; i <= sliceCount; i++) {
      const z = -(i * step)
      const ratio = i / sliceCount
      const brightness = 1 - ratio * 0.35 // Darker towards the back for ambient occlusion
      const specularAlpha = 0.35 * (1 - ratio * 0.8)

      slices.push(
        <div
          key={`depth-slice-${i}`}
          className="absolute inset-0 pointer-events-none transition-all duration-150"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: `${radius}px`,
            backgroundColor: appearance.color,
            filter: `brightness(${brightness})`,
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,${specularAlpha}),
              0 0 0 1px rgba(0,0,0,${0.2 + ratio * 0.4})
            `,
            transform: `translateZ(${z}px)`,
          }}
        />
      )
    }
    return slices
  }

  // =========================================================================
  // 1. IPHONE 16 PRO (Volumetric 3D Titanium Chassis with Curved Rounded Depth)
  // =========================================================================
  if (device === 'iphone-16-pro') {
    const frameWidth = isLandscape ? 740 : 360
    const frameHeight = isLandscape ? 360 : 740
    const outerRadius = 52
    const innerRadius = 44

    return (
      <div
        className="relative group transition-transform duration-150 select-none"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Contact Floor Shadow in 3D space */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-200"
            style={{
              width: `${frameWidth * 0.9}px`,
              height: `${45 + shadowDistance * 0.9}px`,
              bottom: `-${40 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, rgba(0, 0, 0, ${shadowOpacity * 0.4}) 50%, transparent 80%)`,
              filter: `blur(${shadowBlur * 0.6}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Back Plate & Camera Bump (at Z = -thickness) */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-150"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: `${outerRadius}px`,
            backgroundColor: appearance.color,
            transform: `translateZ(-${thickness}px)`,
            filter: 'brightness(0.75)',
            boxShadow: `
              inset 0 0 20px rgba(0,0,0,0.85),
              0 0 0 1px rgba(255,255,255,0.15)
            `,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Back Camera Bump Island */}
          {appearance.showCameraBump && !isLandscape && (
            <div
              className="absolute top-8 left-8 w-[136px] h-[136px] rounded-[34px] border border-white/15 p-3 flex flex-wrap gap-2 shadow-2xl"
              style={{
                transform: `translateZ(-${5}px)`,
                backgroundColor: appearance.color,
                filter: 'brightness(1.15)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-700 shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-zinc-900 border border-blue-900/60" />
              </div>
              <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-700 shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-zinc-900 border border-blue-900/60" />
              </div>
              <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-700 shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-zinc-900 border border-blue-900/60" />
              </div>
            </div>
          )}
        </div>

        {/* 3D Depth Slices Extrusion Stack (Perfect smooth rounded edges) */}
        {renderDepthSlices(frameWidth, frameHeight, outerRadius, 14)}

        {/* Side Hardware Buttons in 3D Depth Space */}
        {appearance.showSideButtons && !isLandscape && (
          <>
            {/* Left Side: Action Button */}
            <div
              className="absolute -left-[3.5px] top-[115px] w-[3.5px] h-[32px] rounded-l-xs pointer-events-none transition-colors"
              style={{
                backgroundColor: appearance.color,
                transform: `translateZ(-${thickness * 0.5}px)`,
                filter: 'brightness(1.2)',
                boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.8)',
              }}
            />
            {/* Left Side: Volume Up */}
            <div
              className="absolute -left-[3.5px] top-[160px] w-[3.5px] h-[52px] rounded-l-xs pointer-events-none transition-colors"
              style={{
                backgroundColor: appearance.color,
                transform: `translateZ(-${thickness * 0.5}px)`,
                filter: 'brightness(1.2)',
                boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.8)',
              }}
            />
            {/* Left Side: Volume Down */}
            <div
              className="absolute -left-[3.5px] top-[224px] w-[3.5px] h-[52px] rounded-l-xs pointer-events-none transition-colors"
              style={{
                backgroundColor: appearance.color,
                transform: `translateZ(-${thickness * 0.5}px)`,
                filter: 'brightness(1.2)',
                boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.8)',
              }}
            />

            {/* Right Side: Power Button */}
            <div
              className="absolute -right-[3.5px] top-[175px] w-[3.5px] h-[75px] rounded-r-xs pointer-events-none transition-colors"
              style={{
                backgroundColor: appearance.color,
                transform: `translateZ(-${thickness * 0.5}px)`,
                filter: 'brightness(1.2)',
                boxShadow: 'inset -1px 1px 1px rgba(255,255,255,0.4), inset 1px -1px 2px rgba(0,0,0,0.8)',
              }}
            />
            {/* Right Side: Camera Control */}
            <div
              className="absolute -right-[2.5px] top-[280px] w-[2.5px] h-[48px] rounded-r-xs pointer-events-none transition-colors"
              style={{
                backgroundColor: appearance.color,
                transform: `translateZ(-${thickness * 0.5}px)`,
                filter: 'brightness(0.9)',
                boxShadow: 'inset -1px 1px 1px rgba(255,255,255,0.3)',
              }}
            />
          </>
        )}

        {/* FRONT FACE (Z = 0px): Chassis Bezel, Screen & Glass Reflection */}
        <div
          className="relative transition-all duration-150"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            transform: 'translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Metallic Outer Chassis Ring */}
          <div
            className="w-full h-full relative overflow-hidden flex flex-col p-[11px]"
            style={{
              borderRadius: `${outerRadius}px`,
              backgroundColor: appearance.color,
              boxShadow: `
                0 0 0 1.5px rgba(255, 255, 255, 0.4),
                0 1px 3px rgba(0, 0, 0, 0.5),
                inset 0 0 0 1.5px rgba(255, 255, 255, 0.45),
                inset 0 2px 4px rgba(255, 255, 255, 0.3),
                inset 0 -3px 6px rgba(0, 0, 0, 0.8)
              `,
              backgroundImage: `linear-gradient(135deg, 
                rgba(255,255,255,0.4) 0%, 
                rgba(255,255,255,0.1) 35%, 
                rgba(0,0,0,0.3) 70%, 
                rgba(255,255,255,0.25) 100%)`,
            }}
          >
            {/* Inner Black Bezel Frame */}
            <div
              className="w-full h-full relative overflow-hidden bg-black flex flex-col"
              style={{
                borderRadius: `${innerRadius}px`,
                boxShadow: 'inset 0 0 0 2px #000000, inset 0 0 8px rgba(0,0,0,0.85)',
              }}
            >
              {/* Screen Content Layer */}
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{
                  backgroundColor: screen.screenBgColor || '#000000',
                }}
              >
                {/* Background Image / Screenshot */}
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-100"
                  style={screenImageStyle}
                />

                {/* iOS Top Status Bar */}
                {screen.showStatusBar && !isLandscape && (
                  <div
                    className={`relative z-20 px-8 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none ${
                      screen.statusBarStyle === 'dark' ? 'text-black' : 'text-white'
                    }`}
                  >
                    <span className="font-bold tracking-tight text-[13px]">
                      {screen.statusBarTime || '09:41'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <Signal className="w-3.5 h-3.5" />
                      <Wifi className="w-3.5 h-3.5" />
                      <Battery className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                )}

                {/* iPhone Dynamic Island */}
                {screen.showNotch && !isLandscape && (
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-2 bg-black rounded-full h-[28px] w-[106px] shadow-lg border border-white/5">
                    {/* Front Camera Lens */}
                    <div className="w-3 h-3 rounded-full bg-zinc-900 border border-blue-900/60 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500/80" />
                    </div>
                    {/* FaceID sensor */}
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-950/80" />
                  </div>
                )}

                {/* Top Speaker Ear Slit */}
                <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-30 w-14 h-[3.5px] rounded-full bg-zinc-900 border border-zinc-800" />

                {/* Glass Glare / Sheen Reflection */}
                {screen.showGlare && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(115deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.15) 28%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0) 100%)',
                      opacity: screen.glareOpacity / 100,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}

                {/* iOS Bottom Home Bar Indicator */}
                {!isLandscape && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-32 h-1 rounded-full bg-white/70 shadow-xs pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. ANDROID FLAGSHIP (Galaxy / Pixel)
  // =========================================================================
  if (device === 'android-flagship') {
    const frameWidth = isLandscape ? 740 : 360
    const frameHeight = isLandscape ? 360 : 740
    const outerRadius = 42
    const innerRadius = 34

    return (
      <div
        className="relative group transition-transform duration-150 select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floor Shadow */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: `${frameWidth * 0.9}px`,
              height: `${45 + shadowDistance * 0.9}px`,
              bottom: `-${40 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, transparent 75%)`,
              filter: `blur(${shadowBlur * 0.6}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Back Plate */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: `${outerRadius}px`,
            backgroundColor: appearance.color,
            transform: `translateZ(-${thickness}px)`,
            filter: 'brightness(0.75)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.85)',
          }}
        />

        {/* Depth Slices */}
        {renderDepthSlices(frameWidth, frameHeight, outerRadius, 12)}

        {/* Side Buttons */}
        {appearance.showSideButtons && !isLandscape && (
          <div
            className="absolute -right-[3px] top-[140px] w-[3px] h-[75px] rounded-r-xs pointer-events-none"
            style={{
              backgroundColor: appearance.color,
              transform: `translateZ(-${thickness * 0.5}px)`,
              filter: 'brightness(1.2)',
              boxShadow: 'inset -1px 1px 1px rgba(255,255,255,0.4)',
            }}
          />
        )}

        {/* Front Face */}
        <div
          className="relative"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            transform: 'translateZ(0px)',
          }}
        >
          <div
            className="w-full h-full relative overflow-hidden flex flex-col p-[8px]"
            style={{
              borderRadius: `${outerRadius}px`,
              backgroundColor: appearance.color,
              boxShadow: `
                0 0 0 1.5px rgba(255, 255, 255, 0.35),
                inset 0 0 0 1px rgba(255,255,255,0.4),
                inset 0 -2px 4px rgba(0,0,0,0.6)
              `,
              backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.4) 100%)`,
            }}
          >
            <div
              className="w-full h-full relative overflow-hidden bg-black flex flex-col"
              style={{ borderRadius: `${innerRadius}px` }}
            >
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{ backgroundColor: screen.screenBgColor || '#000000' }}
              >
                <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

                {/* Status Bar */}
                {screen.showStatusBar && !isLandscape && (
                  <div
                    className={`relative z-20 px-6 pt-2 pb-1 flex items-center justify-between text-xs font-medium select-none ${
                      screen.statusBarStyle === 'dark' ? 'text-black' : 'text-white'
                    }`}
                  >
                    <span>{screen.statusBarTime || '10:00'}</span>
                    <div className="flex items-center space-x-1.5">
                      <Signal className="w-3.5 h-3.5" />
                      <Wifi className="w-3.5 h-3.5" />
                      <Battery className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                )}

                {/* Centered Punch-hole Camera */}
                {screen.showNotch && !isLandscape && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-4 h-4 rounded-full bg-black border border-zinc-700 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600/70" />
                  </div>
                )}

                {/* Glare */}
                {screen.showGlare && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(120deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.1) 35%, transparent 50%)',
                      opacity: screen.glareOpacity / 100,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 3. MACBOOK PRO 16" (100% Solid Seamless 3D Unibody Clamshell)
  // =========================================================================
  if (device === 'macbook-pro') {
    const screenWidth = 700
    const screenHeight = 440
    const lidThickness = Math.max(8, Math.round(thickness * 0.55))
    const deckDepth = 340
    const deckThickness = Math.max(14, thickness)
    const deckRadius = 16
    const lidRadius = 18
    const openAngle = appearance.laptopLidAngle || 105
    // Angle to rotate keyboard deck forward relative to the screen lid (around hinge)
    const deckRotateX = 180 - openAngle

    return (
      <div
        className="relative group transition-transform duration-150 select-none flex flex-col items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Contact Floor Shadow under base deck */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-200"
            style={{
              width: `${screenWidth * 1.08}px`,
              height: `${60 + shadowDistance * 0.8}px`,
              bottom: `-${50 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.5}) 0%, rgba(0, 0, 0, ${shadowOpacity * 0.4}) 50%, transparent 80%)`,
              filter: `blur(${shadowBlur * 0.7}px)`,
              transform: `translateZ(-${deckThickness + 30}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* 1. DISPLAY LID (SCREEN) */}
        <div
          className="relative flex flex-col items-center z-10"
          style={{
            width: `${screenWidth}px`,
            height: `${screenHeight}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Back Lid Shell (at Z = -lidThickness) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[18px]"
            style={{
              transform: `translateZ(-${lidThickness}px)`,
              backgroundColor: appearance.color,
              filter: 'brightness(0.75)',
              boxShadow: 'inset 0 0 24px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />

          {/* Smooth Dense Depth Slices for Display Lid */}
          {renderDepthSlices(screenWidth, screenHeight, lidRadius, 16)}

          {/* Front Display Lid Face (Z = 0) */}
          <div
            className="absolute inset-0 overflow-hidden flex flex-col p-[9px] rounded-[18px] z-20"
            style={{
              transform: 'translateZ(0px)',
              backgroundColor: appearance.color,
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.4),
                inset 0 1.5px 2px rgba(255,255,255,0.6),
                inset 0 -1px 2px rgba(0,0,0,0.5)
              `,
            }}
          >
            {/* Display Bezel */}
            <div
              className="w-full h-full relative overflow-hidden bg-black flex flex-col rounded-[12px]"
              style={{
                boxShadow: 'inset 0 0 0 1px #000, inset 0 0 6px rgba(0,0,0,0.9)',
              }}
            >
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{ backgroundColor: screen.screenBgColor || '#000000' }}
              >
                <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

                {/* MacBook Camera Notch */}
                {screen.showNotch && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-36 h-5 rounded-b-xl bg-black flex items-center justify-center space-x-2 px-3 shadow-md border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-900/90 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-cyan-400" />
                      </div>
                    </div>
                    {/* TrueTone sensor */}
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    {/* Green Camera Indicator LED */}
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-xs shadow-emerald-400" />
                  </div>
                )}

                {/* Glass Glare */}
                {screen.showGlare && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 40%, transparent 60%)',
                      opacity: screen.glareOpacity / 100,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SOLID SEAMLESS HINGE BAR */}
        <div
          className="relative z-20 flex items-center justify-center -mt-[4px] pointer-events-none"
          style={{
            width: `${screenWidth}px`,
            height: '14px',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(-4px)',
          }}
        >
          <div
            className="h-3.5 rounded-full shadow-2xl"
            style={{
              width: `${screenWidth - 20}px`,
              background: 'linear-gradient(180deg, #2b2d35 0%, #121418 35%, #050608 70%, #1e2026 100%)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.95), inset 0 1px 1px rgba(255,255,255,0.3)',
              border: '1px solid rgba(0,0,0,0.9)',
            }}
          />
        </div>

        {/* 3. SOLID ENCLOSED KEYBOARD BASE DECK */}
        <div
          className="relative z-30 transition-all duration-150 -mt-[10px]"
          style={{
            width: `${screenWidth}px`,
            height: `${deckDepth}px`,
            transformOrigin: 'top center',
            transform: `rotateX(${deckRotateX}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* A. SOLID BOTTOM BASE PLATE (Z = -deckThickness) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[16px]"
            style={{
              transform: `translateZ(-${deckThickness}px)`,
              backgroundColor: appearance.color,
              filter: 'brightness(0.68)',
              backgroundImage: `linear-gradient(180deg, 
                rgba(0,0,0,0.5) 0%, 
                rgba(255,255,255,0.06) 50%, 
                rgba(0,0,0,0.6) 100%)`,
              boxShadow: `
                0 25px 50px rgba(0,0,0,0.95),
                inset 0 0 35px rgba(0,0,0,0.85)
              `,
            }}
          >
            {/* 4 Clean Black Rubber Feet Pads */}
            <div className="absolute top-4 left-7 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>
            <div className="absolute top-4 right-7 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>
            <div className="absolute bottom-5 left-7 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>
            <div className="absolute bottom-5 right-7 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>
          </div>

          {/* B. ULTRA-DENSE SMOOTH ROUNDED DEPTH SLICES (24 Slices for 100% Solid Extrusion with Zero Gaps) */}
          {renderDepthSlices(screenWidth, deckDepth, deckRadius, 24)}

          {/* C. TOP DECK SURFACE (Z = 0) */}
          <div
            className="absolute inset-0 z-20 flex flex-col justify-between p-3.5 rounded-[16px] overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
              backgroundColor: appearance.color,
              backgroundImage: `linear-gradient(180deg, 
                rgba(255,255,255,0.35) 0%, 
                rgba(255,255,255,0.08) 15%, 
                rgba(0,0,0,0.15) 60%, 
                rgba(0,0,0,0.45) 100%)`,
              boxShadow: `
                0 0 0 1px rgba(255, 255, 255, 0.4),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.6),
                inset 0 -3px 6px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {/* Top Deck: Speakers + Keyboard Well */}
            <div className="w-full flex items-center justify-between gap-3 px-1 relative z-20">
              {/* Left Speaker Grille */}
              <div
                className="w-8 h-32 rounded-md opacity-35 pointer-events-none hidden sm:block"
                style={{
                  backgroundImage: 'radial-gradient(#000000 35%, transparent 35%)',
                  backgroundSize: '3px 3px',
                }}
              />

              {/* Keyboard Well */}
              <div
                className="flex-1 bg-[#090b0e] rounded-xl p-2 shadow-2xl border border-zinc-900 flex flex-col justify-between gap-1.5"
                style={{
                  boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.95), 0 1px 2px rgba(255,255,255,0.15)',
                }}
              >
                {/* Row 1: Function Keys */}
                <div className="flex gap-1 h-4">
                  <div className="w-8 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[6px] text-zinc-400 flex items-center justify-center font-mono">esc</div>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[6px] text-zinc-500 flex items-center justify-center font-mono">
                      F{i + 1}
                    </div>
                  ))}
                  {/* Touch ID / Power Key */}
                  <div className="w-8 bg-[#1c1e24] rounded-xs border border-zinc-800 flex items-center justify-center shadow-xs">
                    <div className="w-2.5 h-2.5 rounded-full border border-zinc-600 bg-zinc-900" />
                  </div>
                </div>

                {/* Row 2: Number Row */}
                <div className="flex gap-1 h-5">
                  {['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'delete'].map((k, i) => (
                    <div
                      key={i}
                      className={`bg-[#1c1e24] rounded-xs border border-zinc-800 text-[8px] text-zinc-300 flex items-center justify-center font-medium shadow-xs ${
                        k === 'delete' ? 'w-11' : 'flex-1'
                      }`}
                    >
                      {k}
                    </div>
                  ))}
                </div>

                {/* Row 3: QWERTY */}
                <div className="flex gap-1 h-5">
                  {['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'].map((k, i) => (
                    <div
                      key={i}
                      className={`bg-[#1c1e24] rounded-xs border border-zinc-800 text-[8px] text-zinc-300 flex items-center justify-center font-medium shadow-xs ${
                        k === 'tab' ? 'w-10' : 'flex-1'
                      }`}
                    >
                      {k}
                    </div>
                  ))}
                </div>

                {/* Row 4: ASDF */}
                <div className="flex gap-1 h-5">
                  {['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'return'].map((k, i) => (
                    <div
                      key={i}
                      className={`bg-[#1c1e24] rounded-xs border border-zinc-800 text-[8px] text-zinc-300 flex items-center justify-center font-medium shadow-xs ${
                        k === 'caps' ? 'w-11' : k === 'return' ? 'w-11' : 'flex-1'
                      }`}
                    >
                      {k}
                    </div>
                  ))}
                </div>

                {/* Row 5: ZXCV */}
                <div className="flex gap-1 h-5">
                  {['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'shift'].map((k, i) => (
                    <div
                      key={i}
                      className={`bg-[#1c1e24] rounded-xs border border-zinc-800 text-[8px] text-zinc-300 flex items-center justify-center font-medium shadow-xs ${
                        k === 'shift' ? 'w-12' : 'flex-1'
                      }`}
                    >
                      {k}
                    </div>
                  ))}
                </div>

                {/* Row 6: Spacebar & Modifiers */}
                <div className="flex gap-1 h-5">
                  <div className="w-7 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">fn</div>
                  <div className="w-7 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">ctrl</div>
                  <div className="w-7 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">opt</div>
                  <div className="w-9 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">cmd</div>
                  <div className="flex-1 bg-[#1c1e24] rounded-xs border border-zinc-800 shadow-xs" />
                  <div className="w-9 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">cmd</div>
                  <div className="w-7 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">opt</div>
                  <div className="w-10 bg-[#1c1e24] rounded-xs border border-zinc-800 text-[7px] text-zinc-400 flex items-center justify-center">◀ ▼ ▶</div>
                </div>
              </div>

              {/* Right Speaker Grille */}
              <div
                className="w-8 h-32 rounded-md opacity-35 pointer-events-none hidden sm:block"
                style={{
                  backgroundImage: 'radial-gradient(#000000 35%, transparent 35%)',
                  backgroundSize: '3px 3px',
                }}
              />
            </div>

            {/* Bottom Deck: Force Touch Trackpad */}
            <div
              className="w-56 h-24 rounded-xl border border-white/20 bg-black/15 my-1.5 mx-auto flex items-center justify-center shadow-xs relative z-20"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.2)',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 4. STUDIO DISPLAY 5K / iMAC
  // =========================================================================
  if (device === 'studio-display') {
    const screenWidth = 740
    const screenHeight = 440

    return (
      <div
        className="relative group transition-transform duration-150 select-none flex flex-col items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floor Shadow */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: `${screenWidth * 0.95}px`,
              height: `${60 + shadowDistance * 0.9}px`,
              bottom: `-${50 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, transparent 75%)`,
              filter: `blur(${shadowBlur * 0.7}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Depth Slices */}
        {renderDepthSlices(screenWidth, screenHeight, 16, 8)}

        {/* Display Panel Front Face */}
        <div
          className="relative overflow-hidden flex flex-col p-[8px] z-10"
          style={{
            width: `${screenWidth}px`,
            height: `${screenHeight}px`,
            borderRadius: '16px',
            backgroundColor: appearance.color,
            boxShadow: `
              0 0 0 1.5px rgba(255, 255, 255, 0.35),
              inset 0 1px 2px rgba(255,255,255,0.4)
            `,
          }}
        >
          <div
            className="w-full h-full relative overflow-hidden bg-black flex flex-col"
            style={{ borderRadius: '10px' }}
          >
            <div
              className="w-full h-full relative overflow-hidden flex flex-col"
              style={{ backgroundColor: screen.screenBgColor || '#000000' }}
            >
              <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

              {/* Webcam */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-2.5 h-2.5 rounded-full bg-black border border-zinc-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-600/80" />
              </div>

              {/* Glare */}
              {screen.showGlare && (
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.06) 45%, transparent 60%)',
                    opacity: screen.glareOpacity / 100,
                    mixBlendMode: 'screen',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stand Neck */}
        <div
          className="w-24 h-24 -mt-2 z-0"
          style={{
            background: 'linear-gradient(180deg, #334155 0%, #64748b 50%, #94a3b8 100%)',
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)',
          }}
        />

        {/* Stand Foot Base */}
        <div
          className="w-64 h-4 rounded-t-md -mt-1 z-10"
          style={{
            background: 'linear-gradient(180deg, #94a3b8 0%, #64748b 60%, #475569 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5)',
          }}
        />
      </div>
    )
  }

  // =========================================================================
  // 5. IPAD PRO 12.9"
  // =========================================================================
  if (device === 'ipad-pro') {
    const frameWidth = isLandscape ? 720 : 540
    const frameHeight = isLandscape ? 540 : 720
    const outerRadius = 38
    const innerRadius = 28

    return (
      <div
        className="relative group transition-transform duration-150 select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floor Shadow */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: `${frameWidth * 0.9}px`,
              height: `${45 + shadowDistance * 0.8}px`,
              bottom: `-${40 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, transparent 75%)`,
              filter: `blur(${shadowBlur * 0.6}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Back Plate */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: `${outerRadius}px`,
            backgroundColor: appearance.color,
            transform: `translateZ(-${thickness}px)`,
            filter: 'brightness(0.75)',
          }}
        />

        {/* Depth Slices */}
        {renderDepthSlices(frameWidth, frameHeight, outerRadius, 8)}

        {/* Front Face */}
        <div
          className="relative"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            transform: 'translateZ(0px)',
          }}
        >
          <div
            className="w-full h-full relative overflow-hidden flex flex-col p-[12px]"
            style={{
              borderRadius: `${outerRadius}px`,
              backgroundColor: appearance.color,
              boxShadow: `
                0 0 0 1.5px rgba(255, 255, 255, 0.35),
                inset 0 1px 2px rgba(255,255,255,0.4)
              `,
            }}
          >
            <div
              className="w-full h-full relative overflow-hidden bg-black flex flex-col"
              style={{ borderRadius: `${innerRadius}px` }}
            >
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{ backgroundColor: screen.screenBgColor || '#000000' }}
              >
                <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

                {/* Camera dot */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700" />

                {/* Glare */}
                {screen.showGlare && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(125deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.1) 35%, transparent 55%)',
                      opacity: screen.glareOpacity / 100,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 6. BROWSER WINDOW
  // =========================================================================
  if (device === 'browser-window') {
    const frameWidth = 760
    const frameHeight = 490

    return (
      <div
        className="relative group transition-transform duration-150 select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floor Shadow */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: `${frameWidth * 0.95}px`,
              height: `${50 + shadowDistance * 0.8}px`,
              bottom: `-${40 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, transparent 75%)`,
              filter: `blur(${shadowBlur * 0.6}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Depth Slices */}
        {renderDepthSlices(frameWidth, frameHeight, 16, 6)}

        <div
          className="relative overflow-hidden flex flex-col"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            borderRadius: '16px',
            backgroundColor: '#18181b',
            transform: 'translateZ(0px)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.2),
              0 20px 45px rgba(0, 0, 0, 0.6)
            `,
          }}
        >
          {/* macOS Browser Header */}
          <div className="bg-[#1f242d] border-b border-zinc-700/60 px-4 py-3 flex items-center justify-between select-none">
            {/* Traffic Lights */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-xs" />
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-md mx-4 bg-[#11141a] rounded-lg px-3 py-1.5 flex items-center justify-center space-x-2 text-xs text-zinc-400 border border-zinc-800">
              <span className="text-zinc-500">🔒</span>
              <span className="font-mono text-[11px] text-zinc-300">https://my-awesome-app.com</span>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-2 text-zinc-500 text-xs">
              <span>⚡</span>
              <span>⠇</span>
            </div>
          </div>

          {/* Browser Content Area */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{ backgroundColor: screen.screenBgColor || '#000000' }}
          >
            <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

            {/* Glare */}
            {screen.showGlare && (
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background:
                    'linear-gradient(130deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)',
                  opacity: screen.glareOpacity / 100,
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 7. APPLE WATCH ULTRA
  // =========================================================================
  if (device === 'apple-watch') {
    const frameWidth = 320
    const frameHeight = 390
    const outerRadius = 48
    const innerRadius = 38

    return (
      <div
        className="relative group transition-transform duration-150 select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Floor Shadow */}
        {appearance.shadowType !== 'none' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: `${frameWidth * 0.9}px`,
              height: `${35 + shadowDistance * 0.8}px`,
              bottom: `-${35 + shadowDistance * 0.5}px`,
              background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${shadowOpacity * 1.3}) 0%, transparent 75%)`,
              filter: `blur(${shadowBlur * 0.6}px)`,
              transform: `translateZ(-${thickness + 20}px) translateY(${shadowDistance}px)`,
            }}
          />
        )}

        {/* Strap Connectors */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-8 rounded-t-xl bg-zinc-800 border-t border-white/20" />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 rounded-b-xl bg-zinc-800 border-b border-white/20" />

        {/* Depth Slices */}
        {renderDepthSlices(frameWidth, frameHeight, outerRadius, 10)}

        <div
          className="relative"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            transform: 'translateZ(0px)',
          }}
        >
          {/* Digital Crown on Right */}
          <div
            className="absolute -right-3.5 top-[80px] w-4 h-16 rounded-r-md bg-zinc-700 border-r border-t border-b border-white/30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #52525b, #52525b 2px, #3f3f46 2px, #3f3f46 4px)',
            }}
          />
          {/* Action Button on Left */}
          <div className="absolute -left-2.5 top-[100px] w-3 h-12 rounded-l-md bg-orange-600 border border-orange-500" />

          {/* Watch Case */}
          <div
            className="w-full h-full relative overflow-hidden flex flex-col p-[10px]"
            style={{
              borderRadius: `${outerRadius}px`,
              backgroundColor: appearance.color,
              boxShadow: `
                0 0 0 1.5px rgba(255, 255, 255, 0.4),
                inset 0 1px 2px rgba(255,255,255,0.4)
              `,
            }}
          >
            <div
              className="w-full h-full relative overflow-hidden bg-black flex flex-col"
              style={{ borderRadius: `${innerRadius}px` }}
            >
              <div
                className="w-full h-full relative overflow-hidden flex flex-col"
                style={{ backgroundColor: screen.screenBgColor || '#000000' }}
              >
                <div className="absolute inset-0 w-full h-full" style={screenImageStyle} />

                {/* Glare */}
                {screen.showGlare && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.12) 35%, transparent 55%)',
                      opacity: screen.glareOpacity / 100,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
