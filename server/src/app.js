import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import notificationRoutes from './routes/notifications.js';
import streamRoutes from './routes/stream.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
const isDev = process.env.NODE_ENV !== "production";
app.use(cors({
  origin: isDev ? true : process.env.CLIENT_URL,
  credentials: true,          // required for cookies to cross origins
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stream', streamRoutes);

app.use(errorHandler);        // must be last

export default app;