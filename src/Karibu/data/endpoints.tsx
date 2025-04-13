export const endpoints = [
    {
      method: 'POST',
      path: '/v1/sms/send',
      description: 'Send an SMS message to a phone number.',
      parameters: [
        { name: 'to', type: 'string', required: true, description: 'The recipient phone number in E.164 format' },
        { name: 'message', type: 'string', required: true, description: 'The message content' },
        { name: 'messageType', type: 'string', required: false, description: 'The type of message (text, media)' },
      ],
      sampleCode: `// Send an SMS message using the Briq API
  const response = await fetch('https://api.briq.dev/v1/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      to: '+1234567890',
      message: 'Hello from Briq API!',
      messageType: 'text',
      callbackUrl: 'https://your-callback-url.com'
    })
  });
  
  const data = await response.json();
  console.log(data);`,
      samplePayload: {
        to: '+1234567890',
        message: 'Hello from Briq API!',
        messageType: 'text',
        callbackUrl: 'https://your-callback-url.com',
        metadata: {
          customerId: 'cust_123',
          campaign: 'welcome'
        }
      },
      sampleResponse: {
        messageId: 'msg_1a2b3c4d5e6f',
        status: 'queued',
        createdAt: '2024-03-14T12:00:00Z',
        to: '+1234567890',
        cost: {
          amount: 0.05,
          currency: 'USD'
        },
        metadata: {
          customerId: 'cust_123',
          campaign: 'welcome'
        }
      }
    },
    {
      method: 'GET',
      path: '/v1/sms/{messageId}',
      description: 'Retrieve details about a specific SMS message.',
      parameters: [
        { name: 'messageId', type: 'string', required: true, description: 'The unique identifier of the message' }
      ],
      sampleCode: `// Get SMS message details
  const response = await fetch('https://api.briq.dev/v1/sms/msg_1a2b3c4d5e6f', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  
  const data = await response.json();
  console.log(data);`,
      samplePayload: {},
      sampleResponse: {
        messageId: 'msg_1a2b3c4d5e6f',
        status: 'delivered',
        createdAt: '2024-03-14T12:00:00Z',
        deliveredAt: '2024-03-14T12:01:00Z',
        to: '+1234567890',
        cost: {
          amount: 0.05,
          currency: 'USD'
        }
      }
    },
    {
      method: 'DELETE',
      path: '/v1/sms/{messageId}/cancel',
      description: 'Cancel a scheduled SMS message.',
      parameters: [
        { name: 'messageId', type: 'string', required: true, description: 'The unique identifier of the message' }
      ],
      sampleCode: `// Cancel a scheduled SMS
  const response = await fetch('https://api.briq.dev/v1/sms/msg_1a2b3c4d5e6f/cancel', {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  
  const data = await response.json();
  console.log(data);`,
      samplePayload: {},
      sampleResponse: {
        messageId: 'msg_1a2b3c4d5e6f',
        status: 'cancelled',
        cancelledAt: '2024-03-14T12:00:30Z'
      }
    }
  ];
  
  // Export these separately if needed elsewhere
  export const defaultCode = endpoints[0].sampleCode;
  export const samplePayload = endpoints[0].samplePayload;
  export const sampleResponse = endpoints[0].sampleResponse;