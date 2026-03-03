# Event Sessions & Run-of-Show — Frontend Integration

**Last Updated:** 2026-03-03  
**API Base path:** `api/v1/events` (and `api/v1/attendees` for RSVP)

This doc summarizes how the frontend integrates with the Event Sessions & Run-of-Show APIs. For full endpoint details, request/response shapes, and error codes, see the backend **Event Sessions & Run-of-Show — Frontend Integration Guide**.

---

## What’s implemented

### Types (`src/types/index.ts`)

- **SessionResponse** — id, event_id, name, description, start_time, end_time, sort_order, ui_config, created_at, updated_at  
- **ActivityResponse** — id, event_id, session_id, name, description, start_time, end_time, owner_type, owner_id, owner_name, notes, is_locked, sort_order, created_at, updated_at  
- **ActivityDependencyResponse** — id, event_id, activity_id, depends_on_activity_id, created_at  
- **ResourceResponse** — id, name, type, venue_id, metadata, created_at, updated_at  
- **ActivityResourceAssignmentResponse** — id, event_id, activity_id, resource_id, role  
- **VendorResponse** — id, name, category, contact_email, contact_phone, metadata, created_at, updated_at  
- **EventProgramResponse** — event_id, sessions, activities, dependencies, resource_assignments  
- **ProgramConflictsResponse** — event_id, vendor_conflicts, resource_conflicts, dependency_violations, out_of_bounds  
- **OwnerType** — `'vendor' | 'staff' | 'host' | 'performer' | 'other'`  
- **ResourceType** — `'room' | 'stage' | 'av' | 'catering' | 'generic'`  
- Request types: **CreateSessionRequest**, **UpdateSessionRequest**, **CreateActivityRequest**, **UpdateActivityRequest**, **BulkUpdateActivitiesRequest**, **CreateDependencyRequest**, **CreateVendorRequest**, **UpdateVendorRequest**, **CreateResourceRequest**, **UpdateResourceRequest**

### API (`src/services/api.tsx`)

All under `api/v1/events` unless noted.

| Function | Method | Path | Auth | Notes |
|----------|--------|------|------|--------|
| **getEventProgram** | GET | `events/{eventId}/activities` | Staff | Full program (sessions, activities, dependencies, resource_assignments) |
| **getEventSessions** | GET | `events/{eventId}/sessions` | Staff | List sessions |
| **createEventSession** | POST | `events/{eventId}/sessions` | Staff | Create session |
| **updateEventSession** | PUT | `events/{eventId}/sessions/{sessionId}` | Staff | Optional `cascade_children` |
| **deleteEventSession** | DELETE | `events/{eventId}/sessions/{sessionId}` | Staff | Optional `cascade_delete_activities` |
| **createEventActivity** | POST | `events/{eventId}/activities` | Staff | resource_ids, depends_on_ids optional |
| **updateEventActivity** | PUT | `events/{eventId}/activities/{activityId}` | Staff | Optional `cascade` |
| **bulkUpdateEventActivities** | PUT | `events/{eventId}/activities/bulk` | Staff | Multi-drag / batch moves |
| **getActivityDependencies** | GET | `events/{eventId}/activities/{activityId}/dependencies` | Staff | List dependencies |
| **addActivityDependencies** | POST | `events/{eventId}/activities/{activityId}/dependencies` | Staff | Add dependency edges |
| **removeActivityDependency** | DELETE | `events/{eventId}/activities/{activityId}/dependencies/{dependsOnId}` | Staff | Remove one edge |
| **getVendors** | GET | `events/vendors` | Public | search, category |
| **getVendor** | GET | `events/vendors/{vendorId}` | Public | |
| **createVendor** | POST | `events/vendors` | Auth | |
| **updateVendor** | PUT | `events/vendors/{vendorId}` | Auth | |
| **deleteVendor** | DELETE | `events/vendors/{vendorId}` | Auth | |
| **getResources** | GET | `events/resources` | Public | venue_id, type |
| **getResource** | GET | `events/resources/{resourceId}` | Public | |
| **createResource** | POST | `events/resources` | Auth | |
| **updateResource** | PUT | `events/resources/{resourceId}` | Auth | |
| **deleteResource** | DELETE | `events/resources/{resourceId}` | Auth | |
| **getProgramConflicts** | GET | `events/{eventId}/program/conflicts` | Staff | Vendor/resource/dependency/out-of-bounds |

---

## Typical frontend flows

1. **Timetable / run-of-show**  
   - `getEventProgram(eventId)` to load sessions, activities, dependencies, resource_assignments.  
   - Group activities by `session_id` for columns; use `dependencies` for arrows; use `resource_assignments` for per-room views.  
   - Optionally `getVendors()` and `getResources({ venue_id })` for pickers.

2. **Create / edit**  
   - Create: `createEventSession`, `createEventActivity` (with optional resource_ids, depends_on_ids).  
   - Edit: `updateEventSession` (with `cascade_children` for resizing), `updateEventActivity` (with `cascade` for single drag), `bulkUpdateEventActivities` for batch moves.  
   - Handle 400/404 with inline validation (e.g. “Must be within event window”).

3. **Conflicts panel**  
   - Call `getProgramConflicts(eventId)` on load, after bulk updates, or before publishing.  
   - Show vendor_conflicts, resource_conflicts, dependency_violations, out_of_bounds in a sidebar.

4. **Dependencies**  
   - Add: `addActivityDependencies(eventId, activityId, [{ depends_on_activity_id }])`.  
   - Remove: `removeActivityDependency(eventId, activityId, dependsOnActivityId)`.

---

## Base URL

Endpoints are relative to the app’s API base (e.g. `VITE_*_API_URL`). Ensure the backend serves v1 under the same host (e.g. `.../api/v1/events/...`).
