"use client";

import { DonateForm } from "@/components/donate/donate-form";
import { DonateHelpPanel } from "@/components/donate/donate-help-panel";

type DonateWorkspaceProps = {
  mode: "donate" | "claim";
  configured: boolean;
};

export function DonateWorkspace({ mode, configured }: DonateWorkspaceProps) {
  return (
    <div className="mx-auto grid w-full gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <DonateHelpPanel mode={mode} />
      <DonateForm mode={mode} configured={configured} />
    </div>
  );
}
