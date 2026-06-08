import { useEffect, useState } from "react";

export const useDebounce = (value, delay = 3000) => {
  const [debounceTerm, setDebounceTerm] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounceTerm(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounceTerm
};
