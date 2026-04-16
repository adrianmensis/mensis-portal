import type { ReactNode } from "react";
import { Label } from "./label";

type Props = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
