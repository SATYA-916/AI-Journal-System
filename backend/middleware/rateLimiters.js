import rateLimit from 'express-rate-limit';

const standardConfig = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
};

export const authLimiter = rateLimit({
  ...standardConfig,
  max: 100,
  message: { error: 'Too many auth requests' },
});

export const apiLimiter = rateLimit({
  ...standardConfig,
  max: 100,
  message: { error: 'Rate limit exceeded' },
});

export const analyzeLimiter = rateLimit({
  ...standardConfig,
  max: 100,
  message: { error: 'Too many analysis requests' },
});
