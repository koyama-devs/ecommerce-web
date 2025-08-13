import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  TextField,
  Button,
  Snackbar,
  useTheme,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    // TODO: connect API
    setSnackbarOpen(true);
    setEmail("");
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    alert("Thanks for your message!");
    setMessage("");
  };

  return (
    <>
      {/* MAIN FOOTER */}
      <Box
        component="footer"
        sx={{
          mt: 8,
          py: 5,
          backgroundColor: theme.palette.background.default,
          borderTop: "1px solid #ccc",
          color: theme.palette.text.primary,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={1} justifyContent="space-between">
            {/* About Us */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <Box mb={2}>
                <img src="/logo.svg" alt="Logo" width={80} />
              </Box>
              <Typography variant="h6" gutterBottom>{t("footer.aboutUs")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("footer.aboutDesc")}
              </Typography>
            </Grid>

            {/* Support */}
            <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
              <Typography variant="h6" gutterBottom>{t("footer.support")}</Typography>
              <Stack spacing={1}>
                <Link href="/contact" color="text.secondary" underline="hover">{t("footer.contact")}</Link>
                <Link href="/help" color="text.secondary" underline="hover">{t("footer.help")}</Link>
                <Link href="/shipping" color="text.secondary" underline="hover">{t("footer.shipping")}</Link>
              </Stack>
            </Grid>

            {/* Policy */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>               
              <Typography variant="h6" gutterBottom>{t("footer.policy")}</Typography>
              <Stack spacing={1}>
                <Link href="/privacy" color="text.secondary" underline="hover">{t("footer.privacy")}</Link>
                <Link href="/terms" color="text.secondary" underline="hover">{t("footer.terms")}</Link>
                <Link href="/returns" color="text.secondary" underline="hover">{t("footer.returns")}</Link>
              </Stack>
            </Grid>

            {/* Newsletter */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <Typography variant="h6" gutterBottom>{t("footer.newsletter")}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("footer.newsletterDesc")}
              </Typography>
              <Box
                component="form"
                onSubmit={handleNewsletter}
                sx={{ display: "flex", flexDirection: "column", gap: 1, maxWidth: 280 }}
              >
                <TextField
                  size="small"
                  label={t("footer.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="contained" disabled={!isValidEmail(email)}>
                  {t("footer.subscribe")}
                </Button>
              </Box>
            </Grid>

            {/* Contact form */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <Typography variant="h6" gutterBottom>{t("footer.feedback")}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {t("footer.feedbackDesc")}
              </Typography>
              <Box component="form" onSubmit={handleContact}>
                <TextField
                  multiline
                  rows={3}
                  placeholder={t("footer.message")}
                  fullWidth
                  size="small"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="outlined" type="submit" sx={{ mt: 1 }}>
                  {t("footer.send")}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom row */}
          <Box
            mt={5}
            pt={3}
            borderTop="1px solid #ccc"
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            textAlign={{ xs: "center", sm: "left" }}
          >
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} {t("footer.companyName")}. {t("footer.allRightsReserved")}
            </Typography>

            <Stack direction="row" spacing={2} mt={{ xs: 2, sm: 0 }}>
              {/* Trust badges */}
              <img src="/visa.svg" alt="Visa" width={32} />
              <img src="/mastercard.svg" alt="MasterCard" width={32} />
              <img src="/ssl.svg" alt="SSL Secure" width={32} />
            </Stack>

            <Stack direction="row" spacing={2} mt={{ xs: 2, sm: 0 }}>
              {/* Social media */}
              <IconButton href="https://facebook.com" color="primary" target="_blank">
                <FacebookIcon />
              </IconButton>
              <IconButton href="https://twitter.com" color="primary" target="_blank">
                <TwitterIcon />
              </IconButton>
              <IconButton href="https://instagram.com" color="primary" target="_blank">
                <InstagramIcon />
              </IconButton>

              <IconButton onClick={scrollToTop} color="primary">
                <KeyboardArrowUpIcon />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* MOBILE FIXED FOOTER */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.palette.background.paper,
          borderTop: "1px solid #ccc",
          justifyContent: "space-around",
          zIndex: 1200,
          py: 1,
        }}
      >
        <IconButton><HomeIcon /></IconButton>
        <IconButton><SearchIcon /></IconButton>
        <IconButton><ShoppingCartIcon /></IconButton>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={t("footer.subscribed")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}