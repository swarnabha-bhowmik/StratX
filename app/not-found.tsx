import type { Metadata } from "next";
import NotFoundClient from "@/components/custom/NotFoundClient";

export const metadata: Metadata = {
  title: "404 - Coordinate Not Found | StratX",
  description:
    "The requested page or autonomous agent coordinate could not be found. Return to StratX mission control or browse pre-built templates.",
};

export default function NotFound() {
  return <NotFoundClient />;
}
