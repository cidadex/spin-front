"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon, Scale, ShieldCheck, Zap } from "lucide-react";
import { ApiClient } from "@/services/api/ApiClient";

const ORBIT_RINGS = [
  { size: 380, top: "12%",  left: "-8%",   duration: 40, dotColor: "rgba(236,209,166,0.55)", dotSize: 6, reverse: false, border: "rgba(255,255,255,0.055)" },
  { size: 240, top: "55%",  left: "6%",    duration: 28, dotColor: "rgba(193,193,193,0.6)",  dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.04)"  },
  { size: 150, top: "20%",  left: "38%",   duration: 22, dotColor: "rgba(236,209,166,0.45)", dotSize: 4, reverse: false, border: "rgba(255,255,255,0.045)" },
  { size: 300, top: "62%",  left: "26%",   duration: 46, dotColor: "rgba(255,255,255,0.35)", dotSize: 5, reverse: true,  border: "rgba(255,255,255,0.035)" },
  { size: 100, top: "6%",   left: "44%",   duration: 18, dotColor: "rgba(193,193,193,0.5)",  dotSize: 3, reverse: false, border: "rgba(255,255,255,0.05)"  },
];

const PERKS = [
  { icon: Zap,         value: "50 créditos",    sub: "gratuitos ao criar conta"       },
  { icon: Scale,       value: "Multicálculo",    sub: "Indulto com precisão jurídica"  },
  { icon: ShieldCheck, value: "Dados seguros",   sub: "Ambiente criptografado"         },
];

const registerSchema = z.object({
  name:            z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email:           z.string().email("E-mail inválido"),
  password:        z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Unauthenticated]}
      redirectTo="/"
    >
      <RegisterPage />
    </ProtectedRoute>
  );
}

const RegisterPage = () => {
  const { push } = useRouter();
  const [apiError, setApiError]   = useState<string | null>(null);
  const [success,  setSuccess]    = useState(false);

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
        setSuccess(true);
        setTimeout(() => push("/login"), 2000);
      } catch (err) {
        if (ApiClient.isApiClientError<{ detail: string }>(err)) {
          const details = await err.details;
          setApiError(details?.detail || "Erro ao criar conta. Tente novamente.");
        } else {
          setApiError("Erro inesperado. Tente novamente.");
        }
      }
    },
    [push],
  );

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
          <div style={{ position: "absolute", width: 500, height: 500, top: -100, right: -120,
            background: "radial-gradient(circle, rgba(236,209,166,0.10) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", width: 360, height: 360, bottom: -60, right: "32%",
            background: "radial-gradient(circle, rgba(193,193,193,0.07) 0%, transparent 70%)" }} />
        </div>

        {/* Orbital rings — desktop only, right side */}
        <div
          className="pointer-events-none fixed hidden md:block"
          style={{ top: 0, right: 0, width: "55%", height: "100%", overflow: "hidden" }}
        >
          {ORBIT_RINGS.map((ring, i) => {
            const r   = ring.size / 2;
            const dir = ring.reverse ? "orbit-ccw" : "orbit-cw";
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top:    ring.top,
                  left:   ring.left,
                  width:  ring.size,
                  height: ring.size,
                  borderRadius: "50%",
                  border: `1px solid ${ring.border}`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width:  ring.dotSize,
                    height: ring.dotSize,
                    borderRadius: "50%",
                    background: ring.dotColor,
                    top:  -(ring.dotSize / 2),
                    left: `calc(50% - ${ring.dotSize / 2}px)`,
                    transformOrigin: `${ring.dotSize / 2}px ${r + ring.dotSize / 2}px`,
                    animation: `${dir} ${ring.duration}s linear infinite`,
                    boxShadow: `0 0 ${ring.dotSize * 2}px ${ring.dotColor}`,
                  }}
                />
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
        <div className="relative z-10 flex-1 flex flex-col md:flex-row-reverse items-center justify-center gap-10 md:gap-16 px-6 md:px-10 py-6 md:py-4">

          {/* Right — branding */}
          <div className="flex-1 max-w-xl w-full">
            <img src="/logo.svg" alt="Spin" className="mb-5 md:mb-6" style={{ height: 36, width: "auto" }} />

            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 md:mb-8"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                color: "#ECD1A6",
              }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#ECD1A6" }} />
              Crie sua conta gratuitamente
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 md:mb-6 text-white">
              Comece agora com <span style={{ color: "#ECD1A6" }}>50 créditos</span> gratuitos.
            </h1>

            <p className="text-sm md:text-base mb-8 md:mb-10 text-white/55 leading-relaxed">
              Crie sua conta em segundos e acesse a plataforma de multicálculo
              de Indulto mais precisa do Brasil.
            </p>

            <div className="flex flex-wrap gap-6 md:gap-8">
              {PERKS.map(({ icon: Icon, value, sub }) => (
                <div key={value} className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "rgba(236,209,166,0.12)",
                      border:     "1px solid rgba(236,209,166,0.2)",
                    }}
                  >
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

          {/* Left — register card */}
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-6 md:p-8"
            style={{
              background:     "rgba(193,193,193,0.10)",
              backdropFilter: "blur(20px)",
              border:         "1px solid rgba(255,255,255,0.13)",
            }}
          >
            {success ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle2Icon className="w-14 h-14" style={{ color: "#ECD1A6" }} />
                <p className="text-xl font-bold text-white text-center">Conta criada!</p>
                <p className="text-sm text-white/55 text-center">
                  Redirecionando para o login…
                </p>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">
                  É rápido e gratuito!
                </p>
                <h2 className="text-xl font-bold mb-6 text-white">
                  Criar conta
                </h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-sm text-white/65">Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Dr. João da Silva"
                              className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                              style={{ background: "rgba(255,255,255,0.09)" }}
                              {...field}
                            />
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
                            <Input
                              type="email"
                              placeholder="advogado@escritorio.com.br"
                              className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                              style={{ background: "rgba(255,255,255,0.09)" }}
                              {...field}
                            />
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
                            <Input
                              type="password"
                              placeholder="Mínimo 8 caracteres"
                              className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                              style={{ background: "rgba(255,255,255,0.09)" }}
                              {...field}
                            />
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
                            <Input
                              type="password"
                              placeholder="Repita a senha"
                              className="text-white placeholder:text-white/25 border-0 focus-visible:ring-1 focus-visible:ring-white/25"
                              style={{ background: "rgba(255,255,255,0.09)" }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {apiError && (
                      <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertDescription>{apiError}</AlertDescription>
                      </Alert>
                    )}

                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full mt-2 py-3 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#ECD1A6", color: "#1C2A39" }}
                    >
                      {form.formState.isSubmitting && (
                        <Loader2Icon className="animate-spin w-4 h-4" />
                      )}
                      Criar minha conta
                    </button>
                  </form>
                </Form>

                <div
                  className="mt-6 pt-5 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">&#10003;</span>
                    <p className="text-xs text-white/35">Seus dados estão seguros</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => push("/login")}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#ECD1A6" }}
                  >
                    Já tenho conta
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};
