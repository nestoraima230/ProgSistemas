let ddlConstResults = [];
let ddlIdentifResults = [];
let ddlResults = [];
let ddlErrors = [];
// let ddlParserResults = [];

// Tabla de elementos estáticos para DDL
const ddlStaticElements = [
    // Palabras reservadas (tipo 1)
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
    
    // Operadores (tipo 2)
    {str: '+', codigo: 70, tipo: 2, simbolo: '+'},
    {str: '-', codigo: 71, tipo: 2, simbolo: '-'},
    {str: '*', codigo: 72, tipo: 2, simbolo: '*'},
    {str: '/', codigo: 73, tipo: 2, simbolo: '/'},
    {str: '=', codigo: 74, tipo: 2, simbolo: '='},
    
    // Operadores relacionales (tipo 3)
    {str: '<', codigo: 80, tipo: 3, simbolo: '<'},
    {str: '>', codigo: 81, tipo: 3, simbolo: '>'},
    {str: '<=', codigo: 82, tipo: 3, simbolo: '≤'},
    {str: '>=', codigo: 83, tipo: 3, simbolo: '≥'},
    {str: '==', codigo: 84, tipo: 3, simbolo: '≡'},
    {str: '!=', codigo: 85, tipo: 3, simbolo: '≠'},
    
    // Delimitadores (tipo 5)
    {str: ',', codigo: 50, tipo: 5, simbolo: ','},
    {str: '.', codigo: 51, tipo: 5, simbolo: '.'},
    {str: '(', codigo: 52, tipo: 5, simbolo: '('},
    {str: ')', codigo: 53, tipo: 5, simbolo: ')'},
    {str: "'", codigo: 54, tipo: 5, simbolo: "'"},
    {str: ";", codigo: 55, tipo: 5, simbolo: ";"},
    
    // Constantes (tipo 6)
    {str: '', codigo: 61, tipo: 6, simbolo: 'd'},  // numéricas
    {str: '', codigo: 62, tipo: 6, simbolo: 'a'},  // alfanuméricas
    
    // Elementos genéricos
    {str: '', codigo: 4, tipo: 4, simbolo: 'i'},   // identificadores
    {str: '', codigo: 199, tipo: 199, simbolo: '$'}, // fin de entrada
    {str: '', codigo: 99, tipo: 99, simbolo: 'λ'}  // lambda (producción vacía)
];

// Gramática Libre de Contexto para DDL
const ddlGlcTable = [
    {regla: 200, producciones: [[16, 17, 4, 52, 202, 53, 55, 201]], simbolo: "C"},
    {regla: 201, producciones: [[200], [211], [99]], simbolo: "B"},
    {regla: 202, producciones: [[4, 203, 52, 61, 53, 204, 205]], simbolo: "A"},
    {regla: 203, producciones: [[18], [19]], simbolo: "D"},
    {regla: 204, producciones: [[20, 21], [99]], simbolo: "E"},
    {regla: 205, producciones: [[50, 206], [99]], simbolo: "F"},
    {regla: 206, producciones: [[202], [207]], simbolo: "G"},
    {regla: 207, producciones: [[22, 4, 208, 52, 4, 53, 209]], simbolo: "H"},
    {regla: 208, producciones: [[24, 23], [25, 23]], simbolo: "J"},
    {regla: 209, producciones: [[50, 207], [26, 4, 52, 4, 53, 210], [99]], simbolo: "K"},
    {regla: 210, producciones: [[50, 207], [99]], simbolo: "L"},
    {regla: 211, producciones: [[27, 28, 4, 29, 52, 212, 53, 55, 215]], simbolo: "I"},
    {regla: 212, producciones: [[213, 214]], simbolo: "M"},
    {regla: 213, producciones: [[54, 62, 54], [61]], simbolo: "O"},
    {regla: 214, producciones: [[50, 212], [99]], simbolo: "P"},
    {regla: 215, producciones: [[211], [200], [99]], simbolo: "N"}
];

