// supabase/functions/albert-tutor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, image } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) throw new Error("Clé API manquante.");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // --- CORRECTION 2026 : ON PASSE AU MODÈLE 2.5 ---
    // Si jamais le 2.5 flash a un suffixe (ex: -001), l'erreur nous le dira.
    // Mais on tente le nom standard "gemini-2.5-flash".
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Tu es Albert, un tuteur mathématique expert pour des étudiants suisses.
    Ton but : Ne donne JAMAIS la réponse brute. Guide l'élève pas à pas.
    Si image : Analyse l'équation manuscrite.
    Format : Markdown (formules LaTeX entre $ $).
    Ton : Encouragent et bref.
    
    Question : ${message}`;

    let result;
    
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        },
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const responseText = response.text();

    return new Response(JSON.stringify({ reply: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("ERREUR:", error);
    // On renvoie l'erreur brute pour voir le message de Google si le nom du modèle est encore faux
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});