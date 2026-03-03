# RSVP & Attendees — Frontend Integration

**Last Updated:** 2026-03-03  
**API Base path:** `api/v1` (relative to app API base URL)

This doc describes how the frontend integrates with the RSVP & Attendees API. For full endpoint details, request/response shapes, and error codes, see the backend integration guide (e.g. **RSVP & Attendees -- Frontend Integration Guide**).

---

## What’s implemented

### Types (`src/types/index.ts`)

- **RSVPResponse** — id, user_id, event_id, **ticket_type_id**, **ticket_type_name**, rsvp_status, check_in_status, checked_in_at, notes, created_at, updated_at  
- **AttendeeInfo** — extends RSVPResponse with user_name, user_email, user_phone, event_title, event_date, event_location  
- **CreateRSVPRequest** — event_id, optional ticket_type_id, optional notes  
- **UpdateAttendeeRequest** — rsvp_status, optional notes  
- **EventAttendeesResponse** — attendees, total, page, size, pages  
- **AttendanceStatsResponse** — pending, confirmed, cancelled, total  
- **TicketType** — id, event_id, name, description, price, currency, quantity_total, quantity_sold, is_active  

### API (`src/services/api.tsx`)

| Function | Method | Path | Auth | Notes |
|----------|--------|------|------|--------|
| **createRSVP** | POST | `api/v1/attendees/rsvp` | Bearer | Send `ticket_type_id` when event has ticket types |
| **getMyRSVPs** | GET | `api/v1/attendees/my-rsvps` | Bearer | Current user’s RSVPs |
| **cancelRSVP** | DELETE | `api/v1/attendees/rsvp/{eventId}` | Bearer | Cancel by event_id |
| **getEventTicketTypes** | GET | `api/v1/events/{eventId}/ticket-types` | Bearer | For RSVP form dropdown |
| **getEventAttendees** | GET | `api/v1/attendees/event/{eventId}/attendees` | Staff | page, size/limit, status_filter |
| **getEventAttendeesByEventId** | GET | `api/v1/events/{eventId}/attendees` | Staff | Same, events namespace |
| **updateAttendee** | PUT | `api/v1/attendees/attendee/{attendeeId}` | Staff | rsvp_status, notes |
| **removeAttendee** | DELETE | `api/v1/attendees/attendee/{attendeeId}` | Staff | |
| **getAttendanceStats** | GET | `api/v1/attendees/stats/{eventId}` | Staff | pending, confirmed, cancelled, total |

---

## Usage checklist for UI

1. **RSVP form**  
   - For an event, call **getEventTicketTypes(eventId)**.  
   - If the list is non-empty, show a ticket type dropdown; on submit send **ticket_type_id** in **createRSVP** (with event_id and optional notes).  
   - If no ticket types, call **createRSVP** with only event_id (and optional notes).

2. **Display**  
   - Use **ticket_type_name** from **RSVPResponse** / **AttendeeInfo** in lists and detail views (no extra API call).

3. **Errors**  
   - Handle **400** (ticket type not on sale), **404** (event/ticket type not found), **409** (already RSVPed / sold out).  
   - Backend enforces one ticket type per event per user.

4. **Staff**  
   - List attendees and stats with **getEventAttendees** or **getEventAttendeesByEventId** and **getAttendanceStats**.  
   - Update status with **updateAttendee**; remove with **removeAttendee**.

---

## Base URL

Endpoints are requested relative to the app’s API base (e.g. `VITE_DEVELOPMENT_API_URL` or `VITE_PRODUCTION_API_URL`).  
Ensure the backend serves the v1 API under the same host (e.g. `.../api/v1/attendees/...`).
