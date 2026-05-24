import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function WorkdeskPage({
  eyebrow,
  title,
  description,
  actions,
  hero,
  children,
  contentClassName,
  compact = false,
}) {
  return (
    <div className={cn("space-y-4", compact ? "lg:space-y-3.5" : "lg:space-y-5")}>
      <section
        className={cn(
          "relative overflow-hidden border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(242,247,249,0.92)_52%,rgba(233,240,236,0.9)_100%)] shadow-[0_24px_64px_rgba(20,33,48,0.10)]",
          compact ? "rounded-[26px] px-4 py-4 md:px-5 md:py-4" : "rounded-[32px] px-6 py-6 md:px-8"
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,148,136,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(190,110,54,0.12),transparent_26%)]" />
        <div className={cn("relative flex flex-col xl:flex-row xl:items-start xl:justify-between", compact ? "gap-4" : "gap-6")}>
          <div className="max-w-3xl">
            {eyebrow ? (
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700/80">
                {eyebrow}
              </div>
            ) : null}
            <h1 className={cn("font-bold tracking-[-0.04em] text-slate-950", compact ? "mt-2 text-2xl md:text-3xl" : "mt-3 text-3xl md:text-4xl")}>
              {title}
            </h1>
            <p className={cn("max-w-2xl text-slate-600", compact ? "mt-2 text-sm leading-5" : "mt-3 text-sm leading-6 md:text-[15px]")}>
              {description}
            </p>
          </div>

          {actions ? <div className="relative flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {hero ? <div className={cn("relative", compact ? "mt-4" : "mt-6")}>{hero}</div> : null}
      </section>

      <div className={cn(compact ? "space-y-3.5 lg:space-y-4" : "space-y-6", contentClassName)}>{children}</div>
    </div>
  );
}

export function WorkdeskSurface({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/75 bg-white/88 shadow-[0_22px_70px_rgba(20,33,48,0.08)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

export function WorkdeskSection({ title, description, aside, className, children, bodyClassName }) {
  return (
    <WorkdeskSurface className={cn("overflow-hidden", className)}>
      {(title || description || aside) && (
        <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-4 md:flex-row md:items-start md:justify-between md:px-5">
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-950 md:text-xl">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      )}
      <div className={cn("px-4 py-4 md:px-5", bodyClassName)}>{children}</div>
    </WorkdeskSurface>
  );
}

export function WorkdeskStatCard({
  label,
  value,
  caption,
  icon: Icon,
  accent = "teal",
  trend,
  className,
}) {
  const tones = {
    teal: "from-teal-500 via-emerald-500 to-cyan-500",
    amber: "from-amber-500 via-orange-500 to-yellow-500",
    blue: "from-sky-500 via-blue-500 to-indigo-500",
    slate: "from-slate-700 via-slate-800 to-slate-900",
    rose: "from-rose-500 via-red-500 to-orange-500",
  };

  return (
    <div
      className={cn(
        "rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,249,250,0.92)_100%)] p-5 shadow-[0_18px_48px_rgba(20,33,48,0.08)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 md:text-3xl">{value}</div>
          {caption ? <p className="mt-1.5 text-sm text-slate-500">{caption}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg md:h-12 md:w-12",
              tones[accent] || tones.teal
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {trend ? (
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {trend}
        </div>
      ) : null}
    </div>
  );
}

export function WorkdeskPill({ children, tone = "default", className }) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-sky-100 text-sky-700",
    danger: "bg-rose-100 text-rose-700",
    dark: "bg-slate-950 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone] || tones.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export function WorkdeskInput({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 md:h-11",
        className
      )}
    />
  );
}

export function WorkdeskSelect({ className, children, ...props }) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 md:h-11",
        className
      )}
    >
      {children}
    </select>
  );
}

export function WorkdeskTextarea({ className, ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100",
        className
      )}
    />
  );
}

export function WorkdeskSegment({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-[20px] border border-slate-200 bg-slate-100/80 p-1.5">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm font-semibold transition",
              active
                ? "bg-white text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function WorkdeskEmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
