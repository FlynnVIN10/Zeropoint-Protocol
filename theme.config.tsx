import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Zeropoint Protocol</span>,
  project: {
    link: 'https://github.com/FlynnVIN10/Zeropoint-Protocol',
  },
  docsRepositoryBase: 'https://github.com/FlynnVIN10/Zeropoint-Protocol/tree/main/website-v2',
  footer: {
    text: '© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Zeropoint Protocol'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Zeropoint Protocol" />
      <meta property="og:description" content="Real compute attestation and tinygrad integration" />
    </>
  ),
  primaryHue: 210,
  primarySaturation: 100,
}

export default config
