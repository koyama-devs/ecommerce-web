// backend/server.js
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

dotenv.config();
const app = express();
app.use(express.json());

// Cho phép frontend gọi API
app.use(cors({ origin: "http://localhost:5173" }));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API tạo Payment Intent
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  console.log("📩 Yêu cầu tạo payment intent với số tiền:", amount);

  try {
    // Kiểm tra số tiền hợp lệ
    if (!amount || isNaN(amount) || amount <= 0) {
      console.warn("⚠️ Số tiền không hợp lệ:", amount);
      return res.status(400).send({ error: "Số tiền không hợp lệ" });
    }

    // Tạo PaymentIntent trên Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // JPY không có phần thập phân
      currency: "jpy",
      automatic_payment_methods: { enabled: true }, // Stripe tự xử lý thẻ, Apple Pay, Google Pay...
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Lỗi Stripe:", error.message);
    res.status(500).send({ error: error.message });
  }
});

app.listen(3001, () => console.log("✅ Backend chạy ở http://localhost:3001"));
