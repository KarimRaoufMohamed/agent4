# Fullstack django and nextjs Project

Fullstack django and nextjs Project

## Prerequisites

- GitHub Copilot with MCP server configuration

## MCP Server Configuration

The DigitizeIt MCP server is pre-configured in the `.vscode/mcp.json` file for this project.

**The configuration is already set up** - no additional steps needed!

If you need to verify or modify the configuration, check the `.vscode/mcp.json` file:

```json
{
  "servers": {
    "digitizeit-mcp": {
      "type": "https",
      "url": "https://www.business-expert.ai/api/mcp"
    }
  },
  "inputs": []
}
```

### Implementing Scenarios with DigitizeIt MCP Server and GitHub Copilot

1. Open GitHub Copilot
2. Type **"#digitizeit-mcp"**
3. Then Type **"start implementing"** to begin implementing the first scenario
4. After the first scenario is completed, type **"continue"** to proceed with the next scenarios

## Running the Project

After configuring the MCP server and implementing the scenarios, you can run the project:

**Option 1: Using GitHub Copilot**
1. Configure `.env.local` file in the "nextjs" folder (see nextjs README for configuration details)
2. Ask GitHub Copilot to run the project for you

**Option 2: Manual Setup**
- Follow the setup instructions in the README files located in:
  - "django" backend directory
  - "nextjs" frontend directory




