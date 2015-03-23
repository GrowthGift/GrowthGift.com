/**
Switched to inline SVG instead of images to reduce HTTP requests.

## Usage:
1. Optimize SVG with SVGO
  1. https://jakearchibald.github.io/svgomg/
    1. https://github.com/svg/svgo
2. Copy SVG code inline below
  1. find and replace regex `\n` with `` to remove new lines
  2. REMOVE any height & width attributes on the svg and instead use / add `width="100%"`
3. Use by calling the template with the `name` attribute matching they key in the `svgs` object, e.g. `{{>svg name='logo'}}
  1. the SVG will be responsive and resize based on the element dimensions; use CSS as normal to set width/height (since the image default width/height are NOT set, you'll have to set for inline elements. Use the svg `viewBox` attribute to see the default dimensions.)

## References:
http://css-tricks.com/using-svg/
http://stackoverflow.com/questions/19484707/how-can-i-make-an-svg-scale-with-its-parent-container
*/

var svgs ={
  // 'logo-black': {
  //   html: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0" y="0" width="100%" viewBox="0 0 207.5 32.25" enable-background="new 0 0 207.5 32.25" xml:space="preserve"><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M24.51 31.19h-3.02L11.21 19.93h-8.12V31.19H0.79V1.43c4.38 0 8.72 0 13.09 0 6.46 0 9.73 4.63 9.78 9.27 0.04 4.85-3.15 9.1-9.65 9.1L24.51 31.19zM3.09 17.76H13.63c5.19 0 7.48-2.93 7.53-7.1 0.04-3.49-2.34-7.1-7.27-7.1H3.09V17.76z"/><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M49.49 15.16h17.43v2.08H49.49V28.98h18.79v2.21H47.24V1.43h20.53v2.17H49.49V15.16z"/><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M111.78 1.48h2.47v0.04l-10.12 14.41 10.93 15.22v0.04h-2.72l-9.61-13.6L93.12 31.19h-2.72v-0.04l10.93-15.22L91.21 1.52V1.48h2.51l9.01 12.71L111.78 1.48z"/><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M159.87 1.43v18.49c0 15.56-22.78 15.6-22.78 0V1.43h2.25v18.49c0 12.8 18.28 12.75 18.28 0V1.43H159.87z"/><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M203.94 7.17c-2.17-3.49-5.65-4-9.01-4.04 -3.49 0-9.01 1.27-9.01 6.04 0 3.78 4.08 4.68 9.1 5.61 5.74 1.11 11.69 2.13 11.69 8.55 -0.04 6.72-6.8 8.33-11.77 8.33 -4.63 0-9.91-1.91-12.2-6.46l2.04-1.02c1.83 3.61 6.5 5.4 10.16 5.4 3.65 0 9.48-1.02 9.48-6.29 0.04-4.46-4.89-5.44-9.78-6.38 -5.44-1.06-11.01-2.17-11.01-7.65 -0.13-6.29 6.42-8.25 11.31-8.25 4.25 0 7.95 0.68 10.88 5.06L203.94 7.17z"/></svg>'
  // }
};

Template.svg.helpers({
  svg: function() {
    return svgs[this.name].html;
  }
});