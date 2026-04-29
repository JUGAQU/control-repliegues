import React from "react";

type Props = {
  formData: any;
};

export default function CabeceraFicha({ formData }: Props) {
  return (
    <div>
      Atlas: {formData?.atlas || ""}
    </div>
  );
}
