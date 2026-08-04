# mcp-amplitude

Amplitude MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `amp_get_events` | Get event counts and breakdowns for a date range (e.g., "2024-01-01" to "2024-01-31"). Returns frequency, user segments, and trends by event name. |
| `amp_get_active_users` | Get active user counts by granularity (daily, weekly, or monthly) for a date range. Returns totals and trend data. |
| `amp_get_retention` | Get user retention metrics for a cohort over time. Returns retention percentages by time period (e.g., day 1, day 7, day 30). |
| `amp_user_search` | Search for users by ID or property (e.g., email, user_id). Returns matching profiles with properties, event history, and segments. |
| `amp_get_user_activity` | Get recent event activity timeline for a specific user. Returns events with timestamps, properties, and interactions. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "amplitude": {
      "url": "https://gateway.pipeworx.io/amplitude/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Amplitude data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
