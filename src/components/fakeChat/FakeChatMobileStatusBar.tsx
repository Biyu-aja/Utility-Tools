/**
 * Folder: src/components/fakeChat/
 * Description: Stores UI components for the Fake WhatsApp Chat generator.
 * This file: FakeChatMobileStatusBar.tsx (Renders mobile status bar for iOS/Android).
 */

import React from 'react'
import type { MobileStatusBarConfig, PlatformType, ThemeType } from '../../types/fakeChat'
import { Wifi, BatteryCharging } from 'lucide-react'

interface Props {
  config: MobileStatusBarConfig
  platform: PlatformType
  theme: ThemeType
}

export const FakeChatMobileStatusBar: React.FC<Props> = ({ config, platform, theme }) => {
  if (!config.showStatusBar) return null

  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-white' : 'text-zinc-900'

  return (
    <div className={`w-full px-5 pt-3 pb-1 select-none flex items-center justify-between text-xs font-semibold ${textColor} tracking-tight relative z-20`}>
      {/* Dynamic Island / Notch for iOS */}
      {config.showNotch && platform === 'ios' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 shadow-sm pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-blue-950/60" />
        </div>
      )}

      {/* Android Punch Hole Camera */}
      {config.showNotch && platform === 'android' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full border border-zinc-900 pointer-events-none" />
      )}

      {/* Left: Time */}
      <div className="flex items-center space-x-1 font-medium tracking-normal text-[13px]">
        <span>{config.time}</span>
      </div>

      {/* Right: Network, WiFi, Battery */}
      <div className="flex items-center space-x-2">
        {/* Signal Bars */}
        <div className="flex items-end space-x-0.5 h-3">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-0.5 rounded-xs ${
                bar <= config.signalStrength
                  ? isDark
                    ? 'bg-white'
                    : 'bg-zinc-900'
                  : isDark
                  ? 'bg-white/30'
                  : 'bg-zinc-300'
              }`}
              style={{ height: `${bar * 25}%` }}
            />
          ))}
        </div>

        {/* Network Tag */}
        <span className="text-[10px] font-bold">{config.networkType}</span>

        {/* WiFi Icon */}
        {config.showWifi && <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />}

        {/* Battery Indicator */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-medium">{config.batteryPercentage}%</span>
          <div className="relative w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
            {config.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 absolute inset-0 m-auto text-emerald-500" />
            ) : (
              <div
                className={`h-full rounded-2xs ${
                  config.batteryPercentage <= 20
                    ? 'bg-red-500'
                    : isDark
                    ? 'bg-white'
                    : 'bg-zinc-900'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, config.batteryPercentage))}%` }}
              />
            )}
            {/* Battery Nipple */}
            <div className="absolute -right-1 top-0.5 bottom-0.5 w-0.5 bg-current rounded-r-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}
