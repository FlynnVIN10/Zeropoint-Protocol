import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/contact',
    component: ComponentCreator('/contact', 'abe'),
    exact: true
  },
  {
    path: '/dashboard',
    component: ComponentCreator('/dashboard', 'd63'),
    exact: true
  },
  {
    path: '/interact',
    component: ComponentCreator('/interact', '04f'),
    exact: true
  },
  {
    path: '/legal',
    component: ComponentCreator('/legal', 'da9'),
    exact: true
  },
  {
    path: '/status',
    component: ComponentCreator('/status', '3ab'),
    exact: true
  },
  {
    path: '/technology',
    component: ComponentCreator('/technology', '88a'),
    exact: true
  },
  {
    path: '/use-cases',
    component: ComponentCreator('/use-cases', '612'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'd6d'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '732'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '299'),
            routes: [
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
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
