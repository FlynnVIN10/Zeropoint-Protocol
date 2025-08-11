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

          // Disable tutorial content generation
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/FlynnVIN10/Zeropoint-Protocol/edit/main/',
          // Disable auto-generated blog content
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 0,
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
      // Force dark mode only
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      
      // Navbar configuration
      navbar: {
        title: 'Zeropoint Protocol',
        logo: {
          alt: 'Zeropoint Protocol Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {to: '/docs', label: 'Documentation', position: 'left'},
          {to: '/status', label: 'Status', position: 'left'},
          {
            href: 'https://github.com/FlynnVIN10/Zeropoint-Protocol',
            label: 'GitHub',
            position: 'right',
          },
        ],
        style: 'dark',
        hideOnScroll: false,
      },
      
      // Footer configuration
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Platform',
            items: [
              {
                label: 'Documentation',
                to: '/docs',
              },
              {
                label: 'Status',
                to: '/status',
              },
              {
                label: 'API Reference',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/FlynnVIN10/Zeropoint-Protocol',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/zeropoint',
              },
            ],
          },
          {
            title: 'Legal',
            items: [
              {
                label: 'Privacy Policy',
                to: '/docs/legal/privacy',
              },
              {
                label: 'Terms of Service',
                to: '/docs/legal/terms',
              },
              {
                label: 'License',
                to: '/docs/legal/license',
              },
            ],
          },
        ],
        copyright: `Copyright © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. Legal & Licensing.`,
      },
      

    }),
    
  // Additional configuration for better dark mode support
  scripts: [
    {
      src: '/js/theme-enforcer.js',
      async: true,
    },
  ],
  

});