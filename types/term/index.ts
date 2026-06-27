import { TermTypeEnum } from "../enums";

export interface TermResponse {
  uuid: string;
  version: string;
  type: TermTypeEnum;
  content: string;
  created_at: string;
}
