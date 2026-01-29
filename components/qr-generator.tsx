"use client"

import React, { useState, useEffect } from "react"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"
import { X, Printer, FileImage, FileCode } from "lucide-react"

interface QRGeneratorProps {
  url: string
  label: string
  carName: string
  vehicleNumber: string
  logoBase64: string | null
  onClose: () => void
}

type PrintSize = 'sticker' | 'card' | 'flyer'

export function QRGenerator({ url, label, carName, vehicleNumber, logoBase64, onClose }: QRGeneratorProps) {
  const [size, setSize] = useState<PrintSize>('card')
  const [svgContent, setSvgContent] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  // Generate QR Data URL once
  useEffect(() => {
    QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 1, width: 1000, color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [url])

  // Generate SVG when dependencies change
  useEffect(() => {
    if (!qrDataUrl) return

    const generateSVG = () => {
      let width = 400
      let height = 600
      let content = ''

      if (size === 'sticker') {
        // Sticker: 300x300 Square (Compact)
        width = 400
        height = 400
        content = `
          <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="white" />
          <rect x="8" y="8" width="${width-16}" height="${height-16}" rx="16" fill="none" stroke="#000000" stroke-width="4" />
          
          <!-- Logo for Sticker -->
          ${logoBase64 ? `<image href="${logoBase64}" x="${(width-280)/2}" y="20" width="280" height="80" preserveAspectRatio="xMidYMid meet" />` : ''}
          
          <image href="${qrDataUrl}" x="${(width-200)/2}" y="110" width="200" height="200" />
          
          <text x="${width/2}" y="340" font-family="Arial, sans-serif" font-weight="bold" font-size="28" text-anchor="middle" fill="black">${vehicleNumber}</text>
          <text x="${width/2}" y="370" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666">ParkSignal</text>
        `
      } else if (size === 'card') {
        // ID Card: 400x600 Portrait (More space for logo)
        width = 400
        height = 600
        content = `
          <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="white" />
          <rect x="12" y="12" width="${width-24}" height="${height-24}" rx="16" fill="none" stroke="#000000" stroke-width="6" />
          
          <!-- Logo Container: Increased height and size for better aspect ratio -->
          ${logoBase64 ? `<image href="${logoBase64}" x="${(width-360)/2}" y="30" width="360" height="120" preserveAspectRatio="xMidYMid meet" />` : ''}
          
          <!-- QR Code pushed down to accommodate larger logo -->
          <image href="${qrDataUrl}" x="${(width-280)/2}" y="170" width="280" height="280" />
          
          <text x="${width/2}" y="480" font-family="Arial, sans-serif" font-weight="bold" font-size="28" text-anchor="middle" fill="black">Scan to Call Owner</text>
          
          <text x="${width/2}" y="520" font-family="monospace" font-weight="bold" font-size="24" text-anchor="middle" fill="#333">${vehicleNumber}</text>
          <text x="${width/2}" y="545" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#555">${carName}</text>
          
          <text x="${width/2}" y="575" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#888">Powered by ParkSignal</text>
        `
      } else if (size === 'flyer') {
        // Flyer: A4-ish ratio (Big Logo)
        width = 600
        height = 850 
        content = `
          <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
          <rect x="20" y="20" width="${width-40}" height="${height-40}" rx="0" fill="none" stroke="#000000" stroke-width="10" />
          
          <!-- Large Logo Area: Significantly increased size for heading look -->
          ${logoBase64 ? `<image href="${logoBase64}" x="${(width-540)/2}" y="40" width="540" height="180" preserveAspectRatio="xMidYMid meet" />` : ''}
          
          <text x="${width/2}" y="250" font-family="Arial, sans-serif" font-weight="bold" font-size="42" text-anchor="middle" fill="black">VEHICLE PARKED HERE?</text>
          <text x="${width/2}" y="300" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#444">Scan below to contact the owner</text>
          
          <image href="${qrDataUrl}" x="${(width-400)/2}" y="330" width="400" height="400" />
          
          <text x="${width/2}" y="770" font-family="monospace" font-weight="bold" font-size="48" text-anchor="middle" fill="black">${vehicleNumber}</text>
          <text x="${width/2}" y="820" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666">Privacy Protected Call by ParkSignal</text>
        `
      }

      setSvgContent(`
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          ${content}
        </svg>
      `.trim())
    }

    generateSVG()
  }, [size, qrDataUrl, logoBase64, label, carName, vehicleNumber])

  const downloadFile = (format: 'png' | 'svg' | 'pdf') => {
    if (!svgContent) return

    const filename = `parksignal-${vehicleNumber.replace(/\s+/g, '-')}-${size}`

    if (format === 'svg') {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.svg`
      link.click()
    } else if (format === 'png') {
      const img = new window.Image()
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // High res for PNG
        const scale = 2 
        const svgWidth = parseInt(svgContent.match(/width="(\d+)"/)?.[1] || '400')
        const svgHeight = parseInt(svgContent.match(/height="(\d+)"/)?.[1] || '600')
        
        canvas.width = svgWidth * scale
        canvas.height = svgHeight * scale
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)
          const link = document.createElement('a')
          link.href = canvas.toDataURL('image/png')
          link.download = `${filename}.png`
          link.click()
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    } else if (format === 'pdf') {
      // PDF Dimensions in mm
      let pdfW, pdfH
      if (size === 'sticker') { pdfW = 80; pdfH = 80; }
      else if (size === 'card') { pdfW = 100; pdfH = 150; }
      else { pdfW = 210; pdfH = 297; } // A4

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH]
      })

      const img = new window.Image()
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const svgWidth = parseInt(svgContent.match(/width="(\d+)"/)?.[1] || '400')
        const svgHeight = parseInt(svgContent.match(/height="(\d+)"/)?.[1] || '600')
        canvas.width = svgWidth * 2
        canvas.height = svgHeight * 2
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.scale(2, 2)
          ctx.drawImage(img, 0, 0)
          const pngData = canvas.toDataURL('image/png')
          doc.addImage(pngData, 'PNG', 0, 0, pdfW, pdfH)
          doc.save(`${filename}.pdf`)
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Preview Section */}
        <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-8 flex items-center justify-center overflow-auto min-h-[400px] relative">
           <div className="absolute top-4 left-4 text-xs font-mono text-zinc-400">Preview</div>
           <div 
            className="shadow-xl transition-all duration-300 bg-white"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{ 
              transform: 'scale(0.8)', 
              transformOrigin: 'center center' 
            }}
          />
        </div>

        {/* Controls Section */}
        <div className="w-full md:w-80 bg-white dark:bg-zinc-900 p-6 flex flex-col border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Download QR</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* Size Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                1. Select Layout
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setSize('sticker')}
                  className={`flex items-center p-3 rounded-lg border text-left transition-all ${size === 'sticker' ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                >
                  <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 mr-3 flex items-center justify-center text-xs font-bold">S</div>
                  <div>
                    <div className="font-medium text-sm">Sticker (Square)</div>
                    <div className="text-xs opacity-70">For windshields (80x80mm)</div>
                  </div>
                </button>
                <button 
                  onClick={() => setSize('card')}
                  className={`flex items-center p-3 rounded-lg border text-left transition-all ${size === 'card' ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                >
                  <div className="w-8 h-10 rounded bg-zinc-200 dark:bg-zinc-700 mr-3 flex items-center justify-center text-xs font-bold">M</div>
                  <div>
                    <div className="font-medium text-sm">ID Card (Portrait)</div>
                    <div className="text-xs opacity-70">For dashboard (100x150mm)</div>
                  </div>
                </button>
                <button 
                  onClick={() => setSize('flyer')}
                  className={`flex items-center p-3 rounded-lg border text-left transition-all ${size === 'flyer' ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                >
                  <div className="w-8 h-12 rounded bg-zinc-200 dark:bg-zinc-700 mr-3 flex items-center justify-center text-xs font-bold">L</div>
                  <div>
                    <div className="font-medium text-sm">Poster (A4)</div>
                    <div className="text-xs opacity-70">For walls/pillars</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Download Buttons */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                2. Download Format
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => downloadFile('pdf')}
                  className="flex items-center justify-center w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Download PDF (Print)
                </button>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                    onClick={() => downloadFile('png')}
                    className="flex items-center justify-center py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    PNG
                  </button>
                  <button 
                    onClick={() => downloadFile('svg')}
                    className="flex items-center justify-center py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
