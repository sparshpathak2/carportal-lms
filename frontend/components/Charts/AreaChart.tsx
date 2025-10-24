"use client"

import React, { useEffect, useRef, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useSidebar } from "@/components/ui/sidebar"

const chartData = [
    { month: "Jan", desktop: 186 },
    { month: "Feb", desktop: 305 },
    { month: "Mar", desktop: 237 },
    { month: "Apr", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "Jun", desktop: 214 },
    { month: "Jul", desktop: 257 },
    { month: "Aug", desktop: 223 },
    { month: "Sep", desktop: 265 },
    { month: "Oct", desktop: 278 },
    { month: "Nov", desktop: 244 },
    { month: "Dec", desktop: 321 },
]

const chartConfig = {
    desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ChartAreaLinear() {
    const { open } = useSidebar()
    const containerRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect()
                setSize({
                    width: Math.floor(width),
                    height: Math.floor(height)
                })
            }
        }

        // Initial size
        updateSize()

        // Create ResizeObserver
        const resizeObserver = new ResizeObserver(updateSize)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        // Also listen to window resize
        window.addEventListener('resize', updateSize)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateSize)
        }
    }, [])

    // Handle sidebar state changes with multiple update attempts
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect()
                setSize({
                    width: Math.floor(width),
                    height: Math.floor(height)
                })
            }
        }

        // Multiple attempts during sidebar animation
        const timeouts = [0, 50, 150, 300, 450].map(delay =>
            setTimeout(updateSize, delay)
        )

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [open])

    return (
        <Card className="flex flex-col h-full w-full shadow-none rounded-md">
            <CardHeader className="flex-shrink-0">
                <CardTitle>AREA CHART - LINEAR</CardTitle>
                <CardDescription>Showing total visitors for the last 12 months</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 pb-2">
                <div ref={containerRef} className="w-full h-full">
                    {size.width > 0 && size.height > 0 && (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart
                                width={size.width}
                                height={size.height}
                                data={chartData}
                                margin={{ left: 12, right: 12, top: 5, bottom: 20 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                <Area
                                    dataKey="desktop"
                                    type="linear"
                                    fill="var(--chart-5)"
                                    stroke="var(--chart-1)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}