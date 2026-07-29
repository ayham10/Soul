import { getStockStatus } from "@/lib/inventory";

const STYLES = {
  in: { bg: "rgba(93, 158, 106, 0.18)", color: "#7ecf93", border: "rgba(93, 158, 106, 0.45)" },
  low: { bg: "rgba(196, 122, 53, 0.18)", color: "#e3a86a", border: "rgba(196, 122, 53, 0.45)" },
  out: { bg: "rgba(224, 116, 106, 0.16)", color: "#e0746a", border: "rgba(224, 116, 106, 0.42)" },
} as const;

export default function AdminStockBadge({
  stock,
  labels,
}: {
  stock: number;
  labels: { in: string; low: string; out: string };
}) {
  const status = getStockStatus(stock);
  const style = STYLES[status];
  const label = labels[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 9.5,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        padding: "5px 9px",
        borderRadius: 2,
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {label} · {stock}
    </span>
  );
}
