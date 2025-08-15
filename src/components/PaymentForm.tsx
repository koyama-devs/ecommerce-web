import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import jsPDF from "jspdf";
import { useState } from "react";

interface PaymentFormProps {
  totalPrice: number;
  onSuccess: (invoice: any) => void;
}

export default function PaymentForm({ totalPrice, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("HÓA ĐƠN THANH TOÁN", 20, 20);
    doc.setFontSize(12);
    doc.text(`Mã giao dịch: ${invoice.id}`, 20, 40);
    doc.text(`Khách hàng: ${invoice.customerName}`, 20, 50);
    doc.text(`Email: ${invoice.customerEmail}`, 20, 60);
    doc.text(`Số tiền: ¥${(invoice.amount / 100).toFixed(2)}`, 20, 70);
    doc.text(`Ngày thanh toán: ${invoice.date}`, 20, 80);
    doc.text(`Trạng thái: Thành công`, 20, 90);
    doc.save(`Invoice_${invoice.id}.pdf`);
  };

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
        body: JSON.stringify({ amount: Math.round(totalPrice * 100) }), // Stripe dùng đơn vị nhỏ nhất (yên → cent)
      });

      const data = await res.json();
      if (data.error) {
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
        const invoice = {
          id: result.paymentIntent.id,
          amount: result.paymentIntent.amount,
          currency: result.paymentIntent.currency,
          date: new Date(result.paymentIntent.created * 1000).toLocaleString(),
          customerName: name,
          customerEmail: email,
        };
        setPaymentStatus("success");
        setPaymentMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");
        generateInvoicePDF(invoice);
        onSuccess(invoice);
      }
    } catch (err: any) {
      setPaymentStatus("error");
      setPaymentMessage(err.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    }

    setLoading(false);
  };

  return (
    <Card sx={{ mt: 4, maxWidth: 500, mx: "auto", boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
          Thông tin thanh toán
        </Typography>

        {paymentStatus && (
          <Alert severity={paymentStatus} sx={{ mb: 2 }}>
            {paymentMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
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

          <Box
            sx={{
              p: 2,
              border: "1px solid #ccc",
              borderRadius: 2,
              mb: 2,
              backgroundColor: "#fafafa",
              minHeight: 50,
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": { color: "#a0aec0" },
                  },
                  invalid: { color: "#e53e3e" },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!stripe || loading || paymentStatus === "success"}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            {loading ? "Đang xử lý..." : `Thanh toán ¥${totalPrice}`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
