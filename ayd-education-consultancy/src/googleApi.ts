import { DriveFile, GoogleContact, CalendarEvent } from './types';

// Helper to check if a token exists and run fetch with bearer header
async function googleFetch(url: string, token: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google API Error (${res.status}): ${errorBody}`);
  }
  return res.json();
}

// 1. Fetch Google Drive Files
export async function fetchDriveFiles(token: string): Promise<DriveFile[]> {
  try {
    const data = await googleFetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,webViewLink)&q=trashed%3Dfalse',
      token
    );
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
    }));
  } catch (error) {
    console.error('Failed to fetch Drive files:', error);
    throw error;
  }
}

// 2. Fetch Google Contacts (People API)
export async function fetchGoogleContacts(token: string): Promise<GoogleContact[]> {
  try {
    const data = await googleFetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=30',
      token
    );
    
    return (data.connections || []).map((person: any) => {
      const name = person.names?.[0]?.displayName || 'Unnamed Contact';
      const email = person.emailAddresses?.[0]?.value || 'No Email';
      const phone = person.phoneNumbers?.[0]?.value || undefined;
      return {
        resourceName: person.resourceName,
        name,
        email,
        phone,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google contacts:', error);
    throw error;
  }
}

// 3. Fetch Google Calendar Events
export async function fetchCalendarEvents(token: string): Promise<CalendarEvent[]> {
  try {
    const data = await googleFetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=15&orderBy=startTime&singleEvents=true&timeMin=' + encodeURIComponent(new Date().toISOString()),
      token
    );
    
    return (data.items || []).map((event: any) => {
      // Look for Google Meet link inside hangoutsLink or conferenceData
      const meetLink = event.hangoutsLink || event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri || undefined;
      return {
        id: event.id,
        summary: event.summary || 'No Title',
        description: event.description,
        start: { dateTime: event.start?.dateTime || event.start?.date, date: event.start?.date },
        end: { dateTime: event.end?.dateTime || event.end?.date, date: event.end?.date },
        meetLink,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Calendar events:', error);
    throw error;
  }
}

// 4. Create Google Calendar Event with Google Meet video link
export async function createGoogleMeetEvent(
  token: string, 
  summary: string, 
  description: string, 
  startISO: string, 
  endISO: string
): Promise<CalendarEvent> {
  try {
    const requestId = `ayd-meet-${Math.random().toString(36).substring(2, 11)}`;
    const eventBody = {
      summary,
      description,
      start: { dateTime: startISO, timeZone: 'UTC' },
      end: { dateTime: endISO, timeZone: 'UTC' },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    const event = await googleFetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      token,
      {
        method: 'POST',
        body: JSON.stringify(eventBody)
      }
    );
    
    const meetLink = event.hangoutsLink || event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri || undefined;
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start?.dateTime },
      end: { dateTime: event.end?.dateTime },
      meetLink,
    };
  } catch (error) {
    console.error('Failed to create Calendar/Meet event:', error);
    throw error;
  }
}
