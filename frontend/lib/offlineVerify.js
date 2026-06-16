// Public Key — safe to embed in frontend (used only for verification)
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3yNKDjLWbq4n6Q9HKWnD
7JCfRdsKxeWlyZNCa1QtV0JGheuEqPQUdnS92LjgeRTGkGtlzBRn7WP18GJi47Do
Hlscv4bAI7uvzSQ4WIb1JzOjBzfK2yWJcrzYPARuZOSCiQ8ijGPoqJzf3S4FrFLS
d6R4byaHgNFXUEJt+aRVRRhSXvbmeWN7Nsfb3ORMJxnMEfqYcKMwFuzL9YjWsTQW
rCGlEoIo5CaAVtWvkZdJOYb+QHWjM72O33hc6dXI1y7vYdRFNUV8pJwaDcYPDMAR
JvojfmMgG+cy+Yl3bgX/ZR7OofqqIoOu5IZBN+oigPFyzFOP0QMN6PriZzQwBpUS
vwIDAQAB
-----END PUBLIC KEY-----`

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function base64ToArrayBuffer(b64) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/**
 * Verifies a medicine's digital signature WITHOUT internet access.
 * Uses Web Crypto API (RSA-SHA256) — the same algorithm used to sign
 * the data at registration time on the backend with the private key.
 */
export async function verifyOfflineSignature(qrPayload) {
  try {
    const { sig, ...payload } = qrPayload

    if (!sig) return { valid: false, reason: 'No signature found in QR code' }

    const keyBuffer = pemToArrayBuffer(PUBLIC_KEY_PEM)
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      keyBuffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBuffer = base64ToArrayBuffer(sig)
    const dataBuffer = new TextEncoder().encode(JSON.stringify(payload))

    const isValid = await window.crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      sigBuffer,
      dataBuffer
    )

    // Check expiry locally too
    const isExpired = payload.expiry ? new Date(payload.expiry) < new Date() : false

    return {
      valid: isValid,
      expired: isExpired,
      payload,
      reason: isValid ? null : 'Signature mismatch — possible tampering detected!'
    }
  } catch (err) {
    return { valid: false, reason: 'Verification error: ' + err.message }
  }
}

export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}