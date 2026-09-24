import type { Metadata } from "next";
import { LANDINGS, OperationLanding } from "@/components/seo/operation-landing";

const landing = LANDINGS.venta;

export const metadata: Metadata = {
  title: landing.title,
  description: landing.description,
  alternates: { canonical: landing.path },
  openGraph: { title: landing.title, description: landing.description, url: landing.path },
};

export default function Page() {
  return <OperationLanding operation="venta" />;
}
