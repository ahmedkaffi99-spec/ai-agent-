import Groq from 'groq-sdk';

// Fallback pour ne pas faire planter le build quand la variable n'est pas encore
// configuree ; en production GROQ_API_KEY doit etre definie dans Vercel.
export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder-key' });

export const GROQ_MODEL = 'llama-3.1-8b-instant';
