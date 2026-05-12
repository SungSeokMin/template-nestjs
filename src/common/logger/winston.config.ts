import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, context, ...meta }) => {
    const ctx = typeof context === 'string' ? `[${context}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${String(timestamp)} ${level} ${ctx} ${String(message)}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), json());

export const winstonConfig = (): WinstonModuleOptions => ({
  transports: [
    new winston.transports.Console({
      format: process.env.ENV === 'local' ? devFormat : prodFormat,
    }),
  ],
});
