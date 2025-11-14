import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RecentExpenseItem } from "../types/index";

interface RecentExpensesTableProps {
  expenses: RecentExpenseItem[];
}

const getDepartmentColor = (departmentName?: string): string => {
  if (!departmentName) return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";

  const colors: Record<string, string> = {
    Marketing: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    Sales: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
    Operations: "bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20",
    Finance: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  };
  return colors[departmentName] || "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
};

export function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.expenseId}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell className="text-muted-foreground">{expense.user?.name || "N/A"}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={getDepartmentColor(expense.department?.name)}>
                {expense.department?.name || "N/A"}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              €{expense.totalAmount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
