"use client";

import React from "react";
import IrisLabScene from "@/components/iris-lab/IrisLabScene";

export default function IrisLabPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030304]">
      <IrisLabScene className="w-full h-full" />
    </main>
  );
}
