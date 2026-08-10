/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{pug,html,js}'],
  future: {
    // Wrap every hover: variant in @media (hover: hover) so touch devices
    // never get sticky first-tap hover states
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // require('@tailwindcss/line-clamp'),
    // NOT @tailwindcss/aspect-ratio: it disables the native aspect-* core
    // utilities (aspect-square in backyard-mech.pug), and nothing here uses
    // its aspect-w-*/aspect-h-* classes.
  ],
};
