import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerAction: string;
  children: ReactNode;
};

export function AuthShell({
  footerLabel,
  footerHref,
  footerAction,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8764f_0%,#8f5960_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-10 lg:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] overflow-hidden rounded-[34px] border border-white/50 bg-[#f4f5fb] shadow-[0_28px_80px_rgba(35,16,18,0.35)] lg:grid-cols-[1fr_0.98fr]">
        <section className="flex min-h-[760px] items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[360px]">
            {children}
            <p className="mt-7 text-center text-sm text-slate-500">
              {footerLabel}{" "}
              <Link className="font-semibold text-[#9d6d78]" href={footerHref}>
                {footerAction}
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-[760px] overflow-hidden rounded-[28px] rounded-l-none border-l border-white/40 bg-[linear-gradient(180deg,#8e5b7c_0%,#f3b181_34%,#f6d699_48%,#d8cde7_66%,#7f74b1_100%)] lg:block">
          <div className="absolute left-8 top-16 h-36 w-36 rounded-full bg-[#fff7dd] blur-[2px] shadow-[0_0_70px_rgba(255,247,221,0.85)]" />
          <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,rgba(163,151,214,0.16),rgba(73,64,111,0.28))]" />
          <div className="absolute bottom-[34%] left-[-4%] h-24 w-[52%] rounded-r-[100px] bg-[#4c4e77]" />
          <div className="absolute bottom-[39%] left-[18%] h-20 w-[38%] rounded-[100px] bg-[#b5acd9]" />
          <div className="absolute bottom-[38%] right-[4%] h-16 w-[46%] rounded-l-[120px] rounded-tr-[50px] bg-[#4f547d]" />
          <div className="absolute bottom-[24%] right-[-4%] h-[34%] w-[76%] rounded-tl-[180px] bg-[linear-gradient(180deg,#d8d0f0_0%,#b8abd9_38%,#4a476e_100%)]" />
          <div className="absolute bottom-[30%] left-[46%] h-[22%] w-[24%] rotate-[42deg] rounded-[120px] bg-[linear-gradient(180deg,#ebe6fb_0%,#cfc3eb_100%)]" />
          <div className="absolute bottom-[40%] left-[35%] h-16 w-16 rounded-full border-[10px] border-[#151827] border-r-transparent border-t-transparent" />
          <div className="absolute bottom-[35.5%] left-[49%] h-[10%] w-[1px] bg-[#151827]" />
          <div className="absolute bottom-[41%] left-[54%] h-10 w-[2px] rotate-[-42deg] bg-[#151827]" />
          <div className="absolute bottom-[40%] left-[55.7%] h-3 w-3 rounded-full bg-[#151827]" />
          <div className="absolute bottom-[38.5%] left-[52.5%] h-3 w-3 rounded-full bg-[#151827]" />
          <div className="absolute bottom-[27%] left-[14%] h-[16%] w-[2px] bg-[#151827]" />
          <div className="absolute bottom-[25.5%] left-[14.7%] h-[12%] w-[2px] rotate-[24deg] bg-[#151827]" />
          <div className="absolute bottom-[25.5%] left-[13.3%] h-[12%] w-[2px] rotate-[-24deg] bg-[#151827]" />
          <div className="absolute bottom-[26%] left-[28%] h-[18%] w-[2px] bg-[#151827]" />
          <div className="absolute bottom-[24.4%] left-[29%] h-[13%] w-[2px] rotate-[20deg] bg-[#151827]" />
          <div className="absolute bottom-[24.6%] left-[27%] h-[13%] w-[2px] rotate-[-20deg] bg-[#151827]" />
          <div className="absolute bottom-[23%] left-[45%] h-[24%] w-[3px] bg-[#111423]" />
          <div className="absolute bottom-[21.2%] left-[46.5%] h-[15%] w-[3px] rotate-[18deg] bg-[#111423]" />
          <div className="absolute bottom-[21.4%] left-[43.8%] h-[15%] w-[3px] rotate-[-18deg] bg-[#111423]" />
          <div className="absolute bottom-[26%] right-[18%] h-[18%] w-[2px] bg-[#151827]" />
          <div className="absolute bottom-[24.6%] right-[16.8%] h-[13%] w-[2px] rotate-[20deg] bg-[#151827]" />
          <div className="absolute bottom-[24.6%] right-[19.2%] h-[13%] w-[2px] rotate-[-20deg] bg-[#151827]" />
          <div className="absolute bottom-[6%] left-[8%] right-[8%] flex items-end justify-between text-white/85">
            <div>
              <p className="text-[34px] font-light tracking-[-0.04em]">
                Finally, all your work in one place.
              </p>
              <div className="mt-8 flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-lg">
                  ←
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-lg">
                  →
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
