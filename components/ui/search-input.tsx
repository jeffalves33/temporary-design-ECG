"use client"

import { Search } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-foreground-muted)" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-(--color-border) rounded-lg text-(--color-foreground) placeholder:text-(--color-foreground-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent transition-all"
      />
    </div>
  )
}
