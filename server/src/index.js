import dotenv from 'dotenv';
import app from './app.js';
import { connectToDatabase } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

try {
  await connectToDatabase();
  app.listen(PORT, () => console.log(`FormX server running on port ${PORT}`));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