// Tabla Sintáctica para DDL
const ddlSyntacticTable = [
    {regla: 200, lex: 16, produccion: [16, 17, 4, 52, 202, 53, 55, 201]},
    {regla: 201, lex: 16, produccion: [200]},
    {regla: 201, lex: 27, produccion: [211]},
    {regla: 201, lex: 199, produccion: [99]},
    {regla: 202, lex: 4, produccion: [4, 203, 52, 61, 53, 204, 205]},
    {regla: 203, lex: 18, produccion: [18]},
    {regla: 203, lex: 19, produccion: [19]},
    {regla: 204, lex: 20, produccion: [20, 21]},
    {regla: 204, lex: 50, produccion: [99]},
    {regla: 204, lex: 53, produccion: [99]},
    {regla: 205, lex: 50, produccion: [50, 206]},
    {regla: 205, lex: 53, produccion: [99]},
    {regla: 206, lex: 4, produccion: [202]},
    {regla: 206, lex: 22, produccion: [207]},
    {regla: 207, lex: 22, produccion: [22, 4, 208, 52, 4, 53, 209]},
    {regla: 208, lex: 24, produccion: [24, 23]},
    {regla: 208, lex: 25, produccion: [25, 23]},
    {regla: 209, lex: 50, produccion: [50, 207]},
    {regla: 209, lex: 26, produccion: [26, 4, 52, 4, 53, 210]},
    {regla: 209, lex: 53, produccion: [99]},
    {regla: 210, lex: 50, produccion: [50, 207]},
    {regla: 210, lex: 53, produccion: [99]},
    {regla: 211, lex: 27, produccion: [27, 28, 4, 29, 52, 212, 53, 55, 215]},
    {regla: 212, lex: 54, produccion: [213, 214]},
    {regla: 212, lex: 61, produccion: [213, 214]},
    {regla: 213, lex: 54, produccion: [54, 62, 54]},
    {regla: 213, lex: 61, produccion: [61]},
    {regla: 214, lex: 50, produccion: [50, 212]},
    {regla: 214, lex: 53, produccion: [99]},
    {regla: 215, lex: 27, produccion: [211]},
    {regla: 215, lex: 16, produccion: [200]},
    {regla: 215, lex: 199, produccion: [99]}
];

function ddlScanner() {
    let identifValue = 401;
    let constValue = 601;
    let text = document.getElementById("textToEval").value.toUpperCase();
    let linesText = text.split('\n');
    
    ddlConstResults = [];
    ddlIdentifResults = [];
    ddlResults = [];
    ddlErrors = [];

    for(let renglon = 0; renglon < linesText.length; renglon++) {
        // Actualizado para capturar operadores relacionales como tokens individuales
        const regex = />=|<=|!=|==|[+\-*/=<>]|[A-Z0-9_]+|[+-]?[0-9]*\.?[0-9]+|'[^']*'|[^A-Z0-9\s]/g;
        let strFound = linesText[renglon].match(regex);
        
        if (strFound !== null) {
            for(let j = 0; j < strFound.length; j++) {
                let str = strFound[j];
                let strType = ddlGetStrType(str);
                let rowToAdd;
                let value = strType.codigo;
                
                if(strType.tipo == 4) { 
                    let pos = -1;
                    for(let i = 0; i < ddlIdentifResults.length; i++) {
                        if(ddlIdentifResults[i].token == str) {
                            ddlIdentifResults[i].row += `, ${renglon+1}`;
                            pos = i;
                            value = ddlIdentifResults[i].valor;
                        }
                    }
                    if(pos == -1) {
                        value = identifValue;
                        rowToAdd = {row: renglon+1, token: str, valor: identifValue++, codigo: strType.codigo};
                        ddlIdentifResults.push(rowToAdd);
                    }
                }

                if(strType.tipo == 6) {  
                    value = constValue;
                    if(strType.codigo == 62)
                        str = str.replaceAll("'", "");
                    rowToAdd = {row: renglon+1, token: str, valor: constValue++, codigo: strType.codigo};
                    ddlConstResults.push(rowToAdd);
                }

                if(strType.tipo > 0) {
                    if(strType.codigo == 62) {
                        ddlResults.push({row: renglon+1, token: "'", tipo: 5, codigo: 54, valor: value, simbolo: "'"});
                    }

                    rowToAdd = {
                        row: renglon+1, 
                        token: (strType.codigo==62 ? 'CONSTANTE' : str),
                        tipo: strType.tipo, 
                        codigo: strType.codigo, 
                        valor: value,
                        simbolo: strType.simbolo || str
                    };
                    ddlResults.push(rowToAdd);
                    
                    if(strType.codigo == 62) {
                        ddlResults.push({row: renglon+1, token: "'", tipo: 5, codigo: 54, valor: value, simbolo: "'"});
                    }
                } else {
                    rowToAdd = {row: renglon+1, codigo: 101, descripcion: "Símbolo desconocido"};
                    ddlErrors.push(rowToAdd);
                }
            } 
        }
    }
}

