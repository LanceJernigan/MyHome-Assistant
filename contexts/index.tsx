import { Theme as ThemeProvider } from "dx-sdk/build/providers";
import { ProvidersProps } from "./types";
import { UserProvider } from "./user";

const Providers: React.FC<ProvidersProps> = ({ children }) => (
	<ThemeProvider theme={{}}>
		<UserProvider>{children}</UserProvider>
	</ThemeProvider>
);

export default Providers;
