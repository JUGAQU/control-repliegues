"use client";

import { useSearchParams } from "next/navigation";
import CabeceraFicha from "../components/CabeceraFicha";
export default function Actuaciones() {

const searchParams = useSearchParams();
const grupo = searchParams.get("grupo") || "";

return (

<CabeceraFicha
  formData={formData}
  handleChange={handleChange}
  provincias={provincias}
  empresasPI={empresasPI}
  setMostrarMemoria={setMostrarMemoria}
/>
  
<div
style={{
background:"#dfe3e6",
minHeight:"100vh",
fontFamily:"Arial"
}}
>

{/* FILA SUPERIOR 1 */}
<div
style={{
background:"#c9e3f2",
border:"1px solid #b7c6d0",
padding:"10px",
marginBottom:6
}}
>
<div style={{display:"flex",gap:8,overflowX:"auto"}}>

<input value="AMPU." readOnly style={{width:55}} />
<input value="LOTE 17" readOnly style={{width:70}} />
<input value="AMPUERO" readOnly style={{width:150}} />
<input value="39-Cantabria" readOnly style={{width:120}} />
<input value="3963001" readOnly style={{width:80}} />

</div>
</div>


{/* FILA SUPERIOR 2 */}
<div
style={{
background:"#c9e3f2",
border:"1px solid #b7c6d0",
padding:"10px",
marginBottom:20
}}
>
<div style={{display:"flex",gap:8,overflowX:"auto"}}>

<input value="Alberto Alcaide" readOnly style={{width:130}} />

<select style={{width:160}}>
<option>-- Seleccionar --</option>
</select>

<input style={{width:120}} />
<input style={{width:120}} />

</div>
</div>


{/* BARRA ACTUACIONES */}
<div
style={{
background:"#c9e3f2",
border:"1px solid #b7c6d0",
padding:"12px"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:14
}}
>

<button
style={{
background:"#0070c0",
color:"#fff",
border:"none",
padding:"10px 18px",
borderRadius:4,
fontWeight:"bold",
fontSize:24,
cursor:"pointer"
}}
>
Actuaciones
</button>

<div
style={{
fontSize:32,
fontWeight:"bold",
color:"#0b5394"
}}
>
{grupo}
</div>

</div>

</div>

</div>
);

}
