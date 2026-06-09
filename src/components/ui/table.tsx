import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-400">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className = "", children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-5 py-3 font-semibold ${className}`.trim()} {...rest}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-zinc-50/50">{children}</tr>;
}

export function Td({ className = "", children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-3 ${className}`.trim()} {...rest}>
      {children}
    </td>
  );
}
