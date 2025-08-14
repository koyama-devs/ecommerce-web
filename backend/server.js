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
  try {
    // Stripe yêu cầu amount là số nguyên (JPY không có phần thập phân)
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).send({ error: "Số tiền không hợp lệ" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "jpy",
      payment_method_types: ["card"], // Chỉ dùng thẻ test
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(3001, () => console.log("✅ Backend chạy ở http://localhost:3001"));
