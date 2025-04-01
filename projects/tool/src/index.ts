#!/usr/bin/env node

import express from 'express';
import { getTools, handleToolCall } from './register';
import { formatResponse } from './middleware/response';
import { handleRequest } from './middleware/request';
import { errorHandler } from './middleware/error';

// Express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(formatResponse());

app.get('/v1/tools', handleRequest(getTools));
app.post('/v1/callTool', handleRequest(handleToolCall));

app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(
      `Init tools`,
      getTools().map((item) => ({
        name: item.name,
        intro: item.intro
      }))
    );
  })
  .on('error', (err) => {
    console.log(err);
  });
