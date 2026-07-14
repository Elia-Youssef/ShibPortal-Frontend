"use client"

import '@shibaone/shibhubui/index.css';
import "@rainbow-me/rainbowkit/styles.css";
import {
  Environments,
  ethereumChain, IAuthOptions,
  shibariumChain,
  ShibAuthSdk
} from "@shibaone/shib-auth-sdk";
import {SecurityProvider} from "@/hooks/useSecurity";
// import {Theme} from "@rainbow-me/rainbowkit";

const customEthChain = ethereumChain;
customEthChain.rpcUrls.default.http = ["https://ethereum-rpc.publicnode.com"]
customEthChain.rpcUrls.public.http = ["https://ethereum-rpc.publicnode.com"]

export default function AuthSdkWrapper({children}: Readonly<{ children: React.ReactNode, }>) {
  let AuthSdkOptions: IAuthOptions = {
    Chains: [shibariumChain, customEthChain],
    IsDecentralizedDisabled: false,
    DiscordProvider: undefined,
    GoogleProvider: undefined,
    AppName: "Shib Portal",
    WalletConnectProjectId: "398b88d053e195542fe90f7454be3680",
  };

  return (
    <ShibAuthSdk
      mode={process.env.NEXT_PUBLIC_ENV == "prod" || process.env.NEXT_PUBLIC_ENV == "stage" ? Environments.PROD : Environments.DEV}
      options={AuthSdkOptions}>
      <SecurityProvider>
        {children}
      </SecurityProvider>
    </ShibAuthSdk>
  );
}

const THEME = {
  colors: {
    accentColor: ``,
    accentColorForeground: ``,
    actionButtonBorder: ``,
    actionButtonBorderMobile: ``,
    actionButtonSecondaryBackground: ``,
    closeButton: ``,
    closeButtonBackground: ``,
    connectButtonBackground: ``,
    connectButtonBackgroundError: ``,
    connectButtonInnerBackground: ``,
    connectButtonText: ``,
    connectButtonTextError: ``,
    connectionIndicator: ``,
    downloadBottomCardBackground: ``,
    downloadTopCardBackground: ``,
    error: ``,
    generalBorder: ``,
    generalBorderDim: ``,
    menuItemBackground: ``,
    modalBackdrop: ``,
    modalBackground: ``,
    modalBorder: ``,
    modalText: ``,
    modalTextDim: ``,
    modalTextSecondary: ``,
    profileAction: ``,
    profileActionHover: ``,
    profileForeground: ``,
    selectedOptionBorder: ``,
    standby: ``,
  },
  fonts: {
    body: ``,
  },
  radii: {
    actionButton: ``,
    connectButton: ``,
    menuButton: ``,
    modal: ``,
    modalMobile: ``,
  },
  shadows: {
    connectButton: ``,
    dialog: ``,
    profileDetailsAction: ``,
    selectedOption: ``,
    selectedWallet: ``,
    walletLogo: ``,
  },
  blurs: {
    modalOverlay: ``,
  }
}
