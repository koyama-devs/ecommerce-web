import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function PaymentForm({ totalPrice }: { totalPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setPaymentStatus(null);
    setPaymentMessage("");

    try {
      const res = await fetch("http://localhost:3001/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(totalPrice) }),
      });

      const data = await res.json();
      if (data.error) {
        console.error("Server error:", data.error);
        setPaymentStatus("error");
        setPaymentMessage(data.error);
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name, email },
        },
      });

      if (result.error) {
        setPaymentStatus("error");
        setPaymentMessage(result.error.message || "Thanh toán thất bại.");
      } else if (result.paymentIntent?.status === "succeeded") {
        setPaymentStatus("success");
        setPaymentMessage("Thanh toán thành công! Cảm ơn bạn.");
      } else {
        setPaymentStatus("error");
        setPaymentMessage(`Trạng thái khác: ${result.paymentIntent?.status}`);
      }
    } catch (err: any) {
      setPaymentStatus("error");
      setPaymentMessage(err.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    }

    setLoading(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 4, maxWidth: 400, mx: "auto", p: 3, border: "1px solid #ddd", borderRadius: 3 }}
    >
      <Typography variant="h6" mb={2}>
        Thanh toán đơn hàng
      </Typography>

      {paymentStatus && (
        <Alert severity={paymentStatus} sx={{ mb: 2 }}>
          {paymentMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Họ và tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, mb: 2 }}>
        <CardElement />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || loading || paymentStatus === "success"}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Đang xử lý..." : `Thanh toán ¥${totalPrice}`}
      </Button>
    </Box>
  );
}
