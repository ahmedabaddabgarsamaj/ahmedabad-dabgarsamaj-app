import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface UploadMemberPhotoParams {
  uri: string;
  base64?: string | null;
  familyId?: string;
  memberId?: string;
  currentPhotoUrl?: string | null;
  headName?: string;
  memberName: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'boakrxdu';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'family_members';
const CLOUDINARY_API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '168595993415575';
const CLOUDINARY_API_SECRET = process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || 'W-g3owT-Kd2sqgiXNewiYqwCTNE';

/**
 * Pure JavaScript SHA-1 implementation (zero external dependencies, fully compatible with React Native & Web)
 */
function sha1(str: string): string {
  function rotateLeft(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  function cvtHex(val: number) {
    let s = '';
    for (let i = 7; i >= 0; i--) {
      const v = (val >>> (i * 4)) & 0x0f;
      s += v.toString(16);
    }
    return s;
  }
  const utf8 = unescape(encodeURIComponent(str));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8);
  }
  words[utf8.length >> 2] |= 0x80 << ((3 - (utf8.length % 4)) * 8);
  words[(((utf8.length + 8) >> 6) + 1) * 16 - 1] = utf8.length * 8;
  let H0 = 0x67452301, H1 = 0xefcdab89, H2 = 0x98badcfe, H3 = 0x10325476, H4 = 0xc3d2e1f0;
  const W = new Array(80);
  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[i + t] || 0;
    for (let t = 16; t < 80; t++) W[t] = rotateLeft(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    let a = H0, b = H1, c = H2, d = H3, e = H4;
    for (let t = 0; t < 80; t++) {
      let f: number, k: number;
      if (t < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
      else if (t < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (t < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const temp = (rotateLeft(a, 5) + f + e + k + W[t]) & 0xffffffff;
      e = d; d = c; c = rotateLeft(b, 30); b = a; a = temp;
    }
    H0 = (H0 + a) & 0xffffffff;
    H1 = (H1 + b) & 0xffffffff;
    H2 = (H2 + c) & 0xffffffff;
    H3 = (H3 + d) & 0xffffffff;
    H4 = (H4 + e) & 0xffffffff;
  }
  return [H0, H1, H2, H3, H4].map(cvtHex).join('');
}

/**
 * Extracts the base public_id from an existing Cloudinary CDN URL
 * e.g. https://res.cloudinary.com/boakrxdu/image/upload/v1788891425/family_members/member_123.jpg?t=123 -> member_123
 */
export function getCloudinaryPublicId(url?: string | null): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1];
    // Strip version like v12345678/
    path = path.replace(/^v[0-9]+\//, '');
    // Strip query params like ?t=123
    path = path.split('?')[0];
    // Strip file extension (.jpg, .png, etc.)
    path = path.replace(/\.[a-zA-Z0-9]+$/, '');
    // Get the base public_id without folder prefix
    const segments = path.split('/');
    const last = segments[segments.length - 1];
    return last ? last.trim() : null;
  } catch (e) {
    return null;
  }
}

export const imageService = {
  /**
   * Request media library permissions (on Native) and pick a 1:1 square profile picture
   */
  async pickProfilePhoto(): Promise<{ uri?: string; base64?: string; error?: string }> {
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          return { error: 'Permission to access gallery is required to upload photos.' };
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return {};
      }

      const asset = result.assets[0];
      let base64 = asset.base64 || undefined;

      // On Android native, cropped images sometimes don't include base64 in the asset.
      // Read it directly from the local file using FileSystem as a fallback.
      if (!base64 && Platform.OS !== 'web' && asset.uri) {
        try {
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsErr) {
          console.warn('Could not read base64 from asset.uri:', fsErr);
        }
      }

      return {
        uri: asset.uri,
        base64,
      };
    } catch (err: any) {
      return { error: err?.message || 'Failed to select image' };
    }
  },

  /**
   * Delete an existing photo from Cloudinary using signed Destroy API
   */
  async deleteMemberPhoto(photoUrl?: string | null): Promise<boolean> {
    const publicId = getCloudinaryPublicId(photoUrl);
    if (!publicId || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = sha1(stringToSign);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.result === 'ok';
    } catch (e) {
      console.warn('Failed to delete old photo from Cloudinary:', e);
      return false;
    }
  },

  /**
   * Upload photo to Cloudinary
   * Overwrites existing image in-place in 'family_members' folder (no duplicate assets created)
   * Returns secure HTTPS CDN URL on success
   */
  async uploadMemberPhoto(params: UploadMemberPhotoParams): Promise<{ url: string; error?: string }> {
    const { uri, base64, memberId, currentPhotoUrl, familyId = 'general', memberName } = params;

    if (!uri) {
      return { url: uri };
    }

    // If it's already a remote hosted URL (Cloudinary / Supabase), no need to re-upload
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return { url: uri };
    }

    if (!CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary configuration missing. Returning local URI.');
      return { url: uri };
    }

    try {
      // 1. Determine deterministic public_id (member_<id>)
      let publicId: string;
      if (memberId) {
        const cleanMemberId = memberId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        publicId = `member_${cleanMemberId}`;
      } else {
        const cleanMember = (memberName || '').trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();
        const safeMember = cleanMember && cleanMember !== '_' ? cleanMember : 'avatar';
        const safeFamily = (familyId || 'general').replace(/[^a-zA-Z0-9]/g, '_');
        publicId = `member_${safeFamily}_${safeMember}_${Date.now()}`;
      }

      // If member previously had a photo with a DIFFERENT public_id, delete the old photo from Cloudinary
      const oldPublicId = getCloudinaryPublicId(currentPhotoUrl);
      if (oldPublicId && oldPublicId !== publicId) {
        await imageService.deleteMemberPhoto(currentPhotoUrl);
      }

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const assetFolder = 'family_members';

      const formData = new FormData();

      if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        // Signed upload with overwrite=true and invalidate=true!
        // Cloudinary OVERWRITES in place, preventing duplicate assets!
        const paramsToSign: Record<string, string> = {
          asset_folder: assetFolder,
          invalidate: 'true',
          overwrite: 'true',
          public_id: publicId,
          timestamp,
        };
        const stringToSign = Object.keys(paramsToSign).sort().map(k => `${k}=${paramsToSign[k]}`).join('&') + CLOUDINARY_API_SECRET;
        const signature = sha1(stringToSign);

        for (const [k, v] of Object.entries(paramsToSign)) {
          formData.append(k, v);
        }
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('signature', signature);
      } else {
        // Fallback to unsigned preset
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('asset_folder', assetFolder);
        formData.append('public_id', publicId);
      }

      let finalBase64 = base64;

      // If base64 wasn't provided, read it directly from FileSystem on native (file:// or content://)
      if (!finalBase64 && Platform.OS !== 'web' && uri && (uri.startsWith('file:') || uri.startsWith('content:'))) {
        try {
          finalBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (fsErr) {
          console.warn('FileSystem reading base64 error:', fsErr);
        }
      }

      if (finalBase64) {
        const dataUri = finalBase64.startsWith('data:') ? finalBase64 : `data:image/jpeg;base64,${finalBase64}`;
        formData.append('file', dataUri);
      } else if (uri.startsWith('data:')) {
        formData.append('file', uri);
      } else if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob);
      } else {
        // Native React Native fallback
        formData.append('file', {
          uri,
          type: 'image/jpeg',
          name: `${publicId}.jpg`,
        } as any);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Failed to upload photo to Cloudinary';
        console.error('Cloudinary photo upload error:', errorMsg);
        return { url: uri, error: errorMsg };
      }

      // Add cache-busting timestamp query so React Native Image immediately refreshes newly saved photo
      const freshUrl = data.secure_url.includes('?')
        ? `${data.secure_url}&t=${Date.now()}`
        : `${data.secure_url}?t=${Date.now()}`;

      return { url: freshUrl };
    } catch (err: any) {
      console.error('Upload catch error:', err);
      return { url: uri, error: err?.message || 'Failed to upload photo' };
    }
  },
};
