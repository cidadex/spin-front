import { DadosPessoaisPageRouteConfig } from "@/app/calculo/novo/dados-pessoais/route-config";
import { DadosProcessuaisPageRouteConfig } from "@/app/calculo/novo/dados-processuais/route-config";
import { QuestionarioDinamicoPageRouteConfig } from "@/app/calculo/novo/questionario-dinamico/route-config";
import { RelatorioPageRouteConfig } from "@/app/calculo/novo/relatorio/route-config";

export interface RouteConfigProps {
  hideMenu?: boolean;
  configs?: Record<string, unknown>;
}

export const routeConfig: Record<string, RouteConfigProps> = {
  "/calculo/novo/dados-pessoais": DadosPessoaisPageRouteConfig,
  "/calculo/novo/dados-processuais": DadosProcessuaisPageRouteConfig,
  "/calculo/novo/questionario-dinamico": QuestionarioDinamicoPageRouteConfig,
  "/calculo/novo/relatorio": RelatorioPageRouteConfig,
} as const;

export const shouldHideMenu = (pathname: string): boolean => {
  return routeConfig[pathname]?.hideMenu ?? false;
};

export const shouldHideSidebars = (pathname: string): boolean => {
  return routeConfig[pathname]?.configs?.hideSidebars === true;
};
