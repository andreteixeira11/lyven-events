import { publicProcedure } from "../../create-context";
import { sendTestEmail } from "../../../lib/send-email";

export const sendTestEmailProcedure = publicProcedure.mutation(async () => {
  const result = await sendTestEmail();
  return result;
});
