# mcp-amplitude

Amplitude MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `amp_get_events` | Get event segmentation data from Amplitude for a date range. Returns event counts and breakdowns. |
| `amp_get_active_users` | Get daily/weekly/monthly active user counts for a date range. |
| `amp_get_retention` | Get retention data for a date range. Shows how many users return over time. |
| `amp_user_search` | Search for a user by user property or user ID. Returns matching Amplitude user profiles. |
| `amp_get_user_activity` | Get recent event activity for a specific user by their Amplitude ID. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "amplitude": {
      "url": "https://gateway.pipeworx.io/amplitude/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use amplitude
```

## License

MIT
