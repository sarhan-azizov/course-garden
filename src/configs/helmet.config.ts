import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';

export const setupHelmet = (app: INestApplication) =>
  app.use(
    helmet({
      // Защищаем от Clickjacking, запрещая отображение сайта в iframe
      frameguard: {
        action: 'deny', // Или 'sameorigin' для разрешения только с того же домена
      },

      // Защищаем от XSS-атак с помощью Content-Security-Policy (CSP)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Разрешаем загружать ресурсы только с того же домена
          scriptSrc: ["'self'", "'unsafe-inline'"], // Разрешаем выполнять только локальные скрипты
        },
      },

      // Запрещаем MIME-type sniffing
      noSniff: true,

      // Защищаем куки от атак через XSS
      hidePoweredBy: true,

      // Защищаем от Host Header атак
      dnsPrefetchControl: {
        allow: false, // Отключаем предварительное разрешение доменов
      },

      // Включаем HSTS для обеспечения безопасности соединений
      strictTransportSecurity: {
        maxAge: 31536000, // Время действия HSTS (1 год)
        includeSubDomains: true, // Применяется ко всем поддоменам
        preload: true, // Добавляем в список для preload
      },
    }),
  );
