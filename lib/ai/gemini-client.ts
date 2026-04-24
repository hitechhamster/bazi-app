import 'server-only'
import { GoogleGenAI } from '@google/genai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing environment variable: GEMINI_API_KEY')
}

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export default gemini
