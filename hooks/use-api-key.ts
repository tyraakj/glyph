import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini-api-key");
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key.trim() === "") {
      localStorage.removeItem("gemini-api-key");
    } else {
      localStorage.setItem("gemini-api-key", key);
    }
  };

  return { apiKey, setApiKey };
}
