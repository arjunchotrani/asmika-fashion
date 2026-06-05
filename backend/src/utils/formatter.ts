// Phase 1: Simple Smart Formatter Utility
// This prepares the architecture for future AI integration while providing basic parsing now.

export interface FormatterInput {
  raw_text: string
}

export interface FormatterOutput {
  seo_description: string
  whatsapp_description: string
  luxury_description: string
}

export const formatTextileData = (input: string): FormatterOutput => {
  // Very basic parser for Phase 1. 
  // Expects lines like "Key: Value"
  const lines = input.split('\n').filter(line => line.trim() !== '')
  const data: Record<string, string> = {}
  
  lines.forEach(line => {
    const [key, ...rest] = line.split(':')
    if (key && rest.length > 0) {
      data[key.trim().toLowerCase()] = rest.join(':').trim()
    }
  })

  // Extract common fields if they exist
  const sku = data['sku'] || ''
  const fabric = data['fabric'] || ''
  const work = data['work'] || ''
  const moq = data['moq'] || ''

  const features = []
  if (fabric) features.push(`Premium ${fabric}`)
  if (work) features.push(`exquisite ${work} detailing`)

  const featureString = features.length > 0 ? ` featuring ${features.join(' and ')}` : ''

  const luxury_description = `Elevate your wardrobe with this stunning piece${featureString}. Designed for those who appreciate fine craftsmanship and timeless elegance.`
  
  const seo_description = `${luxury_description} ${sku ? `SKU: ${sku}.` : ''}`.substring(0, 160)
  
  let whatsapp_description = `✨ *New Arrival* ✨\n\n${luxury_description}\n\n`
  if (sku) whatsapp_description += `🏷️ *SKU:* ${sku}\n`
  if (fabric) whatsapp_description += `🧵 *Fabric:* ${fabric}\n`
  if (work) whatsapp_description += `✂️ *Work:* ${work}\n`
  if (moq) whatsapp_description += `📦 *MOQ:* ${moq}\n`
  
  return {
    seo_description,
    whatsapp_description,
    luxury_description
  }
}
