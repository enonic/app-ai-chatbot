export default function throttle(callback) {
  let ticking = false;

  return function requestTick(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        ticking = false;
        callback(...args);
      });
    }
    ticking = true;
  };
}
