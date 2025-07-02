export const endpoints = [
  // Workspace Management
  {
    method: "POST",
    path: "/v1/workspace/create/",
    description: "Create a new workspace for the user.",
    sampleCode: `curl -X POST https://karibu.briq.tz/v1/workspace/create/ \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "name": "Workspace Name",
  "description": "Optional description"
}'`,
    samplePayload: {
      name: "Workspace Name",
      description: "Optional description",
    },
    sampleResponse: {
      success: true,
      workspace_id: "workspace-uuid",
      name: "Workspace Name",
      description: "Optional description",
    },
  },
  {
    method: "GET",
    path: "/v1/workspace/all/",
    description: "Retrieve a list of all workspaces for the authenticated user.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/workspace/all/ \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      workspaces: [
        { workspace_id: "workspace-uuid-1", name: "Workspace 1" },
        { workspace_id: "workspace-uuid-2", name: "Workspace 2" },
      ],
    },
  },
  {
    method: "GET",
    path: "/v1/workspace/{workspace_id}",
    description: "Retrieve details of a specific workspace by its ID.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/workspace/{workspace_id} \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      workspace_id: "workspace-uuid",
      name: "Workspace Name",
      description: "Optional description",
    },
  },
  {
    method: "PATCH",
    path: "/v1/workspace/update/{workspace_id}",
    description: "Update the details of a specific workspace.",
    sampleCode: `curl -X PATCH https://karibu.briq.tz/v1/workspace/update/{workspace_id} \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "name": "Updated Workspace Name",
  "description": "Updated description"
}'`,
    samplePayload: {
      name: "Updated Workspace Name",
      description: "Updated description",
    },
    sampleResponse: {
      success: true,
      workspace_id: "workspace-uuid",
      name: "Updated Workspace Name",
      description: "Updated description",
    },
  },

  // Campaign Management
  {
    method: "POST",
    path: "/v1/campaign/create/",
    description: "Create a new campaign within a workspace.",
    sampleCode: `curl -X POST https://karibu.briq.tz/v1/campaign/create/ \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "workspace_id": "workspace-uuid",
  "name": "Campaign Name",
  "description": "Optional description",
  "launch_date": "2023-12-01T00:00:00"
}'`,
    samplePayload: {
      workspace_id: "workspace-uuid",
      name: "Campaign Name",
      description: "Optional description",
      launch_date: "2023-12-01T00:00:00",
    },
    sampleResponse: {
      success: true,
      campaign_id: "campaign-uuid",
      name: "Campaign Name",
      description: "Optional description",
      launch_date: "2023-12-01T00:00:00",
    },
  },
  {
    method: "GET",
    path: "/v1/campaign/all/",
    description: "Retrieve a list of all campaigns for the authenticated user.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/campaign/all/ \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      campaigns: [
        { campaign_id: "campaign-uuid-1", name: "Campaign 1" },
        { campaign_id: "campaign-uuid-2", name: "Campaign 2" },
      ],
    },
  },
  {
    method: "GET",
    path: "/v1/campaign/{campaign_id}/",
    description: "Retrieve details of a specific campaign by its ID.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/campaign/{campaign_id}/ \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      campaign_id: "campaign-uuid",
      name: "Campaign Name",
      description: "Optional description",
      launch_date: "2023-12-01T00:00:00",
    },
  },
  {
    method: "PATCH",
    path: "/v1/campaign/update/{campaign_id}",
    description: "Update the details of a specific campaign.",
    sampleCode: `curl -X PATCH https://karibu.briq.tz/v1/campaign/update/{campaign_id} \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "name": "Updated Campaign Name",
  "description": "Updated description",
  "launch_date": "2023-12-15T00:00:00"
}'`,
    samplePayload: {
      name: "Updated Campaign Name",
      description: "Updated description",
      launch_date: "2023-12-15T00:00:00",
    },
    sampleResponse: {
      success: true,
      campaign_id: "campaign-uuid",
      name: "Updated Campaign Name",
      description: "Updated description",
      launch_date: "2023-12-15T00:00:00",
    },
  },

  // Message Management
  {
    method: "POST",
    path: "/v1/message/send-instant",
    description: "Send an instant SMS message to one or more recipients.",
    sampleCode: `curl -X POST https://karibu.briq.tz/v1/message/send-instant \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "content": "Hello, this is a test message",
  "recipients": ["255788344348"],
  "sender_id": "registered-sender-id-name",
  "campaign_id": "optional-campaign-uuid"
}'`,
    samplePayload: {
      content: "Hello, this is a test message",
      recipients: ["255788344348"],
      sender_id: "registered-sender-id-name",
      campaign_id: "optional-campaign-uuid",
    },
    sampleResponse: {
      success: true,
      message_id: "message-uuid",
      status: "sent",
    },
  },
  {
    method: "POST",
    path: "/v1/message/send-campaign",
    description: "Send an SMS message as part of a campaign.",
    sampleCode: `curl -X POST https://karibu.briq.tz/v1/message/send-campaign \\
-H "Content-Type: application/json" \\
-H "X-API-Key: <your_api_key>" \\
-d '{
  "campaign_id": "campaign-uuid",
  "group_id": "group-uuid",
  "content": "Campaign message content",
  "sender_id": "registered-sender-id-name"
}'`,
    samplePayload: {
      campaign_id: "campaign-uuid",
      group_id: "group-uuid",
      content: "Campaign message content",
      sender_id: "registered-sender-id-name",
    },
    sampleResponse: {
      success: true,
      message_id: "message-uuid",
      status: "sent",
    },
  },
  {
    method: "GET",
    path: "/v1/message/logs",
    description: "Retrieve logs of sent messages.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/message/logs \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      logs: [
        { message_id: "message-uuid-1", content: "Hello, this is a test message", status: "sent" },
        { message_id: "message-uuid-2", content: "Campaign message", status: "delivered" },
      ],
    },
  },
  {
    method: "GET",
    path: "/v1/message/history",
    description: "Retrieve the message history for the authenticated user.",
    sampleCode: `curl -X GET https://karibu.briq.tz/v1/message/history \\
-H "X-API-Key: <your_api_key>"`,
    samplePayload: {},
    sampleResponse: {
      success: true,
      history: [
        { message_id: "message-uuid-1", content: "Hello, this is a test message", timestamp: "2023-12-01T00:00:00" },
        { message_id: "message-uuid-2", content: "Campaign message", timestamp: "2023-12-02T00:00:00" },
      ],
    },
  },
];