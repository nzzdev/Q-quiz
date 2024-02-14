import type { QuizImage } from '@src/interfaces';

export function getImageUrls(
  image: QuizImage,
  width: number,
  imageServiceUrl: string
) {
  return {
    image1x: getImageUrl(image, width, imageServiceUrl),
    image2x: getImageUrl(image, width * 2, imageServiceUrl),
    image3x: getImageUrl(image, width * 3, imageServiceUrl),
    image4x: getImageUrl(image, width * 4, imageServiceUrl),
  };
}

function getImageUrl(image: QuizImage, width: number, imageServiceUrl: string) {
  if (imageServiceUrl && image.key && width)
    return `${imageServiceUrl
      .replace('{key}', image.key)
      .replace('{width}', width.toString())
      .replace('{format}', 'pjpg')}&auto=webp`;
  else return image.url;
}
