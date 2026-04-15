interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Amplitude MCP Pack
 *
 * BYO key: pass your Amplitude API key and secret key as _apiKey and _secretKey.
 * Uses Basic auth (apiKey:secretKey) against the Amplitude Dashboard REST API.
 */


const API = 'https://amplitude.com/api/2';

async function ampFetch(apiKey: string, secretKey: string, path: string, params: Record<string, string> = {}) {
  const credentials = btoa(`${apiKey}:${secretKey}`);
  const qs = new URLSearchParams(params);
  const url = Object.keys(params).length > 0 ? `${API}${path}?${qs}` : `${API}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amplitude API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'amp_get_events',
    description: 'Get event segmentation data from Amplitude for a date range. Returns event counts and breakdowns.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Amplitude API key' },
        _secretKey: { type: 'string', description: 'Amplitude secret key' },
        event_type: { type: 'string', description: 'Event name to query (e.g., "Page View", "Button Click")' },
        start: { type: 'string', description: 'Start date (YYYYMMDD)' },
        end: { type: 'string', description: 'End date (YYYYMMDD)' },
        group_by: { type: 'string', description: 'Property to group by (optional)' },
      },
      required: ['_apiKey', '_secretKey', 'event_type', 'start', 'end'],
    },
  },
  {
    name: 'amp_get_active_users',
    description: 'Get daily/weekly/monthly active user counts for a date range.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Amplitude API key' },
        _secretKey: { type: 'string', description: 'Amplitude secret key' },
        start: { type: 'string', description: 'Start date (YYYYMMDD)' },
        end: { type: 'string', description: 'End date (YYYYMMDD)' },
        m: { type: 'string', description: 'Metric: "active" (DAU), "new", or "returning" (default "active")' },
      },
      required: ['_apiKey', '_secretKey', 'start', 'end'],
    },
  },
  {
    name: 'amp_get_retention',
    description: 'Get retention data for a date range. Shows how many users return over time.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Amplitude API key' },
        _secretKey: { type: 'string', description: 'Amplitude secret key' },
        start: { type: 'string', description: 'Start date (YYYYMMDD)' },
        end: { type: 'string', description: 'End date (YYYYMMDD)' },
        re: { type: 'string', description: 'Retention type: "rolling" or "bracket" (default "rolling")' },
      },
      required: ['_apiKey', '_secretKey', 'start', 'end'],
    },
  },
  {
    name: 'amp_user_search',
    description: 'Search for a user by user property or user ID. Returns matching Amplitude user profiles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Amplitude API key' },
        _secretKey: { type: 'string', description: 'Amplitude secret key' },
        user: { type: 'string', description: 'User search term (email, user_id, or Amplitude ID)' },
      },
      required: ['_apiKey', '_secretKey', 'user'],
    },
  },
  {
    name: 'amp_get_user_activity',
    description: 'Get recent event activity for a specific user by their Amplitude ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Amplitude API key' },
        _secretKey: { type: 'string', description: 'Amplitude secret key' },
        amplitude_id: { type: 'string', description: 'Amplitude internal user ID (from amp_user_search results)' },
        offset: { type: 'number', description: 'Pagination offset (default 0)' },
        limit: { type: 'number', description: 'Max events to return (default 100, max 1000)' },
      },
      required: ['_apiKey', '_secretKey', 'amplitude_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  delete args._context;
  const apiKey = args._apiKey as string | undefined;
  const secretKey = args._secretKey as string | undefined;
  delete args._apiKey;
  delete args._secretKey;

  if (!apiKey || !secretKey) {
    return { error: 'credentials_required', message: 'Pass your Amplitude API key as _apiKey and secret key as _secretKey' };
  }

  switch (name) {
    case 'amp_get_events': {
      const params: Record<string, string> = {
        e: JSON.stringify({ event_type: args.event_type as string }),
        start: args.start as string,
        end: args.end as string,
      };
      if (args.group_by) {
        params.g = args.group_by as string;
      }
      return ampFetch(apiKey, secretKey, '/events/segmentation', params);
    }

    case 'amp_get_active_users': {
      const params: Record<string, string> = {
        start: args.start as string,
        end: args.end as string,
        m: (args.m as string) ?? 'active',
      };
      return ampFetch(apiKey, secretKey, '/users', params);
    }

    case 'amp_get_retention': {
      const params: Record<string, string> = {
        se: JSON.stringify({ event_type: 'Any Event' }),
        re: JSON.stringify({ event_type: 'Any Event' }),
        start: args.start as string,
        end: args.end as string,
      };
      if (args.re) {
        params.rt = args.re as string;
      }
      return ampFetch(apiKey, secretKey, '/retention', params);
    }

    case 'amp_user_search':
      return ampFetch(apiKey, secretKey, '/usersearch', {
        user: args.user as string,
      });

    case 'amp_get_user_activity': {
      const params: Record<string, string> = {
        user: args.amplitude_id as string,
      };
      if (args.offset != null) params.offset = String(args.offset);
      if (args.limit != null) params.limit = String(args.limit);
      return ampFetch(apiKey, secretKey, '/useractivity', params);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 } } satisfies McpToolExport;
