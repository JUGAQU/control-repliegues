import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: "bd75f827-0bbc-4c98-b603-4e80dc001d99",
      clientSecret: "TU_NUEVO_SECRET",
      tenantId: "32237451-e33d-4e8a-aba9-ead3c455253b",
    }),
  ],
});

export { handler as GET, handler as POST };
