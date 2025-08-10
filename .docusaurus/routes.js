import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/phases/09',
    component: ComponentCreator('/phases/09', '579'),
    exact: true
  },
  {
    path: '/phases/10',
    component: ComponentCreator('/phases/10', '260'),
    exact: true
  },
  {
    path: '/phases/11',
    component: ComponentCreator('/phases/11', '38f'),
    exact: true
  },
  {
    path: '/phases/12',
    component: ComponentCreator('/phases/12', '521'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'ca4'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '956'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'f71'),
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
