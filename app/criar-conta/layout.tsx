import { UnauthenticatedLayout } from "@/components/ui/layouts/UnauthenticatedLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <UnauthenticatedLayout>{children}</UnauthenticatedLayout>;
}
