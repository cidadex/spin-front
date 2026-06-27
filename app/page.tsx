"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientRepository } from "@/repositories/client/ClientRepository";
import { NewApenadoDialog } from "./components/new-apenado-dialog/NewApenadoDialog";
import { NumerosSpinCard } from "./components/numeros-spin-card/NumerosSpinCard";
import { RankingCard } from "./components/ranking-card/RankingCard";
import { NewsCard } from "./components/news-card/NewsCard";
import {
  ArrowRightIcon,
  CoinsIcon,
  SparklesIcon,
  HourglassIcon,
  FileTextIcon,
  TimerIcon,
  CalculatorIcon,
} from "lucide-react";

const ORBIT_RINGS = [
  { size: 560, top: "-8%",  left: "-6%",  duration: 55, dotColor: "rgba(236,209,166,0.4)",  dotSize: 7, reverse: false, border: "rgba(255,255,255,0.038)" },
  { size: 340, top: "52%",  left: "-3%",  duration: 36, dotColor: "rgba(193,193,193,0.45)", dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.03)"  },
  { size: 220, top: "18%",  left: "28%",  duration: 26, dotColor: "rgba(236,209,166,0.38)", dotSize: 4, reverse: false, border: "rgba(255,255,255,0.035)" },
  { size: 460, top: "48%",  left: "52%",  duration: 65, dotColor: "rgba(255,255,255,0.28)", dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.022)" },
  { size: 140, top: "2%",   left: "62%",  duration: 20, dotColor: "rgba(193,193,193,0.4)",  dotSize: 3, reverse: false, border: "rgba(255,255,255,0.04)"  },
  { size: 300, top: "28%",  left: "76%",  duration: 44, dotColor: "rgba(236,209,166,0.32)", dotSize: 4, reverse: true,  border: "rgba(255,255,255,0.028)" },
  { size: 180, top: "70%",  left: "40%",  duration: 32, dotColor: "rgba(236,209,166,0.3)",  dotSize: 3, reverse: false, border: "rgba(255,255,255,0.03)"  },
];

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <HomePage />
    </ProtectedRoute>
  );
}

