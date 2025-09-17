import { EncryptedContextData } from '../types/context.types';

/**
 * Encryption utilities for securing AI context data
 */

// Use Web Crypto API for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16; // 128 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Generate a cryptographic key from a password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random bytes
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, password: string): Promise<EncryptedContextData> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate random salt and IV
    const salt = generateRandomBytes(SALT_LENGTH);
    const iv = generateRandomBytes(IV_LENGTH);
    
    // Derive encryption key
    const key = await deriveKey(password, salt);
    
    // Encrypt data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: new Uint8Array(iv)
      },
      key,
      dataBuffer
    );
    
    return {
      encryptedContent: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
      salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
      algorithm: ALGORITHM
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: EncryptedContextData, password: string): Promise<string> {
  try {
    // Convert base64 strings back to ArrayBuffers
    const encryptedBuffer = base64ToArrayBuffer(encryptedData.encryptedContent);
    const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
    const salt = new Uint8Array(base64ToArrayBuffer(encryptedData.salt));
    
    // Derive decryption key
    const key = await deriveKey(password, salt);
    
    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid password or corrupted data'}`);
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = generateRandomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Hash data using SHA-256
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Verify data integrity using hash
 */
export async function verifyDataIntegrity(data: string, expectedHash: string): Promise<boolean> {
  try {
    const actualHash = await hashData(data);
    return actualHash === expectedHash;
  } catch (error) {
    console.error('Hash verification failed:', error);
    return false;
  }
}

/**
 * Secure key derivation for deterministic encryption keys
 */
export async function deriveEncryptionKey(contextId: string, userSecret: string): Promise<string> {
  const combined = `${contextId}:${userSecret}`;
  const hash = await hashData(combined);
  return hash.substring(0, 32); // Use first 32 characters as key
}

/**
 * Check if Web Crypto API is available
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}

/**
 * Encrypt file data
 */
export async function encryptFile(file: File, password: string): Promise<EncryptedContextData> {
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = arrayBufferToBase64(arrayBuffer);
  return encryptData(base64Data, password);
}

/**
 * Decrypt file data
 */
export async function decryptFile(encryptedData: EncryptedContextData, password: string): Promise<Blob> {
  const decryptedBase64 = await decryptData(encryptedData, password);
  const arrayBuffer = base64ToArrayBuffer(decryptedBase64);
  return new Blob([arrayBuffer]);
}
