import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CartItem,
  InvoiceData,
  StoreInfo,
} from "./CheckoutButton";
import {
  generateInvoicePDF
} from "./CheckoutButton";

interface PaymentFormProps {
  totalPrice: number;
  cartItems: CartItem[];
  storeInfo: StoreInfo;
  taxRate?: number;
  shippingFee?: number;
  discount?: number;
  onSuccess: (invoice: InvoiceData) => void;
}

export default function PaymentForm({
  totalPrice,
  cartItems,
  storeInfo,
  taxRate = 0.1,
  shippingFee = 0,
  discount = 0,
  onSuccess,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(
    null
  );
  const [paymentMessage, setPaymentMessage] = useState("");

  const calcTotals = () => {
    const subtotal = cartItems.reduce(
      (s, it) => s + it.price * it.quantity,
      0
    );
    const tax = Math.round(subtotal * taxRate);
    const grandTotal = Math.max(
      0,
      Math.round(subtotal + tax + shippingFee - discount)
    );
    return { subtotal, tax, grandTotal };
  };

  const randomId = (prefix: string) =>
    `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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
        setPaymentStatus("error");
        setPaymentMessage(data.error);
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name, email, phone },
        },
      });

      if (result.error) {
        setPaymentStatus("error");
        setPaymentMessage(result.error.message || t("payment.error"));
      } else if (result.paymentIntent?.status === "succeeded") {
        const { subtotal, tax, grandTotal } = calcTotals();

        const invoiceData: InvoiceData = {
          store: { ...storeInfo },
          invoice: {
            invoiceNumber: randomId("INV"),
            date: new Date().toLocaleString(),
            orderId: result.paymentIntent.id || randomId("ORD"),
            paymentMethod: t("payment.method"),
            paymentStatus: t("payment.statusPaid"),
          },
          customer: {
            name,
            phone,
            email,
            shippingAddress: address,
          },
          items: cartItems,
          totals: {
            subtotal,
            tax,
            shippingFee,
            discount,
            grandTotal,
            currency: "JPY",
            vatRate: taxRate,
          },
          extras: {
            terms: t("invoice.terms"),
            thanksNote: t("invoice.thanksNote"),
            signer: storeInfo.name,
          },
        };

        setPaymentStatus("success");
        setPaymentMessage(t("payment.success"));

        await generateInvoicePDF(invoiceData);
        onSuccess(invoiceData);
      }
    } catch (err: any) {
      setPaymentStatus("error");
      setPaymentMessage(err.message || t("payment.errorRequest"));
    }

    setLoading(false);
  };

  return (
    <Card sx={{ mt: 4, maxWidth: 640, mx: "auto", boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
          {t("payment.title")}
        </Typography>

        {paymentStatus && (
          <Alert severity={paymentStatus} sx={{ mb: 2 }}>
            {paymentMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("form.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("form.phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("form.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("form.address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
          </Grid>

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
            {loading ? t("payment.processing") : t("payment.payNow", { amount: Math.round(totalPrice) })}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
