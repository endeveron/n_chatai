## Staleness Logic

The staleness logic determines when a session should be refreshed proactively, before it actually expires or becomes invalid. Here's why and when you'd want to use it:

### **Why Check for Staleness?**

1. **Prevent Auth Failures**: Refresh tokens before they expire to avoid failed API calls
2. **Better UX**: Users don't experience sudden authentication errors
3. **Security**: Ensure users always have fresh tokens with latest permissions
4. **Performance**: Batch refreshes rather than reactive refreshes

### **Types of Staleness Checks:**

#### 1. **Time-Based Staleness**

```typescript
// Session expires within 5 minutes → refresh now
const timeUntilExpiry = expiryTime - now;
if (timeUntilExpiry <= STALENESS_CONFIG.EXPIRY_THRESHOLD) {
  return true; // Session is stale
}
```

#### 2. **Age-Based Staleness**

```typescript
// Session is older than 30 minutes → refresh it
const sessionAge = now - session.iat * 1000;
if (sessionAge > STALENESS_CONFIG.MAX_AGE) {
  return true; // Session is too old
}
```

#### 3. **Activity-Based Staleness**

```typescript
// User was inactive, then became active → refresh to get latest data
if (userJustBecameActive && timeSinceLastRefresh > 10 * 60 * 1000) {
  return true; // Refresh after inactivity
}
```

### **When to Enable Staleness Checks:**

**Enable for:**

- Financial applications (banking, trading)
- Admin dashboards with real-time permissions
- Applications with short-lived tokens
- Multi-tenant apps where permissions change frequently

**Don't enable for:**

- Simple content websites
- Applications with long-lived sessions
- High-traffic apps where API calls are expensive

### **Implementation Examples:**

#### **Basic Time-Based:**

```typescript
const shouldRefresh =
  status === 'authenticated' &&
  session &&
  !hasAttemptedRefresh.current &&
  // Enable this line:
  new Date(session.expires || 0).getTime() - Date.now() < 5 * 60 * 1000; // 5 min before expiry
```

#### **Critical Action Pattern:**

```typescript
// Before important operations
const handlePayment = async () => {
  await ensureFreshSession(); // Refresh if needed
  // Proceed with payment...
};
```

#### **User Activity Pattern:**

```typescript
// Refresh when user returns after being away
useEffect(() => {
  const handleVisibilityChange = () => {
    if (
      document.visibilityState === 'visible' &&
      shouldRefreshAfterInactivity()
    ) {
      refreshSession();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () =>
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### **Configuration Recommendations:**

```typescript
// Conservative (most apps)
EXPIRY_THRESHOLD: 5 * 60 * 1000,  // 5 minutes
MAX_AGE: 60 * 60 * 1000,          // 1 hour

// Aggressive (high-security apps)
EXPIRY_THRESHOLD: 2 * 60 * 1000,  // 2 minutes
MAX_AGE: 15 * 60 * 1000,          // 15 minutes

// Minimal (simple apps)
EXPIRY_THRESHOLD: 30 * 1000,      // 30 seconds
MAX_AGE: Infinity,                // Never refresh based on age
```

The key is finding the right balance between security/freshness and avoiding unnecessary API calls. Start with the conservative settings and adjust based on your app's specific needs.
