import { historyCacheKey } from './config';

export default function validate(parent) {
  const isValidRoot = parent && parent instanceof HTMLElement;
  if (!isValidRoot) {
    throw new Error(`Can't find the parent element: ${parent}`);
  }

  try {
    localStorage.setItem(historyCacheKey, historyCacheKey);
    localStorage.removeItem(historyCacheKey);
  } catch (error) {
    const msg = `Your server does not allow storing data locally. Most likely it's because you've opened this page from your hard-drive. For testing you can disable your browser's security or start a localhost environment.`;
    console.error(msg);
  }
}
