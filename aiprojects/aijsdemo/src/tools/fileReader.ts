import { Tool } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

const ALLOWED_BASE_PATH = process.env.FS_BASE_PATH || process.cwd();

export const fileReaderTool: Tool = {
  name: 'file_reader',
  description: 'Reads content from a file within the configured base path',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Relative path to the file to read'
      }
    },
    required: ['filePath']
  },
  execute: async (params: { filePath: string }) => {
    const fullPath = path.join(ALLOWED_BASE_PATH, params.filePath);
    
    // Security: Ensure path is within allowed base path
    if (!fullPath.startsWith(ALLOWED_BASE_PATH)) {
      throw new Error('Access denied: Path outside allowed directory');
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content, path: fullPath };
    } catch (error: any) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
};
