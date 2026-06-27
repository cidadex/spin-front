"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClient } from "@/services/api/ApiClient";
import { CheckIcon, CoinsIcon, Loader2Icon, SparklesIcon, StarIcon } from "lucide-react";

interface Plan {
  uuid: string;
  name: string;
  description: string;
  price_brl: string;
  credits: number;
  features: string[];
  is_free: boolean;
  is_highlighted: boolean;
  badge_label: string;
}

export default function Page() {
  return (
    <ProtectedRoute oneOfAuthState={[AuthStatusEnum.Authenticated]} redirectTo="/login">
      <PlanosPage />
    </ProtectedRoute>
  );
}

const PlanosPage = () => {
  const { push } = useRouter();
  const [plans, setPlans]         = useState<Plan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [modal, setModal]         = useState<Plan | null>(null);

  useEffect(() => {
    ApiClient.getInstance()
      .get<Plan[]>("/client/plans/", { useAuthHeader: false })
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (plan: Plan) => {
    if (plan.is_free) {
      setSelecting(plan.uuid);
      setTimeout(() => push("/"), 600);
    } else {
      setModal(plan);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes fadeup  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        className="min-h-[100dvh] w-full flex flex-col"
        style={{ backgroundColor: "#1C2A39" }}
      >
        {/* Background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div style={{ position:"absolute", width:600, height:600, top:-150, right:-100,
            background:"radial-gradient(circle, rgba(236,209,166,0.08) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", width:400, height:400, bottom:-80, left:"20%",
            background:"radial-gradient(circle, rgba(193,193,193,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
          <img src="/logo.svg" alt="Spin" style={{ height: 30, width: "auto" }} />
          <button
            onClick={() => push("/")}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Pular por enquanto →
          </button>
        </div>

        {/* Hero */}
        <div className="relative z-10 text-center px-6 pt-8 pb-6" style={{ animation: "fadeup .5s ease both" }}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background:"rgba(236,209,166,0.12)", border:"1px solid rgba(236,209,166,0.25)", color:"#ECD1A6" }}
          >
            <SparklesIcon className="w-3 h-3" />
            Escolha seu plano
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Comece agora, evolua quando quiser.
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            Todos os planos incluem acesso completo à plataforma de multicálculo de Indulto.
            Cancele a qualquer momento.
          </p>
        </div>

        {/* Plans */}
        <div className="relative z-10 flex-1 flex items-start justify-center px-6 py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 mt-16">
              <Loader2Icon className="animate-spin w-5 h-5" />
              <span>Carregando planos…</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 justify-center items-stretch max-w-4xl w-full">
              {plans.map((plan, i) => (
                <PlanCard
                  key={plan.uuid}
                  plan={plan}
                  delay={i * 80}
                  selecting={selecting === plan.uuid}
                  onSelect={() => handleSelect(plan)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buy credits banner */}
        <div className="relative z-10 px-6 md:px-12 pb-10">
          <div
            className="max-w-4xl mx-auto rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:"rgba(236,209,166,0.15)", border:"1px solid rgba(236,209,166,0.25)" }}
              >
                <CoinsIcon className="w-5 h-5" style={{ color:"#ECD1A6" }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Prefere comprar créditos avulsos?</p>
                <p className="text-xs text-white/40">Sem mensalidade — pague só o que usar.</p>
              </div>
            </div>
            <button
              onClick={() => setModal({ uuid:"credits", name:"Comprar Créditos", description:"", price_brl:"0",
                credits:0, features:[], is_free:false, is_highlighted:false, badge_label:"" })}
              className="shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background:"rgba(236,209,166,0.15)", border:"1px solid rgba(236,209,166,0.3)", color:"#ECD1A6" }}
            >
              Ver pacotes de créditos
            </button>
          </div>
        </div>
      </div>

      {/* Simulated checkout modal */}
      {modal && (
        <CheckoutModal plan={modal} onClose={() => setModal(null)} />
      )}
    </>
  );
};

/* ── Plan Card ── */
const PlanCard = ({
  plan, delay, selecting, onSelect,
}: {
  plan: Plan; delay: number; selecting: boolean; onSelect: () => void;
}) => {
  const price = parseFloat(plan.price_brl);
  const isCredits = plan.uuid === "credits";

  return (
    <div
      className="flex flex-col rounded-2xl w-full max-w-[300px] overflow-hidden relative"
      style={{
        background: plan.is_highlighted
          ? "linear-gradient(160deg, rgba(236,209,166,0.14) 0%, rgba(28,42,57,0.95) 60%)"
          : "rgba(255,255,255,0.06)",
        border: plan.is_highlighted
          ? "1px solid rgba(236,209,166,0.35)"
          : "1px solid rgba(255,255,255,0.10)",
        animation: `fadeup .5s ease ${delay}ms both`,
      }}
    >
      {/* Badge */}
      {plan.badge_label && (
        <div
          className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
          style={{ background:"#ECD1A6", color:"#1C2A39" }}
        >
          {plan.badge_label}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Name + price */}
        <div>
          {plan.is_free && (
            <div
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full"
              style={{ background:"rgba(74,222,128,0.15)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.25)" }}
            >
              Gratuito
            </div>
          )}
          <p className="text-lg font-extrabold text-white">{plan.name}</p>
          <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{plan.description}</p>
        </div>

        <div>
          {plan.is_free ? (
            <p className="text-4xl font-extrabold text-white">
              R$ 0
              <span className="text-base font-normal text-white/40"> /mês</span>
            </p>
          ) : (
            <p className="text-4xl font-extrabold text-white">
              R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              <span className="text-base font-normal text-white/40"> /mês</span>
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: "#ECD1A6" }}>
            {plan.credits} créditos incluídos
          </p>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color:"#ECD1A6" }} />
              <span className="text-xs text-white/65">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          disabled={selecting}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={
            plan.is_highlighted
              ? { backgroundColor: "#ECD1A6", color: "#1C2A39" }
              : plan.is_free
              ? { background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff" }
              : { background:"rgba(236,209,166,0.15)", border:"1px solid rgba(236,209,166,0.30)", color:"#ECD1A6" }
          }
        >
          {selecting && <Loader2Icon className="animate-spin w-4 h-4" />}
          {plan.is_free ? "Começar grátis" : "Assinar agora"}
        </button>
      </div>
    </div>
  );
};

/* ── Simulated Checkout Modal ── */
const CREDIT_PACKAGES = [
  { label: "50 créditos",  price: "R$ 35",  highlight: false },
  { label: "150 créditos", price: "R$ 89",  highlight: true  },
  { label: "400 créditos", price: "R$ 197", highlight: false },
];

const CheckoutModal = ({ plan, onClose }: { plan: Plan; onClose: () => void }) => {
  const isCredits = plan.uuid === "credits";
  const [selected, setSelected] = useState<number | null>(isCredits ? 1 : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"
        style={{ background:"#1e2f40", border:"1px solid rgba(255,255,255,0.12)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 text-xl leading-none"
        >×</button>

        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-3 px-2.5 py-1 rounded-full"
          style={{ background:"rgba(236,209,166,0.12)", color:"#ECD1A6", border:"1px solid rgba(236,209,166,0.2)" }}
        >
          <StarIcon className="w-3 h-3" />
          {isCredits ? "Créditos avulsos" : "Checkout simulado"}
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1">
          {isCredits ? "Comprar créditos" : plan.name}
        </h3>
        <p className="text-sm text-white/45 mb-5">
          {isCredits
            ? "Escolha o pacote ideal para o seu volume de trabalho."
            : `Plano ${plan.name} — R$ ${parseFloat(plan.price_brl).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} /mês`}
        </p>

        {isCredits ? (
          <div className="flex flex-col gap-2 mb-5">
            {CREDIT_PACKAGES.map((pkg, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                style={{
                  background: selected === i ? "rgba(236,209,166,0.15)" : "rgba(255,255,255,0.05)",
                  border: selected === i ? "1px solid rgba(236,209,166,0.4)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-sm font-semibold text-white">{pkg.label}</span>
                <span className="text-sm font-bold" style={{ color:"#ECD1A6" }}>{pkg.price}</span>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl p-4 mb-5 flex items-center justify-between"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-sm text-white/60">{plan.credits} créditos/mês</span>
            <span className="text-lg font-extrabold" style={{ color:"#ECD1A6" }}>
              R$ {parseFloat(plan.price_brl).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div
          className="rounded-xl p-3 mb-5 text-center"
          style={{ background:"rgba(236,209,166,0.06)", border:"1px solid rgba(236,209,166,0.15)" }}
        >
          <p className="text-xs text-white/40">
            🔒 Integração com <strong className="text-white/60">PagSeguro</strong> em breve.
            <br />O pagamento será processado de forma segura.
          </p>
        </div>

        <button
          className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor:"#ECD1A6", color:"#1C2A39" }}
          onClick={onClose}
        >
          Finalizar compra (em breve)
        </button>
      </div>
    </div>
  );
};
