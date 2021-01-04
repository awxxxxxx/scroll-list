export function throttle(fn: Function, time: number) {
  let pre = 0;
  let timer: any = null;
  return function (...args: any[]) {
    if (Date.now() - pre > time) {
      clearTimeout(timer);
      timer = null;
      pre = Date.now();
      // @ts-ignore
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        // @ts-ignore
        fn.apply(this, args);
      }, time);
    }
  }
}
