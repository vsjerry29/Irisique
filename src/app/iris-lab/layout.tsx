import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRIS — Lab",
  description: "Cinematic interactive iris experience",
};

export default function IrisLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
