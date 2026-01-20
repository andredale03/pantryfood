
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/parse-receipt/parse-receipt.js
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var parse_receipt_default = async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const { text } = await req.json();
    console.log("Analisi scontrino iniziata...");
    const prompt = `
      Sei un assistente che estrae dati da scontrini.
      Analizza il seguente testo OCR (che potrebbe contenere errori) ed estrai i prodotti acquistati.
      
      Regole:
      1. Ignora sconti, subtotali o voci non prodotto.
      2. Cerca di correggere errori di battitura evidenti (es. "Latte Parz Scr" -> "Latte Parzialmente Scremato").
      3. Estrai la data dello scontrino (formato YYYY-MM-DD). Se non c'\xE8, usa la data di oggi.
      4. Estrai il nome del negozio.
      
      Restituisci ESCLUSIVAMENTE un oggetto JSON valido con questa struttura esatta:
      {
        "store": "Nome Negozio",
        "date": "YYYY-MM-DD",
        "items": [
          { "name": "Nome Prodotto", "qty": 1, "price": 0.00 }
        ]
      }

      Testo OCR:
      ${text}
    `;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      // <--- MODELLO ECONOMICO
      response_format: { type: "json_object" },
      temperature: 0.1
      // Bassa creatività per essere precisi
    });
    const result = completion.choices[0].message.content;
    console.log("Risultato OpenAI:", result);
    return new Response(result, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Errore OpenAI:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
export {
  parse_receipt_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvcGFyc2UtcmVjZWlwdC9wYXJzZS1yZWNlaXB0LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBuZXRsaWZ5L2Z1bmN0aW9ucy9wYXJzZS1yZWNlaXB0LmpzXHJcbmltcG9ydCBPcGVuQUkgZnJvbSAnb3BlbmFpJztcclxuXHJcbmNvbnN0IG9wZW5haSA9IG5ldyBPcGVuQUkoe1xyXG4gIGFwaUtleTogcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVlcclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxKSA9PiB7XHJcbiAgLy8gR2VzdGlhbW8gc29sbyBsZSByaWNoaWVzdGUgUE9TVFxyXG4gIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLCB7IHN0YXR1czogNDA1IH0pO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIExlZ2dpYW1vIGlsIHRlc3RvIGludmlhdG8gZGFsIGZyb250ZW5kXHJcbiAgICBjb25zdCB7IHRleHQgfSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJBbmFsaXNpIHNjb250cmlubyBpbml6aWF0YS4uLlwiKTtcclxuXHJcbiAgICBjb25zdCBwcm9tcHQgPSBgXHJcbiAgICAgIFNlaSB1biBhc3Npc3RlbnRlIGNoZSBlc3RyYWUgZGF0aSBkYSBzY29udHJpbmkuXHJcbiAgICAgIEFuYWxpenphIGlsIHNlZ3VlbnRlIHRlc3RvIE9DUiAoY2hlIHBvdHJlYmJlIGNvbnRlbmVyZSBlcnJvcmkpIGVkIGVzdHJhaSBpIHByb2RvdHRpIGFjcXVpc3RhdGkuXHJcbiAgICAgIFxyXG4gICAgICBSZWdvbGU6XHJcbiAgICAgIDEuIElnbm9yYSBzY29udGksIHN1YnRvdGFsaSBvIHZvY2kgbm9uIHByb2RvdHRvLlxyXG4gICAgICAyLiBDZXJjYSBkaSBjb3JyZWdnZXJlIGVycm9yaSBkaSBiYXR0aXR1cmEgZXZpZGVudGkgKGVzLiBcIkxhdHRlIFBhcnogU2NyXCIgLT4gXCJMYXR0ZSBQYXJ6aWFsbWVudGUgU2NyZW1hdG9cIikuXHJcbiAgICAgIDMuIEVzdHJhaSBsYSBkYXRhIGRlbGxvIHNjb250cmlubyAoZm9ybWF0byBZWVlZLU1NLUREKS4gU2Ugbm9uIGMnXHUwMEU4LCB1c2EgbGEgZGF0YSBkaSBvZ2dpLlxyXG4gICAgICA0LiBFc3RyYWkgaWwgbm9tZSBkZWwgbmVnb3ppby5cclxuICAgICAgXHJcbiAgICAgIFJlc3RpdHVpc2NpIEVTQ0xVU0lWQU1FTlRFIHVuIG9nZ2V0dG8gSlNPTiB2YWxpZG8gY29uIHF1ZXN0YSBzdHJ1dHR1cmEgZXNhdHRhOlxyXG4gICAgICB7XHJcbiAgICAgICAgXCJzdG9yZVwiOiBcIk5vbWUgTmVnb3ppb1wiLFxyXG4gICAgICAgIFwiZGF0ZVwiOiBcIllZWVktTU0tRERcIixcclxuICAgICAgICBcIml0ZW1zXCI6IFtcclxuICAgICAgICAgIHsgXCJuYW1lXCI6IFwiTm9tZSBQcm9kb3R0b1wiLCBcInF0eVwiOiAxLCBcInByaWNlXCI6IDAuMDAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG5cclxuICAgICAgVGVzdG8gT0NSOlxyXG4gICAgICAke3RleHR9XHJcbiAgICBgO1xyXG5cclxuICAgIGNvbnN0IGNvbXBsZXRpb24gPSBhd2FpdCBvcGVuYWkuY2hhdC5jb21wbGV0aW9ucy5jcmVhdGUoe1xyXG4gICAgICBtZXNzYWdlczogW3sgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IHByb21wdCB9XSxcclxuICAgICAgbW9kZWw6IFwiZ3B0LTRvLW1pbmlcIiwgLy8gPC0tLSBNT0RFTExPIEVDT05PTUlDT1xyXG4gICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogXCJqc29uX29iamVjdFwiIH0sXHJcbiAgICAgIHRlbXBlcmF0dXJlOiAwLjEsIC8vIEJhc3NhIGNyZWF0aXZpdFx1MDBFMCBwZXIgZXNzZXJlIHByZWNpc2lcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRpb24uY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIlJpc3VsdGF0byBPcGVuQUk6XCIsIHJlc3VsdCk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShyZXN1bHQsIHtcclxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9XHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcmUgT3BlbkFJOlwiLCBlcnJvcik7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSksIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59OyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFDQSxPQUFPLFlBQVk7QUFFbkIsSUFBTSxTQUFTLElBQUksT0FBTztBQUFBLEVBQ3hCLFFBQVEsUUFBUSxJQUFJO0FBQ3RCLENBQUM7QUFFRCxJQUFPLHdCQUFRLE9BQU8sUUFBUTtBQUU1QixNQUFJLElBQUksV0FBVyxRQUFRO0FBQ3pCLFdBQU8sSUFBSSxTQUFTLHNCQUFzQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDM0Q7QUFFQSxNQUFJO0FBRUYsVUFBTSxFQUFFLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSztBQUVoQyxZQUFRLElBQUksK0JBQStCO0FBRTNDLFVBQU0sU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFvQlgsSUFBSTtBQUFBO0FBR1IsVUFBTSxhQUFhLE1BQU0sT0FBTyxLQUFLLFlBQVksT0FBTztBQUFBLE1BQ3RELFVBQVUsQ0FBQyxFQUFFLE1BQU0sUUFBUSxTQUFTLE9BQU8sQ0FBQztBQUFBLE1BQzVDLE9BQU87QUFBQTtBQUFBLE1BQ1AsaUJBQWlCLEVBQUUsTUFBTSxjQUFjO0FBQUEsTUFDdkMsYUFBYTtBQUFBO0FBQUEsSUFDZixDQUFDO0FBRUQsVUFBTSxTQUFTLFdBQVcsUUFBUSxDQUFDLEVBQUUsUUFBUTtBQUM3QyxZQUFRLElBQUkscUJBQXFCLE1BQU07QUFFdkMsV0FBTyxJQUFJLFNBQVMsUUFBUTtBQUFBLE1BQzFCLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDaEQsQ0FBQztBQUFBLEVBRUgsU0FBUyxPQUFPO0FBQ2QsWUFBUSxNQUFNLGtCQUFrQixLQUFLO0FBQ3JDLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLE9BQU8sTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0U7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
