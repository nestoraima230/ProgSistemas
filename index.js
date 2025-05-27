require("dotenv").config();
const express = require("express");
const db = require("./db");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Me quiero cojer al inquisitor");
});

app.get("/query", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "No query provided" });
  }

  try {
    const typeError = await validateQueryTypes(query);
    if (typeError) {
      return res.status(400).json({
        error: typeError,
        raw: "Type mismatch in SELECT conditions",
      });
    }

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("SQL Error:", error.message);

    const message = error.message;
    const lineNumber = estimateLineNumber(message, query);
    const parsedMessage = parseSQLError(message, lineNumber, query);

    res.status(500).json({
      error: parsedMessage,
      raw: message,
    });
  }
});

// 👇 Se agrega esta función y helper para validación de tipo
const validateQueryTypes = require("./validateTypes");

function estimateLineNumber(errorMessage, query) {
  const lines = query.split("\n");
  let customIndex =
    errorMessage.includes("ambiguous") || errorMessage.includes("doesn't exist")
      ? 1
      : 2;

  const word = errorMessage
    .replaceAll("'", "")
    .split(" ")
    [customIndex].toLowerCase()
    .replace(/^.*?\./, "");

  const regex = new RegExp(`\\b${word}\\b`, "i");

  for (let i = 0; i < lines.length; i++) {
    const cleanLine = lines[i].trim();
    if (regex.test(cleanLine)) {
      return String(i + 1).padStart(2, "0");
    }
  }

  return "01";
}

function parseSQLError(message, line, query) {
  if (message.includes("Unknown column")) {
    const match = message.match(/Unknown column '(.*?)'/);
    const column = match ? match[1] : "???";

    if (column.includes(".")) {
      const [table, attr] = column.split(".");
      const fromMatch = query
        .split(/where/i)[0]
        .replace(/\n/g, " ")
        .toUpperCase();

      const isTableMentioned = new RegExp(`\\b${table.toUpperCase()}\\b`).test(
        fromMatch
      );

      if (isTableMentioned) {
        return `Error 3:311 Línea ${line} El nombre del atributo “${attr}” no es válido.`;
      } else {
        return `Error 3:315 Línea ${line} El identificador “${column}” no es válido.`;
      }
    } else {
      return `Error 3:311 Línea ${line} El nombre del atributo “${column}” no es válido.`;
    }
  }

  if (message.includes("ambiguous")) {
    const match = message.match(/Column '(.*?)'/);
    const attr = match ? match[1] : "???";
    return `Error 3:312 Línea ${line} El nombre del atributo “${attr.replace(
      /^.*?\./,
      ""
    )}” es ambigüo.`;
  }

  if (
    message.includes("doesn't exist") &&
    message.toLowerCase().includes("table")
  ) {
    const match = message.match(/Table '(.*?)'/);
    const table = match ? match[1] : "???";
    return `Error 3:314 Línea ${line} El nombre de la tabla “${table.replace(
      /^.*?\./,
      ""
    )}” no es válido.`;
  }

  if (message.includes("Incorrect") && message.includes("value")) {
    return `Error 3:313 Línea ${line}. Error de conversión de tipo de datos.`;
  }

  return `Error 3:999 Línea ${line} Error desconocido: ${message}`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Me corro en http://localhost:${PORT}`);
});
