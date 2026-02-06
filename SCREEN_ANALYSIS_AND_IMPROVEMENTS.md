# 📱 LYVEN App - Screen Analysis & Improvement Guide

## 🎯 Where We Stopped (Latest Update)

**Done so far:**
- **Login / Auth** – tRPC auth, email verification (Resend), paste code, 3-min expiry
- **Home (Explore)** – tRPC `events.list` (featured + all), loading/error/skeleton, pull-to-refresh
- **Event Details** – tRPC `events.get`, loading/error, share, calendar, favorites
- **Search** – tRPC list + search, debounced query, loading/error
- **Tickets** – tRPC `tickets.list` + `events.list`, QR display, pull-to-refresh, loading/error ✅ (was "NOT REVIEWED")
- **Profile (Promoter)** – tRPC next event, promoter events, stats

**All main screens now use tRPC for event data.** Remaining mock: buyer/ticket lists on promoter-event and event-buyers until backend supports list-by-event.

**Next steps:** UX/performance items from the sections below; optional: backend list tickets/buyers by event for promoter screens.

---

## 📋 Table of Contents
1. [Overall App Flow](#overall-app-flow)
2. [Screen-by-Screen Analysis](#screen-by-screen-analysis)
3. [Critical Issues & Fixes](#critical-issues--fixes)
4. [UX/UI Improvements](#uxui-improvements)
5. [Technical Improvements](#technical-improvements)
6. [Missing Features](#missing-features)
7. [Performance Optimizations](#performance-optimizations)

---

## 🔄 Overall App Flow

### Current User Journey

```
Login/Register → Onboarding (if new) → Home/Explore → Event Details → Cart → Checkout → Tickets
                                                              ↓
                                                      Search/Profile/Settings
```

### Issues in Current Flow:
1. ❌ **No proper authentication state management** - Hardcoded admin check (`email === 'geral@lyven.pt'`)
2. ❌ **Missing deep linking handling** - Event links from shares don't properly navigate
3. ❌ **No offline support** - App breaks when network is unavailable
4. ❌ **Inconsistent error handling** - Some screens show errors, others crash silently
5. ❌ **No loading states** - Many screens don't show loading indicators

---

## 📱 Screen-by-Screen Analysis

### 1. **Login Screen** (`app/login.tsx`)

#### ✅ What's Good:
- Clean, modern UI with animations
- User type selection (Normal/Promoter)
- Password visibility toggle
- Form validation

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **Hardcoded Admin Login** (Line 110)
   ```typescript
   if (email.toLowerCase() === 'admin' && password === 'admin')
   ```
   - **Fix:** Use proper backend authentication
   - **Security Risk:** Exposed in client code

2. **Mock Promoter Login** (Line 118)
   ```typescript
   if (email === 'teste' && password === 'teste')
   ```
   - **Fix:** Connect to real tRPC auth endpoint
   - **Issue:** No actual authentication happening

3. **No Error Feedback for Network Issues**
   - **Add:** Network error handling
   - **Add:** Retry mechanism

**UX Improvements:**
1. **Add "Remember Me" option**
2. **Add biometric authentication** (Face ID/Touch ID)
3. **Add "Continue as Guest" option**
4. **Show password strength indicator** for registration
5. **Add social login** (Google, Apple, Facebook)
6. **Add loading spinner** during authentication
7. **Better error messages** - Currently just shows generic error

**Code Improvements:**
```typescript
// Current: No proper error handling
catch (error) {
  setErrorMessage('Ocorreu um erro...');
}

// Should be:
catch (error) {
  if (error instanceof NetworkError) {
    setErrorMessage('Sem conexão à internet. Verifica a tua ligação.');
  } else if (error instanceof AuthError) {
    setErrorMessage('Credenciais inválidas. Verifica o email e palavra-passe.');
  } else {
    setErrorMessage('Erro inesperado. Tenta novamente.');
  }
}
```

---

### 2. **Home/Explore Screen** (`app/(tabs)/index.tsx`)

#### ✅ What's Good:
- Different views for Admin/Promoter/Normal users
- Featured events section
- Upcoming events list
- Responsive design

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **Using Mock Data** (Line 18)
   ```typescript
   import { mockEvents } from '@/mocks/events';
   ```
   - **Fix:** Use tRPC queries to fetch real events
   - **Add:** Pull-to-refresh functionality

2. **No Loading State**
   - **Add:** Skeleton loaders while fetching
   - **Add:** Empty state with CTA

3. **No Error Handling**
   - **Add:** Error boundary
   - **Add:** Retry button on error

**UX Improvements:**
1. **Add pull-to-refresh**
2. **Add infinite scroll** for events list
3. **Add filters** (date, location, price range)
4. **Add "Recently Viewed" section**
5. **Add personalized recommendations** (based on user interests)
6. **Add event categories quick filter** at top
7. **Add map view toggle** (list/grid/map)
8. **Add saved searches**

**Performance:**
1. **Image optimization** - Use `expo-image` with caching
2. **Lazy load** events below fold
3. **Memoize event cards** to prevent re-renders

**Code Example:**
```typescript
// Current: Static mock data
const featuredEvents = mockEvents.filter((e: Event) => e.isFeatured);

// Should be:
const { data: featuredEvents, isLoading, error } = trpc.events.featured.useQuery();

if (isLoading) return <EventListSkeleton />;
if (error) return <ErrorState onRetry={refetch} />;
```

---

### 3. **Search Screen** (`app/(tabs)/search.tsx`)

#### ✅ What's Good:
- Search input with suggestions
- Category filters
- Featured events section
- Different views for Admin/Promoter/Normal users

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **Mixed Mock and Real Data** (Line 78-129)
   - Uses tRPC for search but falls back to mockEvents
   - **Fix:** Remove mock fallback, handle empty states properly

2. **Search Suggestions Not Debounced**
   - **Fix:** Add debounce (300ms) to prevent excessive API calls
   - **Add:** Cancel previous requests

3. **No Search History**
   - **Add:** Save recent searches
   - **Add:** Quick access to recent searches

**UX Improvements:**
1. **Add search filters sidebar** (date range, price, location)
2. **Add "Trending Searches" section**
3. **Add voice search** (optional)
4. **Add barcode/QR scanner** for event codes
5. **Add saved searches**
6. **Add search suggestions** based on user history
7. **Add "No results" suggestions** (similar events, popular events)

**Performance:**
1. **Debounce search input** (300ms)
2. **Cancel pending requests** when new search starts
3. **Cache search results** for 5 minutes

**Code Example:**
```typescript
// Current: No debounce
const [searchQuery, setSearchQuery] = useState('');

// Should be:
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);

const { data: searchResults } = useQuery({
  queryKey: ['eventSearch', debouncedQuery],
  queryFn: () => trpcClient.events.search.query({ query: debouncedQuery }),
  enabled: debouncedQuery.length > 0,
});
```

---

### 4. **Event Details Screen** (`app/event/[id].tsx`)

#### ✅ What's Good:
- Beautiful hero image with gradient
- Social proof component
- FOMO alerts
- Ticket selection with quantity
- Add to calendar functionality
- Share functionality

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **Using Mock Data** (Line 20)
   ```typescript
   const event = mockEvents.find(e => e.id === id);
   ```
   - **Fix:** Fetch from tRPC using event ID
   - **Add:** Loading state
   - **Add:** Error handling for invalid event ID

2. **No Real-time Ticket Availability**
   - **Fix:** Poll or use WebSocket for real-time updates
   - **Add:** "X tickets left" warning when low

3. **Share Functionality May Not Work**
   - **Test:** Deep linking from shares
   - **Fix:** Ensure proper URL generation

**UX Improvements:**
1. **Add image gallery** (if multiple images)
2. **Add video preview** (if available)
3. **Add "Similar Events" section** at bottom
4. **Add reviews/ratings section**
5. **Add "People Going" list** (with privacy controls)
6. **Add event map** with directions
7. **Add weather forecast** for outdoor events
8. **Add accessibility info** (wheelchair access, etc.)
9. **Add event timeline** (doors open, show starts, etc.)
10. **Add "Report Event" option**

**Performance:**
1. **Lazy load** social proof and FOMO components
2. **Optimize hero image** - Use WebP, multiple sizes
3. **Preload** similar events in background

**Code Example:**
```typescript
// Current: Mock data
const event = mockEvents.find(e => e.id === id);

// Should be:
const { data: event, isLoading, error } = trpc.events.get.useQuery({ id: id as string });

if (isLoading) return <EventDetailSkeleton />;
if (error || !event) return <EventNotFound />;
```

---

### 5. **Checkout Screen** (`app/checkout.tsx`)

#### ✅ What's Good:
- Multi-step checkout flow
- Multiple payment methods
- Form validation
- Success animation

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **No Real Payment Processing**
   - **Fix:** Integrate Stripe/PayPal/MB Way APIs
   - **Add:** Payment confirmation webhook handling
   - **Security:** Never store card details client-side

2. **No Cart Persistence**
   - **Fix:** Save cart to AsyncStorage
   - **Add:** Restore cart on app restart

3. **Service Fee Calculation Hardcoded** (Line 93)
   ```typescript
   const serviceFee = subtotal * 0.1;
   ```
   - **Fix:** Get from backend configuration

**UX Improvements:**
1. **Add saved payment methods** (if user has previous payments)
2. **Add billing address form** (if required)
3. **Add discount code input**
4. **Add order summary expandable section**
5. **Add "Save for later" option**
6. **Add guest checkout** option
7. **Add payment method icons** (Visa, Mastercard, etc.)
8. **Add security badges** (SSL, PCI compliant)
9. **Add estimated delivery time** for digital tickets

**Security:**
1. **Never log card details**
2. **Use tokenization** for card payments
3. **Validate CVV** but don't store it
4. **Add 3D Secure** for card payments

**Code Example:**
```typescript
// Current: No real payment
const handlePurchase = async () => {
  // Mock purchase
};

// Should be:
const handlePurchase = async () => {
  try {
    const paymentIntent = await trpc.payments.createIntent.mutate({
      amount: total,
      paymentMethod: selectedPayment,
      // ... other details
    });
    
    // Process payment based on method
    if (selectedPayment === 'card') {
      await processCardPayment(paymentIntent);
    }
  } catch (error) {
    // Handle payment errors
  }
};
```

---

### 6. **Profile Screen** (`app/(tabs)/profile.tsx`)

#### ✅ What's Good:
- Different views for Admin/Promoter/Normal users
- Theme toggle
- Settings navigation
- Logout functionality

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **Hardcoded Next Event** (Line 125-135)
   - **Fix:** Fetch from backend
   - **Add:** Handle no events case

2. **No Profile Picture Upload**
   - **Add:** Image picker integration
   - **Add:** Crop functionality
   - **Add:** Avatar placeholder

3. **No User Stats**
   - **Add:** Events attended count
   - **Add:** Total spent
   - **Add:** Favorite events count
   - **Add:** Following count

**UX Improvements:**
1. **Add profile completion indicator**
2. **Add achievement badges**
3. **Add "My Reviews" section**
4. **Add "My Friends" section** (if social features enabled)
5. **Add privacy settings** quick access
6. **Add account verification status**
7. **Add subscription/premium status** (if applicable)
8. **Add referral code** section

**Code Example:**
```typescript
// Current: Hardcoded data
const nextEvent = {
  id: 'demo-1',
  title: 'Arctic Monkeys',
  // ...
};

// Should be:
const { data: nextEvent } = trpc.promoters.getNextEvent.useQuery();
const { data: userStats } = trpc.users.getStats.useQuery();
```

---

### 7. **Tickets Screen** (`app/(tabs)/tickets.tsx`)

#### ✅ **REVIEWED – DONE**
- Uses tRPC `tickets.list` and `events.list` for real data
- Loading/error states, pull-to-refresh
- QR code display (expandable per ticket)
- Navigates to ticket-details; cart tab with real data
- **Optional later:** ticket transfer, add to wallet (see Missing Features)

---

### 8. **Onboarding Screen** (`app/onboarding.tsx`)

#### ✅ What's Good:
- Multi-step flow
- Progress indicator
- Step components separated

#### ❌ Issues & Improvements Needed:

**Critical:**
1. **No Validation Between Steps**
   - **Add:** Validate required fields before proceeding
   - **Add:** Show which fields are missing

2. **No Progress Persistence**
   - **Fix:** Save progress to AsyncStorage
   - **Add:** Resume from last step if app closes

3. **No Skip Option**
   - **Add:** "Skip for now" option on optional steps
   - **Add:** "Complete later" in profile

**UX Improvements:**
1. **Add step previews** (show what's coming)
2. **Add "Why we need this" tooltips**
3. **Add data usage explanation** (privacy)
4. **Add animation between steps**
5. **Add welcome video** on first step

---

## 🚨 Critical Issues & Fixes

### 1. **Authentication System**
**Problem:** Hardcoded credentials, no real auth
**Fix:**
```typescript
// Create: app/lib/auth.ts
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    const result = await trpc.auth.login.mutate({ email, password });
    // Store token, update user context
  };
  
  const logout = async () => {
    await trpc.auth.logout.mutate();
    // Clear token, reset user context
  };
};
```

### 2. **Data Fetching**
**Problem:** Using mock data instead of real API
**Fix:** Replace all `mockEvents` with tRPC queries

### 3. **Error Handling**
**Problem:** Inconsistent error handling
**Fix:** Create error boundary component and standardize error messages

### 4. **Loading States**
**Problem:** No loading indicators
**Fix:** Add skeleton loaders and loading spinners

### 5. **Offline Support**
**Problem:** App breaks offline
**Fix:** Use React Query with cache, add offline detection

---

## 🎨 UX/UI Improvements

### Global Improvements:
1. **Add haptic feedback** consistently (already partially implemented)
2. **Add skeleton loaders** for all loading states
3. **Add empty states** with helpful CTAs
4. **Add error states** with retry buttons
5. **Add pull-to-refresh** on list screens
6. **Add infinite scroll** for long lists
7. **Add search debouncing** everywhere
8. **Add loading overlays** for async operations
9. **Add success animations** for completed actions
10. **Add confirmation dialogs** for destructive actions

### Navigation Improvements:
1. **Add deep linking** handling
2. **Add navigation guards** (prevent back on checkout)
3. **Add breadcrumbs** on nested screens
4. **Add "Back to top" button** on long scrolls

---

## 🔧 Technical Improvements

### 1. **State Management**
- ✅ Already using Context API (good)
- ⚠️ Consider Zustand for complex state
- ⚠️ Add proper state persistence

### 2. **API Integration**
- ❌ Replace all mock data with tRPC
- ❌ Add request retry logic
- ❌ Add request cancellation
- ❌ Add response caching

### 3. **Error Handling**
```typescript
// Create: app/lib/error-handler.ts
export const handleError = (error: unknown) => {
  if (error instanceof NetworkError) {
    return 'Sem conexão à internet';
  }
  if (error instanceof AuthError) {
    return 'Sessão expirada. Por favor, inicia sessão novamente.';
  }
  return 'Ocorreu um erro. Por favor, tenta novamente.';
};
```

### 4. **Performance**
- Add React.memo for expensive components
- Add useMemo for computed values
- Add useCallback for event handlers
- Implement virtualized lists for long lists
- Optimize images (WebP, multiple sizes)
- Add code splitting

### 5. **Testing**
- ❌ No tests found
- **Add:** Unit tests for utilities
- **Add:** Integration tests for flows
- **Add:** E2E tests for critical paths

---

## 📦 Missing Features

### High Priority:
1. **Push Notifications** - Event reminders, ticket confirmations
2. **Offline Mode** - View cached events, queue actions
3. **Ticket Transfer** - Send tickets to friends
4. **Event Reviews** - Rate and review events
5. **Social Features** - Follow friends, see their events
6. **Wallet Integration** - Apple Wallet, Google Pay
7. **QR Code Scanner** - Scan tickets at venue
8. **Event Recommendations** - AI-powered suggestions

### Medium Priority:
1. **Event Calendar View** - Monthly/weekly view
2. **Price Alerts** - Notify when price drops
3. **Group Bookings** - Book multiple tickets together
4. **Loyalty Program** - Points, rewards
5. **Referral System** - Invite friends, get rewards
6. **Event Waitlist** - Join waitlist for sold-out events

### Low Priority:
1. **AR Features** - View venue in AR
2. **Live Chat** - Support chat
3. **Event Streaming** - Watch events live
4. **Merchandise** - Buy event merch

---

## ⚡ Performance Optimizations

### 1. **Image Optimization**
```typescript
// Current: Basic Image component
<Image source={{ uri: event.image }} />

// Should be:
<Image
  source={{ uri: event.image }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={blurhash}
/>
```

### 2. **List Optimization**
```typescript
// For long lists, use FlashList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={events}
  renderItem={renderEvent}
  estimatedItemSize={200}
/>
```

### 3. **Code Splitting**
- Lazy load heavy screens
- Split vendor bundles
- Use dynamic imports for large components

---

## 📝 Next Steps

### Phase 1 (Critical - Week 1):
1. ✅ Replace mock data with tRPC queries
2. ✅ Fix authentication system
3. ✅ Add error handling
4. ✅ Add loading states

### Phase 2 (Important - Week 2):
1. ✅ Add offline support
2. ✅ Implement deep linking
3. ✅ Add pull-to-refresh
4. ✅ Optimize images

### Phase 3 (Enhancements - Week 3+):
1. ✅ Add missing features
2. ✅ Performance optimizations
3. ✅ Add tests
4. ✅ Polish UI/UX

---

## 🎯 Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Replace mock data | High | Medium | 🔴 P0 |
| Fix authentication | High | Medium | 🔴 P0 |
| Add error handling | High | Low | 🔴 P0 |
| Add loading states | Medium | Low | 🟡 P1 |
| Add offline support | Medium | High | 🟡 P1 |
| Optimize images | Medium | Low | 🟡 P1 |
| Add pull-to-refresh | Low | Low | 🟢 P2 |
| Add infinite scroll | Low | Medium | 🟢 P2 |

---

**Last Updated:** January 28, 2026
**Reviewer:** AI Assistant
**Status:** Initial Analysis Complete