const HomePage = () => {
  const { me } = useAuth();
  const { push } = useRouter();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const repo = new ClientRepository();
    let cancelled = false;
    repo.getCreditsBalance()
      .then((r) => { if (!cancelled) setCredits(r.data.balance); })
      .catch(() => { if (!cancelled) setCredits(0); });
    return () => { cancelled = true; };
  }, []);

  const firstName = me?.first_name || "usuário";

  return (
    <>
      <style>{`
        @keyframes orbit-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes orbit-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes fadein-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .home-card { animation: fadein-up .4s ease both; }
      `}</style>

      {/* ── Orbital rings — fixed, z-index 0, above the dark bg gradient ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {ORBIT_RINGS.map((ring, i) => {
          const r   = ring.size / 2;
          const dir = ring.reverse ? "orbit-ccw" : "orbit-cw";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: ring.top, left: ring.left,
                width: ring.size, height: ring.size,
                borderRadius: "50%",
                border: `1px solid ${ring.border}`,
              }}
            >
              <div style={{
                position: "absolute",
                width: ring.dotSize, height: ring.dotSize,
                borderRadius: "50%",
                background: ring.dotColor,
                top: -(ring.dotSize / 2),
                left: `calc(50% - ${ring.dotSize / 2}px)`,
                transformOrigin: `${ring.dotSize / 2}px ${r + ring.dotSize / 2}px`,
                animation: `${dir} ${ring.duration}s linear infinite`,
                boxShadow: `0 0 ${ring.dotSize * 2}px ${ring.dotColor}`,
              }} />
            </div>
          );
        })}
      </div>

      {/* ── Page content — z-index 1, above orbital rings ── */}
      <div className="relative w-full min-h-[calc(100svh-60px)] flex flex-col" style={{ zIndex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="w-full px-6 md:px-10 pt-10 pb-8 home-card" style={{ animationDelay: "0ms" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "rgba(236,209,166,0.75)" }}>
            Bem-vindo de volta
          </p>
          <h1 className="text-2xl font-bold text-white mb-6">
            Olá, <span style={{ color: "#ECD1A6" }}>{firstName}</span>
          </h1>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { icon: <HourglassIcon className="w-5 h-5" />, value: "0 anos 0 meses 0 dias", label: "Tempo de pena indevida identificado", color: "rgba(193,193,193,0.7)" },
              { icon: <FileTextIcon  className="w-5 h-5" />, value: "0 processos",           label: "Execuções Penais analisadas",        color: "rgba(100,160,255,0.85)" },
              { icon: <TimerIcon     className="w-5 h-5" />, value: "0h 0min",               label: "Tempo de análise economizado",       color: "rgba(80,210,130,0.85)" },
              {
                icon: <CalculatorIcon className="w-5 h-5" />,
                value: credits === null ? "…" : `${credits} créditos`,
                label: "Cálculos restantes",
                color: "#ECD1A6",
              },
            ].map(({ icon, value, label, color }, i) => (
              <div
                key={i}
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{
                  background:     "rgba(255,255,255,0.05)",
                  border:         "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span style={{ color }}>{icon}</span>
                <p className="text-base md:text-lg font-bold text-white leading-tight">{value}</p>
                <p className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(80,200,120,0.07)",
              border:     "1px solid rgba(80,200,120,0.16)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">
                <i className="material-symbols-outlined material-symbols-outlined-sized">check_circle</i>
              </span>
              <p className="text-xs font-medium text-emerald-400">
                Use seus cálculos para garantir justas penas. Clique no botão ao lado para começar:
              </p>
            </div>
            <NewApenadoDialog
              trigger={
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: "#22c55e", color: "#fff" }}
                >
                  Realizar Novo Cálculo
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              }
            />
          </div>
        </section>

        {/* ── Credits banner ───────────────────────────────── */}
        <div
          className="mx-6 md:mx-10 mb-7 rounded-2xl home-card"
          style={{
            animationDelay: "70ms",
            background:     "linear-gradient(120deg, rgba(236,209,166,0.09) 0%, rgba(236,209,166,0.04) 100%)",
            border:         "1px solid rgba(236,209,166,0.16)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(236,209,166,0.13)",
                  border:     "1px solid rgba(236,209,166,0.22)",
                }}
              >
                <CoinsIcon className="w-4 h-4" style={{ color: "#ECD1A6" }} />
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-0.5">
                  Você tem{" "}
                  <span style={{ color: "#ECD1A6" }}>
                    {credits === null ? "…" : credits} crédito{credits !== 1 ? "s" : ""}
                  </span>{" "}
                  disponíveis
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Cada cálculo consome créditos. Recarregue para continuar operando sem interrupções.
                </p>
              </div>
            </div>
            <button
              onClick={() => push("/planos")}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm shrink-0 transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
            >
              <SparklesIcon className="w-4 h-4" />
              Comprar créditos
            </button>
          </div>
        </div>

        {/* ── Panel label ──────────────────────────────────── */}
        <p
          className="text-center text-xs font-semibold mb-5 px-6 home-card"
          style={{ color: "rgba(255,255,255,0.3)", animationDelay: "110ms", letterSpacing: "0.1em" }}
        >
          PAINEL DE CONTROLE
        </p>

        {/* ── Panel cards — 3 columns, overflow clipped ────── */}
        <section className="px-6 md:px-10 pb-12 flex-1 home-card" style={{ animationDelay: "150ms" }}>
          <div className="grid gap-4 items-start" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr) minmax(0,1fr)" }}>
            <div className="min-w-0 overflow-hidden"><NumerosSpinCard /></div>
            <div className="min-w-0 overflow-hidden"><RankingCard /></div>
            <div className="min-w-0 overflow-hidden"><NewsCard /></div>
          </div>
        </section>

      </div>
    </>
  );
};
