import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe("pk_test_51RvvuRJhVUeatzaxarReCCkpJ9HCqqnUjnOXlweugIBgyPqC9cOPiY0qZDQyiLq4ZEar8tl0prRZXOljOPSXYOFL00OVyMDP7l"); // public key từ Stripe Dashboard

export default function CheckoutButton({ totalPrice }: { totalPrice: number }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm totalPrice={totalPrice} />
    </Elements>
  );
}
