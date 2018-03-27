import { historyCacheKey } from './config';

export function loadHistory(limit = 0) {
  const messages = JSON.parse(localStorage.getItem(historyCacheKey)) || [];
  return limit > 0 ? messages.slice(-limit) : null;
  // const messages = history.split();
}

export function saveHistory() {
  const history = JSON.stringify([]);
  localStorage.setItem(historyCacheKey, history);
  // save history
}
