import CloudImage from "@/assets/Cloud.png";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function AuthShell({
  eyebrow,
  title,
  description,
  badge,
  children,
  logo,
  modeLabel,
  supportLabel,
}) {
  return (
    <div className="relative min-h-[100svh] overflow-x-clip bg-[#dcecff]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${CloudImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(126,183,236,0.18)_0%,rgba(255,255,255,0.10)_42%,rgba(255,255,255,0.20)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_26%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.20),transparent_22%)]" />

      <div className="absolute inset-0 opacity-45">
        <div className="absolute left-1/2 top-[16%] h-[60%] w-[88%] -translate-x-1/2 rounded-[50%] border border-white/36" />
        <div className="absolute left-1/2 top-[22%] h-[52%] w-[72%] -translate-x-1/2 rounded-[50%] border border-white/22" />
        <div className="absolute left-1/2 top-[28%] h-[44%] w-[56%] -translate-x-1/2 rounded-[50%] border border-white/14" />
        <div className="absolute left-[14%] top-[24%] h-[56%] w-px rotate-[34deg] bg-white/18" />
        <div className="absolute right-[14%] top-[24%] h-[56%] w-px -rotate-[34deg] bg-white/18" />
      </div>

      <div className="relative flex min-h-[100svh] items-center justify-center px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        <div className="flex w-full justify-center">
          <div className="w-full max-w-[min(100%,28rem)] rounded-[clamp(1.4rem,4vw,1.9rem)] border border-white/80 bg-white/22 p-2 shadow-[0_30px_90px_rgba(42,68,94,0.20)] backdrop-blur-[18px] sm:p-2.5">
            <div className="rounded-[clamp(1.2rem,3.5vw,1.6rem)] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.28)_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <div className="flex justify-center">
                <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-white/88 p-2.5 shadow-[0_14px_32px_rgba(22,32,42,0.10)] sm:h-24 sm:w-24 lg:h-28 lg:w-28 lg:p-3">
                  <img
                    src={logo}
                    alt="Eximinq brand"
                    className="h-full w-full rounded-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:text-[11px] sm:tracking-[0.24em]">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="truncate">{modeLabel}</span>
                </div>
                <h1 className="mt-4 text-[clamp(1.75rem,5.5vw,2rem)] font-bold tracking-[-0.04em] text-slate-950">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[0.95rem]">{description}</p>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 px-2 text-center text-xs text-slate-500 sm:mt-6">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-balance">{badge}</span>
              </div>

              <div className="mt-5 sm:mt-6">{children}</div>

              <div className="mt-5 text-center sm:mt-6">
                <p className="text-xs leading-5 text-slate-500">{supportLabel}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
                  {eyebrow}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
