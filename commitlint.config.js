module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Tipo obbligatorio: feat, fix, docs, style, refactor, test, chore, ci, perf, build
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nuova funzionalità
        "fix", // Bug fix
        "docs", // Solo documentazione
        "style", // Formattazione, punti e virgola mancanti, ecc.
        "refactor", // Refactoring del codice
        "test", // Aggiunta o modifica test
        "chore", // Manutenzione, dipendenze, config
        "ci", // CI/CD
        "perf", // Miglioramento performance
        "build", // Build system
        "revert", // Revert di un commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [1, "always", 100],
  },
};
