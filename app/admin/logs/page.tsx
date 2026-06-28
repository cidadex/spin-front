"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiClient } from "@/services/api/ApiClient";

interface SystemLog {
  id: number;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  level_number: number;
  logger_name: string;
  message: string;
  traceback: string;
  extra: Record<string, string>;
  created_at: string;
}

interface LogsResponse {
  count: number;
  results: SystemLog[];
}

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: "bg-gray-100 text-gray-600",
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-yellow-100 text-yellow-700",
  ERROR: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-900 font-bold",
};

const LEVELS = ["ALL", "CRITICAL", "ERROR", "WARNING", "INFO"] as const;

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filter !== "ALL") params.set("level", filter);
      const client = ApiClient.getInstance();
      const data = await client.get<LogsResponse>(
        `/api/logs/?${params.toString()}`
      );
      setLogs(data.results);
      setCount(data.count);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao buscar logs");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLogs]);

  const handleClear = async () => {
    if (!confirm("Apagar todos os logs? Esta ação não pode ser desfeita."))
      return;
    try {
      const res = await fetch("/api/logs/", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchLogs();
    } catch (e) {
      alert("Erro ao apagar logs: " + (e instanceof Error ? e.message : e));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Logs do Sistema</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {count} registros totais
              {lastRefresh && (
                <span className="ml-2">
                  · Atualizado às {lastRefresh.toLocaleTimeString("pt-BR")}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh 10s
            </label>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
            >
              {loading ? "..." : "↻ Atualizar"}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
            >
              Limpar logs
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                filter === level
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum log encontrado{filter !== "ALL" ? ` para nível ${filter}` : ""}.
          </div>
        )}

        <div className="space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-border rounded-md overflow-hidden"
            >
              <div
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30"
                onClick={() =>
                  setExpanded(expanded === log.id ? null : log.id)
                }
              >
                <span
                  className={`mt-0.5 shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${LEVEL_COLORS[log.level] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {log.level}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-muted-foreground/60 shrink-0 truncate max-w-[200px]">
                      {log.logger_name}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5 font-mono break-all">
                    {log.message}
                  </p>
                </div>
                {(log.traceback || Object.keys(log.extra).length > 0) && (
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {expanded === log.id ? "▲" : "▼"}
                  </span>
                )}
              </div>

              {expanded === log.id && (
                <div className="border-t border-border bg-muted/20 p-3 space-y-3">
                  {Object.keys(log.extra).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Contexto
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(log.extra).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-xs bg-background border border-border rounded px-2 py-0.5"
                          >
                            <span className="text-muted-foreground">{k}:</span>{" "}
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.traceback && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Traceback
                      </p>
                      <pre className="text-xs font-mono bg-black/90 text-green-400 p-3 rounded overflow-x-auto whitespace-pre-wrap break-all">
                        {log.traceback}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
