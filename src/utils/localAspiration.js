export function readLocalAspiration(storage, userId) {
  if (!userId) return '';
  try {
    return storage.getItem(`veval_university_aspiration:${userId}`) || '';
  } catch {
    return '';
  }
}

export function saveLocalAspiration(storage, userId, value) {
  if (!userId) throw new Error('Vui lòng đăng nhập để lưu nguyện vọng.');
  storage.setItem(`veval_university_aspiration:${userId}`, value.trim());
}
