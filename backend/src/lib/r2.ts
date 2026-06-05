import { S3Client } from '@aws-sdk/client-s3'
import type { Env } from '../config/env'

export function createR2Client(env: Env): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
}
