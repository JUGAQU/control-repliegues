import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: "TU_CLIENT_ID",
      clientSecret: "TU_SECRET",
      tenantId: "TU_TENANT_ID",
    }),
  ],
});

export { handler as GET, handler as POST };
