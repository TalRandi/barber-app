console.log("[STARTUP] DATABASE_URL defined:", !!process.env.DATABASE_URL);
console.log("[STARTUP] NODE_ENV:", process.env.NODE_ENV);

import app from "../backend/src/app";

export default app;
