import { PieChart, Pie, Cell } from 'recharts';

export default function CircularGauge({ value = 0, max = 100, label = '', unit = '', color = '#00eaff', size = 180, showNeedle = false, showTicks = false }) {
  const percent = Math.min(Math.max(value / max, 0), 1);
  const data = [
    { value: percent },
    { value: 1 - percent },
  ];
  const angle = 210 - 240 * percent;
  const center = size / 2;
  const radius = size * 0.82;
  const needleX = center + radius * Math.cos((angle * Math.PI) / 180);
  const needleY = center - radius * Math.sin((angle * Math.PI) / 180);
  const ticks = showTicks ? Array.from({ length: 9 }, (_, i) => {
    const tickAngle = 210 - (240 * i) / 8;
    const x1 = center + (radius - 10) * Math.cos((tickAngle * Math.PI) / 180);
    const y1 = center - (radius - 10) * Math.sin((tickAngle * Math.PI) / 180);
    const x2 = center + (radius + 6) * Math.cos((tickAngle * Math.PI) / 180);
    const y2 = center - (radius + 6) * Math.sin((tickAngle * Math.PI) / 180);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00eaff" strokeWidth={2} opacity={0.7} />;
  }) : null;
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          startAngle={210}
          endAngle={-30}
          innerRadius={size * 0.68}
          outerRadius={size * 0.95}
          dataKey="value"
          stroke="none"
        >
          <Cell key="value" fill={color} opacity={0.9} />
          <Cell key="rest" fill="#22292f" opacity={0.2} />
        </Pie>
        {showTicks && <g>{ticks}</g>}
        {showNeedle && (
          <g>
            <line x1={center} y1={center} x2={needleX} y2={needleY} stroke="#00eaff" strokeWidth={4} />
            <circle cx={center} cy={center} r={8} fill="#00eaff" opacity={0.7} />
          </g>
        )}
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-extrabold font-jarvis text-cyan-400 drop-shadow-[0_0_16px_#00eaff]">
          {Math.round(value)}
          {unit && <span className="text-lg ml-1 font-jarvis text-cyan-300">{unit}</span>}
        </div>
        <div className="text-xs font-jarvis text-cyan-300 tracking-widest mt-2 uppercase drop-shadow-[0_0_8px_#00eaff99]">
          {label}
        </div>
      </div>
    </div>
  );
} 