import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadMemberPhotoParams {
  uri: string;
  base64?: string | null;
  familyId?: string;
  headName?: string;
  memberName: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'boakrxdu';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'family_members';

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
      return {
        uri: asset.uri,
        base64: asset.base64 || undefined,
      };
    } catch (err: any) {
      return { error: err?.message || 'Failed to select image' };
    }
  },

  /**
   * Upload photo to Cloudinary
   * Returns secure HTTPS CDN URL on success
   */
  async uploadMemberPhoto(params: UploadMemberPhotoParams): Promise<{ url: string; error?: string }> {
    const { uri, base64, headName = 'head', memberName } = params;

    if (!uri) {
      return { url: uri };
    }

    // If it's already a remote hosted URL (Cloudinary / Supabase), no need to re-upload
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return { url: uri };
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.warn('Cloudinary configuration missing. Returning local URI.');
      return { url: uri };
    }

    try {
      const cleanHead = headName.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const cleanMember = memberName.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const fileName = `${cleanHead}_${cleanMember}_${Date.now()}`;

      const formData = new FormData();
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('filename_override', fileName);

      if (base64) {
        const dataUri = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
        formData.append('file', dataUri);
      } else if (uri.startsWith('data:')) {
        formData.append('file', uri);
      } else if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob);
      } else {
        // Native React Native / Expo local URI
        formData.append('file', {
          uri,
          type: 'image/jpeg',
          name: `${fileName}.jpg`,
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

      return { url: data.secure_url };
    } catch (err: any) {
      console.error('Upload catch error:', err);
      return { url: uri, error: err?.message || 'Failed to upload photo' };
    }
  },
};

