export const code = `\
diff --git a/src/main.ts b/src/main.ts
index a1b2c3d..e4f5a6b 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,7 +1,9 @@
 import { mount } from 'svelte';
+import './app.css';
 import App from './App.svelte';

-const app = mount(App, { target: document.body });
+const app = mount(App, { target: document.getElementById('app')! });
 export default app;`;
