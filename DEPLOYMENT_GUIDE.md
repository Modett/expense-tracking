# Deployment Guide - Expense Tracker Enhancements

## 🚀 Quick Start

### 1. Database Migration

Run the Prisma migration to add budget enforcement fields:

```bash
npx prisma migrate dev --name add_budget_enforcement_fields
```

This adds to the `budgets` table:
- `enforcement_type` (soft/hard)
- `override_allowed` (boolean)
- `warning_threshold_1`, `warning_threshold_2`, `critical_threshold` (integers)

### 2. Update App.ts

Wire up the budget enforcement service:

```typescript
// src/app.ts

// Register budget module FIRST
const { budgetQueryRepo, budgetCommandRepo } = await registerBudgetModule(
  fastify,
  prisma
);

// Register approval module
const { approvalOrchestrationService } = await registerApprovalModule(
  fastify,
  prisma
);

// Register expense module WITH dependencies
await registerExpenseManagementModule(fastify, prisma, {
  approvalOrchestrationService,
  budgetQueryRepo, // ← ADD THIS LINE
  skipRouteRegistration: false,
});
```

### 3. Test Budget Enforcement

**Test Case 1: Budget Warning**
```bash
# Create budget
POST /budgets
{
  "departmentId": "uuid",
  "budgetAmount": 10000,
  "fiscalPeriod": "2024-Q1",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}

# Create expense that triggers 80% warning
POST /expenses
{
  "departmentId": "uuid",
  "categoryId": "uuid",
  "vendorId": "uuid",
  "description": "Test expense",
  "totalAmount": 8500, // 85% of budget
  ...
}

# Submit - should succeed with warning
POST /expenses/:id/submit
Response: {
  "success": true,
  "budgetWarnings": ["Budget is at 80%+ utilization - monitor closely"],
  "budgetInfo": {
    "utilizationPercentage": 85,
    "projectedUtilization": 85
  }
}
```

**Test Case 2: Budget Exceeded (No Override)**
```bash
# Create expense exceeding budget
POST /expenses
{
  "totalAmount": 12000, // Exceeds 10K budget
  ...
}

# Submit - should BLOCK
POST /expenses/:id/submit
Response: {
  "error": "BLOCKED: Expense exceeds budget by 2000. Budget override required.\n\nRequired actions:\n- Set budget override type\n- Add justification"
}
```

**Test Case 3: Emergency Override**
```bash
# Create expense with override
POST /expenses
{
  "totalAmount": 12000,
  "priority": "emergency",
  "budgetOverride": "emergency",
  "justification": "Server failure requires immediate replacement - business critical",
  ...
}

# Submit - should succeed with special approval
POST /expenses/:id/submit
Response: {
  "success": true,
  "message": "Expense submitted with 2 approvals (Budget Override: emergency) - Requires executive approval",
  "budgetWarnings": [
    "This expense will trigger special approval workflow",
    "Requires CFO/CEO approval"
  ]
}
```

---

## 📊 New Features Available

### 1. Budget Enforcement Service

**Automatic Checks:**
- ✅ Budget availability before submission
- ✅ Warnings at 80%, 90%, 100% utilization
- ✅ Blocks over-budget expenses without override
- ✅ Validates justification requirements

**Response Format:**
```json
{
  "success": true,
  "budgetWarnings": ["..."],
  "budgetInfo": {
    "budgetAmount": 50000,
    "spentAmount": 42000,
    "remainingAmount": 8000,
    "utilizationPercentage": 84,
    "projectedUtilization": 92
  }
}
```

### 2. Dynamic Approval Chains

**Amount-Based:**
- $0-500: Manager only
- $501-5K: Manager → Finance
- $5K-50K: Manager → Finance → Admin
- $50K+: Full chain including CFO/CEO

**Priority-Based:**
- `routine`: 7-day SLA, normal chain
- `standard`: 3-day SLA, normal chain
- `urgent`: 24-hour SLA, auto-escalation enabled
- `emergency`: 4-hour SLA, skip to top 2 levels

**Budget Override:**
- `emergency`: Fast-track to Finance → Admin
- `annual`: Requires Finance → Admin
- `recurring`: Requires Finance minimum

### 3. Enhanced Budget Model

**New Fields:**
- `enforcementType`: 'soft' (warn) or 'hard' (block)
- `overrideAllowed`: Allow/disallow budget overrides
- `warningThreshold1/2`: Configurable warning levels
- `criticalThreshold`: Critical alert level

**Query Budgets:**
```bash
GET /budgets/:id
Response: {
  "budgetAmount": 50000,
  "spentAmount": 42000,
  "utilizationPercentage": 84,
  "enforcementType": "soft",
  "overrideAllowed": true,
  "thresholds": {
    "warning1": 80,
    "warning2": 90,
    "critical": 100
  },
  "thresholdStatus": {
    "level": "warning1",
    "threshold": 80
  },
  "isHardEnforcementViolated": false
}
```

