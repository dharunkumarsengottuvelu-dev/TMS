import app from '../server/src/app.js';
import { connectDatabase } from '../server/src/config/database.js';

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('❌ [Vercel Serverless] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error',
      error: error.message,
    });
  }
}
