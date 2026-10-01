/**
 * Folder: src/services/
 * This file: user.ts (Service for managing user entity / user profile).
 */

import { apiFetch } from './api'
import type { User } from '../types'

/**
 * Fetches the currently logged-in user profile.
 * Calls the '/users/me' endpoint or appropriate BE route.
 */
export async function fetchCurrentUser(): Promise<User> {
  try {
    return await apiFetch<User>('/users/me')
  } catch (error) {
    console.error('Failed to fetch current user profile:', error)
    throw error
  }
}

/**
 * Fetches the complete list of users.
 * GET /users
 */
export async function fetchAllUsers(): Promise<User[]> {
  try {
    return await apiFetch<User[]>('/users')
  } catch (error) {
    console.error('Failed to fetch users list:', error)
    throw error
  }
}

/**
 * Fetches a specific user's data by ID.
 * GET /users/:id
 */
export async function fetchUserById(id: string): Promise<User> {
  try {
    return await apiFetch<User>(`/users/${id}`)
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error)
    throw error
  }
}

/**
 * Creates a new user.
 * POST /users
 */
export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  try {
    return await apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  } catch (error) {
    console.error('Failed to create new user:', error)
    throw error
  }
}

/**
 * Updates an existing user's data by ID.
 * PUT /users/:id
 */
export async function updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User> {
  try {
    return await apiFetch<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  } catch (error) {
    console.error(`Failed to update user with ID ${id}:`, error)
    throw error
  }
}

/**
 * Deletes a user by ID.
 * DELETE /users/:id
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error(`Failed to delete user with ID ${id}:`, error)
    throw error
  }
}
