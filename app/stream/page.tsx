"use client"

import styles from "./style.module.css"
import {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import LoadingModal from "@/components/LoadingModal";
import ErrorModal from "@/components/ErrorModal";
import ShibButton from "@/components/ShibButton";
import Fetch from "@/utils/Fetch";
import {parseSeconds} from "@/utils/time";

function Stream() {
  const params = useSearchParams();
  const token = params.get("token")

  const [isBrowser, setIsBrowser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setIsBrowser(!window.electron);
    initializePlayer();
    LogRedirection();
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.backgroundBlur}>
        <div className={styles.title}>Welcome To Shib The Metaverse</div>

        <div className={styles.container}>
          <ShibButton title={"Start Session"} onClick={() => createSession()} disabled={timeLeft <= 0} filled/>
          {!isBrowser && <ShibButton title={"Quit"} onClick={() => terminateSession()}/>}
          <div>Time left: {parseSeconds(timeLeft)}</div>
        </div>
      </div>

      <LoadingModal show={loadingMessage.length > 0} title={"Loading..."} message={loadingMessage}/>
      <ErrorModal
        show={errorMessage.length > 0}
        title={"Oops."}
        message={errorMessage}
        showCancel
        okText={"Try Again"}
        onOk={() => {
          setErrorMessage("")
          initializePlayer()
        }}
        cancelText={"Quit"}
        onCancel={() => terminateSession()}
      />
    </div>
  );

  async function initializePlayer() {
    localStorage.setItem("token", token || "");
    setLoadingMessage("Checking credentials...")

    try {
      let {ok, data} = await Fetch({api: `/api/MV/OPENPS`})

      if (!ok || !data?.Success) {
        setErrorMessage("Invalid credentials")
        setLoadingMessage("")
        return
      }

      setTimeLeft(data.TimeLeft < 0 ? 0 : data.TimeLeft);
    } catch {
      setErrorMessage("Invalid credentials")
      setLoadingMessage("")
    }

    setLoadingMessage("")
  }

  async function createSession() {
    setLoadingMessage("Creating session...")

    let {ok, data} = await Fetch({api: `/api/MV/STARTPS`});

    if (!ok || !data.Success) {
      setLoadingMessage("")
      return
    }
    let streamUrl = data.URL;

    let checkHealth = setInterval(async () => {
      let response = await fetch(streamUrl);
      if (response.ok) {
        clearInterval(checkHealth);
        setLoadingMessage("")
        window.location.href = streamUrl + "?token=" + token;
      }
    }, 5000)

    setLoadingMessage("Creating a session...")
  }

  async function terminateSession() {
    setLoadingMessage("Ending session...")

    try {
      await Fetch({api: `/api/MV/STOPPS`});
    } catch {
    }

    setLoadingMessage("")

    if (isBrowser) {
      window.location.href = "https://shibthemetaverse.io"
    } else {
      window.electron.ipcRenderer.send("PixelStreaming:CloseWindow")
    }
  }
  
  function LogRedirection() {
    try {
      let userAgentStr = "no_userAgent";
      try {
        userAgentStr = JSON.stringify(navigator.userAgent);
      } catch {}

      Fetch({
        api: "/api/MV/INSERTLOG",
        method: "post",
        body: {
          "eventCode": !window.electron ? "ps_redirect_browser" : "ps_redirect_portal",
          "eventDescription": userAgentStr
        }
      })
    } catch {}
  }
}

export default Stream;