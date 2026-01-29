"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-24 h-9 bg-gray-100 rounded-full animate-pulse" />
  }

  return (
    <div className="flex items-center p-1 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700">
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'system' 
            ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' 
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="System Theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'light' 
            ? 'bg-white shadow-sm text-amber-500' 
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'dark' 
            ? 'bg-zinc-600 shadow-sm text-indigo-400' 
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
