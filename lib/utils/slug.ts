/**
 * Utility functions for generating unique organization slugs
 * Prevents the duplicate key constraint error
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Generate a URL-friendly slug from company name
 */
export function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .substring(0, 50)              // Limit length
}

/**
 * Generate a unique slug by checking database and adding suffix if needed
 */
export async function generateUniqueSlug(companyName: string): Promise<string> {
  const supabase = createClient()
  const baseSlug = createSlugFromName(companyName)
  
  // Check if base slug exists
  const { data: existing } = await supabase
    .from('organizations')
    .select('slug')
    .eq('slug', baseSlug)
    .single()
  
  // If doesn't exist, use base slug
  if (!existing) {
    return baseSlug
  }
  
  // If exists, add random 4-digit suffix
  let uniqueSlug = ''
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const suffix = Math.floor(1000 + Math.random() * 9000) // 4-digit random number
    uniqueSlug = `${baseSlug}-${suffix}`
    
    const { data: check } = await supabase
      .from('organizations')
      .select('slug')
      .eq('slug', uniqueSlug)
      .single()
    
    if (!check) {
      return uniqueSlug
    }
    
    attempts++
  }
  
  // Fallback: use timestamp
  return `${baseSlug}-${Date.now().toString().slice(-6)}`
}

/**
 * Generate subdomain from slug
 */
export function generateSubdomain(slug: string): string {
  return `${slug}.iamcfo.com`
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Must be lowercase alphanumeric with hyphens, 3-50 chars
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/
  return slugRegex.test(slug)
}
