"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { AuthService } from "@/services/auth/AuthService";
import { ApiClient } from "@/services/api/ApiClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircleIcon,
  Calculator,
  CheckCircle2Icon,
  GraduationCap,
  Loader2Icon,
  Users,
} from "lucide-react";
import { useGenerateSchema } from "@/hooks/useGenerateSchema/useGenerateSchema";
import { generateLoginPageSchema, LoginPageSchema } from "../schemas";

const ORBIT_RINGS = [
  { size: 420, top: "8%",  left: "-10%", duration: 38, dotColor: "rgba(236,209,166,0.55)", dotSize: 6, reverse: false, border: "rgba(255,255,255,0.055)" },
  { size: 260, top: "52%", left: "4%",   duration: 26, dotColor: "rgba(193,193,193,0.6)",  dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.04)"  },
  { size: 160, top: "18%", left: "36%",  duration: 20, dotColor: "rgba(236,209,166,0.45)", dotSize: 4, reverse: false, border: "rgba(255,255,255,0.045)" },
  { size: 320, top: "60%", left: "28%",  duration: 44, dotColor: "rgba(255,255,255,0.35)", dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.035)" },
  { size: 110, top: "5%",  left: "42%",  duration: 16, dotColor: "rgba(193,193,193,0.5)",  dotSize: 3, reverse: false, border: "rgba(255,255,255,0.05)"  },
];

const STATS = [
  { icon: Calculator,    value: "12mi",          sub: "Parametrizações de cálculo" },
  { icon: Users,         value: "Especialistas", sub: "Experiência em Indultos"    },
  { icon: GraduationCap, value: "837 alunos",    sub: "Já utilizam as técnicas"    },
];

