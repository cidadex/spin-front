"use client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NovoCalculoPage() {
  const { push } = useRouter();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    push("/calculo/novo/dados-pessoais");
  }, [push]);
  return (
    <>
      <Loader className="animate-spin" />
    </>
  );
}
