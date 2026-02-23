import toast from "react-hot-toast";

// Nike-like minimalist toast style
const baseStyle = {
  border: "1px solid #E5E7EB",
  padding: "12px 16px",
  color: "#111827",
  background: "#FFFFFF",
  borderRadius: "2px",
  fontWeight: "700",
  fontSize: "0.80rem",
  textTransform: "uppercase" as const,
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  letterSpacing: "0.025em",
};

export const showNotification = (
  message: string,
  severity: "success" | "error" | "warning" | "info" = "success"
) => {
  switch (severity) {
    case "success":
      toast.success(message, {
        style: { ...baseStyle, borderLeft: "4px solid #10B981" },
        iconTheme: { primary: "#10B981", secondary: "#FFF" },
      });
      break;
    case "error":
      toast.error(message, {
        style: { ...baseStyle, borderLeft: "4px solid #EF4444" },
        iconTheme: { primary: "#EF4444", secondary: "#FFF" },
      });
      break;
    case "warning":
      toast(message, {
        icon: "⚠️",
        style: { ...baseStyle, borderLeft: "4px solid #F59E0B" },
      });
      break;
    case "info":
      toast(message, {
        icon: "ℹ️",
        style: { ...baseStyle, borderLeft: "4px solid #3B82F6" },
      });
      break;
    default:
      toast(message, { style: baseStyle });
  }
};

export { toast };
