function CampoSelectAuto({
  label,
  value,
  options,
  minWidth = 180,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  minWidth?: number;
  onChange: (value: string) => void;
}) {
  const valorActual = value || "";
  const existeEnLista = options.includes(valorActual);

  return (
    <div
      style={{
        minWidth,
        flex: "0 0 auto",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: "#0b5394",
          marginBottom: 3,
        }}
      >
        {label}
      </div>

      <select
        value={valorActual}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minHeight: 30,
          minWidth: "100%",
          background: "#d9ead3",
          border: "1px solid #666",
          padding: "4px 6px",
          fontSize: 12,
        }}
      >
        {!existeEnLista && valorActual && (
          <option value={valorActual}>{valorActual}</option>
        )}

        <option value="">-- Seleccionar --</option>

        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}
