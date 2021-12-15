import initStripe from "stripe";
import { buffer } from "micro";
import { getServiceSupabase } from "../../utils/supabase";

export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  const signingSecret = process.env.STRIPE_SIGNING_KEY;
  const reqBuffer = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
  } catch (err) {
    console.log(err);
    return res.status(400).send(`WEBHOOK ERROR: ${err.message}`);
  }
  const supabase = getServiceSupabase();

  switch (event.type) {
    case "customer.subscription.updated":
      await supabase
        .from("profile")
        .update({
          is_subscribed: true,
          interval: event.data.object.items.data[0].plan.interval,
        })
        .eq("stripe_customer", event.data.object.customer);
      break;
    case "customer.subscription.deleted": // only fires when subscription turns off
      await supabase
        .from("profile")
        .update({
          is_subscribed: false,
          interval: null,
        })
        .eq("stripe_customer", event.data.object.customer);
  }

  console.log("Event Received");
  console.log({ event });
  res.send({ received: true });
};

export default handler;
