// Arrays para almacenar resultados del análisis
let constResults = []      // Almacena las constantes encontradas durante el análisis
let identifResults = []    // Almacena los identificadores encontrados
let results = []           // Almacena todos los tokens encontrados con su información
let errors = []            // Almacena los errores detectados
let parserResults = []     // Almacena los resultados del análisis sintáctico

// Deshabilita el botón del parser inicialmente hasta que se complete el análisis léxico sin errores
document.getElementById("bParser").disabled = true;

/**
 * Función principal que inicia el análisis léxico
 * Muestra los resultados y habilita el parser si no hay errores
 */
function analiza() {
  let inputText = document.getElementById("textToEval").value.trim();
  if (inputText === "") {
    alert("Por favor, ingresa una sentencia SQL.");
    return;
  }

  scanner();
  showResults();
  if (errors.length === 0) {
    document.getElementById("bParser").disabled = false;
    showParser();
  }
}


/**
 * Ejecuta el análisis sintáctico y muestra sus resultados
 * Muestra un mensaje con el resultado y actualiza las tablas
 */
function showParser() {
  let result = parser()    // Ejecuta el análisis sintáctico
  showResultsParser()      // Actualiza las tablas con los resultados del parser
  document.getElementById("bParser").disabled = true;  // Deshabilita el botón después de usarlo  
}

/**
 * Realiza el análisis léxico del texto ingresado
 * Identifica y categoriza todos los tokens
 */
function scanner() {
  // Modulo de Análisis
  var identifValue = 401                  // Valor inicial para identificadores
  var constValue = 601                    // Valor inicial para constantes
  let text = document.getElementById("textToEval").value.toUpperCase() // Texto a evaluar convertido a mayúsculas
  let linesText = text.split('\n')        // Se divide el texto en un arreglo por lineas
  
  // Se limpian los arreglos de resultados antes de un nuevo análisis
  constResults = []
  identifResults = []
  results = []
  errors = []

  // Recorre cada línea del texto
  for(let renglon = 0; renglon < linesText.length; renglon++) {
    // Expresión regular para identificar tokens
    // Captura: operadores relacionales, identificadores, números, constantes entre comillas, y símbolos
    const regex = />=|<=|!=|==|[A-Z0-9_]+|[+-]?[0-9]*\.?[0-9]+|'[^']*'|[^A-Z0-9\s]/g;
    let strFound = linesText[renglon].match(regex) // Regresa arreglo de TOKENS de un renglón   
    
    if (strFound !== null) {  // Si se encontraron tokens en la línea
      for(j = 0; j < strFound.length; j++) {  // Procesa cada token
        let str =  strFound[j]                // Token actual
        let strType = getStrType(str)         // Identifica el tipo de token
        let rowToAdd                          // Variable para el objeto a añadir a los resultados
        let value =  strType.codigo           // Valor/código del token
        
        // Manejo de identificadores (tipo 4)
        if(strType.tipo == 4){ 
          let pos = -1
          // Busca si el identificador ya existe en la tabla de identificadores
          for(let i=0; i<identifResults.length; i++) { 
            if(identifResults[i].token == str) {
              identifResults[i].row += `, ${renglon+1}` // Agrega nuevo No.Linea al ya existente
              pos = i;                        // Marca que se encontró
              value = identifResults[i].valor // Usa el valor asignado anteriormente
            }
          }
          if(pos == -1) { // Si es un nuevo identificador
            value = identifValue              // Asigna un nuevo valor
            rowToAdd = {row: renglon+1, token: str, valor: identifValue++ , codigo: strType.codigo} 
            identifResults.push(rowToAdd)     // Añade a la tabla de identificadores
          }
        }

        // Manejo de constantes (tipo 6)
        if(strType.tipo == 6) {  
          value = constValue
          if(strType.codigo == 62)            // Si es constante alfanumérica
            str = str.replaceAll("'", "")     // Elimina las comillas
          rowToAdd = {row: renglon+1, token: str, valor: constValue++ , codigo: strType.codigo} 
          constResults.push(rowToAdd)         // Añade a la tabla de constantes
        }

        // Se agrega a la tabla de resultados si es un token válido
        if(strType.tipo > 0) {  // Se excluyen los errores (tipo 0)
          // Manejo especial para constantes alfanuméricas (código 62)
          // Añade la comilla de apertura como token separado
          if(strType.codigo == 62)
            results.push({row: renglon+1, token: "'", tipo: 5, codigo: 54, valor: value, simbolo: "'" })

          // Añade el token principal
          rowToAdd = {
            row: renglon+1, 
            token: (strType.codigo==62 ? 'CONSTANTE' : str), // Para constantes alfanuméricas usa 'CONSTANTE' como token
            tipo: strType.tipo, 
            codigo: strType.codigo, 
            valor: value,
            simbolo: strType.simbolo || str
          }
          results.push(rowToAdd) 
          
          // Añade la comilla de cierre como token separado para constantes alfanuméricas
          if(strType.codigo == 62)
            results.push({row: renglon+1, token: "'", tipo: 5, codigo: 54, valor: value, simbolo: "'"})
        }
        else {  // Manejo de errores (tokens no reconocidos)
          rowToAdd = {row: renglon+1, codigo: 101, descripcion: "Simbolo desconocido"}
          errors.push(rowToAdd)
        }
      } 
    }
  }
}

