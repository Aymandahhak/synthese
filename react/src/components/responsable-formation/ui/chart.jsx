"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" }

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider")
  }
  return context
}

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const gradientId = `gradient-${id || uniqueId}`
  const chartStyles = Object.entries(config ?? {}).reduce((styles, [key, value]) => {
    if (!value) return styles

    const cssProperty = value.color
      ? `--chart-${key}`
      : Object.entries(value.theme).reduce((properties, [theme, color]) => {
          properties[`${THEMES[theme]} [data-chart] [data-layer="${key}"]`] = {
            "--chart-value": color,
          }
          return properties
        }, {})

    return { ...styles, ...(typeof cssProperty === "string" ? { [key]: cssProperty } : cssProperty) }
  }, {})

  return (
    <ChartContext.Provider value={{ config }}>
      {Object.keys(chartStyles).length > 0 && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {${Object.entries(chartStyles)
              .map(([key, value]) => (typeof value === "string" ? `${value}: var(--${key})` : ""))
              .filter(Boolean)
              .join(";")}}

${Object.entries(chartStyles)
  .map(([key, value]) => (typeof value === "object" ? Object.entries(value).map(([k, v]) => `${k} { ${Object.entries(v).map(([p, val]) => `${p}: ${val}`).join(";")} }`).join("\n") : ""))
  .filter(Boolean)
  .join("\n")}`,
          }}
        />
      )}
      <RechartsPrimitive.ResponsiveContainer {...props} ref={ref} className={cn("relative", className)}>
        <React.Fragment>
          <defs>
            {Object.entries(config ?? {}).map(([key, value]) => {
              if (!value?.color) return null

              return (
                <React.Fragment key={key}>
                  {typeof value.color === "string" ? (
                    <linearGradient id={`${gradientId}-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={`hsl(var(--chart-${key}))`} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={`hsl(var(--chart-${key}))`} stopOpacity={0} />
                    </linearGradient>
                  ) : (
                    <pattern id={`pattern-${key}`} patternUnits="userSpaceOnUse" width={4} height={4}>
                      <path d="M 0 0 L 4 4 M 4 0 L 0 4" strokeWidth={1} stroke="var(--chart-value)" />
                    </pattern>
                  )}
                </React.Fragment>
              )
            })}
          </defs>
          {children}
        </React.Fragment>
      </RechartsPrimitive.ResponsiveContainer>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn("text-sm font-medium text-muted-foreground", className)} {...props} />
))
ChartTitle.displayName = "ChartTitle"

const ChartDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
ChartDescription.displayName = "ChartDescription"

const ChartHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-between gap-4", className)} {...props} />
))
ChartHeader.displayName = "ChartHeader"

const ChartHeaderDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex justify-between gap-8", className)} {...props} />
))
ChartHeaderDescription.displayName = "ChartHeaderDescription"

const ChartValueDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-2", className)} {...props} />
))
ChartValueDescription.displayName = "ChartValueDescription"

const ChartValueTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-medium", className)} {...props} />
))
ChartValueTitle.displayName = "ChartValueTitle"

const ChartValue = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-2xl font-bold", className)} {...props} />
))
ChartValue.displayName = "ChartValue"

const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props} />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipColumn = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props} />
))
ChartTooltipColumn.displayName = "ChartTooltipColumn"

const ChartTooltipValue = React.forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("text-right tabular-nums", className)} {...props} />
))
ChartTooltipValue.displayName = "ChartTooltipValue"

const ChartTooltipLabel = React.forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("text-muted-foreground/60", className)} {...props} />
))
ChartTooltipLabel.displayName = "ChartTooltipLabel"

const ChartTooltipContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-0.5", className)} {...props} />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-wrap items-center gap-4", className)} {...props} />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
))
ChartLegendContent.displayName = "ChartLegendContent"

const ChartStyle = ({ charts, colors, backgroundColor }) => {
  if (!colors && !backgroundColor && !charts?.length) return null

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        ${colors?.map((color, i) => `--chart-${i + 1}: ${color};`).join("\n")}
        ${backgroundColor ? `--chart-background: ${backgroundColor};` : ""}
      }

      ${charts?.map(({ label, color }) => label && color ? `[data-chart] [data-layer="${label}"] { --chart-value: ${color}; }` : "").join("\n")}
    ` }} />
  )
}

export {
  ChartContainer,
  ChartTitle,
  ChartDescription,
  ChartHeader,
  ChartHeaderDescription,
  ChartValueDescription,
  ChartValueTitle,
  ChartValue,
  ChartTooltip,
  ChartTooltipColumn,
  ChartTooltipValue,
  ChartTooltipLabel,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
