"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  onClear?: () => void
}

export function FilterChip({ label, value, options, onChange, onClear }: FilterChipProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-(--color-foreground-secondary)">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full border transition-colors",
              value === option.value
                ? "bg-(--color-primary) text-white border-(--color-primary)"
                : "bg-white text-(--color-foreground) border-(--color-border) hover:border-(--color-primary)",
            )}
          >
            {option.label}
          </button>
        ))}
        {value && onClear && (
          <button
            onClick={onClear}
            className="px-2 py-1.5 text-sm font-medium rounded-full border border-(--color-border) bg-white text-(--color-foreground-secondary) hover:bg-(--color-background-tertiary) transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>
    </div>
  )
}
