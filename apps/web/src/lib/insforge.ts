import { createClient } from '@insforge/sdk'
export const insforge = createClient({
  url: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
})
