import { CalculadoraRepository } from "@/repositories/calculadora/CalculadoraRepository";
import { PaginatedRequest } from "@/types/api/api";
import {
  ApenadosCreatePayload,
  ApenadosCreateResponse,
  ApenadosUpdatePayload,
  ApenadosUpdateVariaveisPayload,
  CalculadoraCalculatePayload,
  CalculadoraCalculateResponse,
  CalculadoraCalculationsGroupedListPayload,
  CalculadoraCalculationsListPayload,
  CalculadoraCancelCalculationResponse,
  ListApenadosParams,
} from "@/types/calculadora";
import { ImpeditivosAvaliarPayload } from "@/types/calculadora/impeditivos";
import { ProcessResponse } from "@/types/calculadora/seeuReports";
import { CalculationVariavelEscopoEnum } from "@/types/enums";

export class CalculadoraService {
  private static instance: CalculadoraService;
  private calculadoraRepository: CalculadoraRepository;

  private constructor() {
    this.calculadoraRepository = new CalculadoraRepository();
  }

  public static getInstance(): CalculadoraService {
    if (!CalculadoraService.instance) {
      CalculadoraService.instance = new CalculadoraService();
    }
    return CalculadoraService.instance;
  }

  async processSeeuReport(params: {
    arquivos: File[];
    decretoUuid?: string;
    decretoDataCorte?: string;
  }) {
    // Process first; only wipe prior temp state once we know the new upload
    // succeeded. Otherwise a network/validation failure leaves the user with
    // empty localStorage and no way to recover the prior flow.
    const response = await this.calculadoraRepository.reports.processSeeuReport(
      {
        arquivos: params.arquivos,
        decretoUuid: params.decretoUuid,
      }
    );

    this.clearTempCalculationData();

    const dataWithDecreto = {
      ...response.data,
      ...(params.decretoUuid ? { decreto_uuid: params.decretoUuid } : {}),
      ...(params.decretoDataCorte
        ? { decreto_data_corte: params.decretoDataCorte }
        : {}),
    };
    this.calculadoraRepository.reports.storeTempSeeuResponse(dataWithDecreto);
    return response;
  }

  async getTempSeeuResponse() {
    return this.calculadoraRepository.reports.getTempSeeuResponse();
  }

  async updateTempSeeuResponse(data: Partial<ProcessResponse>) {
    this.calculadoraRepository.reports.updateTempSeeuResponse(data);
  }

  async updateTempApenado(data: Partial<ApenadosCreateResponse["data"]>) {
    return this.calculadoraRepository.apenados.storeTempApenado(data);
  }

  async getTempApenado() {
    return this.calculadoraRepository.apenados.getTempApenado();
  }

  cancelCalculation(
    uuid: string
  ): Promise<CalculadoraCancelCalculationResponse> {
    return this.calculadoraRepository.cancelCalculation(uuid);
  }

  completeCalculation(
    uuid: string
  ): Promise<CalculadoraCancelCalculationResponse> {
    return this.calculadoraRepository.completeCalculation(uuid);
  }

  async getCalculation(uuid: string, signal?: AbortSignal) {
    return this.calculadoraRepository.getCalculation(uuid, signal);
  }

  async getPeticaoData(uuid: string, signal?: AbortSignal) {
    return this.calculadoraRepository.getPeticaoData(uuid, signal);
  }

  async cancelTempSeeuResponse(): Promise<CalculadoraCancelCalculationResponse | null> {
    const tempApenado = await this.getTempApenado();

    const calculoHasApenado = tempApenado?.uuid;
    const calculationUuid = tempApenado?.calculations?.[0]?.uuid;
    let cancelResult: CalculadoraCancelCalculationResponse | null = null;
    if (calculoHasApenado && calculationUuid) {
      cancelResult = await this.cancelCalculation(calculationUuid);
    }
    this.clearTempCalculationData();
    return cancelResult;
  }

  clearTempCalculationData() {
    this.calculadoraRepository.reports.clearTempSeeuResponse();
    this.calculadoraRepository.apenados.clearTempApenado();
    this.calculadoraRepository.clearTempCalculationResult();
    this.calculadoraRepository.clearTempCalculationVariablesHistory();
    this.calculadoraRepository.clearTempCalculationMetadata();
  }

  async impeditivosAvaliar(payload: ImpeditivosAvaliarPayload) {
    return this.calculadoraRepository.impeditivos.avaliar(payload);
  }

  async createApenado(payload: ApenadosCreatePayload) {
    return this.calculadoraRepository.apenados.create(payload);
  }

  async updateApenadoVariaveis(
    apenadoUuid: string,
    payload: Partial<ApenadosUpdateVariaveisPayload>
  ) {
    return this.calculadoraRepository.apenados.updateApenadoVariaveis(
      apenadoUuid,
      payload
    );
  }

  async updateApenado(
    apenadoUuid: string,
    payload: Partial<ApenadosUpdatePayload>
  ) {
    const response = await this.calculadoraRepository.apenados.updateApenado(
      apenadoUuid,
      payload
    );

    return response;
  }

