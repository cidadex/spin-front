"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { AuthStatusEnum } from "@/types/enums";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      <SettingsPage />
    </ProtectedRoute>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

const inputReadonlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.4)",
  cursor: "not-allowed",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  color: "rgba(255,255,255,0.5)",
  marginBottom: "6px",
  display: "block",
};

const SettingsPage = () => {
  return (
    <div style={{ width: "100%" }}>
      <div className="px-6 md:px-10 pt-10 pb-8">
        <p style={{ color: "#C9A84C", fontSize: "13px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Configurações
        </p>
        <h1 className="text-2xl font-bold text-white mt-1">Perfil e Configurações</h1>
      </div>

      <div className="px-6 md:px-10 pb-10 flex flex-col gap-6">
        <ProfileHeader />
        <UserSection />
        <SecuritySection />
        <DangerSection />
      </div>
    </div>
  );
};

const ProfileHeader = () => {
  const { me } = useAuth();

  const userInitials = useMemo(() => {
    const first = me?.first_name?.charAt(0)?.toUpperCase() ?? "";
    const last = me?.last_name?.charAt(0)?.toUpperCase() ?? "";
    return first + last || "?";
  }, [me]);

  const fullName = me ? `${me.first_name} ${me.last_name}`.trim() : "—";

  return (
    <div
      className="rounded-xl p-6 flex flex-col items-center gap-4"
      style={cardStyle}
    >
      <div
        className="flex items-center justify-center rounded-full text-white font-bold text-2xl"
        style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          border: "2px solid rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      >
        {userInitials}
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-base">{fullName}</p>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>{me?.email}</p>
      </div>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)",
          cursor: "not-allowed",
          opacity: 0.6,
        }}
        disabled
        title="Em breve"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
        Alterar Foto
      </button>
    </div>
  );
};

type UserFormValues = {
  first_name: string;
  last_name: string;
};

const UserSection = () => {
  const { me, authService } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UserFormValues>({
    defaultValues: {
      first_name: me?.first_name ?? "",
      last_name: me?.last_name ?? "",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    if (!authService?.current) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.current.updateMe(values);
      setSuccess(true);
      reset(values);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl p-6 flex flex-col gap-5" style={cardStyle}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined" style={{ color: "#8b5cf6", fontSize: 20 }}>person</span>
        <h2 className="text-white font-semibold text-base">Perfil do usuário</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Nome</label>
            <input
              {...register("first_name")}
              type="text"
              style={inputStyle}
              placeholder="Nome"
            />
          </div>
          <div>
            <label style={labelStyle}>Sobrenome</label>
            <input
              {...register("last_name")}
              type="text"
              style={inputStyle}
              placeholder="Sobrenome"
            />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input
              type="email"
              value={me?.email ?? ""}
              readOnly
              style={inputReadonlyStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Número da OAB</label>
            <input
              type="text"
              readOnly
              placeholder="Em breve"
              style={inputReadonlyStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#4ade80", fontSize: "13px" }}>Salvo com sucesso!</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => reset()}
            disabled={!isDirty || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.6)",
              opacity: !isDirty || saving ? 0.4 : 1,
              cursor: !isDirty || saving ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: isDirty && !saving ? "rgba(99,102,241,0.8)" : "rgba(99,102,241,0.3)",
              border: "1px solid rgba(99,102,241,0.5)",
              color: "#fff",
              opacity: !isDirty || saving ? 0.5 : 1,
              cursor: !isDirty || saving ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {saving ? "hourglass_empty" : "save"}
            </span>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

const SecuritySection = () => {
  return (
    <div className="rounded-xl p-6 flex flex-col gap-5" style={cardStyle}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined" style={{ color: "#8b5cf6", fontSize: 20 }}>shield</span>
        <h2 className="text-white font-semibold text-base">Segurança</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="flex items-center justify-between py-4 px-4 rounded-lg"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-white text-sm font-medium">Alterar senha</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: 2 }}>
              Atualize sua senha de acesso
            </p>
          </div>
          <button
            disabled
            title="Em breve"
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.4)",
              cursor: "not-allowed",
            }}
          >
            Em breve
          </button>
        </div>

        <div
          className="flex items-center justify-between py-4 px-4 rounded-lg"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-white text-sm font-medium">Autenticação em dois fatores</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: 2 }}>
              Adicione uma camada extra de segurança
            </p>
          </div>
          <button
            disabled
            title="Em breve"
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.4)",
              cursor: "not-allowed",
            }}
          >
            Em breve
          </button>
        </div>
      </div>
    </div>
  );
};

const DangerSection = () => {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined" style={{ color: "#f87171", fontSize: 20 }}>warning</span>
        <h2 className="font-semibold text-base" style={{ color: "#f87171" }}>Zona de perigo</h2>
      </div>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
        A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
      </p>
      <div>
        <button
          disabled
          title="Em breve"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            cursor: "not-allowed",
            opacity: 0.6,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          Excluir conta
        </button>
      </div>
    </div>
  );
};
