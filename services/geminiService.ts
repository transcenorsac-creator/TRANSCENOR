import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: process.env.API_KEY must be set in the build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (name: string, price: number, category: string): Promise<string> => {
  try {
    const prompt = `
      Actúa como un experto en marketing digital y copywriting.
      Escribe una descripción corta (máximo 150 caracteres), atractiva y persuasiva para un producto.
      
      Detalles del producto:
      - Nombre: ${name}
      - Precio: S/ ${price}
      - Categoría: ${category}
      
      La descripción debe incluir emojis y estar lista para compartir en WhatsApp.
      No uses comillas en la respuesta.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Descripción no disponible.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "¡Increíble producto a un excelente precio! Contáctanos para más detalles.";
  }
};