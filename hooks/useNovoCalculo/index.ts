import { NovoCalculoContext } from "@/contexts/novo-calculo/context";
import { useContext } from "react";

export const useNovoCalculo = () => useContext(NovoCalculoContext);
