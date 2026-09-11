import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('❌ [Vercel Serverless Server] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database or serverless execution error',
      error: error.message,
    });
  }
}
