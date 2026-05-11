import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const USUARIOS_AUTORIZADOS = [
  "julio.garcia@atelcosoluciones.es",
  // "otro.usuario@atelcosoluciones.es",
];

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
      const email = profile?.email?.toLowerCase().trim();

      if (!email) return false;

      return USUARIOS_AUTORIZADOS.includes(email);
    },
  },
});

export { handler as GET, handler as POST };
