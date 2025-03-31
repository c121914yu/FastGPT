#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { getMcpTools, handleToolCall } from './templates';

// Register mcp server
const server = new Server(
  {
    name: 'FastGPT tool server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: getMcpTools()
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => handleToolCall(request.params));

const app = express();

let transport: SSEServerTransport | null = null;

app.get('/sse', (req, res) => {
  transport = new SSEServerTransport('/messages', res);
  server.connect(transport);
  res.write('ok');
});

app.post('/messages', (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

const port = Number(process.env.PORT || 3000);
app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on('error', (err) => {
    console.log(err);
  });
