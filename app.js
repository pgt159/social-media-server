import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from './utils/appError.js';
import globalErrorHandler from './controller/errorController.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import chatRoomRoute from './routes/chatRoomRouter.js';
import messRoute from './routes/messRouter.js';
import notiRoute from './routes/notiRoute.js';

import defaultRoute from './routes/defaultRoute.js';
import { VERSION } from './config.js';

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(
  bodyParser.json({
    limit: '30mb',
    extended: true,
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '30mb',
    extended: true,
  })
);
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ROUTING

app.use(`${VERSION}/`, defaultRoute);
app.use(`${VERSION}/auth`, authRoute);
app.use(`${VERSION}/user`, userRoute);
app.use(`${VERSION}/post`, postRoute);
app.use(`${VERSION}/chat`, chatRoomRoute);
app.use(`${VERSION}/mess`, messRoute);
app.use(`${VERSION}/noti`, notiRoute);

// ERROR HANDLING
app.use('*', (req, res, next) => {
  return next(
    new AppError(`Cant find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
