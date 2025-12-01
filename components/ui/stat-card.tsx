"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-(--color-primary)",
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-4 border border-(--color-border) shadow-sm",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-(--color-foreground-secondary) font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-(--color-foreground) mb-1">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-(--color-success)" : "text-(--color-error)",
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconColor.includes("primary") ? "bg-(--color-primary-light)" : "bg-(--color-background-tertiary)",
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
