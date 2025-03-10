"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/sync-user");
  }, [router]);
}

// import React from 'react'

// const page = () => {
//   return (
//     <div>
//       ...
//     </div>
//   )
// }

//export default page
