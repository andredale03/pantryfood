export const config = { runtime: 'edge' };
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async (req) => {
  // Gestiamo solo le richieste POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Leggiamo il testo inviato dal frontend
    const { text } = await req.json();

    console.log("Analisi scontrino iniziata...");

    const prompt = `
      Sei un assistente che estrae dati da scontrini.
      Analizza il seguente testo OCR (che potrebbe contenere errori) ed estrai i prodotti acquistati.
      
      Regole:
      1. Ignora sconti, subtotali o voci non prodotto.
      2. Cerca di correggere errori di battitura evidenti (es. "Latte Parz Scr" -> "Latte Parzialmente Scremato").
      3. Estrai la data dello scontrino (formato YYYY-MM-DD). Se non c'è, usa la data di oggi.
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
      model: "gpt-4o-mini", // <--- MODELLO ECONOMICO
      response_format: { type: "json_object" },
      temperature: 0.1, // Bassa creatività per essere precisi
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