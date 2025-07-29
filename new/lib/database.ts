import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "antique_watches_store",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      charset: "utf8mb4",
    })
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = [], connection?: mysql.PoolConnection): Promise<any> {
  try {
    if (connection) {
      const [results] = await connection.execute(query, params)
      return results
    } else {
      const pool = createPool()
      const [results] = await pool.execute(query, params)
      return results
    }
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw error
  }
}

export async function beginTransaction(): Promise<mysql.PoolConnection> {
  try {
    const pool = createPool()
    const connection = await pool.getConnection()
    await connection.beginTransaction()
    return connection
  } catch (error) {
    console.error("Error beginning transaction:", error)
    throw error
  }
}

export async function commitTransaction(connection: mysql.PoolConnection): Promise<void> {
  try {
    await connection.commit()
    connection.release()
  } catch (error) {
    console.error("Error committing transaction:", error)
    await rollbackTransaction(connection)
    throw error
  }
}

export async function rollbackTransaction(connection: mysql.PoolConnection): Promise<void> {
  try {
    await connection.rollback()
    connection.release()
  } catch (error) {
    console.error("Error rolling back transaction:", error)
    connection.release()
    throw error
  }
}

// Singleton pattern for database manager
export class DatabaseManager {
  private static instance: DatabaseManager
  private pool: mysql.Pool

  private constructor() {
    this.pool = createPool()
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async query(sql: string, params: any[] = []): Promise<any> {
    return executeQuery(sql, params)
  }

  public async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await beginTransaction()
    try {
      const result = await callback(connection)
      await commitTransaction(connection)
      return result
    } catch (error) {
      await rollbackTransaction(connection)
      throw error
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
    }
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
  const images = await executeQuery(
    "SELECT image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order",
    [id],
  )
  return { ...results[0], images } || null
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
