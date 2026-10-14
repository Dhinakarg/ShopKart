import app, { connectDb } from '../server/index.js';

export default async function handler(req, res) {
  try {
    await connectDb();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
  }
  return app(req, res);
}
