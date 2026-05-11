import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

async function checkUserInSharePoint(email: string, accessToken: string) {
  const site = process.env.SHAREPOINT_SITE_NAME;
  const list = process.env.SHAREPOINT_LIST_NAME;

  const url = `https://graph.microsoft.com/v1.0/sites/atelcosoluciones.sharepoint.com:/sites/${site}:/lists/${list}/items?expand=fields`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();

  console.log("SHAREPOINT RESPONSE:", JSON.stringify(data, null, 2));

  const user = data.value?.find((item: any) => {
    const spEmail = item.fields?.Title?.toLowerCase().trim();
    return spEmail === email.toLowerCase().trim();
  });

  console.log("EMAIL LOGIN:", email);
  console.log("USUARIO ENCONTRADO:", user);

  if (!user) return false;

  return user.fields?.activo === true || user.fields?.activo === "true";
}

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read Sites.Read.All",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile, account }) {
      const email = profile?.email;

      if (!email || !account?.access_token) {
        return false;
      }

      return await checkUserInSharePoint(email, account.access_token);
    },
  },
});

export { handler as GET, handler as POST };