  async updateApenadoVariavel(
    data:
      | {
          escopo: CalculationVariavelEscopoEnum.Apenado;
          variavelIdentificador: string;
          variavelValor: unknown;
        }
      | {
          escopo: CalculationVariavelEscopoEnum.Pena;
          variavelIdentificador: string;
          variavelValor: unknown;
          crimeUuid: string;
        }
  ) {
    const { escopo, variavelIdentificador, variavelValor } = data;
    const tempApenado = await this.getTempApenado();

    if (!tempApenado) {
      throw new Error("No temp apenado found");
    }

    const tempCalculationResult = await this.getTempCalculationResult();

    if (!tempCalculationResult) {
      throw new Error("No temp calculation result found");
    }

    const variaveisRespondidas =
      tempCalculationResult.variaveis_respondidas || [];

    const variaveisRespondidasAsObject: Record<string, unknown> = {};
    const crimesRespondidos: Array<{
      uuid: string;
      variaveis: Record<string, unknown>;
    }> = [];

    if (escopo === CalculationVariavelEscopoEnum.Apenado) {
      variaveisRespondidas
        .filter(
          (variavel) =>
            variavel.escopo === CalculationVariavelEscopoEnum.Apenado
        )
        .forEach((variavel) => {
          variaveisRespondidasAsObject[
            variavel.identificador.replace(`${variavel.escopo}.`, "")
          ] = variavel.valor;
        });

      variaveisRespondidasAsObject[variavelIdentificador] = variavelValor;
    }

    if (escopo === CalculationVariavelEscopoEnum.Pena) {
      const { crimeUuid } = data;
      crimesRespondidos.push({
        uuid: crimeUuid,
        variaveis: {
          [variavelIdentificador.replace(`${escopo}.`, "")]: variavelValor,
        },
      });
    }

    const updatedVariaveis = {
      ...variaveisRespondidasAsObject,
    };

    await this.updateApenadoVariaveis(tempApenado.uuid, {
      variaveis: updatedVariaveis,
      crimes: crimesRespondidos.length === 0 ? undefined : crimesRespondidos,
    });

    const tempMetadata =
      this.calculadoraRepository.getTempCalculationMetadata();

    await this.calculate({
      apenado_id: tempApenado.uuid,
      decreto_id: tempCalculationResult.impeditivos_check.data.decreto_uuid,
      metadata: tempMetadata,
    });

    this.calculadoraRepository.addTempCalculationVariableToHistory({
      variavelIdentificador,
      variavelValor,
      timestamp: Date.now(),
      escopo,
      ref_id:
        escopo === CalculationVariavelEscopoEnum.Pena
          ? data.crimeUuid
          : undefined,
    });
  }

  getCalculationVariablesHistory() {
    return this.calculadoraRepository.getTempCalculationVariablesHistory();
  }

  async listApenados(params?: ListApenadosParams, signal?: AbortSignal) {
    return this.calculadoraRepository.apenados.list(params, signal);
  }

  async listDecretos(
    params?: PaginatedRequest<{ search?: string }>,
    signal?: AbortSignal
  ) {
    return this.calculadoraRepository.listDecretos(params, signal);
  }

  async refreshCalculation() {
    const tempApenado = await this.getTempApenado();

    if (!tempApenado) {
      throw new Error("No temp apenado found");
    }

    const tempCalculationResult = await this.getTempCalculationResult();

    if (!tempCalculationResult) {
      throw new Error("No temp calculation result found");
    }

    const metadata = this.calculadoraRepository.getTempCalculationMetadata();

    const response = await this.calculate({
      apenado_id: tempApenado.uuid,
      decreto_id: tempCalculationResult.impeditivos_check.data.decreto_uuid,
      metadata,
    });

    return response;
  }

  async calculate(payload: CalculadoraCalculatePayload) {
    const response = await this.calculadoraRepository.calculate(payload);

    await this.calculadoraRepository.storeTempCalculationResult(response);

    return response;
  }

  async updateTempCalculationResult(result: CalculadoraCalculateResponse) {
    return this.calculadoraRepository.storeTempCalculationResult(result);
  }

  async getTempCalculationResult() {
    return this.calculadoraRepository.getTempCalculationResult();
  }

  async getTempCalculationPendingVariables() {
    const tempResult = this.calculadoraRepository.getTempCalculationResult();
    return tempResult?.variaveis_pendentes || null;
  }

  async listApenadosMetadata(
    params?: ListApenadosParams,
    signal?: AbortSignal
  ) {
    return this.calculadoraRepository.apenados.listMetadata(params, signal);
  }

  async listCalculations(
    payload: CalculadoraCalculationsListPayload,
    signal?: AbortSignal
  ) {
    return this.calculadoraRepository.listCalculations(payload, signal);
  }

  async listCalculationsGrouped(
    payload: CalculadoraCalculationsGroupedListPayload,
    signal?: AbortSignal
  ) {
    return this.calculadoraRepository.listCalculationsGrouped(payload, signal);
  }

  getTempCalculationMetadata() {
    return this.calculadoraRepository.getTempCalculationMetadata();
  }

  updateTempCalculationMetadata(
    metadata: CalculadoraCalculatePayload["metadata"]
  ) {
    return this.calculadoraRepository.storeTempCalculationMetadata(metadata);
  }

  updateTempCalculationMetadataItem<
    K extends keyof CalculadoraCalculatePayload["metadata"],
  >(key: K, value: CalculadoraCalculatePayload["metadata"][K]) {
    const metadata =
      this.calculadoraRepository.getTempCalculationMetadata() || {};

    const updatedMetadata = {
      ...metadata,
      [key]: value,
    };

    this.calculadoraRepository.storeTempCalculationMetadata(updatedMetadata);
  }
}
