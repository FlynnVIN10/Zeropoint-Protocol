import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/navigation-demo',
    component: ComponentCreator('/navigation-demo', '7b9'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '589'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '551'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '9c5'),
            routes: [
              {
                path: '/docs/api/',
                component: ComponentCreator('/docs/api/', '8b5'),
                exact: true
              },
              {
                path: '/docs/brand',
                component: ComponentCreator('/docs/brand', '4cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/compliance/gdpr-audit',
                component: ComponentCreator('/docs/compliance/gdpr-audit', '0ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/design/phase8-visualizer',
                component: ComponentCreator('/docs/design/phase8-visualizer', '073'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/design/screenshots/',
                component: ComponentCreator('/docs/design/screenshots/', '72d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/design/screenshots/phase4/',
                component: ComponentCreator('/docs/design/screenshots/phase4/', '9eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/errors',
                component: ComponentCreator('/docs/errors', '065'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/feedback',
                component: ComponentCreator('/docs/feedback', '7c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/legal',
                component: ComponentCreator('/docs/legal', '4c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/LICENSES',
                component: ComponentCreator('/docs/LICENSES', '8a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/phase13_consensus_engine',
                component: ComponentCreator('/docs/phase13_consensus_engine', '3d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/phase13_petal_training',
                component: ComponentCreator('/docs/phase13_petal_training', '439'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/soulchain-rpc',
                component: ComponentCreator('/docs/soulchain-rpc', '952'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/status',
                component: ComponentCreator('/docs/status', 'fa6'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
