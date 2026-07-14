"use client"

import styles from "./style.module.css"
import LoadingIcon from "@/components/LoadingIcon";
import Image from "next/image";

function ShibButton({title, filled = false, disabled = false, onClick}: {
  title: string,
  filled?: boolean,
  disabled?: boolean,
  onClick: Function
}) {

  return (
    <div className={styles.container} onClick={() => !disabled && onClick()}
         style={{cursor: disabled ? "not-allowed" : "pointer"}}>
      <div className={`${styles.background} ${!filled && styles.backgroundNotFilled}`}/>
      <div className={`${styles.title} ${!filled && styles.titleNotFilled}`}>{title}</div>
    </div>
  )
}

export default ShibButton;
