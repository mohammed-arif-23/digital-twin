export default function StatPanel({ title = '', value = '', unit = '', icon = null, color = '#00eaff' }) {
  return (
    <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-cyan-400/30 p-3 shadow-md min-w-[90px]">
      {icon && <div className="mb-1 text-cyan-300 drop-shadow-[0_0_8px_#00eaff]">{icon}</div>}
      <div className="text-2xl font-bold font-jarvis" style={{ color }}>{value}{unit && <span className="text-base ml-1 font-jarvis text-cyan-200">{unit}</span>}</div>
      <div className="text-xs font-jarvis text-cyan-300 tracking-widest mt-1 uppercase text-center">{title}</div>
    </div>
  );
} 