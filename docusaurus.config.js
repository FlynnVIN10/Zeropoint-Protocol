const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Zeropoint Protocol',
  tagline: 'Ethical Agentic AI Platform',
  url: 'https://zeropointprotocol.ai',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
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
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
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
        logo: {
          alt: 'Zeropoint Protocol Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {to: '/dashboard', label: 'Dashboard', position: 'left'},
          {to: '/interact', label: 'Interact', position: 'left'},
          {to: '/technology', label: 'Technology', position: 'left'},
          {to: '/status', label: 'Status', position: 'left'},
          {to: '/use-cases', label: 'Use Cases', position: 'left'},
          {to: '/legal', label: 'Legal', position: 'left'},
          {to: '/contact', label: 'Contact', position: 'left'},
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Documentation',
          },
        ],
        style: 'dark',
        backgroundColor: 'transparent',
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Technology',
            items: [
              {
                label: 'Technology',
                to: '/technology',
              },
            ],
          },
          {
            title: 'Legal',
            items: [
              {
                label: 'License',
                to: '/legal',
              },
              {
                label: 'Terms',
                to: '/legal',
              },
              {
                label: 'Privacy',
                to: '/legal',
              },
            ],
          },
          {
            title: 'Contact',
            items: [
              {
                label: 'Contact',
                to: '/contact',
              },
              {
                label: 'Support',
                to: '/contact',
              },
            ],
          },
        ],
        copyright: `Copyright © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. Legal & Licensing.`,
      },
      prism: {
        theme: darkCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});