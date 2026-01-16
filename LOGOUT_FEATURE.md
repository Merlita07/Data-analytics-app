# Logout Feature

## Overview

The logout feature has been implemented in the application. There are two components:

### 1. **Backend - Logout API Endpoint**
**Location**: `app/api/auth/logout/route.ts`

This is a POST endpoint that:
- Deletes the `auth-token` cookie from the user's browser
- Returns a success message (200 status)
- Requires authentication (POST request with credentials)

**How it works**:
```typescript
POST /api/auth/logout
├─→ Delete 'auth-token' cookie
└─→ Return { message: 'Logout successful' }
```

### 2. **Frontend - Logout Button**
**Location**: `components/Dashboard.tsx` (top-right of dashboard header)

The logout button is now visible on the Dashboard page with:
- Red styling for visual distinction
- Confirmation dialog ("Are you sure you want to log out?")
- Smooth redirect to `/login` page after logout

**User Interaction**:
```
User clicks "Logout" button
    ↓
Confirmation dialog appears
    ↓
If confirmed:
    ├─→ Send POST /api/auth/logout
    ├─→ Cookie deleted by server
    ├─→ Redirect to /login (100ms delay)
    └─→ User must log in again
```

## Implementation Details

### Logout Handler Function
Added to `components/Dashboard.tsx`:
```typescript
const handleLogout = async () => {
  if (!confirm('Are you sure you want to log out?')) return
  try {
    const response = await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'  // Include cookies in request
    })
    if (response.ok) {
      window.location.href = '/login'  // Redirect to login page
    }
  } catch (error) {
    console.error('Error logging out:', error)
  }
}
```

### Dashboard Header Update
The dashboard header now has a logout button:
```jsx
<div className="flex justify-between items-center mb-4 md:mb-6">
  <h1 className="text-2xl md:text-3xl font-bold text-white">
    Data Analytics Dashboard
  </h1>
  <button
    onClick={handleLogout}
    className="bg-red-600/80 hover:bg-red-700 text-white font-semibold py-2 px-4 md:px-6 rounded-xl..."
  >
    Logout
  </button>
</div>
```

## User Flow After Logout

1. **Before Logout**:
   - User is authenticated with JWT token in cookie
   - Can access `/dashboard`
   - Can create/edit/delete data

2. **User Clicks Logout**:
   - Confirmation dialog appears
   - User confirms

3. **Logout Processing**:
   - POST request sent to `/api/auth/logout`
   - Server deletes `auth-token` cookie
   - Returns 200 OK

4. **After Logout**:
   - Browser redirects to `/login` page
   - JWT token is gone
   - Cannot access `/dashboard` anymore
   - Must log in again to use the app

## Button Styling

The logout button:
- **Background**: Red (`bg-red-600/80` with hover effect `hover:bg-red-700`)
- **Position**: Top-right of the dashboard header
- **Size**: Responsive (smaller on mobile, larger on desktop)
- **Border**: Subtle red border that becomes more visible on hover
- **Confirmation**: Dialog box appears before logout to prevent accidental clicks

## Security Considerations

✅ **Secure Implementation**:
- Uses POST request (not GET) to prevent accidental logouts from links
- Includes `credentials: 'include'` to send cookies with request
- Requires confirmation dialog
- Server-side cookie deletion (most secure)
- Redirects to login page (no sensitive data in URL)

⚠️ **Future Improvements**:
- Could add auto-logout after inactivity (e.g., 15 minutes)
- Could add session management (multiple tabs/devices)
- Could add logout from all devices option

## Testing the Logout Feature

1. **Login to the app**:
   - Navigate to `/login`
   - Enter valid credentials
   - Click "Log In"

2. **Logout**:
   - Click the "Logout" button (top-right of dashboard)
   - Click "OK" in confirmation dialog

3. **Verify logout**:
   - Should redirect to `/login` page
   - Trying to access `/dashboard` should redirect to `/login`
   - No auth token in cookies

## Files Modified

- `components/Dashboard.tsx`: Added logout button and handler function

## API Endpoint

**Endpoint**: `POST /api/auth/logout`
**Authentication**: ✅ Required (JWT cookie)
**Response**: 
```json
{
  "message": "Logout successful"
}
```
**Status**: `200 OK`

---

**Status**: ✅ Logout feature is now complete and ready to use!
