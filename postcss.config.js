const hslVarsPlugin = () => {
  return {
    postcssPlugin: 'postcss-hsl-vars',
    Declaration(decl) {
      if (decl.value.includes('hsl(')) {
        const match = decl.value.match(/hsl\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%\)/);
        if (match) {
          const [_, h, s, l] = match;
          decl.value = `${h} ${s}% ${l}%`;
        }
      }
    }
  };
};
hslVarsPlugin.postcss = true;

export default {
  plugins: [
    hslVarsPlugin,
    'tailwindcss'
  ],
};