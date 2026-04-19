"use client";

import { useState } from "react";

export default function Ficha() {
  const [formData, setFormData] = useState<any>({});

  return (
    <div>
      <h1>Ficha</h1>
    </div>
  );
}

import { useSearchParams, useRouter } from "next/navigation";
const searchParams = useSearchParams();
const router = useRouter();
const id = searchParams.get("id");
