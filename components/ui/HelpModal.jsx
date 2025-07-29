'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Keyboard } from 'lucide-react'

export function HelpModal({ showHelp, setShowHelp }) {
  if (!showHelp) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-md border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-blue-400" />
              Keyboard Shortcuts
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Start/Stop Engine</span>
              <div className="px-2 py-1 rounded border bg-blue-600/20 border-blue-400/30 text-blue-400 text-xs">E</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Reset All</span>
              <div className="px-2 py-1 rounded border bg-red-600/20 border-red-400/30 text-red-400 text-xs">R</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Park Gear</span>
              <div className="px-2 py-1 rounded border bg-purple-600/20 border-purple-400/30 text-purple-400 text-xs">P</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Drive Gear</span>
              <div className="px-2 py-1 rounded border bg-purple-600/20 border-purple-400/30 text-purple-400 text-xs">D</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Manual Gears</span>
              <div className="flex gap-1">
                {['1', '2', '3', '4', '5'].map(gear => (
                  <div key={gear} className="px-2 py-1 rounded border bg-purple-600/20 border-purple-400/30 text-purple-400 text-xs">
                    {gear}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Accelerator Pedal</span>
              <div className="flex gap-1">
                <div className="px-2 py-1 rounded border bg-green-600/20 border-green-400/30 text-green-400 text-xs">W</div>
                <div className="px-2 py-1 rounded border bg-green-600/20 border-green-400/30 text-green-400 text-xs">↑</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Brake Pedal</span>
              <div className="px-2 py-1 rounded border bg-red-600/20 border-red-400/30 text-red-400 text-xs">Space</div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Use mouse to rotate, zoom, and pan the 3D view
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}