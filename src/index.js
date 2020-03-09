function eval() {
    // Do not use eval!!!
    return;
}

// Parse a string containing a math expression
// and return the array of tokens, e.g.:
// - expr: 12 + 7
// - return: [ 12, '+', 7 ]
function parseToTokens (expr) {
    const lexx = [ '(', ')', '+', '-', '*', '/' ];
    const digs = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
    let tokens = [];
    let number = '';

    for (let symbol of expr) {
        if (digs.includes(symbol)) {
            number += symbol;
            continue;
        }
        if (number != '') {
            tokens.push(+number);
            number = '';
        }
        if (lexx.includes(symbol)) {
            tokens.push(symbol);
            continue;
        }
        if (symbol == ' ') {
            continue;
        }
        throw Error("illegal symbol: '" + symbol + "'");
    }

    if (number != '') {
        tokens.push(+number);
    }

    return tokens;
}

// Get math expression as list of tokens,
// and convert in to Polish notation, e.g.:
// - tokens: [ 12, '+', 7 ]
// - return: [ 12, 7, '+' ]
function toPolish (tokens) {
    const highPriority = [ '*', '/' ];
    const lowPriority = [ '+', '-' ];

    let stack = [];
    let output = [];

    for (let token of tokens) {
        if (token === '(') {
            stack.push('(');
            continue;
        }
        if (token === ')') {
            // Here we pop all operators from stack
            // to output, until the stack is empty,
            // or we meet the opening parenthesis.
            // Note that such cycle may end for two
            // different reasons, so we use infinite
            // cycle with break (or it may throw).
            while (true) {
                if (stack.length === 0) {
                    throw Error('ExpressionError: Brackets must be paired');
                }
                let symbol = stack.pop();
                if (symbol === '(') {
                    break;
                }
                output.push(symbol);
            }
            continue;
        }
        if (typeof token === 'number') {
            output.push(token);
            continue;
        }
        if (lowPriority.includes(token)) {
            // Here we need to check the top symbol
            // on stack, and maybe move it to output.
            // Such check must be recursive, because
            // we may need to move several operators
            // (actually, up to 2 operators - in case
            // if top symbol was a higher-priority op,
            // and next to top was a low-priority op.)
            while (true) {
                if (stack.length === 0) {
                    break;
                }
                let symbol = stack[stack.length - 1];
                if (symbol === '(') {
                    break;
                }
                // OK, so the symbol on top of stack
                // is an operator of the same or higher
                // priority than the incoming token.
                // So we move it from stack to output:
                output.push(stack.pop());
            }
            // OK, stack is empty, or its top symbol is '('.
            // So we just put the incoming token to stack.
            stack.push(token);
            continue;
        }
        if (highPriority.includes(token)) {
            // Here we again check top symbol of stack,
            // and maybe move it to output - if it is a
            // high-priority operator.
            // Note that such check doesn't need to be
            // recursive, as we move at most 1 operator.
            if (stack.length === 0) {
                stack.push(token);
                continue;
            }
            let symbol = stack[stack.length - 1];
            if (symbol === '(') {
                stack.push(token);
                continue;
            }
            // Here we know, that stack is not empty,
            // and its top symbol is not the '('.
            // Thus, the top symbol is binary operator
            // of same or lower priority than token.
            // If its priority is high, then we move
            // it from stack to output.
            if (highPriority.includes(symbol)) {
                let temp = stack.pop();
                output.push(temp);
            }
            stack.push(token);
            continue;
        }
        throw Error('unknown token: ' + token);
    }

    while (stack.length > 0) {
        let temp = stack.pop();
        output.push(temp);
    }

    return output;
}

// Execute an expression in Polish notation
// E.g.:
// - polish: [ 12, 7, '+' ]
// - return: 19
function executePolish (polish) {
    const ops = {
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => x / y
    };
    let stack = [];
    for (let token of polish) {
        if (token in ops) {
            if (stack.length < 2) {
                throw Error('need at least 2 items in stack, but stack = [' + stack + ']');
            }
            let y = stack.pop();
            let x = stack.pop();
            if (token === '/' && y === 0) {
                throw Error('TypeError: Division by zero.');
            }
            let z = ops[token](x, y);
            stack.push(z);
        } else {
            // here, token is a number:
            stack.push(token);
        }
    }
    if (stack.length !== 1) {
        throw Error('ExpressionError: Brackets must be paired');
    }
    return stack.pop();
}

function expressionCalculator(expr) {
    let tokens = parseToTokens(expr);
    let polish = toPolish(tokens);
    let result = executePolish(polish);
    return result;
}

module.exports = {
    expressionCalculator
}
