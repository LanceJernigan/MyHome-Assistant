import { Theme as ThemeProvider } from "dx-sdk/build/providers";
import { ProvidersProps } from "./types";
import { UserProvider } from "./user";
import { Auth0Provider } from "@auth0/auth0-react";
import config from "@/utils/config";

const providerConfig = {
  domain: config.AUTHORIZATION_DOMAIN,
  clientId: config.AUTHORIZATION_CLIENT_ID,
  audience: config.AUTHORIZATION_AUDIENCE,
  useRefreshTokens: true,
  scope: "Corp:DX:Read Corp:DX:Write Global:Read:User Global:Write:User",
};

const Providers: React.FC<ProvidersProps> = ({ children }) => (
  <Auth0Provider
    {...providerConfig}
    cacheLocation="localstorage"
    redirectUri={
      typeof window !== "undefined" ? window.location.origin : "/chat/"
    }
  >
    <ThemeProvider theme={{}}>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  </Auth0Provider>
);

export default Providers;
