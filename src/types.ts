export interface RendererOptions {
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  components?: Record<string, unknown>;
  remarkRehypeOptions?: Record<string, unknown>;
}

export interface MarkdownRenderer {
  optionsGenerators: {
    customGenerateViewOptions?: (...args: unknown[]) => RendererOptions;
    generateViewOptions: (...args: unknown[]) => RendererOptions;
  };
}

export interface GrowiFacade {
  markdownRenderer?: MarkdownRenderer;
}

declare global {
  interface Window {
    growiFacade?: GrowiFacade;
    pluginActivators?: Record<string, { activate: () => void; deactivate: () => void }>;
  }
}
