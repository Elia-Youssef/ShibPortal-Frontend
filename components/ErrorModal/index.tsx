"use client"

import styles from "./style.module.css"
import Image from "next/image";
import ShibButton from "@/components/ShibButton";

function ErrorModal({show, showCancel = false, title, message, onOk, onCancel, okText, cancelText}: {
  show: boolean,
  showCancel: boolean,
  title: string,
  message: string,
  okText: string,
  onOk: Function,
  cancelText?: string,
  onCancel?: Function
}) {

  return (
    show ?
      <div className={styles.container}>
        <div className={styles.title}>{title}</div>
        <Image src={"/icons/LoadingError.png"} alt={""} width={127} height={127}/>
        <div className={styles.message}>{message}</div>
        <div className={styles.buttonsContainer}>
          <ShibButton title={okText} onClick={() => onOk()} filled/>
          {showCancel && <ShibButton title={cancelText || ""} onClick={() => onCancel && onCancel()}/>}
        </div>
      </div>
      : null
  )
}

export default ErrorModal;
