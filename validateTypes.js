const db = require("./db");

async function getTableColumns(table) {
  const [columns] = await db.query(
    `SELECT COLUMN_NAME, DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'INSCRITOS' AND TABLE_NAME = ?`,
    [table]
  );
  console.log(columns);
  return columns.reduce((acc, col) => {
    acc[col.COLUMN_NAME.toUpperCase()] = col.DATA_TYPE.toLowerCase();
    return acc;
  }, {});
}

function isValueCompatible(type, value) {
  if (["int", "decimal", "numeric", "float", "double"].includes(type)) {
    return /^\d+$/.test(value);
  }

  if (["char", "varchar", "text"].includes(type)) {
    return /^'.*'$/.test(value); // sólo acepta strings entre comillas
  }

  return true;
}

async function validateQueryTypes(query) {
  const allTablesMatch = [...query.matchAll(/FROM\s+(\w+)/gi)];
  const allTables = [...new Set(allTablesMatch.map((match) => match[1]))];

  const allColumns = {};
  for (const table of allTables) {
    const cols = await getTableColumns(table);
    allColumns[table.toUpperCase()] = cols;
  }

  const allEqualsConditions = [
    ...query.matchAll(/(\w+)\s*=\s*('[^']*'|\d+)/gi),
  ];

  const lines = query.split("\n").map((line) => line.trim());

  for (const [_, field, value] of allEqualsConditions) {
    for (const table in allColumns) {
      if (field.toUpperCase() in allColumns[table]) {
        const type = allColumns[table][field.toUpperCase()];
        const isQuoted = /^'.*'$/.test(value.trim());

        const conditionPattern = new RegExp(
          `\\b${field}\\b\\s*=\\s*${value.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&"
          )}`
        );

        const lineIndex = lines.findIndex((line) =>
          conditionPattern.test(line)
        );

        const errorLine =
          lineIndex >= 0 ? String(lineIndex + 1).padStart(2, "0") : "??";

        if (
          (["char", "varchar", "text"].includes(type) && !isQuoted) ||
          (["int", "decimal", "numeric", "float", "double"].includes(type) &&
            isQuoted)
        ) {
          return `Error 3:313 Línea ${errorLine} Error de conversión al convertir el valor del atributo ‘${field}’ del tipo ${type} a tipo de dato incompatible.`;
        }
      }
    }
  }

  return null;
}

module.exports = validateQueryTypes;
