/**
 * Generate a URL-friendly slug from a company name
 * Handles duplicates by adding a random suffix
 */
export function generateSlug(companyName: string): string {
  // Convert to lowercase and replace spaces/special chars with hyphens
  let slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // Add random 4-character suffix to prevent duplicates
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  slug = `${slug}-${randomSuffix}`

  return slug
}

/**
 * Check if a slug already exists in the database
 * Returns true if slug exists, false otherwise
 */
export async function slugExists(slug: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  return !!data && !error
}

/**
 * Generate a unique slug by checking against existing slugs
 * Will retry up to 5 times if duplicates are found
 */
export async function generateUniqueSlug(
  companyName: string,
  supabase: any
): Promise<string> {
  let attempts = 0
  const maxAttempts = 5

  while (attempts < maxAttempts) {
    const slug = generateSlug(companyName)
    const exists = await slugExists(slug, supabase)

    if (!exists) {
      return slug
    }

    attempts++
  }

  // If we exhausted attempts, throw error
  throw new Error(
    `Failed to generate unique slug for "${companyName}" after ${maxAttempts} attempts`
  )
}
