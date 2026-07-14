"use client"

import ErrorModal from "@/components/ErrorModal";
import {useRouter} from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <ErrorModal show={true} showCancel={false} title={"404"} message={"This page does not exist"}
                okText={"Go Back"}
                onOk={() => router.back()}/>
  );
}
