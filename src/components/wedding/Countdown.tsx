import { useEffect, useState } from "react";

const TARGET = new Date("2026-12-12T16:00:00-04:00").getTime();

function diff() {
  const now = Date.now();
  const d = Math.max(0, TARGET - now);
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    seconds: Math.floor((d / 1000) % 60),
  };
}

export function Countdown({ light = false }: { light?: boolean }) {
  const [t, setT] = useState(diff);
  useEffect(() => {
    const i = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(i);
  }, []);

  const items = [
    { v: t.days, l: "Dias" },
    { v: t.hours, l: "Horas" },
    { v: t.minutes, l: "Min" },
    { v: t.seconds, l: "Seg" },
  ];

  return (
    <div className={`flex items-center justify-center gap-5 sm:gap-10 ${light ? "text-background" : "text-foreground"}`}>
      {items.map((it, i) => (
        <div key={it.l} className="flex items-center gap-5 sm:gap-10">
          <div className="text-center">
            <div className="font-serif text-3xl sm:text-5xl tabular-nums">
              {String(it.v).padStart(2, "0")}
            </div>
            <div className="mt-2 text-[10px] tracking-luxe uppercase opacity-80">{it.l}</div>
          </div>
          {i < items.length - 1 && (
            <span className={`h-8 w-px ${light ? "bg-background/40" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}