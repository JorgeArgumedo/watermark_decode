import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "analysis",
        component: () => import("@/pages/AnalysisPage.vue"),
        meta: {
          title: "Analysis",
        },
      },
      {
        path: "help",
        name: "help",
        component: () => import("@/pages/HelpPage.vue"),
        meta: {
          title: "Help",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
