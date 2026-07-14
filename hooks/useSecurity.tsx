import {createContext, useContext, useState, ReactNode} from 'react';
import {shibariumChain, useShibAuth} from '@shibaone/shib-auth-sdk';
import {IdentitySDK} from "@shibaone/identity-sdk";
import {Shib4337} from '@shibaone/account-abstraction-sdk';
import {ethers} from 'ethers';

const DID_REGISTRY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DID_REGISTRY_CONTRACT_ADDRESS || "";
const CAS_URL = process.env.NEXT_PUBLIC_CAS_URL || "";
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || "";
const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || "";

interface DecodedToken {
  exp: number;
  iat: number;

  // Add any custom fields you expect in the token
  [key: string]: any;
}

interface IUser {
  id: string;
  email: string;
  email_verified: boolean;
  name: string;
  avatar: string;
  organizations: {
    id: string;
    name: string;
    role: string;
  }[];
}

interface SecurityContextProps {
  user: IUser | null;
  isAuthenticated: boolean;
  signOut: () => void;
  authenticateWithShib: () => Promise<void>;
  error: string | null;
  loginData: {
    address: string;
    requestId: string;
    signature: string;
  } | null;
}

const SecurityContext = createContext<SecurityContextProps>({
  user: null,
  isAuthenticated: false,
  signOut: () => {
  },
  authenticateWithShib: async () => {
  },
  error: null,
  loginData: null
});

export const SecurityProvider = ({children}: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState<{ address: string, requestId: string; signature: string; } | null>(null);

  const {user: shibUser, getEthersSigner, logoutUser, currentChain, changeChain} = useShibAuth();

  const authenticateWithShib = async () => {
    // if (user) {
    //   return;
    // }
    if (!shibUser) {
      setError("User is not logged in");
      console.log("User is not logged in");
      return;
    }
    if (currentChain.chainId != 109) {
      await changeChain(shibariumChain)
    }

    setError(null);

    try {
      const baseUrl = CAS_URL!;
      const didContractAddress = DID_REGISTRY_CONTRACT_ADDRESS!;

      const signer = await getEthersSigner();

      const shibAAservice = Shib4337.init({
        signer: signer,
        chainId: 109,
        bundlerUrl: BUNDLER_URL!,
        options: {
          owners: [signer.address],
          threshold: 1,
          saltNonce: '0'
        },
        paymasterOptions: {
          paymasterUrl: PAYMASTER_URL!,
          isSponsored: true,
          sponsorshipPolicyId: ''
        }
      });

      const walletAddress = await shibAAservice.getWalletAddress();

      const identitySDK = await IdentitySDK.create({signer, identityAddresses: {didContractAddress}, returnData: true});

      const didString = identitySDK.idFromAddress(walletAddress);

      const isIdentityRegistered = await identitySDK.isIdentityRegistered(didString);

      if (!isIdentityRegistered) {
        const services = [
          {
            id: "1",
            serviceType: "URL",
            serviceEndpoint: "https://uidai.gov.in/",
          },
          {
            id: "2",
            serviceType: "URL",
            serviceEndpoint: "https://uidai2.gov.in/",
          },
        ];
        const verificationMethods = [
          {
            id: "PDS_VERIFIER_ADDRESS",
            keyType: 0,
            key: ethers.encodeBytes32String(""),
            add: signer.address,
            verificationRelationships: [0, 1, 2, 3],
          }
        ]

        const createIdentityData = await identitySDK.createIdentity(
          "UIDAI",
          verificationMethods,
          services,
          walletAddress
        );

        await shibAAservice.addTransaction({
          to: didContractAddress,
          data: createIdentityData,
          value: '0'
        });

        const userOp = await shibAAservice.createTransaction({
          transactions: [],
          options: {
            type: 2
          }
        });

        const resExecuteTransaction = await shibAAservice.executeTransaction({
          userOp,
          signer: signer
        });

        await resExecuteTransaction.wait();
      }

      const nonceResponse = await fetch(`${baseUrl}/api/v1/nonce/${walletAddress}`);
      const nonceData = await nonceResponse.json();
      const signature = await signer.signMessage(`login:shibauth:${nonceData.requestId}`);

      setLoginData({address: walletAddress, signature: signature, requestId: nonceData.requestId});

    } catch (err: any) {
      console.error("Authentication error", err);
      setError(err)
      if (shibUser) signOut()
    }
  };

  const signOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    logoutUser();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <SecurityContext.Provider value={{
      user,
      isAuthenticated,
      signOut,
      authenticateWithShib,
      error,
      loginData
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);
