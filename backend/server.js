import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Permit server-to-server / local tools without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json({ limit: "20kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }));

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_TO"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

function getTransporter() {
  if (missingEnv.length) {
    throw new Error(`Missing server environment variables: ${missingEnv.join(", ")}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function clean(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validateCommon(body) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 60);
  const message = clean(body.message, 3000);
  const city = clean(body.city, 120);

  if (!name) return { error: "Please provide your name." };
  if (phone.replace(/\D/g, "").length < 7) return { error: "Please provide a valid phone number." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please provide a valid email address." };

  return { data: { name, email, phone, message, city } };
}

async function sendEnquiry({ subject, replyTo, fields }) {
  const transporter = getTransporter();
  const text = fields.map(([label, value]) => `${label}: ${value || "Not provided"}`).join("\n");

  await transporter.sendMail({
    from: `Leading UPVC Website <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO,
    replyTo: replyTo || undefined,
    subject,
    text,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Leading UPVC enquiry API" });
});

app.post("/api/contact", async (req, res) => {
  const validated = validateCommon(req.body || {});
  if (validated.error) return res.status(400).json({ message: validated.error });

  const { name, email, phone, city, message } = validated.data;
  const type = clean(req.body.type, 120);

  try {
    await sendEnquiry({
      subject: `Website contact enquiry — ${name}`,
      replyTo: email,
      fields: [
        ["Form", "Contact enquiry"],
        ["Name", name],
        ["Phone", phone],
        ["Email", email],
        ["City / Location", city],
        ["Project Type", type],
        ["Message", message],
      ],
    });
    return res.status(200).json({ message: "Your enquiry has been sent successfully." });
  } catch (error) {
    console.error("Contact email failed:", error.message);
    return res.status(500).json({ message: "We couldn't send your enquiry right now. Please try again or email us directly." });
  }
});

app.post("/api/quote", async (req, res) => {
  const validated = validateCommon(req.body || {});
  if (validated.error) return res.status(400).json({ message: validated.error });

  const { name, email, phone, city, message } = validated.data;
  const projectType = clean(req.body.projectType || req.body.type, 160);
  const windowType = clean(req.body.windowType, 160);
  const quantity = clean(String(req.body.quantity ?? ""), 80);
  const dimensions = clean(req.body.dimensions || req.body.size, 160);
  const colour = clean(req.body.colour || req.body.color, 120);

  try {
    await sendEnquiry({
      subject: `Website quote request — ${name}`,
      replyTo: email,
      fields: [
        ["Form", "Quote request"],
        ["Name", name],
        ["Phone", phone],
        ["Email", email],
        ["City / Location", city],
        ["Project Type", projectType],
        ["Window / Door Type", windowType],
        ["Quantity", quantity],
        ["Dimensions", dimensions],
        ["Colour", colour],
        ["Message", message],
      ],
    });
    return res.status(200).json({ message: "Your quote request has been sent successfully." });
  } catch (error) {
    console.error("Quote email failed:", error.message);
    return res.status(500).json({ message: "We couldn't send your quote request right now. Please try again or email us directly." });
  }
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: "This website origin is not allowed to submit enquiries." });
  }
  console.error("API error:", error.message);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`Leading UPVC email API running on http://localhost:${PORT}`);
  if (missingEnv.length) console.warn(`Email setup incomplete. Add: ${missingEnv.join(", ")}`);
});
