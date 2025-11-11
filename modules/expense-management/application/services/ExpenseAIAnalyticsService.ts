import axios from "axios";
import type { IExpenseQueryRepository } from "../../domain/repositories/IExpenseQueryRepository.js";
import type { Expense } from "../../domain/entities/Expense.js";

export interface AIAnalyticsFilters {
  status?: any;
  userId?: any;
  vendorId?: any;
  categoryId?: any;
  departmentId?: any;
  dateFrom?: Date;
  dateTo?: Date;
}

export class ExpenseAIAnalyticsService {
  constructor(
    private readonly expenseQueryRepo: IExpenseQueryRepository,
    private readonly aiApiUrl: string = "http://localhost:11434/api/generate"
  ) {}

  async analyzeExpenses(filters?: AIAnalyticsFilters): Promise<string> {
    try {
      // 1. Fetch expense data
      const expenses = await this.expenseQueryRepo.findAll(filters);

      if (expenses.length === 0) {
        return "No expenses found for the specified filters. Unable to generate insights.";
      }

      // 2. Prepare data summary for AI
      const summary = {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce(
          (sum, e) => sum + e.amount.getTotalValue(),
          0
        ),
        averageAmount:
          expenses.reduce((sum, e) => sum + e.amount.getTotalValue(), 0) /
          expenses.length,
        byCategory: this.groupByCategory(expenses),
        byDepartment: this.groupByDepartment(expenses),
        byStatus: this.groupByStatus(expenses),
        topExpenses: this.getTopExpenses(expenses, 5),
      };

      // 3. Create prompt for AI (simplified for faster response)
      const prompt = `Analyze these expenses:
Total: ${summary.totalExpenses} expenses, $${summary.totalAmount.toFixed(2)}
Average: $${summary.averageAmount.toFixed(2)}

Categories: ${Object.keys(summary.byCategory).length} categories
Departments: ${Object.keys(summary.byDepartment).length} departments
Status breakdown: ${JSON.stringify(summary.byStatus)}

Top expense: $${summary.topExpenses[0]?.amount || 0}

Provide brief insights on:
1. Key spending patterns
2. Any concerns or anomalies
3. 2-3 cost optimization tips

Keep response under 200 words.`;

      // 4. Call AI model (Ollama)
      const response = await axios.post(
        this.aiApiUrl,
        {
          model: "llama3.2:1b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 500, // Limit response length for faster processing
          },
        },
        {
          timeout: 120000, // 120 second timeout (2 minutes)
        }
      );

      return response.data.response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            "AI service is not running. Please start Ollama: 'ollama serve'"
          );
        }
        throw new Error(`AI service error: ${error.message}`);
      }
      throw error;
    }
  }

  private groupByCategory(expenses: Expense[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    expenses.forEach((exp) => {
      const catId = exp.categoryId.getValue();
      if (!grouped[catId]) {
        grouped[catId] = { count: 0, total: 0 };
      }
      grouped[catId].count++;
      grouped[catId].total += exp.amount.getTotalValue();
    });
    return grouped;
  }

  private groupByDepartment(expenses: Expense[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    expenses.forEach((exp) => {
      const deptId = exp.departmentId.getValue();
      if (!grouped[deptId]) {
        grouped[deptId] = { count: 0, total: 0 };
      }
      grouped[deptId].count++;
      grouped[deptId].total += exp.amount.getTotalValue();
    });
    return grouped;
  }

  private groupByStatus(expenses: Expense[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    expenses.forEach((exp) => {
      const status = exp.status.getValue();
      if (!grouped[status]) {
        grouped[status] = { count: 0, total: 0 };
      }
      grouped[status].count++;
      grouped[status].total += exp.amount.getTotalValue();
    });
    return grouped;
  }

  private getTopExpenses(expenses: Expense[], limit: number): any[] {
    return expenses
      .sort((a, b) => b.amount.getTotalValue() - a.amount.getTotalValue())
      .slice(0, limit)
      .map((exp) => ({
        id: exp.id.getValue(),
        description: exp.description.getValue(),
        amount: exp.amount.getTotalValue(),
        status: exp.status.getValue(),
        date: exp.dateOfExpense.getValue().toISOString().split("T")[0],
      }));
  }
}
