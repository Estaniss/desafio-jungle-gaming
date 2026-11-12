
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

const baseUrl = "http://127.0.0.1:4173";

const categories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];

const targets = [
  {
    name: "home",
    url: `${baseUrl}/`,
  },
  {
    name: "nft-details",
    url: `${baseUrl}/nft/emerald-ape-042`,
  },
];

const profiles = [
  {
    name: "mobile",
    config: "mobile.config.cjs",
  },
  {
    name: "desktop",
    config: "desktop.config.cjs",
  },
];

const repetitions = 3;

const chromePath =
  process.env.CHROME_PATH ||
  path.join(
    process.env.ProgramFiles || "C:\\Program Files",
    "Google",
    "Chrome",
    "Application",
    "chrome.exe",
  );

const lighthouseCli = path.join(
  rootDir,
  "node_modules",
  "lighthouse",
  "cli",
  "index.js",
);

const lighthousePackage = JSON.parse(
  readFileSync(
    path.join(rootDir, "node_modules", "lighthouse", "package.json"),
    "utf-8",
  ),
);

function ensureFileExists(filePath, description) {
  if (!existsSync(filePath)) {
    throw new Error(`${description} não encontrado: ${filePath}`);
  }
}

function median(values) {
  const validValues = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (validValues.length === 0) {
    return null;
  }

  const middle = Math.floor(validValues.length / 2);

  if (validValues.length % 2 !== 0) {
    return validValues[middle];
  }

  return (validValues[middle - 1] + validValues[middle]) / 2;
}

function round(value, decimals = 2) {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(decimals));
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`Processo finalizado com código ${code}`),
        );
      }
    });
  });
}

function getCategoryScores(report) {
  return Object.fromEntries(
    categories.map((category) => [
      category,
      round(
        report.categories[category]?.score == null
          ? null
          : report.categories[category].score * 100,
      ),
    ]),
  );
}

function getMetrics(report) {
  const audits = report.audits;

  return {
    lcpMs: round(
      audits["largest-contentful-paint"]?.numericValue,
      0,
    ),

    cls: round(
      audits["cumulative-layout-shift"]?.numericValue,
      4,
    ),

    tbtMs: round(
      audits["total-blocking-time"]?.numericValue,
      0,
    ),
  };
}

function calculateSummary(results) {
  const summary = {};

  for (const profile of profiles) {
    summary[profile.name] = {};

    for (const target of targets) {
      const runs = results.filter(
        (result) =>
          result.profile === profile.name &&
          result.page === target.name,
      );

      summary[profile.name][target.name] = {
        executions: runs.length,

        categories: Object.fromEntries(
          categories.map((category) => [
            category,
            median(
              runs.map(
                (run) => run.scores[category],
              ),
            ),
          ]),
        ),

        metrics: {
          lcpMs: median(
            runs.map((run) => run.metrics.lcpMs),
          ),

          cls: median(
            runs.map((run) => run.metrics.cls),
          ),

          tbtMs: median(
            runs.map((run) => run.metrics.tbtMs),
          ),
        },

        goals: {
          performance: 90,
          accessibility: 95,
          "best-practices": 95,
          seo: 90,
        },
      };
    }
  }

  return summary;
}

async function main() {
  ensureFileExists(chromePath, "Google Chrome");
  ensureFileExists(lighthouseCli, "Lighthouse CLI");

  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  const reportsDir = path.join(
    rootDir,
    "lighthouse",
    "reports",
    timestamp,
  );

  mkdirSync(reportsDir, { recursive: true });

  const results = [];

  console.log("\n====================================");
  console.log(" KURIO - LIGHTHOUSE AUDIT");
  console.log("====================================\n");

  console.log(`Node.js: ${process.version}`);
  console.log(`Lighthouse: ${lighthousePackage.version}`);
  console.log(`Chrome: ${chromePath}`);
  console.log(`URL base: ${baseUrl}`);
  console.log(`Execuções por combinação: ${repetitions}`);
  console.log(`Relatórios: ${reportsDir}\n`);

  for (const profile of profiles) {
    const configPath = path.join(
      rootDir,
      "lighthouse",
      "config",
      profile.config,
    );

    ensureFileExists(configPath, `Configuração ${profile.name}`);

    for (const target of targets) {
      const targetDir = path.join(
        reportsDir,
        profile.name,
        target.name,
      );

      mkdirSync(targetDir, { recursive: true });

      for (let run = 1; run <= repetitions; run++) {
        const reportPrefix = path.join(
          targetDir,
          `run-${run}`,
        );

        console.log(
          `\n[${profile.name}] ${target.name} - Execução ${run}/${repetitions}`,
        );

        const args = [
          lighthouseCli,
          target.url,
          `--config-path=${configPath}`,
          "--output=html",
          "--output=json",
          `--output-path=${reportPrefix}`,
          "--chrome-flags=--headless=new",
          "--quiet",
        ];

        await runProcess(process.execPath, args, {
          env: {
            ...process.env,
            CHROME_PATH: chromePath,
            VITE_ENABLE_MOCKS: "true",
            VITE_MOCK_SCENARIO: "success",
          },
        });

        const jsonPath = `${reportPrefix}.report.json`;

        ensureFileExists(jsonPath, "Relatório JSON");

        const report = JSON.parse(
          readFileSync(jsonPath, "utf-8"),
        );

        const result = {
          profile: profile.name,
          page: target.name,
          url: target.url,
          run,
          scores: getCategoryScores(report),
          metrics: getMetrics(report),
          lighthouseVersion: report.lighthouseVersion,
          userAgent: report.environment?.hostUserAgent,
          networkUserAgent: report.environment?.networkUserAgent,
          fetchTime: report.fetchTime,
        };

        results.push(result);

        console.log("Pontuações:", result.scores);
        console.log("Métricas:", result.metrics);
      }
    }
  }

  const summary = calculateSummary(results);

  const lighthouseMetadata = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: process.env.npm_config_user_agent || "Não informado",
    lighthouseVersion: lighthousePackage.version,
    chromePath,
    baseUrl,
    mockEnvironment: {
      VITE_ENABLE_MOCKS: "true",
      VITE_MOCK_SCENARIO: "success",
    },
    repetitions,
    categories,
    results,
    summary,
  };

  const summaryPath = path.join(
    reportsDir,
    "summary.json",
  );

  writeFileSync(
    summaryPath,
    JSON.stringify(lighthouseMetadata, null, 2),
    "utf-8",
  );

  console.log("\n====================================");
  console.log(" AUDITORIA CONCLUÍDA");
  console.log("====================================");
  console.log(`Total de medições: ${results.length}`);
  console.log(`Resumo: ${summaryPath}\n`);

  console.log(
    JSON.stringify(summary, null, 2),
  );
}

main().catch((error) => {
  console.error("\nErro durante a auditoria:");
  console.error(error);
  process.exitCode = 1;
});
