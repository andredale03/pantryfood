
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/suggest-recipes.js
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: (process.env.OPENAI_API_KEY || "").trim()
});
var suggest_recipes_default = async (req) => {
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
    console.error("ERRORE DETTAGLIATO:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
export {
  suggest_recipes_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvc3VnZ2VzdC1yZWNpcGVzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgT3BlbkFJIGZyb20gJ29wZW5haSc7XHJcblxyXG5jb25zdCBvcGVuYWkgPSBuZXcgT3BlbkFJKHtcclxuICBhcGlLZXk6IChwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWSB8fCAnJykudHJpbSgpXHJcbn0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSkgPT4ge1xyXG4gIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikgcmV0dXJuIG5ldyBSZXNwb25zZShcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLCB7IHN0YXR1czogNDA1IH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBpbmdyZWRpZW50cyB9ID0gYXdhaXQgcmVxLmpzb24oKTtcclxuXHJcbiAgICBjb25zdCBwcm9tcHQgPSBgXHJcbiAgICAgIFNlaSB1bm8gY2hlZiBhbnRpLXNwcmVjbyBjcmVhdGl2by5cclxuICAgICAgSG8gcXVlc3RpIGluZ3JlZGllbnRpIGNoZSBzdGFubm8gcGVyIHNjYWRlcmU6ICR7aW5ncmVkaWVudHMuam9pbihcIiwgXCIpfS5cclxuICAgICAgXHJcbiAgICAgIFN1Z2dlcmlzY2ltaSB1bmEgcmljZXR0YSBzaW5nb2xhLCBzZW1wbGljZSBlIGd1c3Rvc2EgcGVyIHVzYXJsaSAobyB1c2FybmUgbGEgbWFnZ2lvciBwYXJ0ZSkuXHJcbiAgICAgIFB1b2kgYXNzdW1lcmUgY2hlIGlvIGFiYmlhIGluIGNhc2EgaW5ncmVkaWVudGkgYmFzZSAoc2FsZSwgb2xpbywgcGFzdGEsIHJpc28sIGZhcmluYSwgc3BlemllKS5cclxuICAgICAgXHJcbiAgICAgIFJlc3RpdHVpc2NpIEVTQ0xVU0lWQU1FTlRFIHVuIG9nZ2V0dG8gSlNPTiBjb24gcXVlc3RvIGZvcm1hdG86XHJcbiAgICAgIHtcclxuICAgICAgICBcInRpdGxlXCI6IFwiTm9tZSBkZWxsYSBSaWNldHRhXCIsXHJcbiAgICAgICAgXCJ0aW1lXCI6IFwiVGVtcG8gKGVzLiAyMCBtaW4pXCIsXHJcbiAgICAgICAgXCJkaWZmaWN1bHR5XCI6IFwiRmFjaWxlL01lZGlhXCIsXHJcbiAgICAgICAgXCJpbmdyZWRpZW50c1wiOiBbXCJsaXN0YVwiLCBcImluZ3JlZGllbnRpXCIsIFwibmVjZXNzYXJpXCJdLFxyXG4gICAgICAgIFwic3RlcHNcIjogW1wicGFzc28gMVwiLCBcInBhc3NvIDJcIiwgXCJwYXNzbyAzLi4uXCJdXHJcbiAgICAgIH1cclxuICAgIGA7XHJcblxyXG4gICAgY29uc3QgY29tcGxldGlvbiA9IGF3YWl0IG9wZW5haS5jaGF0LmNvbXBsZXRpb25zLmNyZWF0ZSh7XHJcbiAgICAgIG1lc3NhZ2VzOiBbeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcHJvbXB0IH1dLFxyXG4gICAgICBtb2RlbDogXCJncHQtNG8tbWluaVwiLFxyXG4gICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogXCJqc29uX29iamVjdFwiIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRpb24uY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQ7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHJlc3VsdCwgeyBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0gfSk7XHJcblxyXG59IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVSUk9SRSBERVRUQUdMSUFUTzpcIiwgZXJyb3IpOyAvLyA8LS0tIEFHR0lVTkdJIFFVRVNUQSBSSUdBXHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSksIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59OyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQSxPQUFPLFlBQVk7QUFFbkIsSUFBTSxTQUFTLElBQUksT0FBTztBQUFBLEVBQ3hCLFNBQVMsUUFBUSxJQUFJLGtCQUFrQixJQUFJLEtBQUs7QUFDbEQsQ0FBQztBQUVELElBQU8sMEJBQVEsT0FBTyxRQUFRO0FBQzVCLE1BQUksSUFBSSxXQUFXLE9BQVEsUUFBTyxJQUFJLFNBQVMsc0JBQXNCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFFcEYsTUFBSTtBQUNGLFVBQU0sRUFBRSxZQUFZLElBQUksTUFBTSxJQUFJLEtBQUs7QUFFdkMsVUFBTSxTQUFTO0FBQUE7QUFBQSxzREFFbUMsWUFBWSxLQUFLLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBZXhFLFVBQU0sYUFBYSxNQUFNLE9BQU8sS0FBSyxZQUFZLE9BQU87QUFBQSxNQUN0RCxVQUFVLENBQUMsRUFBRSxNQUFNLFFBQVEsU0FBUyxPQUFPLENBQUM7QUFBQSxNQUM1QyxPQUFPO0FBQUEsTUFDUCxpQkFBaUIsRUFBRSxNQUFNLGNBQWM7QUFBQSxJQUN6QyxDQUFDO0FBRUQsVUFBTSxTQUFTLFdBQVcsUUFBUSxDQUFDLEVBQUUsUUFBUTtBQUM3QyxXQUFPLElBQUksU0FBUyxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUIsRUFBRSxDQUFDO0FBQUEsRUFFbkYsU0FBUyxPQUFPO0FBQ1osWUFBUSxNQUFNLHVCQUF1QixLQUFLO0FBQzFDLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLE9BQU8sTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0U7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
