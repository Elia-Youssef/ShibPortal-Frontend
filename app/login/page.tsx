"use client"

import styles from "./page.module.css"
import {useEffect, useState} from 'react';
import {useShibAuth} from '@shibaone/shib-auth-sdk';
import {useSecurity} from '@/hooks/useSecurity';
import {useSearchParams} from "next/navigation";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {useConnectModal} from '@rainbow-me/rainbowkit'
import Fetch from "@/utils/Fetch";
import ErrorModal from "@/components/ErrorModal";
import LoadingModal from "@/components/LoadingModal";

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {user, currentChain, loginWithW3A} = useShibAuth();
  const {authenticateWithShib, signOut, loginData, error} = useSecurity()
  const {openConnectModal} = useConnectModal();

  const [stopRefresh, setStopRefresh] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<any>({});
  const [loading, setLoading] = useState<{ title: string, message: string }>({title: "", message: ""});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newUser, setNewUser] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [usernameStatus, setUsernameStatus] = useState<{
    available: false,
    message: string,
  }>({message: "", available: false});

  useEffect(OnUnload, [stopRefresh]);

  useEffect(() => {
    if (user && currentChain) {
      // isNewUser()
      if (loginData != null) {
        isNewUser()
      } else {
        setStopRefresh(true);
        setLoading({title: "Authenticating...", message: "Please do not refresh the page."})
        authenticateWithShib()
      }
    }
  }, [user, currentChain, loginData]);

  useEffect(() => {
    if (error != null) {
      setLoading({title: "", message: ""});
      setStopRefresh(false);
      setErrorMessage("An error occured");
      signOut();
    }
  }, [error]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      checkUsernameAvailability()
    }, 400);
    return () => clearTimeout(debounce);
  }, [username]);

  return (
    <div className={styles.page}>
      {currentPage == 0 ? // LOGIN OR LOGOUT
        <div className={styles.loginLogoutContainer}>
          <Image src={"/images/ShibPortalBigLogo.png"} alt={""} width={700} height={400} style={{marginBottom: 30}}/>

          <button
            className={styles.loginButton}
            onClick={() => {
              signOut();
              setCurrentPage(1);
            }}
          >
            Login
          </button>

          <button
            className={`${styles.loginButton} ${styles.logoutButton}`}
            onClick={() => {
              signOut()
            }}
          >
            Logout
          </button>
        </div>

        : currentPage == 1 ? // LOGIN
          <div className={styles.loginContainer}>
            <div className={styles.loginTitle}>Login / Join</div>
            <Image src={"/images/ShibPortalBigLogo.png"} alt={""} width={275} height={155}/>

            <button
              className={styles.loginButton}
              onClick={() => {
                signOut();
                if (openConnectModal) {
                  openConnectModal();
                }
              }}
            >
              Connect Wallet
            </button>

            <div className={styles.orContainer}>
              <div className={styles.orLine}/>
              <div>Or</div>
              <div className={styles.orLine} style={{transform: "scale(-1)"}}/>
            </div>

            <div className={styles.emailLogin} onClick={() => {
              signOut();
              setCurrentPage(2);
            }}>Continue with Email
            </div>

            <div className={styles.notice}>
              By logging in, you agree to our<br/>
              <a href={"https://www.shibthemetaverse.io/en/terms-of-use"} target={"_blank"}
                 style={{textDecoration: "underline"}}>Terms of Use</a> and <a
              href={"https://www.shibthemetaverse.io/en/privacy-policy"} target={"_blank"}
              style={{textDecoration: "underline"}}>Privacy Policy</a>
            </div>
          </div>

          : currentPage == 2 ? // EMAIL LOGIN
            <div className={styles.loginContainer}>
              <div className={styles.loginTitle}>Email Login / Join</div>

              <input type="email" id="email" placeholder="hello@example.com" className={styles.emailInput}
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}/>
              <div className={styles.inputContainer}>
                <button
                  className={styles.loginButton}
                  onClick={() => loginWithW3A("passwordless", email)}
                  disabled={email.length < 5}
                  style={{cursor: email.length < 5 ? "not-allowed" : "pointer"}}
                >
                  Continue
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setEmail("")
                    setCurrentPage(1)
                  }}
                >
                  Back
                </button>
              </div>

              <div className={styles.notice}>
                <a href={"https://docs.shib.io"} target={"_blank"}
                   style={{textDecoration: "underline", color: "#DAA46B"}}>Having trouble with login?</a>
              </div>

              <div className={styles.notice}>
                By logging in, you agree to our<br/>
                <a href={"https://www.shibthemetaverse.io/en/terms-of-use"} target={"_blank"}
                   style={{textDecoration: "underline"}}>Terms of Use</a> and <a
                href={"https://www.shibthemetaverse.io/en/privacy-policy"} target={"_blank"}
                style={{textDecoration: "underline"}}>Privacy Policy</a>
              </div>
            </div>

            : currentPage == 3 ? // SIGN UP
              <div className={styles.loginContainer}>
                <div className={styles.loginTitle}>Welcome to Shib Portal</div>

                <div className={styles.inputContainer}>
                  <div className={styles.inputLabel}>What should we call you?</div>
                  <input type="text" placeholder="Enter your username" className={styles.emailInput}
                         value={username}
                         onChange={(e) => {
                           setUsername(e.target.value)
                         }}/>
                  <div
                    className={styles.usernameAvailability}
                    style={{color: usernameStatus.available ? "#27FF06" : "#EC3722"}}
                  >
                    {usernameStatus.message}
                  </div>
                </div>

                <div className={styles.signUpNotes}>
                  <li>Using only letters and numbers-no profanity, symbols, or spaces allowed.</li>
                  <li>You can change your username later in settings.</li>
                </div>

                <div className={styles.inputContainer}>
                  <button
                    className={styles.loginButton}
                    style={{
                      width: 185,
                      height: 45,
                      cursor: usernameStatus.available ? "pointer" : "not-allowed",
                      opacity: usernameStatus.available ? 1 : 0.8,
                    }}
                    onClick={() => loginToMV()}
                    disabled={!usernameStatus.available}
                  >
                    Sign Up
                  </button>
                  <button
                    className={styles.cancelButton}
                    style={{width: 185, height: 45}}
                    onClick={() => {
                      setEmail("")
                      setCurrentPage(1)
                    }}
                  >
                    Back
                  </button>
                </div>

                <div className={styles.notice}>
                  By logging in, you agree to our<br/>
                  <a href={"https://www.shibthemetaverse.io/en/terms-of-use"} target={"_blank"}
                     style={{textDecoration: "underline"}}>Terms of Use</a> and <a
                  href={"https://www.shibthemetaverse.io/en/privacy-policy"} target={"_blank"}
                  style={{textDecoration: "underline"}}>Privacy Policy</a>
                </div>
              </div>

              : currentPage == 4 ? // REDIRECT
                <div className={styles.loginContainer}>
                  <div className={styles.loginTitle}>{username.length > 0 ? "Welcome!" : "Welcome back!"}</div>
                  <Image src={"/shib-logo.svg"} alt={""} width={100} height={100}/>
                  <div style={{fontWeight: 700, fontSize: 20}}>{loggedInUser.UserName}</div>
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: 10}}>
                    <Image src={"/SmallLoading.png"} alt={""} width={21} height={21} className={styles.smallLoading}/>
                    <div>Redirecting...</div>
                  </div>
                  <div className={styles.retryRedirect} onClick={() => Redirect(loggedInUser)}>If you weren't
                    redirected, click here
                  </div>
                </div>
                : <></>
      }

      <LoadingModal show={loading.title.length > 0} title={loading.title} message={loading.message}/>
      <ErrorModal show={errorMessage.length > 0} title={"Error..."} message={errorMessage} okText={"Ok"}
                  onOk={() => setErrorMessage("")} showCancel={false}/>
    </div>
  )

  async function checkUsernameAvailability() {
    username.trim();
    if (username.length <= 0) {
      setUsernameStatus({message: "Please fill the username.", available: false});
      return;
    }
    setUsernameStatus({message: " ", available: false});

    const {data} = await Fetch({
      method: "get",
      api: `/api/USER/CheckUsername?username=${username}`,
    });

    if (data) {
      setUsernameStatus(data);
    } else {
      setUsernameStatus({message: "Failed to check username availability.", available: false});
    }
  }

  async function isNewUser() {
    if (!user) {
      setErrorMessage("Could not login")
      signOut();
      return;
    }

    let res;
    if (user.w3aInfo?.email) {
      res = await Fetch({api: `/api/USER/MAILEXISTENCE?Email=${user.w3aInfo.email}`});
    } else {
      res = await Fetch({api: `/api/USER/WALLETEXISTENCE?WalletAddress=${user.address}`});
    }

    setStopRefresh(false);

    if (!res.ok) {
      setErrorMessage("Could not login");
      signOut();
      return;
    }

    if (res.data?.Success) {
      setNewUser(false);
      loginToMV()
    } else {
      setNewUser(true);
      setLoading({title: "", message: ""})
      setCurrentPage(3)
    }
  }

  async function oldLoginToMV() {
    if (!user) {
      setErrorMessage("Could not login")
      signOut();
      return;
    }

    setLoading({title: "Logging in...", message: ""})

    if (newUser) {
      const {ok, data} = await Fetch({
        method: "post",
        api: "/api/USER/SIGNUP",
        body: {params: [{walletAddress: user.address, name: username, email: user.w3aInfo?.email || null}]}
      })
      if (ok) {
        data.Token = data.token
        delete data.token
        Redirect(data);
        return
      }
    } else {
      const {ok, data} = await Fetch({
        method: "post",
        api: "/api/USER/LOGIN",
        body: {params: [{walletAddress: user.address}]}
      })
      if (ok) {
        Redirect(data)
        return
      }
    }

    setErrorMessage("Could not login")
    signOut();
  }

  async function loginToMV() {
    // oldLoginToMV();
    if (!user) {
      setErrorMessage("Could not login")
      signOut();
      return;
    }

    setLoading({title: "Logging in...", message: ""})

    const {ok, data} = await Fetch({
      method: "post",
      api: "/api/USER/CASAUTHENTICATION",
      body: {
        walletAddress: user.address,
        addressProxy: loginData?.address,
        email: user.w3aInfo?.email,
        signature: loginData?.signature,
        requestId: loginData?.requestId,
        userName: username,
      }
    })

    if (ok && data.nextApiResponse) {
      let userData;
      try {
        userData = JSON.parse(data.nextApiResponse)
      } catch {
      }

      Redirect(userData)
      return
    }

    setErrorMessage("Could not login")
    signOut();
  }

  function Redirect(user: any) {
    setLoading({title: "", message: ""})
    setLoggedInUser(user);
    setCurrentPage(4);
    let newToken = user.Token || user.token;
    delete user.token;
    user.Token = newToken;

    localStorage.setItem("token", newToken);

    if (searchParams.get("redirect") == "ps") {
      router.replace(`/stream?token=${newToken}`)
      return;
    }

    let params = new URLSearchParams({user: JSON.stringify(user)})

    window.open("shibportal://auth?" + params, "_self");
    setTimeout(() => {
      window.close()
    }, 20000)
  }

  function OnUnload() {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (stopRefresh) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }
}

export default Login;