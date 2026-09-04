import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000 * 15,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too Many Requests. Please try later",
  },
});
