import type { RendererOptions } from './src/types';
import remarkGithubAlerts from './src/remark-github-alerts';
import './src/styles/github-alerts.css';

const PLUGIN_NAME = 'growi-plugin-test2';

type CustomGenerateViewOptions = (...args: unknown[]) => RendererOptions;

let originalCustom: CustomGenerateViewOptions | undefined;
let wrapped = false;

const activate = (): void => {
  if (wrapped) return;
  const facade = window.growiFacade;
  if (!facade?.markdownRenderer) {
    console.warn(`[${PLUGIN_NAME}] growiFacade.markdownRenderer not available`);
    return;
  }
  const { optionsGenerators } = facade.markdownRenderer;
  originalCustom = optionsGenerators.customGenerateViewOptions;

  optionsGenerators.customGenerateViewOptions = (...args: unknown[]): RendererOptions => {
    const options = originalCustom
      ? originalCustom(...args)
      : optionsGenerators.generateViewOptions(...args);
    options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGithubAlerts];
    return options;
  };
  wrapped = true;
  console.log(`[${PLUGIN_NAME}] activated`);
};

const deactivate = (): void => {
  if (!wrapped) return;
  const facade = window.growiFacade;
  if (facade?.markdownRenderer) {
    facade.markdownRenderer.optionsGenerators.customGenerateViewOptions = originalCustom;
  }
  wrapped = false;
  originalCustom = undefined;
  console.log(`[${PLUGIN_NAME}] deactivated`);
};

(window.pluginActivators ??= {})[PLUGIN_NAME] = { activate, deactivate };