/* ── Register schema ── */
const registerSchema = z
  .object({
    name:            z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email:           z.string().email("E-mail inválido"),
    password:        z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
type RegisterSchema = z.infer<typeof registerSchema>;

/* ═══════════════════════════════════════════ */
export const LoginForm = () => {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <>
      <style>{`
        @keyframes orbit-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes orbit-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
      `}</style>

      <div
        className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
        style={{ backgroundColor: "#1C2A39" }}
      >
        {/* Background glow blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div style={{ position: "absolute", width: 500, height: 500, top: -100, left: -120,
            background: "radial-gradient(circle, rgba(236,209,166,0.10) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", width: 360, height: 360, bottom: -60, left: "32%",
            background: "radial-gradient(circle, rgba(193,193,193,0.07) 0%, transparent 70%)" }} />
        </div>

        {/* Orbital rings */}
        <div
          className="pointer-events-none fixed hidden md:block"
          style={{ top: 0, left: 0, width: "55%", height: "100%", overflow: "hidden" }}
        >
          {ORBIT_RINGS.map((ring, i) => {
            const r   = ring.size / 2;
            const dir = ring.reverse ? "orbit-ccw" : "orbit-cw";
            return (
              <div key={i} style={{ position: "absolute", top: ring.top, left: ring.left,
                width: ring.size, height: ring.size, borderRadius: "50%",
                border: `1px solid ${ring.border}` }}>
                <div style={{
                  position: "absolute", width: ring.dotSize, height: ring.dotSize,
                  borderRadius: "50%", background: ring.dotColor,
                  top: -(ring.dotSize / 2), left: `calc(50% - ${ring.dotSize / 2}px)`,
                  transformOrigin: `${ring.dotSize / 2}px ${r + ring.dotSize / 2}px`,
                  animation: `${dir} ${ring.duration}s linear infinite`,
                  boxShadow: `0 0 ${ring.dotSize * 2}px ${ring.dotColor}`,
                }} />
              </div>
            );
          })}
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-end px-6 md:px-10 py-5 md:py-6">
          <a href="#" className="text-sm font-medium text-white/45 hover:text-white/70 transition-colors">
            Suporte
          </a>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-6 md:px-10 py-6 md:py-4">

          {/* Left — branding */}
          <div className="flex-1 max-w-xl w-full">
            <img src="/logo.svg" alt="Spin" className="mb-5 md:mb-6" style={{ height: 36, width: "auto" }} />
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 md:mb-8"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)", color: "#ECD1A6" }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#ECD1A6" }} />
              Beta &nbsp;·&nbsp; Tecnologia disruptiva
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 md:mb-6 text-white">
              Justiça no tempo certo, calculada com precisão.
            </h1>
            <p className="text-sm md:text-base mb-8 md:mb-10 text-white/55 leading-relaxed">
              A primeira plataforma otimizada de multicálculo de Indulto: intuitiva,
              rápida e com respostas jurídicas em menos de 5 minutos.
            </p>
            <div className="flex flex-wrap gap-6 md:gap-8">
              {STATS.map(({ icon: Icon, value, sub }) => (
                <div key={value} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(236,209,166,0.12)", border: "1px solid rgba(236,209,166,0.2)" }}>
                    <Icon className="w-4 h-4" style={{ color: "#ECD1A6" }} />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold text-white leading-tight">{value}</p>
                    <p className="text-xs mt-0.5 text-white/45">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — card with toggle */}
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-6 md:p-8"
            style={{ background: "rgba(193,193,193,0.10)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.13)" }}
          >
            {/* Toggle tabs */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={
                    tab === t
                      ? { backgroundColor: "#ECD1A6", color: "#1C2A39" }
                      : { color: "rgba(255,255,255,0.45)" }
                  }
                >
                  {t === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <LoginInner />
            ) : (
              <RegisterInner onSuccess={() => setTab("login")} />
            )}
          </div>

        </div>
      </div>
    </>
  );
};

/* ─── Login inner ─── */
const LoginInner = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const t = useTranslations();
  const loginPageSchema = useGenerateSchema(generateLoginPageSchema);
  const form = useForm<LoginPageSchema>({
    resolver: zodResolver(loginPageSchema),
    defaultValues: { email: "", password: "", loginType: "individual", rememberMe: false },
  });

  const onValidSubmit = useMemo<SubmitHandler<LoginPageSchema>>(
    () => async (data) => {
      setApiError(null);
      try {
        await AuthService.getInstance().login({ email: data.email, password: data.password });
      } catch (error) {
        if (ApiClient.isApiClientError<{ detail: string }>(error)) {
          const details = await error.details;
          setApiError(details?.detail || t("loginPage.genericApiError"));
          return;
        }
        console.error("Login failed:", error);
      }
    },
    [t],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-sm text-white/65">E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="advogado@escritorio.com.br"
                  className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="font-semibold text-sm text-white/65">Senha</FormLabel>
                <a href="#" className="text-xs text-white/40 hover:text-white/65 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <FormControl>
                <Input type="password"
                  className="text-white border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && (
          <Alert variant="destructive">
            <AlertCircleIcon /><AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full mt-2 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
        >
          {form.formState.isSubmitting && <Loader2Icon className="animate-spin w-4 h-4" />}
          Entrar
        </button>

        <div className="flex items-center gap-2 pt-2">
          <span className="text-green-400 font-bold">&#10003;</span>
          <p className="text-xs text-white/35">Seus dados estão seguros</p>
        </div>
      </form>
    </Form>
  );
};

/* ─── Register inner ─── */
const RegisterInner = ({ onSuccess }: { onSuccess: () => void }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onValidSubmit = useMemo<SubmitHandler<RegisterSchema>>(
    () => async (data) => {
      setApiError(null);
      try {
        await ApiClient.getInstance().post(
          "/client/register/",
          { name: data.name, email: data.email, password: data.password },
          { useAuthHeader: false },
        );
        setDone(true);
        setTimeout(onSuccess, 1800);
      } catch (err) {
        if (ApiClient.isApiClientError<{ detail: string }>(err)) {
          const details = await err.details;
          setApiError(details?.detail || "Erro ao criar conta. Tente novamente.");
        } else {
          setApiError("Erro inesperado. Tente novamente.");
        }
      }
    },
    [onSuccess],
  );

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2Icon className="w-12 h-12" style={{ color: "#ECD1A6" }} />
        <p className="text-lg font-bold text-white text-center">Conta criada!</p>
        <p className="text-sm text-white/50 text-center">
          Você ganhou <strong style={{ color: "#ECD1A6" }}>50 créditos</strong>.
          <br />Faça login para começar.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-sm text-white/65">Nome completo</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Dr. João da Silva"
                  className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-sm text-white/65">E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="advogado@escritorio.com.br"
                  className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-sm text-white/65">Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mínimo 8 caracteres"
                  className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-sm text-white/65">Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Repita a senha"
                  className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                  style={{ background: "rgba(255,255,255,0.09)" }} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && (
          <Alert variant="destructive">
            <AlertCircleIcon /><AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full mt-2 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
        >
          {form.formState.isSubmitting && <Loader2Icon className="animate-spin w-4 h-4" />}
          Criar minha conta grátis
        </button>

        <p className="text-xs text-center text-white/30 pt-1">
          Você receberá <span style={{ color: "#ECD1A6" }}>50 créditos</span> ao se cadastrar.
        </p>
      </form>
    </Form>
  );
};