---

## 🔧 Configuration Options

### Budget Creation with Custom Settings

```bash
POST /budgets
{
  "departmentId": "uuid",
  "categoryId": "uuid", // Optional
  "budgetAmount": 100000,
  "fiscalPeriod": "2024-Q1",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",

  // NEW: Enforcement settings
  "enforcementType": "hard", // 'soft' or 'hard'
  "overrideAllowed": false, // Strict mode
  "warningThreshold1": 75, // Custom thresholds
  "warningThreshold2": 90,
  "criticalThreshold": 100
}
```

### Expense Creation with Priority & Override

```bash
POST /expenses
{
  "vendorId": "uuid",
  "categoryId": "uuid",
  "departmentId": "uuid", // Optional for startups/personal
  "description": "Server replacement",
  "netAmount": 8000,
  "taxAmount": 1200,
  "totalAmount": 9200,
  "expenseDate": "2024-01-15",

  // NEW: Priority & override
  "priority": "urgent", // routine, standard, urgent, emergency
  "budgetOverride": "emergency", // none, emergency, annual, recurring
  "justification": "Critical server failure - requires immediate action",
  "receiptUrl": "https://..."
}
```

---

## 🎯 Business Rules Summary

| Scenario | Budget Status | Override | Result |
|----------|--------------|----------|--------|
| Within budget, no warnings | ✅ OK | Not needed | Approved per normal chain |
| 80-90% utilization | ⚠️ Warning | Not needed | Approved with warning |
| 90-100% utilization | ⚠️ Alert | Not needed | Approved with alert |
| Exceeds budget, soft enforcement | ⚠️ Over | Required | Blocked until override set |
| Exceeds budget, hard enforcement | ❌ Over | Required + approved | Blocked unless executive approves |
| Emergency priority | Any | May be required | Fast-tracked to top 2 levels |

---

## 🧪 Testing Checklist

- [ ] Budget creation with default thresholds
- [ ] Budget creation with custom thresholds
- [ ] Expense within budget (should succeed)
- [ ] Expense triggering 80% warning
- [ ] Expense triggering 90% alert
- [ ] Expense exceeding budget without override (should block)
- [ ] Expense exceeding budget with emergency override (should succeed with warnings)
- [ ] Emergency priority expense (should fast-track)
- [ ] Department-optional expense (for startups/personal use)
- [ ] Hard enforcement budget blocking over-budget expenses

---

## 📈 Monitoring & Analytics

**Budget Utilization Query:**
```bash
GET /budgets?departmentId=uuid&fiscalPeriod=2024-Q1
```

**Expense Aggregations:**
```bash
GET /expenses/aggregations?departmentId=uuid&groupBy=department,category
```

**Budget Alerts to Watch:**
- Budgets at 80%+ utilization
- Budget overrides requested
- Hard enforcement violations
- Repeated budget exceeded attempts

---

## 🚨 Troubleshooting

**Issue: "Budget enforcement not working"**
- Check: Is `budgetQueryRepo` passed to expense module?
- Check: Is budget active for the expense date range?
- Check: Does department match between expense and budget?

**Issue: "All expenses blocked"**
- Check: Budget enforcement type (soft vs hard)
- Check: `overrideAllowed` flag
- Check: Budget amount vs spent amount

**Issue: "No approval chain created"**
- Check: Approval rules exist for category + amount
- Check: `approvalOrchestrationService` is passed to module
- Check: Category ID is valid

---

## 📚 Additional Resources

**Files Modified:**
- `prisma/schema.prisma` - Budget model enhanced
- `modules/expense-management/module.ts` - Added budget repo dependency
- `modules/expense-management/application/commands/submit-expense/handler.ts` - Added budget check

**Files Created:**
- `modules/expense-management/application/services/BudgetEnforcementService.ts`
- `modules/expense-management/application/services/ApprovalChainBuilderService.ts`
- `modules/budget/domain/value-objects/BudgetEnforcementType.ts`
- `modules/budget/domain/value-objects/BudgetThresholds.ts`

**Next Features (Optional):**
- SLA tracking with auto-escalation
- Rejection visibility for higher roles
- Role-based approval dashboards
- Budget threshold event notifications

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Run database migration
- [ ] Update app.ts with budgetQueryRepo
- [ ] Test all budget scenarios
- [ ] Configure default budgets for existing departments
- [ ] Set enforcement type per department (soft vs hard)
- [ ] Document budget override approval process
- [ ] Train users on new priority levels
- [ ] Set up monitoring for budget alerts

**Ready to deploy!** 🎉
