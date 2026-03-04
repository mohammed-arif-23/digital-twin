"use client";
// This file is intentionally a separate client component
// so recharts can be imported directly (avoids broken dynamic named exports)
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

const tooltipStyle = {
    background: "#060b14",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    fontSize: 11,
    color: "#fff",
};

export function SparkAreaChart({ data, color, unit, max }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, max || "auto"]} hide />
                <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ display: "none" }}
                    formatter={(v) => [`${Math.round(v)} ${unit || ""}`, ""]}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                />
                <Area
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${color.replace("#", "")})`}
                    dot={false}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
