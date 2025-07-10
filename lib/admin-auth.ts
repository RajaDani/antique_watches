import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database"
import type mysql from "mysql"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "super_admin" | "admin" | "editor" | "viewer"
  permissions?: any
  is_active: boolean
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateAdminToken(adminId: number): string {
  return jwt.sign({ adminId, type: "admin" }, JWT_SECRET, { expiresIn: "8h" })
}

export function verifyAdminToken(token: string): { adminId: number; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number; role: string }
    return decoded.role === "admin" || decoded.role === "super_admin" ? decoded : null
  } catch {
    return null
  }
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  const results = (await executeQuery(
    "SELECT id, email, first_name, last_name, role, permissions, is_active, created_at FROM admin_users WHERE id = ? AND is_active = TRUE",
    [id],
  )) as AdminUser[]

  return results[0] || null
}

export async function getAdminByEmail(email: string): Promise<(AdminUser & { password: string }) | null> {
  const results = (await executeQuery(
    "SELECT id, email, password, first_name, last_name, role, permissions, is_active, created_at FROM admin_users WHERE email = ? AND is_active = TRUE",
    [email],
  )) as (AdminUser & { password: string })[]

  return results[0] || null
}

export async function createAdmin(adminData: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
  created_by: number
}): Promise<AdminUser> {
  const hashedPassword = await hashPassword(adminData.password)

  const result = (await executeQuery(
    "INSERT INTO admin_users (email, password, first_name, last_name, role, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    [adminData.email, hashedPassword, adminData.first_name, adminData.last_name, adminData.role, adminData.created_by],
  )) as mysql.ResultSetHeader

  const admin = await getAdminById(result.insertId)
  if (!admin) throw new Error("Failed to create admin")

  return admin
}

export async function logAdminActivity(
  adminId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  await executeQuery(
    "INSERT INTO admin_activity_logs (admin_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      adminId,
      action,
      resourceType,
      resourceId || null,
      JSON.stringify(details || {}),
      ipAddress || null,
      userAgent || null,
    ],
  )
}

export function hasPermission(admin: AdminUser, permission: string): boolean {
  if (admin.role === "super_admin") return true

  const rolePermissions = {
    admin: ["read", "write", "delete", "manage_orders", "manage_products"],
    editor: ["read", "write", "manage_products"],
    viewer: ["read"],
  }

  return rolePermissions[admin.role]?.includes(permission) || false
}
