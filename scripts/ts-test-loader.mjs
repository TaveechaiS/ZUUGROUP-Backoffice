import fs from 'node:fs';
import ts from 'typescript';
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier + '.ts', context.parentURL);
      if (fs.existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    throw error;
  }
}
export async function load(url, context, next) {
  if (url.endsWith('.ts'))
    return {
      format: 'module',
      source: ts.transpileModule(fs.readFileSync(new URL(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
      shortCircuit: true,
    };
  return next(url, context);
}
