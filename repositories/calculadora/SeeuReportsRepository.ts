import { ApiClient } from "@/services/api/ApiClient";
import { ApiBaseResponse } from "@/types/api/api";
import { ProcessResponse } from "@/types/calculadora";

export class SeeuReportsRepository {
  private apiClient: ApiClient;
  public static readonly TEMP_SEEU_RESPONSE_KEY = "temp_seeu_response";

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  processSeeuReport({
    arquivos,
    decretoUuid,
  }: {
    arquivos: File[];
    decretoUuid?: string;
  }) {
    const formData = new FormData();
    arquivos.forEach((file) => {
      formData.append("arquivos", file);
    });
    if (decretoUuid) {
      formData.append("decreto_uuid", decretoUuid);
    }

    return this.apiClient.post<ApiBaseResponse<ProcessResponse>, FormData>(
      "/calculadora/seeu-reports/process/",
      formData,
      {
        useAuthHeader: true,
      }
    );
  }

  storeTempSeeuResponse(data: ProcessResponse) {
    const dataString = JSON.stringify(data);
    localStorage.setItem(
      SeeuReportsRepository.TEMP_SEEU_RESPONSE_KEY,
      dataString
    );
  }

  updateTempSeeuResponse(data: Partial<ProcessResponse>) {
    const existingData = this.getTempSeeuResponse() || {};
    const updatedData = {
      ...existingData,
      ...data,
    } as ProcessResponse;
    this.storeTempSeeuResponse(updatedData);
  }

  getTempSeeuResponse(): ProcessResponse | null {
    const dataString = localStorage.getItem(
      SeeuReportsRepository.TEMP_SEEU_RESPONSE_KEY
    );
    if (!dataString) return null;
    // Tolerate a corrupted/half-written entry: surface as "no temp state"
    // rather than crashing every caller with SyntaxError.
    try {
      return JSON.parse(dataString) as ProcessResponse;
    } catch {
      this.clearTempSeeuResponse();
      return null;
    }
  }

  clearTempSeeuResponse() {
    localStorage.removeItem(SeeuReportsRepository.TEMP_SEEU_RESPONSE_KEY);
  }
}
