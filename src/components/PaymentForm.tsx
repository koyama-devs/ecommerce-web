import { Box, Button } from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function PaymentForm({ totalPrice }: { totalPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Gọi API backend để tạo PaymentIntent
      const res = await fetch("http://localhost:3001/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // JPY nên gửi số nguyên
        body: JSON.stringify({ amount: Math.round(totalPrice) }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Lỗi tạo PaymentIntent: " + errData.error);
        setLoading(false);
        return;
      }

      const { clientSecret } = await res.json();
      if (!clientSecret) {
        alert("Không nhận được clientSecret từ server");
        setLoading(false);
        return;
      }

      // Xác nhận thanh toán
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        alert("Lỗi thanh toán: " + result.error.message);
      } else {
        if (result.paymentIntent?.status === "succeeded") {
          alert("✅ Thanh toán thành công!");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Có lỗi kết nối: " + err.message);
    }

    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <CardElement />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        disabled={!stripe || loading}
      >
        {loading ? "Đang xử lý..." : "Thanh toán ngay"}
      </Button>
    </Box>
  );
}
