# AI Analytics Integration - Setup Guide

## Overview

Your expense tracker now has AI-powered analytics! The system uses open-source LLMs to analyze expense data and provide insights.

## What Was Implemented

✅ **ExpenseAIAnalyticsService** - Fetches and analyzes expense data
✅ **AI Analytics Endpoint** - `/expenses/ai-analytics` (GET)
✅ **Automatic data aggregation** - Groups by category, department, status
✅ **Smart insights** - Spending patterns, anomalies, recommendations

---

## Installation Steps

### Step 1: Install Ollama (AI Model Runtime)

#### Windows:

1. Download Ollama from: https://ollama.ai/download/windows
2. Run the installer
3. Open Command Prompt and verify:
   ```bash
   ollama --version
   ```

#### Mac/Linux:

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Download AI Model

Open terminal/command prompt and run:

```bash
ollama pull llama2
```

This will download the Llama 2 model (~4GB). Wait for it to complete.

### Step 3: Start Ollama Server

```bash
ollama serve
```

Keep this terminal window open. Ollama will run on `http://localhost:11434`

### Step 4: Test Ollama

Open a new terminal and test:

```bash
ollama run llama2
```

Type a message like "Hello!" to verify it works. Press `Ctrl+D` to exit.

---

## Using the AI Analytics Endpoint

### Endpoint

**GET** `/expenses/ai-analytics`

### Authentication

- Requires JWT token
- Admin role only

### Query Parameters (All Optional)

- `status` - Filter by expense status (DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED)
- `userId` - Filter by user ID
- `vendorId` - Filter by vendor ID
- `categoryId` - Filter by category ID
- `departmentId` - Filter by department ID
- `dateFrom` - Start date (ISO format)
- `dateTo` - End date (ISO format)

### Example Requests

#### 1. Analyze all approved expenses

```bash
curl -X GET "http://localhost:3000/expenses/ai-analytics?status=APPROVED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Analyze expenses for a specific department

```bash
curl -X GET "http://localhost:3000/expenses/ai-analytics?departmentId=YOUR_DEPT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Analyze expenses for a date range

```bash
curl -X GET "http://localhost:3000/expenses/ai-analytics?dateFrom=2025-01-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "insights": "Based on the expense data analysis:\n\n1. Key Spending Patterns:\n- Total approved expenses: $1,300,000\n- Average expense: $185,714\n- Highest spending category: IT Equipment\n\n2. Anomalies or Concerns:\n- Unusual spike in consulting expenses in Q2\n- Three large equipment purchases in June\n\n3. Cost Optimization Recommendations:\n- Consider bulk purchasing for recurring office supplies\n- Negotiate annual contracts for consulting services\n\n4. Budget Allocation Insights:\n- IT department shows consistent spending pattern\n- Marketing expenses are seasonal, allocate more for Q2-Q3"
  }
}
```

---

## Testing in Swagger UI

1. Start your backend server
2. Go to: `http://localhost:3000/documentation`
3. Find the **Expenses** section
4. Look for: `GET /expenses/ai-analytics`
5. Click "Try it out"
6. Add filters (optional)
7. Click "Execute"

---

## Troubleshooting

### Error: "AI service is not running"

**Solution:** Start Ollama server:

```bash
ollama serve
```

### Error: "Connection refused"

**Solution:** Check if Ollama is running on port 11434:

```bash
# Windows
netstat -an | findstr 11434

# Mac/Linux
lsof -i :11434
```

### AI responses are slow

**Normal behavior:** First request may take 10-30 seconds as the model loads into memory. Subsequent requests are faster.

### Want to use a different model?

Edit `ExpenseAIAnalyticsService.ts`, line 17:

```typescript
private readonly aiApiUrl: string = "http://localhost:11434/api/generate"
```

And line 59 (change the model):

```typescript
model: "mistral",  // or "codellama", "llama2:13b", etc.
```

Available models: https://ollama.ai/library

---

## Alternative: Use HuggingFace API (No Local Install)

If you don't want to install Ollama locally, you can use HuggingFace's free API:

1. Get API key from: https://huggingface.co/settings/tokens
2. Edit `ExpenseAIAnalyticsService.ts`:

```typescript
async analyzeExpenses(filters?: AIAnalyticsFilters): Promise<string> {
  // ... prepare data (same as before)

  // Use HuggingFace API instead
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer YOUR_HUGGINGFACE_TOKEN`
      }
    }
  );

  return response.data[0].generated_text;
}
```

---

## Performance Tips

1. **Limit data range** - Use date filters to analyze smaller datasets
2. **Cache results** - Consider caching AI responses for frequently accessed data
3. **Use smaller models** - For faster responses, use `llama2:7b` instead of `llama2:13b`
4. **Increase timeout** - For large datasets, increase timeout in service (currently 60s)

---

## What the AI Analyzes

The AI receives:

- Total expense count and amounts
- Expenses grouped by category
- Expenses grouped by department
- Expenses grouped by status
- Top 5 largest expenses

It provides:

1. **Key Spending Patterns** - Trends and behaviors in spending
2. **Anomalies or Concerns** - Unusual patterns or red flags
3. **Cost Optimization** - Ways to reduce costs
4. **Budget Allocation** - Suggestions for better budget distribution

---

## Next Steps

- ✅ AI analytics is ready to use!
- 📊 Try it with different filters to get various insights
- 🔧 Customize the prompt in `ExpenseAIAnalyticsService.ts` for specific business needs
- 🚀 Consider adding scheduled reports that automatically generate AI insights monthly

---

## Support

For issues or questions:

1. Check Ollama is running: `ollama serve`
2. Check model is installed: `ollama list`
3. Test endpoint in Swagger UI
4. Review logs for error messages
