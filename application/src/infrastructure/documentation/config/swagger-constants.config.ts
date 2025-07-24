import * as fs from 'fs';
import * as path from 'path';

const description_path = path.join(__dirname, 'description.txt');

let description = 'Default description';
if (fs.existsSync(description_path)) {
  description = fs.readFileSync(description_path, 'utf8');
}

export const SWAGGER_API_ROOT = 'docs';
export const SWAGGER_API_NAME = 'Exforge API';
export const SWAGGER_API_DESCRIPTION = description;
export const SWAGGER_API_CURRENT_VERSION = '1.0';