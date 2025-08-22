
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




// this code is running before added hearbeat
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { v4 as uuidv4 } from "uuid";
// const sessions = new Map(); // sid -> { userId, lastActivity }
// const INACTIVITY_LIMIT_MS = 90 * 120 * 1000; // 1 minute

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





// ================== IMPORTS ==================
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import http from "http";
import { WebSocketServer } from "ws";

// ================== EXISTING SESSION STORE ==================
const sessions = new Map(); // sid -> { userId, lastActivity, ws?, lastHeartbeat? }
const INACTIVITY_LIMIT_MS = 90 * 120 * 1000; // 180 minutes (your original reason)

// 🔸 Heartbeat config
const HEARTBEAT_INTERVAL_CLIENT_MS = 3000;  // client sends every 3s
const SERVER_TIMEOUT_MS = 6000;            // if no heartbeat for 4s => logout

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow only your GitHub Pages frontend (unchanged)
const ALLOWED_ORIGIN =
  process.env.FRONTEND_URL || "https://moeen4128.github.io";
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true, // allow cookies
  })
);

// ================== HELPERS ==================
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

// Parse cookies from WS upgrade request headers
function parseCookieHeader(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
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
  }
  // sliding expiration
  session.lastActivity = Date.now();
  req.userId = session.userId;
  req.sid = sid;
  next();
}

// ================== ROUTES ==================
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
  const s = sessions.get(req.sid);
  if (s?.ws && s.ws.readyState === 1) { // 1 = OPEN
    try { s.ws.close(4001, "Logged out"); } catch {}
  }
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

// ================== HTTP SERVER + WEBSOCKET SERVER ==================
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

// Create WS server on same port, path `/ws`
const wss = new WebSocketServer({ server, path: "/ws" });

// WS connection handler
wss.on("connection", (ws, request) => {
  const cookies = parseCookieHeader(request.headers?.cookie || "");
  const sid = cookies["sid"];

  if (!sid || !sessions.has(sid)) {
    ws.close(4401, "Unauthorized");
    return;
  }
  const session = sessions.get(sid);

  if (isExpired(session)) {
    sessions.delete(sid);
    ws.close(4440, "Session expired");
    return;
  }

  session.ws = ws;
  session.lastHeartbeat = Date.now();
  session.lastActivity = Date.now();

  try {
    ws.send(JSON.stringify({ type: "ws_connected", ts: Date.now() }));
  } catch {}

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data?.type === "heartbeat") {
        session.lastHeartbeat = Date.now();
        session.lastActivity = Date.now();
      }
    } catch {}
  });

  ws.on("close", () => {
    if (sessions.has(sid)) {
      const s = sessions.get(sid);
      if (s?.ws === ws) {
        s.ws = null;
      }
    }
  });
});

// Global heartbeat timeout scanner (every 1s)
setInterval(() => {
  const now = Date.now();
  for (const [sid, s] of sessions.entries()) {
    if (s.lastHeartbeat) {
      const diff = now - s.lastHeartbeat;
      if (diff > SERVER_TIMEOUT_MS) {
        try {
          if (s.ws && s.ws.readyState === 1) {
            s.ws.send(JSON.stringify({ type: "logout", reason: "heartbeat_timeout" }));
            s.ws.close(4000, "Heartbeat timeout");
          }
        } catch {}
        sessions.delete(sid);
        console.log(`Session ${sid} logged out due to heartbeat timeout (${diff}ms)`);
      }
    }
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`Auth + WS server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
