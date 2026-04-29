export default function CabeceraFicha({ formData }: { formData: any }) {
  return (
    <div>
      Atlas: {formData?.atlas || ""}
    </div>
  );
}
