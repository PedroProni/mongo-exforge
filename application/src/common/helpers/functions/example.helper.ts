/*
Example Helper funcion to call an external API using axios

import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

export class ExampleHelper {
  static async call<T>(method: 'get' | 'post', url: string, headers: Record<string, string>, params: Record<string, any>, data?: T): Promise<any> {
    try {
      const response = await axios({ method, url, headers, params, data });
      return response.data;
    } catch (e: any) {
      throw new BadRequestException(e.response?.data?.message || e.message || 'An error occurred while calling the API');
    }
  }
}

*/