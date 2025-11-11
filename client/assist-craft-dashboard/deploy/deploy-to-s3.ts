import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// ES modules dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');

/* eslint-disable no-undef */
const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const REGION = process.env.AWS_REGION || '';

if (!BUCKET_NAME || !REGION) {
  console.error('Missing required environment variables.');
  process.exit(1);
}
/* eslint-enable no-undef */

const s3 = new S3Client({ region: REGION });

/**
 * Recursively walks a directory and returns a list of files.
 * @param dir - The directory to walk.
 * @param fileList - The list of files to return.
 * @param baseDir - The base directory to use for relative paths.
 * @returns The list of files.
 */
function walkDir(
  dir: string,
  fileList: string[] = [],
  baseDir = dir
): string[] {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList, baseDir);
    } else {
      fileList.push(path.relative(baseDir, filePath));
    }
  });
  return fileList;
}

/**
 * Gets the cache control and expires for a file.
 * @param filePath - The path to the file.
 * @returns The cache control and expires for the file.
 */
function getCacheControlAndExpires(filePath: string): {
  cacheControl: string;
  expires: Date | undefined;
} {
  const ext = path.extname(filePath).toLowerCase();

  // Define caching strategy based on file type
  let cacheControl: string;
  let expires: Date | undefined;

  if (ext === '.html') {
    // HTML files: No caching to ensure latest version is always served
    cacheControl = 'no-cache, no-store, must-revalidate';
    expires = undefined;
  } else if (ext === '.js' || ext === '.css') {
    // JS and CSS files: Cache for 10 minutes with validation
    cacheControl = 'public, max-age=600, must-revalidate';
    expires = new Date(Date.now() + 600000); // 10 minutes
  } else {
    // Other static assets: Cache for 1 hour
    cacheControl = 'public, max-age=3600';
    expires = new Date(Date.now() + 3600000); // 1 hour
  }

  return { cacheControl, expires };
}

/**
 * Uploads a file to S3.
 * @param filePath - The path to the file to upload.
 * @returns A promise void
 */
async function uploadFile(filePath: string): Promise<void> {
  const fullPath = path.join(DIST_DIR, filePath);
  const fileStream = fs.createReadStream(fullPath);
  const s3Key = path.posix.join(filePath).replace(/\\/g, '/');

  const { cacheControl, expires } = getCacheControlAndExpires(filePath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileStream,
    CacheControl: cacheControl,
    ...(expires && { Expires: expires }),
    ContentType: getContentType(filePath),
  });

  try {
    await s3.send(command);
    console.log(
      `Uploaded: ${s3Key} (Cache-Control: ${cacheControl}, Expires: ${expires})`
    );
  } catch (err) {
    console.error(`Failed to upload ${s3Key}:`, err);
  }
}

/**
 * Gets the content type of a file.
 * @param filePath - The path to the file.
 * @returns The content type of the file.
 */
function getContentType(filePath: string): string | undefined {
  // Basic content type mapping
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'application/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    default:
      return undefined;
  }
}

/* eslint-disable no-undef */
/**
 * Main function to deploy to S3.
 * @returns A promise void
 */
async function main(): Promise<void> {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Dist directory not found: ${DIST_DIR}`);
    process.exit(1);
  }
  const files = walkDir(DIST_DIR);
  for (const file of files) {
    await uploadFile(file);
  }
  console.log('All files uploaded.');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
/* eslint-enable no-undef */
