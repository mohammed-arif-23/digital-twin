import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TelemetryChart({ data = [], dataKey = 'value', color = '#00eaff', label = '' }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl border border-cyan-400/30 p-2 shadow-lg w-full h-32 flex flex-col">
      <div className="text-xs font-jarvis text-cyan-300 tracking-widest mb-1 uppercase">{label}</div>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ background: '#0a192f', border: 'none', borderRadius: 8, color: '#00eaff', fontFamily: 'Orbitron' }} labelStyle={{ color: '#00eaff' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 