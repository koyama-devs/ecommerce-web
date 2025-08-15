import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe("pk_test_51RvvuRJhVUeatzaxarReCCkpJ9HCqqnUjnOXlweugIBgyPqC9cOPiY0qZDQyiLq4ZEar8tl0prRZXOljOPSXYOFL00OVyMDP7l");

export default function CheckoutButton({ totalPrice, onSuccess }: { totalPrice: number; onSuccess: (invoice:any)=>void }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm totalPrice={totalPrice} onSuccess={onSuccess} />
    </Elements>
  );
}
