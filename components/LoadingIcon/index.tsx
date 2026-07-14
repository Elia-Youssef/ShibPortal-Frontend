import styles from "./style.module.css"
import Image from "next/image";

function LoadingIcon() {
  return (
    <div className={styles.container}>
      <Image src={"/icons/LoadingIcon.png"} alt={""} width={65} height={72} className={styles.loadingIcon} />
      <Image src={"/icons/LoadingRing.png"} alt={""} width={155} height={155} className={styles.loadingRing} />
    </div>
  )
}

export default LoadingIcon;