import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database"
import type mysql from "mysql" // Declare the mysql variable

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  profile_image?: string
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const results = (await executeQuery(
    "SELECT id, email, first_name, last_name, phone, profile_image, created_at FROM users WHERE id = ? AND is_active = TRUE",
    [id],
  )) as User[]

  return results[0] || null
}

export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  const results = (await executeQuery(
    "SELECT id, email, password, first_name, last_name, phone, profile_image, created_at FROM users WHERE email = ? AND is_active = TRUE",
    [email],
  )) as (User & { password: string })[]

  return results[0] || null
}

export async function createUser(userData: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)

  const result = (await executeQuery(
    "INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)",
    [userData.email, hashedPassword, userData.first_name, userData.last_name, userData.phone || null],
  )) as mysql.ResultSetHeader

  const user = await getUserById(result.insertId)
  if (!user) throw new Error("Failed to create user")

  return user
}
