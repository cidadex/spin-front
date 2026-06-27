export interface IGenerateSchemaFunction<T = unknown> {
  (translator: (k: string) => string): T;
}
