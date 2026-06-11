import api from '@/lib/api'
import type { UserProfile } from '@/types/user'

interface CurrentUserResponse {
  status?: string
  status_code?: number
  message?: string
  data?:
    | {
        user?: UserProfile
      }
    | UserProfile
}

export interface UpdateProfilePayload {
  avatar_url?: string
  name?: string
}

interface UpdateProfileResponse {
  status?: string
  status_code?: number
  message?: string
  data?: UserProfile
}

interface UploadProfilePictureResponse {
  status?: string
  status_code?: number
  message?: string
  data?: {
    profile_picture_url?: string
  }
}

export const userService = {
  getCurrentUser: () => api.get<CurrentUserResponse>('/users/me'),
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<UpdateProfileResponse>('/users/me', payload),
  uploadProfilePicture: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<UploadProfilePictureResponse>('/users/me/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
