export const config = { runtime: 'edge' };
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || '').trim()
});

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { ingredients } = await req.json();

    const prompt = `
      Sei uno chef anti-spreco creativo.
      Ho questi ingredienti che stanno per scadere: ${ingredients.join(", ")}.
      
      Suggeriscimi una ricetta singola, semplice e gustosa per usarli (o usarne la maggior parte).
      Puoi assumere che io abbia in casa ingredienti base (sale, olio, pasta, riso, farina, spezie).
      
      Restituisci ESCLUSIVAMENTE un oggetto JSON con questo formato:
      {
        "title": "Nome della Ricetta",
        "time": "Tempo (es. 20 min)",
        "difficulty": "Facile/Media",
        "ingredients": ["lista", "ingredienti", "necessari"],
        "steps": ["passo 1", "passo 2", "passo 3..."]
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }
    });

    const result = completion.choices[0].message.content;
    return new Response(result, { headers: { "Content-Type": "application/json" } });

} catch (error) {
    console.error("ERRORE DETTAGLIATO:", error); // <--- AGGIUNGI QUESTA RIGA
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};