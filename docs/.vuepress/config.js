module.exports = {
  title: 'Laputa',
  description: 'A blog about python, vue and linux.',
  evergreen: true,
  // permalink: '/:slug',
  themeConfig: {
    sidebarDepth: 1,
    sidebar: 'auto',
    lastUpdated: 'Last Updated',
  },
  markdown: {
    lineNumbers: true,
    extendMarkdown: md => {
      md.use(require('markdown-it-math'), {
        inlineOpen: '$',
        inlineClose: '$',
        blockOpen: '$$',
        blockClose: '$$',
      });
    },
  },
  plugins: [],
};
