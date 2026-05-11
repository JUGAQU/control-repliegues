import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();

      if (!email) {
        return false;
      }

      return email.endsWith("@atelcosoluciones.es");
    },
  },
});

export { handler as GET, handler as POST };
