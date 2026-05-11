import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

async function checkUserInSharePoint(email: string, accessToken: string) {
  try {
    const site = process.env.SHAREPOINT_SITE_NAME;
    const list = process.env.SHAREPOINT_LIST_NAME;

    const url = `https://graph.microsoft.com/v1.0/sites/atelcosoluciones.sharepoint.com:/sites/${site}:/lists/${list}/items?expand=fields`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    const user = data.value?.find(
      (item: any) =>
        item.fields?.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) return false;

    return user.fields?.activo === true;
  } catch (error) {
    console.error("Error SharePoint:", error);
    return false;
  }
}

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],

  callbacks: {
    async signIn({ profile, account }) {
      const email = profile?.email;

      if (!email || !account?.access_token) {
        return false;
      }

      const permitido = await checkUserInSharePoint(
        email,
        account.access_token
      );

      return permitido;
    },
  },
});

export { handler as GET, handler as POST };
