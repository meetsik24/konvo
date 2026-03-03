# Ticket Types — Frontend Integration

**Last Updated:** 2026-03-03  
**API Base path:** `api/v1/events`

This doc summarizes the Ticket Types API and migration notes. For full endpoint details, see the backend **Ticket Types -- Frontend Integration Guide**.

---

## Breaking changes (Event model)

The following fields are **removed** from the Event model and must not be used:

| Removed        | Replacement |
|----------------|-------------|
| `is_paid`      | Check if any ticket type has `price > 0` |
| `price_amount` | Use each ticket type’s `price` |
| `currency`     | Use each ticket type’s `currency` |
| `has_ticketing`| Check if the event has any ticket types |

**Action:** Do not add or use `is_paid`, `price_amount`, `currency`, or `has_ticketing` on Event types. Pricing lives on ticket types only.

---

## What’s implemented

### Types (`src/types/index.ts`)

- **TicketType** — id, event_id, name, description, price, currency, quantity_total (number | null), quantity_sold, is_active, sort_order, metadata, created_at, updated_at  
- **TicketTypesListResponse** — `{ ticket_types: TicketType[] }` (list endpoint shape)  
- **CreateTicketTypeRequest** — name, description?, price, currency?, quantity_total?, is_active?, sort_order?, metadata?  
- **UpdateTicketTypeRequest** — partial of create  
- **PurchaseTicketRequest** — ticket_type_id, phone, network, notes?  
- **PurchaseInitiatedResponse** — transaction_id, status, payment_url, message (paid flow)  
- **FreeTicketResponse** — ticket_id, ticket_code, message (free ticket issued immediately)  

### API (`src/services/api.tsx`)

| Function                   | Method | Path | Auth   | Notes |
|---------------------------|--------|------|--------|--------|
| **getEventTicketTypes**   | GET    | `events/{eventId}/ticket-types` | No  | Returns `ticket_types` array |
| **getEventTicketType**    | GET    | `events/{eventId}/ticket-types/{ticketTypeId}` | No  | Single ticket type |
| **createEventTicketType** | POST   | `events/{eventId}/ticket-types` | Staff | all/super |
| **updateEventTicketType** | PUT    | `events/{eventId}/ticket-types/{ticketTypeId}` | Staff | Partial body |
| **deleteEventTicketType** | DELETE | `events/{eventId}/ticket-types/{ticketTypeId}` | Staff | 409 if quantity_sold > 0 |
| **purchaseEventTicket**   | POST   | `events/{eventId}/purchase` | Yes | Returns paid or free shape |

### Availability

- **Unlimited:** `quantity_total === null` → remaining = Infinity while `is_active`.  
- **Limited:** remaining = `quantity_total - quantity_sold`; sold out when `quantity_sold >= quantity_total`.  
- **Off sale:** `is_active === false`.

### Purchase response

- **Paid (price > 0):** response has `transaction_id`, `status`, `payment_url`, `message` → continue MeetPay flow.  
- **Free (price === 0):** response has `ticket_id`, `ticket_code`, `message` → ticket issued immediately.  

Differentiate in UI with: `'ticket_id' in response` → free; `'transaction_id' in response` → paid.

### Metadata

`TicketType.metadata` is a free-form object. Common keys: `image_url`, `video_url`, `color`, `terms_url`. Use for banners, accent colour, and links.

---

## Migration checklist

1. Do not use `is_paid`, `price_amount`, `currency`, `has_ticketing` on Event.  
2. Use **TicketType** for event pricing and availability.  
3. Fetch ticket types with **getEventTicketTypes(eventId)** on event detail.  
4. Treat event as paid if any ticket type has `price > 0`.  
5. Show remaining/sold out from `quantity_total`, `quantity_sold`, `is_active`.  
6. In purchase flow, send **ticket_type_id** via **purchaseEventTicket(eventId, body)**.  
7. Handle both purchase response shapes (paid vs free) in the UI.  
8. Use **metadata** for images, colour, and extra links.
