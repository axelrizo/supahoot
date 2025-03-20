import { botttsNeutral } from '@dicebear/collection'
import { toJpeg } from '@dicebear/converter'
import { createAvatar } from '@dicebear/core'

export class DicebearAvatarService {
  async generateAvatarByString(string: string) {
    const avatar = createAvatar(botttsNeutral, { seed: string })
    const buffer = await toJpeg(avatar).toArrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    return new File([uint8Array], `${string}.jpeg`, { type: 'image/jpeg' })
  }
}
