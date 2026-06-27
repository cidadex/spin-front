export interface ProcessResponseIdentificacao {
  nome: string;
  cpf: string;
  data_nascimento: SeeuDate;
  rg: string;
  nome_mae: string;
  numero_unico: string;
  ativo: boolean;
}

export type SeeuDate = `${string}-${string}-${string}`;

export interface SeeuReportDuracao {
  anos: number;
  meses: number;
  dias: number;
}

interface ProcessResponseCalculosPena {
  regime_atual: string | null;
  pena_total_imposta: SeeuReportDuracao | null;
  pena_cumprida: SeeuReportDuracao | null;
  pena_remanescente: SeeuReportDuracao | null;
  data_progressao_regime: SeeuDate | null;
  data_livramento_condicional: SeeuDate | null;
  total_dias_remidos: number | null;
}

export interface ProcessResponseCrime {
  numero_condenacao: string;
  dispositivo: string;
  diploma: string;
  data_cometimento: SeeuDate;
  pena_anos: number;
  pena_meses: number;
  pena_dias: number;
  com_violencia_ou_grave_ameaca: boolean;
  cumulacao: string | null;
  extinto: boolean;
  // Emitted by the backend transformer but not always populated by FE forms
  // that re-serialize the crime list (e.g. the legacy dados-processuais
  // step). Optional in the type so producers may omit them.
  data_sentenca?: SeeuDate | null;
  data_transito_julgado?: SeeuDate | null;
  resultado_morte?: boolean;
  reincidente_comum?: boolean;
  reincidente_especifico?: boolean;
  comando_organizacao_criminosa?: boolean;
  hediondo_linha_tempo?: boolean | null;
  regime_inicial?: string | null;
  indultado?: boolean;
  comutado?: boolean;
  observacao?: string | null;
}

interface RawProcessoExecucao {
  "Número Único": string;
  Ativo: boolean;
  "Número Antigo": string | null;
  Nome: string;
  CPF: string;
  RG: string;
  "Nome da Mãe": string;
  "Data de Nascimento": SeeuDate;
}

interface RawDuracao {
  years: number;
  months: number;
  days: number;
}

interface RawSaldoDiasRemidos {
  total_days: number;
  redeemed_days: number;
  lost_days: number;
}

interface RawCalculosPena {
  "Regime Atual": string;
  "Pena Total Imposta": RawDuracao;
  "Pena Cumprida Até Data Atual": RawDuracao;
  "Pena Remanescente": RawDuracao;
  "Total Interrupções": RawDuracao;
  "Saldo dias Remidos": RawSaldoDiasRemidos;
  "Data prevista para o Término da Pena": SeeuDate;
}

interface RawProgressaoItem {
  [key: string]: RawDuracao;
}

interface RawCalculosProgressaoRegime {
  "Data-base adotada no cálculo para progresso regime": SeeuDate;
  Progressão: RawProgressaoItem[];
  "Data prevista para progressão de regime": SeeuDate;
}

interface RawCalculosLivramentoCondicional {
  "Data-base adotada no cálculo para livramento condicional": SeeuDate;
  Progressão: RawProgressaoItem[];
  "Data prevista livramento condicional": SeeuDate;
}

interface RawPenaTotal {
  years: number;
  months: number;
  days: number;
  comment: string;
}

interface RawDesmembramento {
  Lei: string;
  "Artigo da Lei": string;
  Pena: string;
  "Pena Imposta": RawDuracao;
  "Data da infração": SeeuDate;
  "Violência ou grave ameaça": boolean;
  "Resultado morte": boolean;
  "Reincidente comum": boolean;
  "Reincidente específico": boolean;
  "Condenado por exercer comando de organização criminosa": boolean;
  "Fração adotada no cálculo para progressão de regime": string;
  "Fração adotada no cálculo para livramento condicional": string;
  Extinto: boolean;
  "Data da extinção": SeeuDate | null;
  Suspenso: boolean | null;
  "Data de suspensão": SeeuDate | null;
}

interface RawProcessoCriminal {
  Número: string;
  Extinta: boolean;
  Indultada: boolean;
  Comutada: boolean;
  Tipo: string;
  "Juízo/Vara de condenação": string | null;
  "Data do recebimento da denúncia": SeeuDate | string;
  "Data da Sentença": SeeuDate | string;
  "Data do trânsito em julgado do Ministério Público": SeeuDate | string;
  "Data do trânsito em julgado do processo": SeeuDate | string;
  Observação: string;
  "Sentença/Acórdão/Recurso Ativo": boolean;
  "Pena total": RawPenaTotal;
  "Regime imposto na sentença/acórdão": string;
  "DESMEMBRAMENTO(S)": RawDesmembramento[];
}

interface RawEvento {
  Tipo: string;
  Motivo: string;
  Data: SeeuDate;
  "Processos Selecionados": string[] | null;
}

interface RawIncidente {
  Tipo: string;
  Complemento: string | null;
  "Data Decisão": SeeuDate;
  "Data Referência": SeeuDate;
  "Processos Selecionados": string[] | null;
}

export interface ProcessResponseRawData {
  "PROCESSO DE EXECUÇÃO": RawProcessoExecucao;
  "CÁLCULOS DA PENA": RawCalculosPena;
  "CÁLCULOS PARA PROGRESSÃO DE REGIME": RawCalculosProgressaoRegime;
  "CÁLCULOS PARA LIVRAMENTO CONDICIONAL": RawCalculosLivramentoCondicional;
  "PROCESSOS CRIMINAIS": RawProcessoCriminal[];
  "EVENTOS DE INÍCIO, REINÍCIO E INTERRRUPÇÃO(ÕES) DO CUMPRIMENTO DA PENA": RawEvento[];
  "INCIDENTES CONCEDIDOS": RawIncidente[];
}

export interface ProcessResponseMarcosTemporaisItem {
  evento: string;
  data: SeeuDate;
  cumprindo_pena: boolean;
}

export type ProcessResponse = {
  identificacao: ProcessResponseIdentificacao;
  calculos_pena: ProcessResponseCalculosPena;
  linha_do_tempo_raw: Record<string, unknown>;
  raw_data: ProcessResponseRawData;
  crimes: ProcessResponseCrime[];
  marcos_temporais: ProcessResponseMarcosTemporaisItem[];
  seeu_emission_date?: string | null;
  decreto_uuid?: string;
  decreto_data_corte?: string;
};
