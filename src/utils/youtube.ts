export function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  const id = match ? match[1] : url;
  return `https://www.youtube.com/embed/${id}`;
}
