type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(func: T, delay: number): AsyncFunction<T> {
    let timeoutId: NodeJS.Timeout;
  
    return async function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<void> {
      const context = this;
  
      clearTimeout(timeoutId);
  
      return new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          await func.apply(context, args);
          resolve();
        }, delay);
      });
    };
  }