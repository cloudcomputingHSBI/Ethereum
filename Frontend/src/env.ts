// Importiere dotenv nur in Node.js (verhindert Fehler im Browser)
if (typeof process !== "undefined" && typeof process.env !== "undefined") {
  import("dotenv").then((dotenv) => dotenv.config()).catch(() => {
    console.warn("⚠️ dotenv konnte nicht geladen werden.");
  });
}

/**
 * Funktion, die Umgebungsvariablen für Browser (Vite) und Node.js abrufen kann.
 */
export const getEnvVar = (key: string): string | undefined => {
  try {
    console.log(`🔍 Suche nach Umgebungsvariable ${key}...`);
    // 🟢 Node.js (ts-node oder normales Backend)
    if (typeof process !== "undefined" && process.env?.[key]) {
      console.log(`🔍 NODE-ENV ${key}:`, process.env[key]); // Debugging
      return process.env[key];
    }

    // 🟢 Vite (Browser, aber OHNE `import.meta.env` direkt in CommonJS!)
    if (typeof window !== "undefined" && (window as any).env) {
      console.log(`🔍 BROWSER-ENV ${key}:`, (window as any).env[key]); // Debugging
      return (window as any).env[key] ?? undefined;
    }
  } catch (error) {
    console.warn(`⚠️ Konnte ${key} nicht abrufen:`, error);
  }
  return undefined;
};
