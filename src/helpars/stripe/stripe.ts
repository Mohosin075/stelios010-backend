import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: "2024-12-18.acacia" as any,
});

export const createPaymentIntent = async (
  amount: number,
  paymentMethodId: string,
  currency: string = "usd"
) => {
  try {
    if (amount <= 0) throw new Error("Invalid amount");

    // Convert to cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${config.url.frontend_url}/payment/success`,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    return paymentIntent;
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    throw new Error(error.message || "Payment failed");
  }
};

export const checkPaymentStatus = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
    };
  } catch (error: any) {
    console.error("Error retrieving payment intent:", error);
    return { success: false, error: error.message };
  }
};

export const createStripeAccount = async (
  userEmail: string,
  country: string = "US",
  businessType: "individual" | "company" = "individual"
) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email: userEmail,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: businessType,
      settings: {
        payouts: {
          schedule: {
            interval: "daily",
          },
        },
      },
    });

    return account?.id;
  } catch (error: any) {
    console.error("Error creating Stripe Express account:", error);
    throw new Error(error?.message || "Failed to create Stripe account");
  }
};

export const generateAccountLink = async (stripeAccountId: string) => {
  try {
    // Generate Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${config.url.frontend_url}/welcome`,
      return_url: `${config.url.frontend_url}/success`,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error: any) {
    console.error("Error generating Stripe account link:", error);
    throw new Error(error?.message || "Failed to generate Stripe account link");
  }
};

// We need to do it web hook
export const updateStripeAccountStatus = async (stripeAccountId: string) => {
  try {
    // Fetch Stripe account details
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account;
  } catch (error: any) {
    console.error("Error updating Stripe account status:", error);
    throw new Error(error?.message || "Failed to update Stripe account status");
  }
};

export const BalanceTransfer = async (
  amount: number,
  destinationAccountId: string,
  currency: string = "usd"
) => {
  try {
    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!destinationAccountId)
      throw new Error("Destination Stripe Account ID required");

    // Stripe expects amount in cents as an integer
    const amountInCents = Math.round(amount * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      destination: destinationAccountId,
    });

    return transfer;
  } catch (error: any) {
    console.error("Error transferring funds:", error);
    throw new Error(error.message || "Transfer failed");
  }
};

export default stripe;

