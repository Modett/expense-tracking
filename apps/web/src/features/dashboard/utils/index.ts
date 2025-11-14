export const formatCurrency = (amount: number, currency: string = "€"): string => {
  return `${currency}${amount.toFixed(2)}`;
};

export const getTeamColor = (team: string): string => {
  const colors: Record<string, string> = {
    Marketing: "bg-purple-500/10 text-purple-500",
    Sales: "bg-pink-500/10 text-pink-500",
    Operations: "bg-fuchsia-500/10 text-fuchsia-500",
    Finance: "bg-cyan-500/10 text-cyan-500",
  };
  return colors[team] || "bg-gray-500/10 text-gray-500";
};

export const getTaskIconColor = (type: string): { iconColor: string; iconBgColor: string } => {
  const colors: Record<string, { iconColor: string; iconBgColor: string }> = {
    approval: { iconColor: "text-blue-500", iconBgColor: "bg-blue-500/10" },
    trip: { iconColor: "text-purple-500", iconBgColor: "bg-purple-500/10" },
    expense: { iconColor: "text-pink-500", iconBgColor: "bg-pink-500/10" },
    upcoming: { iconColor: "text-green-500", iconBgColor: "bg-green-500/10" },
    advance: { iconColor: "text-orange-500", iconBgColor: "bg-orange-500/10" },
  };
  return colors[type] || { iconColor: "text-gray-500", iconBgColor: "bg-gray-500/10" };
};