function ddlGetStrType(str) {
    for(let i = 0; i < ddlStaticElements.length; i++) {
        if(ddlStaticElements[i].str === str) return ddlStaticElements[i];
    }

    let obj = {str: str, codigo: 0, tipo: 0, simbolo: ''};
    
    const regexNumber = /^-?[0-9]+(\.[0-9]+)?$/;
    if (regexNumber.test(str)) {
        obj.codigo = 61;
        obj.tipo = 6;
        obj.simbolo = "d";
        return obj;
    }
    
    const regexAlfaConst = /[^\']*'/g;
    if (regexAlfaConst.test(str)) {
        obj.codigo = 62;
        obj.tipo = 6;
        obj.simbolo = "a";
        return obj;
    }
    
    const regexIdentif = /^[a-zA-Z0-9_]+$/;
    if (regexIdentif.test(str)) {
        obj.tipo = 4;
        obj.codigo = 400;
        obj.simbolo = "i";
        return obj;
    }
    
    return obj;
}

function ddlGetSymbol(code) {
    const terminal = ddlStaticElements.find(item => item.codigo === code || item.tipo === code);
    if(terminal) return terminal.simbolo;
    
    const nonTerminal = ddlGlcTable.find(item => item.regla === code);
    if(nonTerminal) return nonTerminal.simbolo;
    
    return `[${code}]`;
}

function ddlAddParserErr(renglon, expectedCode, actualToken) {
    
    expectedCode = parseInt(expectedCode);
    //Para debug
    console.log(`DEBUG → Línea ${renglon}, expectedCode: ${expectedCode}, actualToken: ${actualToken.token}`);


    const errorTypes = {
        // Palabras reservadas
        16: { tipo: 1, desc: "Palabra Reservada 'CREATE'" },
        17: { tipo: 1, desc: "Palabra Reservada 'TABLE'" },
        18: { tipo: 1, desc: "Palabra Reservada 'CHAR'" },
        19: { tipo: 1, desc: "Palabra Reservada 'NUMERIC'" },
        20: { tipo: 1, desc: "Palabra Reservada 'NOT'" },
        21: { tipo: 1, desc: "Palabra Reservada 'NULL'" },
        22: { tipo: 1, desc: "Palabra Reservada 'CONSTRAINT'" },
        23: { tipo: 1, desc: "Palabra Reservada 'KEY'" },
        24: { tipo: 1, desc: "Palabra Reservada 'PRIMARY'" },
        25: { tipo: 1, desc: "Palabra Reservada 'FOREIGN'" },
        26: { tipo: 1, desc: "Palabra Reservada 'REFERENCES'" },
        27: { tipo: 1, desc: "Palabra Reservada 'INSERT'" },
        28: { tipo: 1, desc: "Palabra Reservada 'INTO'" },
        29: { tipo: 1, desc: "Palabra Reservada 'VALUES'" },

        // Delimitadores
        50: { tipo: 5, desc: "Delimitador ','" },
        51: { tipo: 5, desc: "Delimitador '.'" },
        52: { tipo: 5, desc: "Delimitador '('" },
        53: { tipo: 5, desc: "Delimitador ')'" },
        54: { tipo: 5, desc: "Delimitador \"'\"" },
        55: { tipo: 5, desc: "Delimitador ';'" },

        // Operadores
        70: { tipo: 2, desc: "Operador '+'" },
        71: { tipo: 2, desc: "Operador '-'" },
        72: { tipo: 2, desc: "Operador '*'" },
        73: { tipo: 2, desc: "Operador '/'" },
        74: { tipo: 2, desc: "Operador '='" },

        // Operadores relacionales
        80: { tipo: 3, desc: "Operador Relacional '<'" },
        81: { tipo: 3, desc: "Operador Relacional '>'" },
        82: { tipo: 3, desc: "Operador Relacional '<='" },
        83: { tipo: 3, desc: "Operador Relacional '>='" },
        84: { tipo: 3, desc: "Operador Relacional '=='" },
        85: { tipo: 3, desc: "Operador Relacional '!='" },

        // Otros elementos
        4: { tipo: 4, desc: "Identificador" },
        61: { tipo: 6, desc: "Constante Numérica" },
        62: { tipo: 6, desc: "Constante Alfanumérica" }
    };

    // CASO ESPECIAL: Insert con coma antes de cerrar paréntesis en VALUES
    if (actualToken.token === ')' && ddlResults.some(item => item.token === 'VALUES')) {
        const insertIndex = ddlResults.findIndex(item => item.token === 'INSERT');
        const valuesIndex = ddlResults.findIndex(item => item.token === 'VALUES');
        const currentIndex = ddlResults.findIndex(item => item === actualToken);

        if (insertIndex !== -1 && valuesIndex !== -1 && currentIndex > 0 &&
            ddlResults[currentIndex - 1].token === ',' &&
            currentIndex > valuesIndex) {

            const errorCode = 206;
            const errorDesc = "Constante";
            const paddedRow = String(renglon).padStart(2, '0');
            const errorMsg = `61:206 Línea ${paddedRow}. Se esperaba ${errorDesc}.`;

            ddlErrors.push({
                row: renglon,
                codigo: errorCode,
                descripcion: errorMsg
            });

            return errorMsg;
        }
    }

    // Resolver producciones esperadas si es un número de regla
    if (expectedCode >= 200) {
        const expectedProductions = ddlSyntacticTable.filter(item => item.regla === expectedCode);
        expectedCode = expectedProductions.length > 0 ? expectedProductions[0].lex : 1;
    }

    let errorType, errorCode, errorDesc;

    if (errorTypes[expectedCode]) {
        errorType = errorTypes[expectedCode].tipo;
        errorDesc = errorTypes[expectedCode].desc;

        switch (errorType) {
            case 1: errorCode = 201; break;
            case 2: errorCode = 207; break;
            case 3: errorCode = 208; break;
            case 4: errorCode = 204; break;
            case 5: errorCode = 205; break;
            case 6: errorCode = 206; break;
            default: errorCode = 209;
        }
    } else {
        errorCode = 209;
        errorDesc = "símbolo válido";
    }

    const paddedRow = String(renglon).padStart(2, '0');
    const errorMsg = `${expectedCode}:${errorCode} Línea ${paddedRow}. Se esperaba ${errorDesc}.`;

    ddlErrors.push({
        row: renglon,
        codigo: errorCode,
        descripcion: errorMsg
    });

    return errorMsg;
}

// Modificación a la función ddlParser para corregir el error de paréntesis
function ddlParser() {
    ddlParserResults = [];
    let pile = [199, 200];
    ddlResults.push({token: '$', codigo: 199, tipo: 199, simbolo: "$"});
    let rowRsl = 0;
    let pileItem = '';
    let rslItemCode = '';
    let prodTS = [];

    let firstToken = ddlResults[0]?.token || '';
    if (firstToken === 'INSERT') {
        pile = [199, 201];
    }

    do {
        let strPile = '';
        pile.forEach(item => { strPile += (ddlGetSymbol(item) + ' '); });
        
        let strLexTable = '';
        let lexTable = ddlResults.filter((item, i) => i >= rowRsl);
        lexTable.forEach(item => strLexTable += (item.simbolo + ' '));

        let strProduccion = '';
        if(prodTS.length > 0) {
            strProduccion = ddlGetSymbol(prodTS[0].regla) + " → ";
            prodTS[0].produccion.forEach(item => { 
                if(item !== 99) strProduccion += ddlGetSymbol(item) + ' ';
            });
        }

        ddlParserResults.push({
            pila: strPile,
            lexTable: strLexTable,
            x: pileItem,
            k: rslItemCode,
            produccion: strProduccion
        });

        pileItem = pile.pop();
        rslItemCode = ddlResults[rowRsl].codigo;
        
        if(ddlResults[rowRsl].tipo === 4) rslItemCode = 4;
        if(ddlResults[rowRsl].tipo === 6) rslItemCode = ddlResults[rowRsl].codigo;
        
        prodTS = [];

        if(pileItem < 200 || pileItem >= 400 || pileItem == 199) {
            if(pileItem == rslItemCode) {
                rowRsl++;
            } else {
                // Aquí está la corrección para mostrar el error esperado
                const errorMsg = ddlAddParserErr(ddlResults[rowRsl].row, pileItem, ddlResults[rowRsl]);
                return errorMsg;
            }
        } else {
            prodTS = ddlSyntacticTable.filter(itemTS => 
                itemTS.regla == pileItem && itemTS.lex == rslItemCode
            );
            
            if (prodTS.length === 0 && pileItem === 201 && rslItemCode === 27) {
                prodTS = [{regla: 201, produccion: [211]}];
            }
            
            if (prodTS.length > 0) {
                if(prodTS[0].produccion[0] != 99) {
                    for(let i = prodTS[0].produccion.length - 1; i >= 0; i--) {
                        if(prodTS[0].produccion[i] !== 99) {
                            pile.push(prodTS[0].produccion[i]);
                        }
                    }
                }
            } else {
                const expectedProductions = ddlSyntacticTable.filter(item => item.regla == pileItem);
                
                if (expectedProductions.length > 0) {
                    const isNumericExpected = expectedProductions.some(prod => 
                        prod.lex === 19 || prod.lex === 18
                    );
                    
                    if (isNumericExpected && ddlResults[rowRsl].token === 'NUMERICO') {
                        const errorMsg = `19:201 Línea ${String(ddlResults[rowRsl].row).padStart(2, '0')}. Se esperaba Palabra Reservada 'NUMERIC'.`;
                        ddlErrors.push({
                            row: ddlResults[rowRsl].row,
                            codigo: 201,
                            descripcion: errorMsg
                        });
                        return errorMsg;
                    }
                    
                    // Si estamos esperando un valor constante después de una coma y encontramos un paréntesis de cierre
                    if (ddlResults[rowRsl].codigo === 53 && // Si el token actual es un paréntesis de cierre
                        pileItem === 212 && // Y estamos en la regla de valores
                        rowRsl > 0 && ddlResults[rowRsl-1].codigo === 50) { // Y el token anterior era una coma
                        
                        const errorMsg = `61:206 Línea ${String(ddlResults[rowRsl].row).padStart(2, '0')}. Se esperaba Constante.`;
                        ddlErrors.push({
                            row: ddlResults[rowRsl].row,
                            codigo: 206,
                            descripcion: errorMsg
                        });
                        return errorMsg;
                    }
                    
                    // Si esperamos una coma pero encontramos un punto y coma, puede ser que falte un paréntesis de cierre
                    if (ddlResults[rowRsl].codigo === 55 && // Si el token actual es un punto y coma
                        pileItem === 205 && pile.includes(53)) { // Y esperamos algo relacionado con la coma y hay un paréntesis abierto sin cerrar
                        
                        const errorMsg = `53:205 Línea ${String(ddlResults[rowRsl].row).padStart(2, '0')}. Se esperaba Delimitador ')'.`;
                        ddlErrors.push({
                            row: ddlResults[rowRsl].row,
                            codigo: 205,
                            descripcion: errorMsg
                        });
                        return errorMsg;
                    }
                    
                    const errorMsg = ddlAddParserErr(ddlResults[rowRsl].row, expectedProductions[0].lex, ddlResults[rowRsl]);
                    return errorMsg;
                } else {
                    const errorMsg = `0:209 Línea ${String(ddlResults[rowRsl].row).padStart(2, '0')}. Error de sintaxis, estructura inesperada.`;
                    ddlErrors.push({
                        row: ddlResults[rowRsl].row,
                        codigo: 209,
                        descripcion: errorMsg
                    });
                    return errorMsg;
                }
            }
        }
    } while(pileItem != 199);
    
    if(ddlErrors.length === 0) {
        ddlErrors.push({row: 0, codigo: 200, descripcion: "Sin error"});
        return "PARSER DDL: No se encontraron errores";
    }
}

// También necesitamos ajustar la función ddlAddParserErr para manejar mejor los casos específicos
function ddlAddParserErr(renglon, expectedCode, actualToken) {
    expectedCode = parseInt(expectedCode);
    
// Si se llega a un punto donde el token actual es ';' pero aún hay un paréntesis sin cerrar
if (actualToken.token === ';') {
    const opened = ddlResults.filter(tok => tok.token === '(').length;
    const closed = ddlResults.filter(tok => tok.token === ')').length;

    if (opened > closed) {
        // Hay más paréntesis abiertos que cerrados → falta un ')'
        const paddedRow = String(renglon).padStart(2, '0');
        const errorCode = 205;
        const errorMsg = `53:${errorCode} Línea ${paddedRow}. Se esperaba Delimitador ')'.`;

        ddlErrors.push({
            row: renglon,
            codigo: errorCode,
            descripcion: errorMsg
        });

        return errorMsg;
    }
}

    const errorTypes = {
        // Palabras reservadas
        16: { tipo: 1, desc: "Palabra Reservada 'CREATE'" },
        17: { tipo: 1, desc: "Palabra Reservada 'TABLE'" },
        18: { tipo: 1, desc: "Palabra Reservada 'CHAR'" },
        19: { tipo: 1, desc: "Palabra Reservada 'NUMERIC'" },
        20: { tipo: 1, desc: "Palabra Reservada 'NOT'" },
        21: { tipo: 1, desc: "Palabra Reservada 'NULL'" },
        22: { tipo: 1, desc: "Palabra Reservada 'CONSTRAINT'" },
        23: { tipo: 1, desc: "Palabra Reservada 'KEY'" },
        24: { tipo: 1, desc: "Palabra Reservada 'PRIMARY'" },
        25: { tipo: 1, desc: "Palabra Reservada 'FOREIGN'" },
        26: { tipo: 1, desc: "Palabra Reservada 'REFERENCES'" },
        27: { tipo: 1, desc: "Palabra Reservada 'INSERT'" },
        28: { tipo: 1, desc: "Palabra Reservada 'INTO'" },
        29: { tipo: 1, desc: "Palabra Reservada 'VALUES'" },
        
        // Delimitadores
        50: { tipo: 5, desc: "Delimitador ','" },
        51: { tipo: 5, desc: "Delimitador '.'" },
        52: { tipo: 5, desc: "Delimitador '('" },
        53: { tipo: 5, desc: "Delimitador ')'" },
        54: { tipo: 5, desc: "Delimitador \"'\"" },
        55: { tipo: 5, desc: "Delimitador ';'" },
        
        // Operadores
        70: { tipo: 2, desc: "Operador '+'" },
        71: { tipo: 2, desc: "Operador '-'" },
        72: { tipo: 2, desc: "Operador '*'" },
        73: { tipo: 2, desc: "Operador '/'" },
        74: { tipo: 2, desc: "Operador '='" },
        
        // Operadores relacionales
        80: { tipo: 3, desc: "Operador Relacional '<'" },
        81: { tipo: 3, desc: "Operador Relacional '>'" },
        82: { tipo: 3, desc: "Operador Relacional '<='" },
        83: { tipo: 3, desc: "Operador Relacional '>='" },
        84: { tipo: 3, desc: "Operador Relacional '=='" },
        85: { tipo: 3, desc: "Operador Relacional '!='" },
        
        // Otros elementos
        4: { tipo: 4, desc: "Identificador" },
        61: { tipo: 6, desc: "Constante Numérica" },
        62: { tipo: 6, desc: "Constante Alfanumérica" }
    };

    // Casos especiales para el contexto actual
    // Si estamos en un INSERT y el token actual es un paréntesis de cierre después de una coma
    if (actualToken.token === ')' && ddlResults.some(item => item.token === 'VALUES')) {
        // Buscar hacia atrás para ver si el token anterior fue una coma
        const currentIndex = ddlResults.findIndex(item => item === actualToken);
        if (currentIndex > 0 && ddlResults[currentIndex-1].token === ',') {
            errorCode = 206;
            errorDesc = "Constante";
            const paddedRow = String(renglon).padStart(2, '0');
            const errorMsg = `61:206 Línea ${paddedRow}. Se esperaba ${errorDesc}.`;
            
            ddlErrors.push({
                row: renglon,
                codigo: errorCode,
                descripcion: errorMsg
            });
            
            return errorMsg;
        }
    }

    if (expectedCode >= 200) {
        const expectedProductions = ddlSyntacticTable.filter(item => item.regla === expectedCode);
        if (expectedProductions.length > 0) {
            expectedCode = expectedProductions[0].lex;
        } else {
            expectedCode = 1;
        }
    }
    
    let errorType;
    let errorCode;
    let errorDesc;
    
    if (errorTypes[expectedCode]) {
        errorType = errorTypes[expectedCode].tipo;
        errorDesc = errorTypes[expectedCode].desc;
        
        switch (errorType) {
            case 1:
                errorCode = 201;
                break;
            case 2:
                errorCode = 207;  // Nuevo código para operadores
                break;
            case 3:
                errorCode = 208;  // Nuevo código para operadores relacionales
                break;
            case 4:
                errorCode = 204;
                break;
            case 5:
                errorCode = 205;
                break;
            case 6:
                errorCode = 206;
                break;
            default:
                errorCode = 209;
        }
    } else {
        errorCode = 209;
        errorDesc = "símbolo válido";
    }

    const paddedRow = String(renglon).padStart(2, '0');
    
    const errorMsg = `${expectedCode}:${errorCode} Línea ${paddedRow}. Se esperaba ${errorDesc}.`;
    
    ddlErrors.push({
        row: renglon,
        codigo: errorCode,
        descripcion: errorMsg
    });
    
    return errorMsg;
}

function ddlShowResults() {
    let strTable = '';
    let tbody = document.querySelector("#resultsTable tbody");
    for(let i = 0; i < ddlResults.length; i++) {
        strTable += `
            <tr class="${ddlResults[i].tipo === 0 ? 'error-row' : ''}">
                <td>${i+1}</td>
                <td>${ddlResults[i].row}</td>
                <td>${ddlResults[i].token}</td>
                <td>${ddlResults[i].tipo}</td>
                <td>${ddlResults[i].valor}</td>
            </tr>`;
    }
    tbody.innerHTML = strTable;

    strTable = '';
    let errBodyParser = document.querySelector("#errorsTable tbody");
    for(let i = 0; i < ddlErrors.length; i++) {
        // Agregar clases para resaltar distintos tipos de errores si es necesario
        let errorClass = "";
        switch(ddlErrors[i].codigo) {
            case 201: errorClass = "error-reserved"; break;
            case 204: errorClass = "error-identifier"; break;
            case 205: errorClass = "error-delimiter"; break;
            case 206: errorClass = "error-constant"; break;
            case 207: errorClass = "error-operator"; break;
            case 208: errorClass = "error-relational"; break;
            default: errorClass = "";
        }
        
        strTable += `
            <tr class="${errorClass}">
                <td>${ddlErrors[i].row}</td>
                <td>${ddlErrors[i].codigo}</td>
                <td>${ddlErrors[i].descripcion}</td>
            </tr>`;
    }
    errBodyParser.innerHTML = strTable;
    
    strTable = '';
    let tbodyIdent = document.querySelector("#identifiersTable tbody");
    for(let i = 0; i < ddlIdentifResults.length; i++) {
        strTable += `
        <tr>
            <td>${ddlIdentifResults[i].row}</td>
            <td>${ddlIdentifResults[i].token}</td>
            <td>${ddlIdentifResults[i].valor}</td>
            <td>${ddlIdentifResults[i].codigo}</td>
        </tr>`;
    }
    tbodyIdent.innerHTML = strTable;

    strTable = '';
    let tbodyConst = document.querySelector("#constantsTable tbody");
    for(let i = 0; i < ddlConstResults.length; i++) {
        strTable += `
        <tr>
            <td>${ddlConstResults[i].row}</td>
            <td>${ddlConstResults[i].token}</td>
            <td>${ddlConstResults[i].valor}</td>
            <td>${ddlConstResults[i].codigo}</td>
        </tr>`;
    }
    tbodyConst.innerHTML = strTable;
}

function ddlShowResultsParser() {
    let strTable = '';
    let tbodyParser = document.querySelector("#parserTable tbody");
    for(let i = 0; i < ddlParserResults.length; i++) {
        strTable += `
            <tr>
                <td>${i+1}</td>
                <td>${ddlParserResults[i].pila}</td>
                <td>${ddlParserResults[i].lexTable}</td>
                <td>${ddlParserResults[i].x}</td>
                <td>${ddlParserResults[i].k}</td>
                <td>${ddlParserResults[i].produccion}</td>
            </tr>`;
    }
    tbodyParser.innerHTML = strTable;

    strTable = '';
    let errBodyParser = document.querySelector("#errParserTable tbody");
    for(let i = 0; i < ddlErrors.length; i++) {
        strTable += `
            <tr>
                <td>${ddlErrors[i].row}</td>
                <td>${ddlErrors[i].codigo}</td>
                <td>${ddlErrors[i].descripcion}</td>
            </tr>`;
    }
    errBodyParser.innerHTML = strTable;
}

function analiza() {
    let inputText = document.getElementById("textToEval").value.trim();
    if (inputText === "") {
        alert("Por favor, ingresa una sentencia SQL.");
        return;
    }

    ddlConstResults = [];
    ddlIdentifResults = [];
    ddlResults = [];
    ddlErrors = [];
    ddlParserResults = [];

    ddlScanner();
    ddlShowResults();
    
    console.log("DEBUG → errores léxicos:", ddlErrors);

    if (ddlErrors.length === 0 || ddlErrors[0].codigo === 200) {
        let parserResult = ddlParser();
        ddlShowResultsParser();
        document.getElementById("parserTable").style.display = "table";
        document.getElementById("parserTitle").style.display = "block";
        alert(parserResult);
    } else {
        alert("Se encontraron errores léxicos. Corrígelos antes de ejecutar el parser.");
    }
}

function clearAll() {
    document.getElementById("textToEval").value = "";
    
    const tables = [
        "#resultsTable tbody",
        "#errorsTable tbody",
        "#identifiersTable tbody", 
        "#constantsTable tbody",
        "#errParserTable tbody"
    ];
    
    tables.forEach(selector => {
        const table = document.querySelector(selector);
        if (table) table.innerHTML = "";
    });
    
    ddlConstResults = [];
    ddlIdentifResults = [];
    ddlResults = [];
    ddlErrors = [];
}
document.getElementById("clear-all-btn").addEventListener("click", clearAll);