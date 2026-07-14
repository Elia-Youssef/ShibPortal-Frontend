"use client"

import styles from "./style.module.css"
import LoadingIcon from "@/components/LoadingIcon";

function LoadingModal({show, title, message}: { show: boolean, title: string, message: string }) {

  return (
    show ?
      <div className={styles.container}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <LoadingIcon/>
      </div>
      : null
  )
}

export default LoadingModal;
