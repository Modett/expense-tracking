# Authentication Guide - How Login Persistence Works

## 🔑 Two-Token Authentication System

### Access Token (Short-lived - 15 minutes)

- **Purpose**: Used for API authorization
- **Location**: Response body JSON
- **Your responsibility**: Store it somewhere (see options below)
- **Usage**: Include in `Authorization: Bearer <token>` header

### Refresh Token (Long-lived - 7 days)

- **Purpose**: Get new access tokens without re-login
- **Location**: HTTP-only cookie (automatic, invisible)
- **Browser handles**: Automatically sent with every request
- **Security**: Cannot be accessed by JavaScript (XSS protection)

---

## ⚠️ IMPORTANT: Understanding the Problem

### What happens when you refresh the page:

**Swagger UI / Postman:**

- ❌ The Authorization header you manually typed **IS NOT SAVED**
- ❌ Swagger UI doesn't persist headers across page refreshes
- ❌ This is **NORMAL BEHAVIOR** for API testing tools

**Real Frontend Application (React/Vue/Angular):**

- ✅ Your code saves the accessToken in localStorage
- ✅ Your code reads it on page load
- ✅ Your code adds it to every API request
- ✅ Login persists!

---

## 🎯 Solution: How to Make Login Persist

### Option 1: Testing in Swagger UI (Current Limitation)

**The Truth:**
Swagger UI **does not persist** the Authorization header when you refresh the page. This is by design - it's a documentation tool, not a login system.

**Workaround for Testing:**
After page refresh, you need to:

1. Call `/auth/refresh-token` (the cookie will work automatically)
2. Copy the new `accessToken` from response
3. Click "Authorize" button in Swagger UI
4. Paste the new token: `Bearer <new-token>`

### Option 2: Real Frontend Implementation (Recommended)

Create a file like `auth.js` in your frontend:

```javascript
// auth.js - Frontend Authentication Helper

class AuthService {
  constructor() {
    this.API_URL = "http://localhost:3000";
  }

  // Login
  async login(email, password) {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ← IMPORTANT: Sends/receives cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    // Save access token in localStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  }

  // Get current access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  // Check if user is logged in
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Initialize auth on page load
  async initialize() {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      // We have a token, user might be logged in
      return true;
    }

    // No access token, try to refresh using cookie
    try {
      const response = await fetch(`${this.API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // ← Sends the HTTP-only cookie
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
    }

    return false; // User needs to login
  }

  // Make authenticated API call
  async apiCall(url, options = {}) {
    const accessToken = this.getAccessToken();

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If access token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        // Retry with new token
        return fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        });
      } else {
        // Refresh failed, redirect to login
        this.logout();
        window.location.href = "/login";
      }
    }

    return response;
  }

  // Refresh access token
  async refreshToken() {
    try {
      const response = await fetch(`${this.API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      }
    } catch (error) {
      console.error("Refresh token failed", error);
    }

    return false;
  }

  // Logout
  async logout() {
    try {
      await fetch(`${this.API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error("Logout failed", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

// Usage in your app
const auth = new AuthService();

// On app startup (e.g., App.js componentDidMount or useEffect)
auth.initialize().then((isAuthenticated) => {
  if (isAuthenticated) {
    console.log("User is logged in!");
  } else {
    console.log("User needs to login");
  }
});

// Making API calls
auth
  .apiCall("http://localhost:3000/api/expenses")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Option 3: HTML + JavaScript Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Expense Tracker Login Test</title>
  </head>
  <body>
    <div id="login-form">
      <h2>Login</h2>
      <input type="email" id="email" placeholder="Email" />
      <input type="password" id="password" placeholder="Password" />
      <button onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
      <h2>Dashboard</h2>
      <p>Welcome! You are logged in.</p>
      <button onclick="logout()">Logout</button>
      <button onclick="testAPI()">Test API Call</button>
    </div>

    <div id="result"></div>

    <script>
      const API_URL = "http://localhost:3000";

      // Check auth on page load
      window.onload = async function () {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
          showDashboard();
        } else {
          // Try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            showDashboard();
          }
        }
      };

      async function login() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // IMPORTANT!
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken);
            showDashboard();
          } else {
            alert("Login failed!");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      async function refreshToken() {
        try {
          const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken);
            return true;
          }
        } catch (error) {
          console.error("Refresh failed:", error);
        }
        return false;
      }

      async function logout() {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        localStorage.removeItem("accessToken");
        location.reload();
      }

      function showDashboard() {
        document.getElementById("login-form").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
      }

      async function testAPI() {
        const response = await fetch(`${API_URL}/api/expenses`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await response.json();
        document.getElementById("result").innerText = JSON.stringify(
          data,
          null,
          2
        );
      }
    </script>
  </body>
</html>
```

---

## 📝 Summary

### The Real Problem:

You're testing in **Swagger UI**, which **doesn't save** the Authorization header when you refresh. This is normal - Swagger is not designed to be a login system.

### The Solution:

1. **For Testing**: Manually call `/auth/refresh-token` after refresh and copy the new token
2. **For Production**: Build a proper frontend that stores `accessToken` in localStorage and reads it on page load

### What the Backend Does (Already Implemented ✅):

- ✅ Sets `refreshToken` as HTTP-only cookie (7 days)
- ✅ Allows CORS with credentials
- ✅ `/auth/refresh-token` endpoint works with cookie
- ✅ Backend is ready - frontend needs to store the accessToken!

---

## 🧪 Quick Test

1. Login via Swagger → Get accessToken
2. Close browser completely
3. Reopen browser, go to Swagger
4. Call `/auth/refresh-token` (POST, no body needed)
5. You'll get a new accessToken! (because cookie persisted)
6. Copy new token and paste in "Authorize" button

This proves the backend works! Your frontend just needs to automate steps 4-6.
