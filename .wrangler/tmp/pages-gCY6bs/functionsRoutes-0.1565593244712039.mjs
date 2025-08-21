import { onRequest as __api_training_status_ts_onRequest } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/functions/api/training/status.ts"
import { onRequest as __api_healthz_ts_onRequest } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/functions/api/healthz.ts"
import { onRequest as __api_readyz_ts_onRequest } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/functions/api/readyz.ts"
import { onRequest as __consensus_proposals_json_ts_onRequest } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/functions/consensus/proposals.json.ts"
import { onRequest as __status_version_json_ts_onRequest } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/functions/status/version.json.ts"

export const routes = [
    {
      routePath: "/api/training/status",
      mountPath: "/api/training",
      method: "",
      middlewares: [],
      modules: [__api_training_status_ts_onRequest],
    },
  {
      routePath: "/api/healthz",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_healthz_ts_onRequest],
    },
  {
      routePath: "/api/readyz",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_readyz_ts_onRequest],
    },
  {
      routePath: "/consensus/proposals.json",
      mountPath: "/consensus",
      method: "",
      middlewares: [],
      modules: [__consensus_proposals_json_ts_onRequest],
    },
  {
      routePath: "/status/version.json",
      mountPath: "/status",
      method: "",
      middlewares: [],
      modules: [__status_version_json_ts_onRequest],
    },
  ]