export interface AvatarService {
  generateAvatarByString(string: string): Promise<File>
}
