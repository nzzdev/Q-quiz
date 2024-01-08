import { ImageFormat } from '@src/enums';

export function getImageUrls(imageKey: string, width: number) {
  return {
    image1x: getImageUrl(imageKey, width, getFileExtension(imageKey)),
    image2x: getImageUrl(imageKey, width * 2, getFileExtension(imageKey)),
    webp1x: getImageUrl(imageKey, width, ImageFormat.WEBPLY),
    webp2x: getImageUrl(imageKey, width * 2, ImageFormat.WEBPLY),
  };
}

function getImageUrl(imageKey: string, width: number, format: ImageFormat) {
  // TODO: check if statement needed
  if (process.env.IMAGE_SERVICE_URL) {
    return process.env.IMAGE_SERVICE_URL.replace('{key}', imageKey)
      .replace('{width}', width.toString())
      .replace('{format}', format);
  }
  return '';
}

function getFileExtension(imageKey: string) {
  const fileExtensionPattern = /\.([0-9a-z]+$)/i;
  const fileExtension = imageKey.match(fileExtensionPattern);
  if (fileExtension && fileExtension[1] === ImageFormat.PNG) {
    return ImageFormat.PNG;
  }
  return ImageFormat.PJPG;
}
