import { Tool } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const wikipediaTool: Tool = {
  name: 'wikipedia_search',
  description: 'Searches Wikipedia and returns article summary',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for Wikipedia'
      }
    },
    required: ['query']
  },
  execute: async (params: { query: string }) => {
    try {
      const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(params.query));
      return {
        title: response.data.title,
        summary: response.data.extract,
        url: response.data.content_urls?.desktop?.page
      };
    } catch (error: any) {
      throw new Error(`Wikipedia search failed: ${error.message}`);
    }
  }
};

export const webScraperTool: Tool = {
  name: 'web_scraper',
  description: 'Scrapes text content from a web page',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL of the web page to scrape'
      }
    },
    required: ['url']
  },
  execute: async (params: { url: string }) => {
    try {
      const response = await axios.get(params.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      $('script, style, nav, footer').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
      
      return { url: params.url, content: text };
    } catch (error: any) {
      throw new Error(`Web scraping failed: ${error.message}`);
    }
  }
};