/**
 * Determina el tipo de un token
 * @param {string} str - El token a analizar
 * @return {object} - Objeto con información del tipo de token
 */
function getStrType(str) {
  // Busca el token en la lista de elementos estáticos (palabras reservadas, operadores, etc.)
  for(let i=0; i < staticElements.length; i++) {
    if(staticElements[i].str === str)  return staticElements[i]
  }

  // Si no es un elemento estático, inicializa un objeto para el resultado
  let obj = {str: str, codigo: 0, tipo: 0, simbolo: ''}
  
  // Verifica si es una constante numérica mediante expresión regular
  const regexNumber = /^-?[0-9]+(\.[0-9]+)?$/  
  if (regexNumber.test(str)) {
    obj.codigo=61         // Código para constantes numéricas
    obj.tipo= 6           // Tipo 6: constantes
    obj.simbolo="d"       // Símbolo para visualización
    return obj
  }
  
  // Verifica si es una constante alfanumérica (texto entre comillas)
  const regexAlfaConst = /[^\']*'/g;
  if (regexAlfaConst.test(str)) {
    obj.codigo=62         // Código para constantes alfanuméricas
    obj.tipo= 6           // Tipo 6: constantes
    obj.simbolo="a"       // Símbolo para visualización
    return obj
  }
  
  // Verifica si es un identificador válido
  const regexIdentif = /^[a-zA-Z0-9_]+$/;
  if (regexIdentif.test(str)) {
    obj.tipo=4            // Tipo 4: identificadores
    obj.codigo=400        // Código base para identificadores
    obj.simbolo="i"       // Símbolo para visualización
    return obj
  }
  
  return obj    // Si no coincide con nada, devuelve objeto con tipo 0 (error)
}

/**
 * Realiza el análisis sintáctico usando una tabla de análisis predictivo
 * @return {string} - Mensaje de éxito o error
 */
function parser() {
  // Inicialización para el algoritmo de parsing
  parserResults = []                // Limpia resultados previos
  let pile = [199, 300];            // Inicializa la pila con $ (fin de entrada) y símbolo inicial (300)
  results.push({token: '$', codigo: 199, tipo: 199, simbolo: "$"}) // Agrega fin de entrada a los tokens
  let rowRsl = 0;                   // Índice para recorrer la tabla de tokens
  let pileItem = ''                 // Elemento actual de la pila
  let rslItemCode = ''              // Código del token actual
  let prodTS = []                   // Producción de la tabla sintáctica

  // Bucle principal del análisis sintáctico
  do {
    // Prepara cadenas para mostrar estado actual del análisis
    let strPile = ''                // Cadena para mostrar contenido de la pila
    pile.map(item => { strPile += (getSymbol(item) + ' ') })
    
    let strLexTable = ''            // Cadena para mostrar tokens restantes
    let lexTable = results.filter((item, i) => i >= rowRsl)
    lexTable.map(item => strLexTable += (item.simbolo + ' '))   

    // Prepara cadena para mostrar la producción aplicada
    let strProduccion = ''
    if(prodTS.length > 0) {
      strProduccion = getSymbol(prodTS[0].regla) + " → "
      prodTS[0].produccion.map(item => { strProduccion += getSymbol(item) })   
    }

    // Guarda el estado actual para visualización
    parserResults.push({
      pila: strPile,
      lexTable: strLexTable,
      x: pileItem,               // Último elemento extraído de la pila
      k: rslItemCode,            // Token actual
      produccion: strProduccion  // Producción aplicada
    })

    // Extrae el tope de la pila y obtiene el código del token actual
    pileItem = pile.pop()        
    rslItemCode = (results[rowRsl].tipo == 4 || results[rowRsl].tipo == 8) ? 
                  results[rowRsl].tipo : results[rowRsl].codigo 
    prodTS=[]                    // Reinicia la producción

    // Primer caso: si es un terminal o fin de entrada
    if(pileItem < 300 || pileItem >= 400 || pileItem == 199) {  
      if(pileItem == rslItemCode) {  // Si coincide con el token actual
        rowRsl++                     // Avanza al siguiente token
      }
      else {                         // Error: no coincide con lo esperado
        let itemSpected = staticElements.filter(item => item.codigo == pileItem)
        addParserErrWithContext(results[rowRsl].row, itemSpected[0].tipo, rowRsl)
        return(`ERROR: Se esperaba ${pileItem}`)  // Retorna mensaje de error
      }
    }
    // Segundo caso: es un no terminal (regla de producción)
    else { 
      // Busca la producción en la tabla sintáctica
      prodTS = syntacticTable.filter(itemTS => itemTS.regla == pileItem && itemTS.lex == rslItemCode)  
      
      if (prodTS.length > 0) {       // Si se encontró una producción
        if(prodTS[0].produccion[0] != 99) {  // Si no es lambda (ε)
          // Añade los símbolos de la producción a la pila en orden inverso
          for(let i = prodTS[0].produccion.length; i > 0; i--) { 
            pile.push(prodTS[0].produccion[i-1])  
          }
        }
      }
      else {                         // Error: no hay producción para esta combinación
        // Busca producciones esperadas para generar mensaje de error
        let lexExpected = syntacticTable.filter(item => item.regla == pileItem && item.lex !== 99)
        let itemSpected = staticElements.filter(item => item.codigo == lexExpected[0].lex)
        addParserErrWithContext(results[rowRsl].row, itemSpected[0].tipo, rowRsl)
        return(`Error de sintaxis, cerca de renglon: ${results[rowRsl].row}, token ${results[rowRsl].token}`)
      }
    }
  } while(pileItem != 199)  // Continúa hasta encontrar el fin de entrada ($)
  
  // Si llega aquí, el análisis fue exitoso
  errors.push({row: 0, codigo: 200, descripcion: "Sin error"})
  return("PARSER DML: No se encontraron errores")
}

/**
 * Añade un error sintáctico según el tipo de elemento esperado, con contexto adicional
 * @param {number} renglon - Número de línea donde ocurrió el error
 * @param {number} itemType - Tipo de elemento esperado
 * @param {number} currentRowRsl - Índice actual en la tabla de tokens
 */
function addParserErrWithContext(renglon, itemType, currentRowRsl) {
  // Verificar si estamos en el caso específico de "AND A" seguido por un paréntesis
  let isInCondition = false;
  
  // Intentar identificar si estamos después de AND y antes de un subquery
  if (itemType == 8) { // Si se esperaba un operador relacional
    // Buscar en los tokens anteriores si hay un AND reciente
    for (let i = currentRowRsl - 2; i >= Math.max(0, currentRowRsl - 5); i--) {
      if (results[i] && (results[i].codigo === 14 || results[i].token === 'AND')) {
        // Si después del AND hay un identificador y luego un paréntesis de apertura
        if (results[i+1] && results[i+1].tipo === 4 && 
            results[currentRowRsl] && results[currentRowRsl].codigo === 52) {
          isInCondition = true;
          break;
        }
      }
    }
  }

  if (isInCondition) {
    // En este caso específico, cambiamos el mensaje de error
    errors.push({row: renglon, codigo: 201, descripcion: `ERROR: Se esperaba palabra reservada.`});
  } else {
    // Usamos la función original para otros casos
    addParserErr(renglon, itemType);
  }
}

/**
 * Obtiene el símbolo correspondiente a un código
 * @param {number} code - Código numérico
 * @return {string} - Símbolo correspondiente
 */
function getSymbol(code) {
  if (code < 300 || code >= 400)   // Si es terminal
    return staticElements.filter(item => item.codigo == code || item.tipo == code)[0].simbolo
  else                             // Si es no terminal (regla)
    return glcTable.filter(item => item.regla == code)[0].simbolo
}

/**
 * Añade un error sintáctico según el tipo de elemento esperado
 * @param {number} renglon - Número de línea donde ocurrió el error
 * @param {number} itemType - Tipo de elemento esperado
 */
function addParserErr(renglon, itemType) {
  if(itemType == 1)
    errors.push({row: renglon, codigo: 201,  descripcion: `ERROR: Se esperaba palabra reservada.`})
  if(itemType == 4)
    errors.push({row: renglon, codigo: 204,  descripcion: `ERROR: Se esperaba identificador.`})
  if(itemType == 5)
    errors.push({row: renglon, codigo: 205,  descripcion: `ERROR: Se esperaba delimitador.`})
  if(itemType == 6)
    errors.push({row: renglon, codigo: 206,  descripcion: `ERROR: Se esperaba constante.`})
  if(itemType == 7)
    errors.push({row: renglon, codigo: 207,  descripcion: `ERROR: Se esperaba operador.`})
  if(itemType == 8)
    errors.push({row: renglon, codigo: 208,  descripcion: `ERROR: Se esperaba operador relacional`})
}

/**
 * Muestra los resultados del análisis léxico en las tablas HTML
 */
function showResults() {
  //Modulo de resultados
  
  // Tabla de tokens
  let strTable = ''
  let tbody = document.querySelector("#resultsTable tbody")
  for(let i=0; i<results.length; i++) {
    strTable += `
      <tr class="${results[i].tipo === 0 ? 'error-row' : ''}">
          <td>${i+1}</td>
          <td>${results[i].row}</td>
          <td>${results[i].token}</td>
          <td>${results[i].tipo}</td>
          <td>${results[i].valor}</td>
      </tr>`
  }
  tbody.innerHTML=strTable    

  // Tabla de errores
  strTable = ''
  let errBodyParser = document.querySelector("#errorsTable tbody")
  for(let i=0; i<errors.length; i++) {
    strTable += `
      <tr>
          <td>${errors[i].row}</td>
          <td>${errors[i].codigo}</td>
          <td>${errors[i].descripcion}</td>
      </tr>`
  }
  errBodyParser.innerHTML=strTable    
  
  // Tabla de identificadores
  strTable = ''
  let tbodyIdent = document.querySelector("#identifiersTable tbody")    
  for(let i=0; i<identifResults.length; i++) {
    strTable += `
    <tr>
        <td>${identifResults[i].row}</td>
        <td>${identifResults[i].token}</td>
        <td>${identifResults[i].valor}</td>
        <td>${identifResults[i].codigo}</td>
    </tr>`
  }
  tbodyIdent.innerHTML=strTable

  // Tabla de constantes
  strTable = ''
  let tbodyConst = document.querySelector("#constantsTable tbody")    
  for(let i=0; i<constResults.length; i++) {
    strTable += `
    <tr>
        <td>${constResults[i].row}</td>
        <td>${constResults[i].token}</td>
        <td>${constResults[i].valor}</td>
        <td>${constResults[i].codigo}</td>
    </tr>`
  }
  tbodyConst.innerHTML=strTable
}

/**
 * Muestra los resultados del análisis sintáctico en las tablas HTML
 */
function showResultsParser() {
  // Tabla del proceso de parsing
  let strTable = ''
  let tbodyParser = document.querySelector("#parserTable tbody")
  for(let i=0; i<parserResults.length; i++) {
    strTable += `
      <tr>
          <td>${i+1}</td>
          <td>${parserResults[i].pila}</td>
          <td>${parserResults[i].lexTable}</td>
          <td>${parserResults[i].x}</td>
          <td>${parserResults[i].k}</td>
          <td>${parserResults[i].produccion}</td>
      </tr>`
  }
  tbodyParser.innerHTML=strTable    

  // Tabla de errores del parser
  strTable = ''
  let errBodyParser = document.querySelector("#errParserTable tbody")
  for(let i=0; i<errors.length; i++) {
    strTable += `
      <tr>
          <td>${errors[i].row}</td>
          <td>${errors[i].codigo}</td>
          <td>${errors[i].descripcion}</td>
      </tr>`
  }
  errBodyParser.innerHTML=strTable    
}

/**
 * Array de elementos estáticos: palabras reservadas, operadores, delimitadores, etc.
 * Cada elemento tiene: cadena original, código numérico, tipo y símbolo para visualización
 */
const staticElements = [
  // Palabras reservadas (tipo 1)
  {str: 'SELECT', codigo: 10, tipo: 1, simbolo: 's'},
  {str: 'FROM', codigo: 11, tipo: 1, simbolo: 'f'},
  {str: 'WHERE', codigo: 12, tipo: 1, simbolo: 'w'},
  {str: 'IN', codigo: 13, tipo: 1, simbolo: 'n'},
  {str: 'AND', codigo: 14, tipo: 1, simbolo: 'y'},
  {str: 'OR', codigo: 15, tipo: 1, simbolo: 'o'},
  {str: 'CREATE', codigo: 16, tipo: 1, simbolo: 'c'}, 
  {str: 'TABLE', codigo: 17, tipo: 1, simbolo: 't'},
  {str: 'CHAR', codigo: 18, tipo: 1, simbolo: 'h'},
  {str: 'NUMERIC', codigo: 19, tipo: 1, simbolo: 'u'},
  {str: 'NOT', codigo: 20, tipo: 1, simbolo: 'e'},
  {str: 'NULL', codigo: 21, tipo: 1, simbolo: 'g'},
  {str: 'CONSTRAINT', codigo: 22, tipo: 1, simbolo: 'b'},
  {str: 'KEY', codigo: 23, tipo: 1, simbolo: 'k'},
  {str: 'PRIMARY', codigo: 24, tipo: 1, simbolo: 'p'},
  {str: 'FOREIGN', codigo: 25, tipo: 1, simbolo: 'j'},
  {str: 'REFERENCES', codigo: 26, tipo: 1, simbolo: 'l'},
  {str: 'INSERT', codigo: 27, tipo: 1, simbolo: 'm'},
  {str: 'INTO', codigo: 28, tipo: 1, simbolo: 'q'},
  {str: 'VALUES', codigo: 29, tipo: 1, simbolo: 'v'},
  // Delimitadores (tipo 5)
  {str: ',', codigo: 50, tipo: 5, simbolo: ','},
  {str: '.', codigo: 51, tipo: 5, simbolo: '.'},
  {str: '(', codigo: 52, tipo: 5, simbolo: '('},
  {str: ')', codigo: 53, tipo: 5, simbolo: ')'},
  {str: "'", codigo: 54, tipo: 5, simbolo: "'"},
  {str: ";", codigo: 55, tipo: 5, simbolo: ";"},
  // Operadores aritméticos (tipo 7)
  {str: '+', codigo: 70, tipo: 7, simbolo: '+'},
  {str: '-', codigo: 71, tipo: 7, simbolo: '-'},
  {str: '*', codigo: 72, tipo: 7, simbolo: '*'},
  {str: '/', codigo: 73, tipo: 7, simbolo: '/'},
  // Operadores relacionales (tipo 8)
  {str: '>', codigo: 81, tipo: 8, simbolo: '>'},
  {str: '<', codigo: 82, tipo: 8, simbolo: '<'},
  {str: '=', codigo: 83, tipo: 8, simbolo: '='},
  {str: '>=', codigo: 84, tipo: 8, simbolo: '>='},
  {str: '<=', codigo: 85, tipo: 8, simbolo: '<='},
  // Elementos genéricos para buscar por tipo
  {str: '', codigo: 8, tipo: 8, simbolo: '8'},
  {str: '', codigo: 4, tipo: 4, simbolo: 'i'},
  {str: '', codigo: 61, tipo: 6, simbolo: 'd'},
  {str: '', codigo: 62, tipo: 6, simbolo: 'a'},
  {str: '', codigo: 199, tipo: 199, simbolo: '$'},
  {str: '', codigo: 99, tipo: 99, simbolo: 'λ'},  // Lambda (ε) para producciones vacías
]

/**
 * Tabla de la gramática libre de contexto
 * Define todas las reglas de producción para el lenguaje SQL soportado
 */
const glcTable = [
  {regla: 300, producciones: [[10, 301, 11, 306, 310]], simbolo: "Q"},  // Q → s A f F J
  {regla: 301, producciones: [[302],[72]], simbolo: "A"},               // A → B | *
  {regla: 302, producciones: [[304, 303]], simbolo: "B"},               // B → C D
  {regla: 303, producciones: [[50, 302], [99]], simbolo: "D"},          // D → , B | λ
  {regla: 304, producciones: [[4, 305]], simbolo: "C"},                 // C → i E
  {regla: 305, producciones: [[51, 4], [99]], simbolo: "E"},            // E → . i | λ
  {regla: 306, producciones: [[308, 307]], simbolo: "F"},               // F → G H
  {regla: 307, producciones: [[50, 306], [99]], simbolo: "H"},          // H → , F | λ
  {regla: 308, producciones: [[4, 309]], simbolo: "G"},                 // G → i I
  {regla: 309, producciones: [[4], [99]], simbolo: "I"},                // I → i | λ
  {regla: 310, producciones: [[12, 311], [99]], simbolo: "J"},          // J → w K | λ
  {regla: 311, producciones: [[313, 312]], simbolo: "K"},               // K → L V
  {regla: 312, producciones: [[317, 311], [99]], simbolo: "V"},         // V → P K | λ
  {regla: 313, producciones: [[304, 314]], simbolo: "L"},               // L → C M
  {regla: 314, producciones: [[315, 316], [13, 52, 300, 53]], simbolo: "M"},  // M → N O | n ( Q )
  {regla: 315, producciones: [[8]], simbolo: "N"},                      // N → 8
  {regla: 316, producciones: [[304], [54, 318, 54], [319]], simbolo: "O"},  // O → C | ' R ' | T
  {regla: 317, producciones: [[14], [15]], simbolo: "P"},               // P → y | o
  {regla: 318, producciones: [[62]], simbolo: "R"},                     // R → a
  {regla: 319, producciones: [[61]], simbolo: "T"}                      // T → d
]

/**
 * Tabla sintáctica para el análisis predictivo
 * Mapea combinaciones de [regla, token] a producciones
 */
const syntacticTable = [
  // Para cada regla y token de entrada, indica la producción a aplicar
  {regla: 300, lex: 10, produccion: [10, 301, 11, 306, 310]},  // Q(SELECT) → SELECT A FROM F J
  {regla: 301, lex: 4, produccion: [302]},                     // A(i) → B
  {regla: 301, lex: 72, produccion: [72]},                     // A(*) → *
  {regla: 302, lex: 4, produccion: [304, 303]},                // B(i) → C D
  {regla: 303, lex: 11, produccion: [99]},                     // D(FROM) → λ
  {regla: 303, lex: 50, produccion: [50, 302]},                // D(,) → , B
  {regla: 303, lex: 199, produccion: [99]},                    // D($) → λ
  {regla: 304, lex: 4, produccion: [4, 305]},                  // C(i) → i E
  {regla: 305, lex: 8, produccion: [99]},                      // E(8) → λ
  {regla: 305, lex: 11, produccion: [99]},                     // E(FROM) → λ
  {regla: 305, lex: 13, produccion: [99]},                     // E(IN) → λ
  {regla: 305, lex: 14, produccion: [99]},                     // E(AND) → λ
  {regla: 305, lex: 15, produccion: [99]},                     // E(OR) → λ
  {regla: 305, lex: 50, produccion: [99]},                     // E(,) → λ
  {regla: 305, lex: 51, produccion: [51, 4]},                  // E(.) → . i
  {regla: 305, lex: 53, produccion: [99]},                     // E()) → λ
  {regla: 305, lex: 199, produccion: [99]},                    // E($) → λ
  {regla: 306, lex: 4, produccion: [308, 307]},                // F(i) → G H
  {regla: 307, lex: 12, produccion: [99]},                     // H(WHERE) → λ
  {regla: 307, lex: 50, produccion: [50, 306]},                // H(,) → , F
  {regla: 307, lex: 53, produccion: [99]},                     // H()) → λ
  {regla: 307, lex: 199, produccion: [99]},                    // H($) → λ
  {regla: 308, lex: 4, produccion: [4, 309]},                  // G(i) → i I
  {regla: 309, lex: 4, produccion: [4]},                       // I(i) → i
  {regla: 309, lex: 12, produccion: [99]},                     // I(WHERE) → λ
  {regla: 309, lex: 50, produccion: [99]},                     // I(,) → λ
  {regla: 309, lex: 53, produccion: [99]},                     // I()) → λ
  {regla: 309, lex: 199, produccion: [99]},                    // I($) → λ
  {regla: 310, lex: 12, produccion: [12, 311]},                // J(WHERE) → WHERE K
  {regla: 310, lex: 53, produccion: [99]},                     // J()) → λ
  {regla: 310, lex: 199, produccion: [99]},                    // J($) → λ
  {regla: 311, lex: 4, produccion: [313, 312]},                // K(i) → L V
  {regla: 312, lex: 14, produccion: [317, 311]},               // V(AND) → P K
  {regla: 312, lex: 15, produccion: [317, 311]},               // V(OR) → P K
  {regla: 312, lex: 53, produccion: [99]},                     // V()) → λ
  {regla: 312, lex: 199, produccion: [99]},                    // V($) → λ
  {regla: 313, lex: 4, produccion: [304, 314]},                // L(i) → C M
  {regla: 314, lex: 8, produccion: [315, 316]},                // M(8) → N O
  {regla: 314, lex: 13, produccion: [13, 52, 300, 53]},        // M(IN) → IN ( Q )
  {regla: 315, lex: 8, produccion: [8]},                       // N(8) → 8
  {regla: 316, lex: 4, produccion: [304]},                     // O(i) → C
  {regla: 316, lex: 54, produccion: [54, 318, 54]},            // O(') → ' R '
  {regla: 316, lex: 61, produccion: [319]},                    // O(d) → T
  {regla: 317, lex: 14, produccion: [14]},                     // P(AND) → AND
  {regla: 317, lex: 15, produccion: [15]},                     // P(OR) → OR
  {regla: 318, lex: 62, produccion: [62]},                     // R(a) → a
  {regla: 319, lex: 61, produccion: [61]}                      // T(d) → d
]

/**
 * Manejador de eventos para el botón de limpiar
 * Limpia todas las áreas de texto y tablas
 */
document.getElementById('clear-all-btn').addEventListener('click', function () {
  // Limpiar el área de entrada de texto
  const inputArea = document.getElementById('textToEval');
  if (inputArea) inputArea.value = '';

  // Lista de IDs de tablas que se deben limpiar
  const tablesToClear = [
    'resultsTable',       // Tabla de resultados generales
    'errorsTable',        // Tabla de errores léxicos
    'identifiersTable',   // Tabla de identificadores
    'constantsTable',     // Tabla de constantes
    'parserTable',        // Tabla del proceso de parsing
    'errParserTable'      // Tabla de errores sintácticos
  ];

  // Recorre cada tabla y limpia su contenido
  tablesToClear.forEach(id => {
    const table = document.getElementById(id);
    if (table) {
      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = ''; // Borra todas las filas de la tabla
      }
    }
  });
});