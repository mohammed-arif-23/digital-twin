"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ChartWidget = dynamic(() => import("./ChartWidget").then((m) => m.SparkAreaChart), { ssr: false });

const HISTORY = 80;
const initH = (v = 0) => Array.from({ length: HISTORY }, (_, i) => ({ v, i }));

function eff(v) {
    if (v >= 90) return "#4ade80";
    if (v >= 70) return "#facc15";
    if (v >= 50) return "#fb923c";
    return "#f87171";
}

function sev(s) {
    if (s === "high") return { bar: "bg-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "text-red-400", text: "text-red-200/80" };
    if (s === "medium") return { bar: "bg-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "text-yellow-400", text: "text-yellow-100/70" };
    return { bar: "bg-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25", label: "text-cyan-400", text: "text-cyan-100/70" };
}

// ── Stat card ────────────────────────────────────────────────────
function Stat({ label, value, unit, color, small }) {
    return (
        <div className="flex flex-col gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">{label}</div>
            <div className="flex items-baseline gap-1">
                <span className={`font-mono font-bold leading-none ${small ? "text-2xl" : "text-3xl"}`} style={{ color }}>
                    {value}
                </span>
                {unit && <span className="text-xs text-white/25 font-mono">{unit}</span>}
            </div>
        </div>
    );
}

// ── Chart card ───────────────────────────────────────────────────
function ChartCard({ label, data, color, unit, max }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">{label}</div>
            <div style={{ height: 90 }}>
                <ChartWidget data={data} color={color} unit={unit} max={max} />
            </div>
        </div>
    );
}

export default function Analytics() {
    const [t, setT] = useState(null);
    const [connected, setConnected] = useState(false);
    // All chart histories in one object → single setState = single render per message
    const [hist, setHist] = useState({
        rpm: initH(0),
        spd: initH(0),
        tmp: initH(85),
        hp: initH(0),
    });
    const tick = useRef(0);
    const es = useRef(null);

    useEffect(() => {
        function connect() {
            const src = new EventSource("/api/telemetry");
            es.current = src;
            src.onopen = () => setConnected(true);
            src.onmessage = (e) => {
                try {
                    const d = JSON.parse(e.data);
                    const i = ++tick.current;
                    // Single setState call → single re-render
                    setT(d);
                    setHist((prev) => ({
                        rpm: [...prev.rpm.slice(1), { v: Math.round(d.rpm || 0), i }],
                        spd: [...prev.spd.slice(1), { v: Math.round(d.speedKmh || 0), i }],
                        tmp: [...prev.tmp.slice(1), { v: Math.round(d.temperature || 85), i }],
                        hp: [...prev.hp.slice(1), { v: Math.round(d.horsepower || 0), i }],
                    }));
                } catch { }
            };
            src.onerror = () => {
                setConnected(false);
                src.close();
                setTimeout(connect, 3000);
            };
        }
        connect();
        return () => es.current?.close();
    }, []);

    const live = connected && t?.engineRunning;
    const ef = t?.efficiency ?? 100;
    const circle = 2 * Math.PI * 38;

    return (
        <div className="min-h-screen bg-[#040810] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Nav ── */}
            <div className="sticky top-0 z-10 bg-[#040810]/90 backdrop-blur border-b border-white/[0.05] px-5 py-3 flex items-center justify-between">
                <div className="text-sm font-bold tracking-wider">Digital Twin · Telemetry</div>
                <div className={`flex items-center gap-2 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${live ? "border-green-500/30 bg-green-500/10 text-green-400" :
                    connected ? "border-white/15 bg-white/5 text-white/40" :
                        "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-400 animate-pulse" : connected ? "bg-white/30" : "bg-red-400"}`} />
                    {live ? "LIVE" : connected ? "STANDBY" : "OFFLINE"}
                </div>
            </div>

            <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">

                {/* ── Row 1: key stats ── */}
                <div className="grid grid-cols-3 gap-3">
                    <Stat label="Speed" value={t?.speedKmh ?? 0} unit="km/h" color="#00eaff" />
                    <Stat label="RPM" value={t ? Math.round(t.rpm) : 0} unit="" color="#a78bfa" />
                    <Stat label="Gear" value={t?.currentGear ?? "P"} unit="" color="#00eaff" small />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Stat label="Temp" value={t ? Math.round(t.temperature) : 85} unit="°C" color="#fb923c" />
                    <Stat label="Fuel" value={t ? Math.round(t.fuelLevel) : 0} unit="%" color="#34d399" />
                    <Stat label="Power" value={t ? Math.round(t.horsepower) : 0} unit="HP" color="#f472b6" />
                </div>

                {/* ── Row 2: live charts ── */}
                <div className="grid grid-cols-2 gap-3">
                    <ChartCard label="Speed" data={hist.spd} color="#00eaff" unit="km/h" max={300} />
                    <ChartCard label="RPM" data={hist.rpm} color="#a78bfa" unit="rpm" max={9000} />
                    <ChartCard label="Temperature" data={hist.tmp} color="#fb923c" unit="°C" max={130} />
                    <ChartCard label="Horsepower" data={hist.hp} color="#f472b6" unit="HP" max={700} />
                </div>

                {/* ── Row 3: efficiency + load + pedals ── */}
                <div className="grid grid-cols-3 gap-3">

                    {/* Efficiency ring */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center gap-2">
                        <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">Efficiency</div>
                        <svg width={90} height={90} viewBox="0 0 90 90">
                            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                            <circle
                                cx="45" cy="45" r="38"
                                fill="none"
                                stroke={eff(ef)}
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={circle}
                                strokeDashoffset={circle * (1 - ef / 100)}
                                transform="rotate(-90 45 45)"
                                style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
                            />
                            <text x="45" y="49" textAnchor="middle" fontSize="15" fontWeight="700" fill={eff(ef)}>{ef}%</text>
                        </svg>
                    </div>

                    {/* Engine load */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2">
                        <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">Engine Load</div>
                        <div className="flex-1 flex flex-col justify-center gap-2">
                            <div className="text-2xl font-bold font-mono" style={{ color: "#c084fc" }}>
                                {t ? Math.round(t.engineLoad) : 0}%
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                                    style={{ width: `${t?.engineLoad ?? 0}%` }}
                                />
                            </div>
                            <div className="text-[9px] font-mono text-white/25">
                                Mode: {t?.currentMode ?? "EFFICIENCY"}
                            </div>
                        </div>
                    </div>

                    {/* Pedals */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2">
                        <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">Pedals</div>
                        <div className="flex-1 flex items-end justify-center gap-4">
                            {/* Accel */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-14 rounded-full bg-white/5 border border-cyan-500/20 overflow-hidden flex flex-col-reverse">
                                    <div className="w-full bg-cyan-400 rounded-full transition-all duration-100"
                                        style={{ height: `${t?.acceleratorPosition ?? 0}%` }} />
                                </div>
                                <div className="text-[8px] font-mono text-white/25">A</div>
                            </div>
                            {/* Brake */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-14 rounded-full bg-white/5 border border-red-500/20 overflow-hidden flex flex-col-reverse">
                                    <div className="w-full bg-red-400 rounded-full transition-all duration-100"
                                        style={{ height: `${t?.brakePosition ?? 0}%` }} />
                                </div>
                                <div className="text-[8px] font-mono text-white/25">B</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 4: fuel economy + session ── */}
                <div className="grid grid-cols-2 gap-3">
                    <Stat label="Fuel Economy" value={t ? (t.fuelEconomy ?? 0).toFixed(1) : "0.0"} unit="km/L" color="#34d399" />
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 flex flex-col gap-0.5 justify-center">
                        <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase">Session</div>
                        <div className="text-[10px] font-mono text-white/35 truncate">{t?.sessionId ?? "—"}</div>
                        <div className="text-[9px] font-mono text-white/20 mt-1">
                            {t?.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "—"}
                        </div>
                    </div>
                </div>

                {/* ── Row 5: Recommendations ── */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                    <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-3">AI Recommendations</div>
                    {t?.recommendations?.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {t.recommendations.map((rec, i) => {
                                const c = sev(rec.severity);
                                return (
                                    <div key={i} className={`flex items-start gap-2.5 rounded-xl border p-3 ${c.bg} ${c.border}`}>
                                        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${c.bar}`} />
                                        <div>
                                            <span className={`text-[9px] font-mono uppercase font-bold ${c.label}`}>{rec.severity} · </span>
                                            <span className={`text-xs ${c.text}`}>{rec.message}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-white/20 text-xs font-mono">
                            {connected ? "✓ All systems nominal" : "Waiting for connection…"}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-white/15 text-[9px] font-mono pb-2">
                    SSE · <code>GET /api/telemetry</code>
                </div>
            </div>
        </div>
    );
}
