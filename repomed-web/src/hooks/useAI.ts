// Simple stub for useAI hook
export function useAI() {
  return {
    generateContent: async (prompt: string) => {
      // Stub implementation
      return `Generated content for: ${prompt}`;
    },
    getSuggestions: async (query: string) => {
      // Stub implementation
      return [`Suggestion for: ${query}`];
    },
    isLoading: false,
    error: null
  };
}