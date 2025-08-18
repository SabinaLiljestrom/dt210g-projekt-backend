import dotenv from 'dotenv';
import Hapi from '@hapi/hapi';
import mongoose from 'mongoose';

// Importera routes
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import reviewRoutes from './routes/review.routes';

dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: Number(process.env.PORT) || 3018,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Content-Type', 'Authorization'], 
        additionalHeaders: ['Access-Control-Allow-Origin'],
        credentials: true,
      },
    },    
  });

  // Anslut till MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log(' Ansluten till MongoDB Atlas');
  } catch (error) {
    console.error(' Fel vid MongoDB-anslutning:', error);
  }

  // Registrera plugins
  await server.register(require('@hapi/inert'));
  await server.register(require('hapi-auth-jwt2'));

  // JWT-strategi
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET_KEY!,
    validate: async (decoded: any, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    
      return { isValid: true, credentials: decoded };
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt');

  // Registrera routes
  server.route(authRoutes);
  server.route(bookRoutes);
  server.route(reviewRoutes);

  // Starta servern
  await server.start();
  console.log(`Servern körs på: ${server.info.uri}`);
};

init();
