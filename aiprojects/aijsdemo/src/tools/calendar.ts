import { Tool } from '../types';

// Mock calendar data
const mockEvents = [
  { id: 1, title: 'Team Meeting', date: '2024-03-15', time: '10:00 AM', duration: '1 hour' },
  { id: 2, title: 'Project Review', date: '2024-03-16', time: '2:00 PM', duration: '2 hours' },
  { id: 3, title: 'Client Call', date: '2024-03-17', time: '11:00 AM', duration: '30 minutes' },
  { id: 4, title: 'Sprint Planning', date: '2024-03-18', time: '9:00 AM', duration: '3 hours' }
];

export const calendarTool: Tool = {
  name: 'calendar_lookup',
  description: 'Looks up calendar events by date or lists upcoming events',
  parameters: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'Date to lookup events (YYYY-MM-DD format), or "upcoming" for next events'
      }
    },
    required: ['date']
  },
  execute: async (params: { date: string }) => {
    if (params.date === 'upcoming') {
      return { events: mockEvents.slice(0, 3) };
    }

    const events = mockEvents.filter(e => e.date === params.date);
    return { date: params.date, events };
  }
};
