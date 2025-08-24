import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { InvoiceData } from "../components/CheckoutButton";
import { generateInvoicePDF } from "../components/CheckoutButton";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceData = location.state as InvoiceData | null;
  const { t } = useTranslation();

  if (!invoiceData) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography align="center" color="error">
          {t("orderSuccessPage.noInvoiceData")}
        </Typography>
      </Container>
    );
  }

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(Math.round(price));

  const handleDownloadPDF = async () => {
    const blob = await generateInvoicePDF(invoiceData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoiceData.invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box textAlign="center">
        <Alert
          severity="success"
          sx={{
            fontSize: "1.05rem",
            p: 2,
            mb: 3,
            backgroundColor: "#e6f4ea",
            color: "#2e7d32",
            fontWeight: "bold",
          }}
        >
          {t("orderSuccessPage.paymentSuccess")}
        </Alert>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxWidth: 900,
            mx: "auto",
            textAlign: "left",
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {invoiceData.store.name}
              </Typography>
              <Typography>{invoiceData.store.address}</Typography>
              <Typography>
                {t("orderSuccessPage.store.phone")}: {invoiceData.store.phone} | Email:{" "}
                {invoiceData.store.email}
              </Typography>
              {invoiceData.store.taxId && (
                <Typography>
                  {t("orderSuccessPage.store.taxId")}: {invoiceData.store.taxId}
                </Typography>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ textAlign: { xs: "left", sm: "right" } }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {t("orderSuccessPage.invoice.title")}
              </Typography>
              <Typography>
                {t("orderSuccessPage.invoice.number")}:{" "}
                {invoiceData.invoice.invoiceNumber}
              </Typography>
              <Typography>
                {t("orderSuccessPage.invoice.date")}: {invoiceData.invoice.date}
              </Typography>
              <Typography>
                {t("orderSuccessPage.invoice.orderId")}: {invoiceData.invoice.orderId}
              </Typography>
              <Typography>
                {t("orderSuccessPage.invoice.paymentMethod")}:{" "}
                {invoiceData.invoice.paymentMethod}
              </Typography>
              <Typography>
                {t("orderSuccessPage.invoice.paymentStatus")}:{" "}
                {invoiceData.invoice.paymentStatus}
              </Typography>
            </Grid>
          </Grid>

          {/* Customer */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {t("orderSuccessPage.customer.title")}
              </Typography>
              <Typography>
                {t("orderSuccessPage.customer.name")}: {invoiceData.customer.name}
              </Typography>
              {invoiceData.customer.phone && (
                <Typography>
                  {t("orderSuccessPage.customer.phone")}: {invoiceData.customer.phone}
                </Typography>
              )}
              {invoiceData.customer.email && (
                <Typography>
                  Email: {invoiceData.customer.email}
                </Typography>
              )}
              {invoiceData.customer.shippingAddress && (
                <Typography>
                  {t("orderSuccessPage.customer.address")}:{" "}
                  {invoiceData.customer.shippingAddress}
                </Typography>
              )}
              {invoiceData.customer.customerId && (
                <Typography>
                  {t("orderSuccessPage.customer.id")}: {invoiceData.customer.customerId}
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Items */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            {t("orderSuccessPage.items.title")}
          </Typography>
          {invoiceData.items.map((item, idx) => (
            <Stack
              key={idx}
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography>
                {idx + 1}. {item.name} (x{item.quantity})
              </Typography>
              <Typography>
                {formattedPrice(item.price * item.quantity)}
              </Typography>
            </Stack>
          ))}

          {/* Summary */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ maxWidth: 360, ml: "auto" }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography>{t("orderSuccessPage.summary.subtotal")}:</Typography>
              <Typography>
                {formattedPrice(invoiceData.totals.subtotal)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography>
                {t("orderSuccessPage.summary.tax")}
                {invoiceData.totals.vatRate
                  ? ` (${Math.round(invoiceData.totals.vatRate * 100)}%)`
                  : ""}
                :
              </Typography>
              <Typography>{formattedPrice(invoiceData.totals.tax)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography>{t("orderSuccessPage.summary.shippingFee")}:</Typography>
              <Typography>
                {formattedPrice(invoiceData.totals.shippingFee)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography>{t("orderSuccessPage.summary.discount")}:</Typography>
              <Typography>
                -{formattedPrice(invoiceData.totals.discount)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">
                {t("orderSuccessPage.summary.total")}:
              </Typography>
              <Typography fontWeight="bold" color="primary">
                {formattedPrice(invoiceData.totals.grandTotal)}
              </Typography>
            </Stack>
          </Box>

          {/* Extras */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {t("orderSuccessPage.extras.termsTitle")}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {t("orderSuccessPage.extras.termsDefault")}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {t("orderSuccessPage.extras.thanksTitle")}
          </Typography>
          <Typography sx={{ mb: 2 }}>
            { t("orderSuccessPage.extras.thanksDefault")}
          </Typography>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDownloadPDF}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
            >
              📄 {t("orderSuccessPage.buttons.downloadPDF")}
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              sx={{ fontWeight: "bold" }}
            >
              ⬅️ {t("orderSuccessPage.buttons.backHome")}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
