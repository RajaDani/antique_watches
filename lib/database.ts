import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "antique_watches_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = getPool()
  try {
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()

    const results = []
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params)
      results.push(result)
    }

    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Product queries
export async function getAllWatches() {
  const query = `
    SELECT 
      p.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as category_name,
      pi.image_url as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    WHERE p.is_active = TRUE
    ORDER BY p.created_at DESC
  `
  return await executeQuery(query)
}

export async function getWatchesByBrand(brandSlug: string) {
  const query = `
    SELECT 
      p.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as category_name,
      pi.image_url as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    WHERE p.is_active = TRUE AND b.slug = ?
    ORDER BY p.created_at DESC
  `
  return await executeQuery(query, [brandSlug])
}

export async function getWatchById(id: number) {
  const query = `
    SELECT 
      p.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_active = TRUE
  `
  const results = await executeQuery(query, [id])
  return results[0] || null
}

export async function getWatchImages(productId: number) {
  const query = `
    SELECT image_url, alt_text, is_primary, sort_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order ASC, is_primary DESC
  `
  return await executeQuery(query, [productId])
}

// Brand queries
export async function getAllBrands() {
  const query = `
    SELECT 
      b.*,
      COUNT(p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = TRUE
    WHERE b.is_active = TRUE
    GROUP BY b.id
    ORDER BY b.name ASC
  `
  return await executeQuery(query)
}

export async function getBrandBySlug(slug: string) {
  const query = `
    SELECT 
      b.*,
      COUNT(p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = TRUE
    WHERE b.slug = ? AND b.is_active = TRUE
    GROUP BY b.id
  `
  const results = await executeQuery(query, [slug])
  return results[0] || null
}

// Category queries
export async function getAllCategories() {
  const query = `
    SELECT 
      c.*,
      COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
    WHERE c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.name ASC
  `
  return await executeQuery(query)
}