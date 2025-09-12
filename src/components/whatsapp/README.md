# WhatsApp Business Components

This directory contains all the components for the WhatsApp Business functionality in BriqPilot. The implementation is modular and maintainable, with each major feature separated into its own component.

## Structure

```
src/components/whatsapp/
├── OnboardingTab.tsx      # WhatsApp Business Account setup and verification
├── MessagingTab.tsx       # Real-time chat interface and conversation management
├── TemplatesTab.tsx       # Message template creation and management
├── CampaignsTab.tsx       # Broadcast campaign creation and management
├── AutomationTab.tsx      # Automation flows and chatbot builder
└── README.md             # This file
```

## Features Implemented

### 1. Onboarding & Verification (`OnboardingTab.tsx`)
- **WABA Registration Wizard**: Step-by-step process to set up WhatsApp Business Account
- **Phone Number Verification**: OTP-based phone number verification
- **Business Information**: Business details collection and validation
- **Document Upload**: Business document verification system
- **Status Tracking**: Real-time status updates (pending, verified, rejected)

### 2. Messaging Dashboard (`MessagingTab.tsx`)
- **Chat Interface**: WhatsApp Web-like interface for real-time conversations
- **Multi-Agent Support**: Assign conversations to different agents
- **Search & Filter**: Find conversations by customer name, phone, or tags
- **Rich Media Support**: Text, images, videos, documents, location sharing
- **Message History**: Complete conversation history with timestamps
- **Typing Indicators**: Real-time typing status

### 3. Template Management (`TemplatesTab.tsx`)
- **Template Creation**: Create message templates with variables
- **Approval Tracking**: Track template approval status (Pending, Approved, Rejected)
- **Categorization**: Organize templates by type (Transactional, Marketing, OTP, Notifications)
- **Variable Support**: Dynamic content with `{{variable}}` placeholders
- **Preview System**: Preview templates before sending
- **Bulk Operations**: Copy, edit, and delete templates

### 4. Campaign Management (`CampaignsTab.tsx`)
- **Campaign Creation**: Create broadcast campaigns with templates
- **Audience Segmentation**: Target specific groups, tags, or custom lists
- **Scheduling**: Schedule campaigns for future delivery
- **Analytics**: Track delivery, read rates, and response metrics
- **Status Management**: Draft, scheduled, running, completed, paused states
- **CSV Import**: Import contact lists from CSV files

### 5. Automation & Flows (`AutomationTab.tsx`)
- **Flow Builder**: Visual flow builder for automation (UI ready)
- **Trigger Types**: Welcome messages, keyword responses, time-based, events
- **Step Types**: Messages, quick replies, conditions, delays, webhooks
- **Status Management**: Activate/deactivate flows
- **Flow Preview**: Preview automation flows before activation

## Types

All TypeScript interfaces are defined in `src/types/whatsapp.ts`:

- `WABAStatus`: WhatsApp Business Account status
- `WhatsAppTemplate`: Message template structure
- `WhatsAppCampaign`: Campaign data structure
- `ChatConversation`: Conversation data
- `ChatMessage`: Individual message structure
- `AutomationFlow`: Automation flow structure
- `FlowStep`: Individual flow step
- `WhatsAppAgent`: Agent information
- `WhatsAppAnalytics`: Analytics data
- `WhatsAppSettings`: Business settings

## Usage

The main WhatsApp page (`src/pages/WhatsApp.tsx`) imports and uses all these components:

```tsx
import OnboardingTab from '../components/whatsapp/OnboardingTab';
import MessagingTab from '../components/whatsapp/MessagingTab';
import TemplatesTab from '../components/whatsapp/TemplatesTab';
import CampaignsTab from '../components/whatsapp/CampaignsTab';
import AutomationTab from '../components/whatsapp/AutomationTab';
```

## State Management

Each component receives its data and setter functions as props, making them:
- **Reusable**: Can be used in different contexts
- **Testable**: Easy to unit test with mock data
- **Maintainable**: Clear separation of concerns

## Styling

All components use Tailwind CSS with:
- **Consistent Design**: WhatsApp green (`#25D366`) as primary color
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: Framer Motion for transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: Detailed reporting and insights
3. **AI Integration**: Smart responses and sentiment analysis
4. **Multi-language Support**: Internationalization
5. **Advanced Automation**: Complex workflow builder
6. **Integration APIs**: Connect with external services

## API Integration

The components are designed to work with REST APIs. Replace the mock data in `useEffect` hooks with actual API calls:

```tsx
// Example API integration
const fetchTemplates = async () => {
  const response = await fetch('/api/whatsapp/templates');
  const templates = await response.json();
  setTemplates(templates);
};
```

## Testing

Each component can be tested independently:

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import OnboardingTab from './OnboardingTab';

test('renders onboarding steps', () => {
  const mockWabaStatus = { status: 'not_connected', last_updated: new Date().toISOString() };
  render(<OnboardingTab wabaStatus={mockWabaStatus} setWabaStatus={jest.fn()} />);
  expect(screen.getByText('Phone Number Verification')).toBeInTheDocument();
});
```
