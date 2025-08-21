
// // this code is running successfully 
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { v4 as uuidv4 } from "uuid";
// const sessions = new Map(); // sid -> { userId, lastActivity }
// const INACTIVITY_LIMIT_MS = 90 * 120 * 1000; // 180 minutes -> I set 180 because I used static pages in frontend so any apis not call whenever user used static pages so the session not expired

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // Allow only your GitHub Pages frontend
// const ALLOWED_ORIGIN =
//   process.env.FRONTEND_URL || "https://moeen4128.github.io";
// app.use(
//   cors({
//     origin: ALLOWED_ORIGIN,
//     credentials: true, // allow cookies
//   })
// );

// // Helpers
// function getSid(req) {
//   return req.cookies?.sid || null;
// }
// function isExpired(session) {
//   return Date.now() - session.lastActivity > INACTIVITY_LIMIT_MS;
// }
// function cookieCookieOptions() {
//   return {
//     httpOnly: true,
//     sameSite: "none", // allow cross-site
//     secure: true, // only works over https
//   };
// }

// function authMiddleware(req, res, next) {
//   const sid = getSid(req);
//   if (!sid) return res.status(401).json({ ok: false, msg: "No session" });
//   const session = sessions.get(sid);
//   if (!session)
//     return res.status(401).json({ ok: false, msg: "Invalid session" });
//   if (isExpired(session)) {
//     sessions.delete(sid);
//     res.clearCookie("sid", cookieCookieOptions());
//     return res.status(440).json({ ok: false, msg: "Session expired" });
//   } // sliding expiration
//   session.lastActivity = Date.now();
//   req.userId = session.userId;
//   req.sid = sid;
//   next();
// } 
// // Routes
// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ ok: false, msg: "email/password required" });
//   }
//   const sid = uuidv4();
//   sessions.set(sid, { userId: email, lastActivity: Date.now() });
//   res.cookie("sid", sid, cookieCookieOptions());
//   res.json({ ok: true, user: { id: email, email } });
// });
// app.post("/logout", authMiddleware, (req, res) => {
//   sessions.delete(req.sid);
//   res.clearCookie("sid", cookieCookieOptions());
//   res.json({ ok: true });
// });
// app.get("/me", authMiddleware, (req, res) => {
//   res.json({ ok: true, user: { id: req.userId, email: req.userId } });
// });
// app.get("/protected-data", authMiddleware, (req, res) => {
//   res.json({ ok: true, data: `Hello ${req.userId}, this is protected.` });
// });
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Auth server running on port ${PORT}`);
// });




import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
const sessions = new Map(); // sid -> { userId, lastActivity }
const INACTIVITY_LIMIT_MS = 90 * 120 * 1000; // 1 minute

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow only your GitHub Pages frontend
const ALLOWED_ORIGIN =
  process.env.FRONTEND_URL || "https://moeen4128.github.io";
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true, // allow cookies
  })
);

// Helpers
function getSid(req) {
  return req.cookies?.sid || null;
}
function isExpired(session) {
  return Date.now() - session.lastActivity > INACTIVITY_LIMIT_MS;
}
function cookieCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "none", // allow cross-site
    secure: true, // only works over https
  };
}

function authMiddleware(req, res, next) {
  const sid = getSid(req);
  if (!sid) return res.status(401).json({ ok: false, msg: "No session" });
  const session = sessions.get(sid);
  if (!session)
    return res.status(401).json({ ok: false, msg: "Invalid session" });
  if (isExpired(session)) {
    sessions.delete(sid);
    res.clearCookie("sid", cookieCookieOptions());
    return res.status(440).json({ ok: false, msg: "Session expired" });
  } // sliding expiration
  session.lastActivity = Date.now();
  req.userId = session.userId;
  req.sid = sid;
  next();
} 
// Routes
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, msg: "email/password required" });
  }
  const sid = uuidv4();
  sessions.set(sid, { userId: email, lastActivity: Date.now() });
  res.cookie("sid", sid, cookieCookieOptions());
  res.json({ ok: true, user: { id: email, email } });
});
app.post("/logout", authMiddleware, (req, res) => {
  sessions.delete(req.sid);
  res.clearCookie("sid", cookieCookieOptions());
  res.json({ ok: true });
});
app.get("/me", authMiddleware, (req, res) => {
  res.json({ ok: true, user: { id: req.userId, email: req.userId } });
});
app.get("/protected-data", authMiddleware, (req, res) => {
  res.json({ ok: true, data: `Hello ${req.userId}, this is protected.` });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});