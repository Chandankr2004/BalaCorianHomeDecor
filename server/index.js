import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "1mb" }));

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: String, default: "Price on enquiry" },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  customerType: { type: String, default: "Other" },
  interest: { type: String, default: "" },
  message: { type: String, default: "" },
  status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);
const Enquiry = mongoose.model("Enquiry", EnquirySchema);

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Admin login required." });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));

app.get("/api/products", async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category && req.query.category !== "all") filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Unable to load products." });
  }
});

app.post("/api/enquiries", async (req, res) => {
  try {
    const { name, phone, customerType, interest, message } = req.body || {};
    if (!String(name || "").trim() || !String(phone || "").trim()) {
      return res.status(400).json({ message: "Name and phone are required." });
    }
    const enquiry = await Enquiry.create({ name, phone, customerType, interest, message });
    res.status(201).json({ message: "Enquiry saved successfully.", id: enquiry._id });
  } catch {
    res.status(500).json({ message: "Unable to save enquiry. Please try again." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Set ADMIN_USERNAME, ADMIN_PASSWORD and JWT_SECRET in server/.env." });
  }
  const userOkay = String(username || "") === expectedUser;
  const passwordOkay = String(password || "") === expectedPass;
  if (!userOkay || !passwordOkay) return res.status(401).json({ message: "Incorrect username or password." });
  const token = jwt.sign({ username: expectedUser, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, username: expectedUser });
});

app.get("/api/admin/enquiries", requireAdmin, async (_req, res) => {
  try {
    res.json(await Enquiry.find().sort({ createdAt: -1 }).lean());
  } catch {
    res.status(500).json({ message: "Unable to load enquiries." });
  }
});

app.patch("/api/admin/enquiries/:id", requireAdmin, async (req, res) => {
  try {
    const allowed = ["New", "Contacted", "Closed"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status." });
    const item = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
    if (!item) return res.status(404).json({ message: "Enquiry not found." });
    res.json(item);
  } catch {
    res.status(400).json({ message: "Unable to update enquiry." });
  }
});

app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  try { res.json(await Product.find().sort({ createdAt: -1 }).lean()); }
  catch { res.status(500).json({ message: "Unable to load products." }); }
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const { name, category, description, price, image, active } = req.body || {};
    if (!String(name || "").trim() || !String(category || "").trim()) {
      return res.status(400).json({ message: "Product name and category are required." });
    }
    const product = await Product.create({ name, category, description, price, image, active: active !== false });
    res.status(201).json(product);
  } catch {
    res.status(400).json({ message: "Unable to create product. Check the submitted fields." });
  }
});

app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const fields = ["name", "category", "description", "price", "image", "active"];
    const updates = Object.fromEntries(fields.filter(k => k in (req.body || {})).map(k => [k, req.body[k]]));
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Unable to update product." });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted." });
  } catch {
    res.status(400).json({ message: "Unable to delete product." });
  }
});

const port = Number(process.env.PORT || 5000);
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_USERNAME) {
  console.error("Set MONGODB_URI, JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD in server/.env");
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");
  app.listen(port, () => console.log(`Balaji API running on http://localhost:${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB. Check MONGODB_URI and network access.", error.message);
  process.exit(1);
}
