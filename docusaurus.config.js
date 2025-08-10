// Theme configuration for code highlighting - temporarily disabled
// const lightCodeTheme = require('prism-react-renderer').themes.github;
// const darkCodeTheme = require('prism-react-renderer').themes.dracula;

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Zeropoint Protocol',
  tagline: 'Ethical Agentic AI Platform',
  url: 'https://zeropointprotocol.ai',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'FlynnVIN10', // Usually your GitHub org/user name.
  projectName: 'zeropointprotocol', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/FlynnVIN10/Zeropoint-Protocol/edit/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/FlynnVIN10/Zeropoint-Protocol/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
      },
      navbar: {
        title: 'Zeropoint Protocol',
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {to: '/docs', label: 'Documentation', position: 'left'},
          {to: '/status', label: 'Status', position: 'left'},
        ],
        style: 'dark',
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. Legal & Licensing.`,
      },
    }),
});