// Tree-sitter grammar for the Harneet programming language (.ha)
// Minimal, WIP: covers comments, identifiers, numbers, strings, 
// declarations (var, function, type struct, import), control flow, 
// arrays, maps, typed arrays, simple expressions.

module.exports = grammar({
  name: 'harneet',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  supertypes: $ => [
    $.expression,
    $.literal,
    $.statement,
  ],

  // Only keep conflicts that are actually needed
  conflicts: $ => [
    // Parameters vs expressions inside parentheses (e.g., (x) => vs (x))
    [$.parameter, $.expression]
  ],

  rules: {
    source_file: $ => repeat($.statement),

    // Comments
    line_comment: _ => token(seq('//', /[^\n]*/)),
    block_comment: _ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    // Statements
    statement: $ => choice(
      $.var_declaration,
      $.function_declaration,
      $.type_struct_declaration,
      $.import_statement,
      $.expression_statement,
      $.block,
      $.for_in,
      $.if_statement,
      $.return_statement,
      $.match_statement,
    ),

    // Prefer blocks at statement start over map literals in ambiguous `{}` cases
    block: $ => prec(2, seq('{', repeat($.statement), '}')),

    // Declarations
    var_declaration: $ => seq(
      'var', field('name', $.identifier),
      optional(seq(':', field('type', $.type))),
      optional(seq('=', field('value', $.expression)))
    ),

    function_declaration: $ => seq(
      'function', field('name', $.identifier),
      field('params', $.parameter_list),
      optional(field('return_type', $.type_annotation)),
      field('body', $.block)
    ),

    // Anonymous function expression
    function_expression: $ => seq(
      'function',
      field('params', $.parameter_list),
      optional(field('return_type', $.type_annotation)),
      field('body', $.block)
    ),

    // Arrow function: (a, b) => expr or (a, b) => { ... }
    arrow_function: $ => seq(
      field('params', $.arrow_params),
      '=>',
      choice(field('body', $.expression), field('body', $.block))
    ),

    // Distinguish parameter parentheses from parenthesized expressions
    arrow_params: $ => choice(
      field('param', $.identifier),
      $.parenthesized_parameters
    ),

    parenthesized_parameters: $ => seq('(', optional(seq($.parameter, repeat(seq(',', $.parameter)))), ')'),

    type_struct_declaration: $ => seq(
      'type', field('name', $.type_identifier), 'struct',
      '{', repeat($.struct_field), '}'
    ),

    struct_field: $ => seq(field('name', $.identifier), field('type', $.type)),

    import_statement: $ => seq('import', field('module', $.identifier)),

    // Keep expression statements low-precedence to avoid conflicts with calls
    expression_statement: $ => prec.left(1, seq($.expression)),

    // Control flow
    if_statement: $ => seq('if', $.expression, $.block, optional(seq('else', $.block))),

    for_in: $ => seq(
      'for', choice(
        seq(field('name', $.identifier)),
        seq(field('key', $.identifier), ',', field('value', $.identifier))
      ),
      'in', field('iterable', $.expression),
      field('body', $.block)
    ),

    // Prefer consuming an expression after 'return' when possible (e.g., returning a map literal '{...}')
    return_statement: $ => prec.right(1, seq('return', optional($.expression))),

    match_statement: $ => seq(
      'match', $.expression,
      '{', repeat($.match_case), '}'
    ),

    match_case: $ => choice(
      seq($.array_pattern, '=>', $.expression, optional(';')),
      seq($.map_pattern, '=>', $.expression, optional(';')),
      seq('_', '=>', $.expression, optional(';')),
      seq($.identifier, '=>', $.expression, optional(';')),
      seq($.primitive_literal, '=>', $.expression, optional(';'))
    ),

    pattern: $ => choice(
      $.primitive_literal,
      '_',
      $.identifier,
      $.array_pattern,
      $.map_pattern
    ),

    // Make array/map patterns bind tighter than literal forms in ambiguous contexts
    array_pattern: $ => prec.dynamic(10, seq('[', optional(seq($.pattern, repeat(seq(',', $.pattern)))), ']')),
    map_pattern: $ => prec.dynamic(10, seq('{', optional(seq($.map_pattern_pair, repeat(seq(',', $.map_pattern_pair)))), '}')),
    map_pattern_pair: $ => seq($.expression, ':', $.pattern),

    // Expressions
    expression: $ => choice(
      $.call_expression,
      $.member_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.parenthesized_expression,
      $.function_expression,
      $.arrow_function,
      $.literal,
      $.identifier
    ),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    // Give function calls high precedence so `expr(` binds as a call, not as an expr-statement followed by '('.
    call_expression: $ => prec.left(9, seq(
      field('function', $.expression),
      field('arguments', $.argument_list)
    )),

    argument_list: $ => seq('(', optional(seq($.expression, repeat(seq(',', $.expression)))), ')'),

    member_expression: $ => prec.left(2, seq(
      field('object', $.expression), '.', field('property', $.identifier)
    )),

    assignment_expression: $ => prec.right(1, seq(
      field('left', $.lvalue),
      field('operator', choice('=', ':=')),
      field('right', $.expression)
    )),

    lvalue: $ => choice(
      $.identifier,
      $.index_expression,
      $.member_expression
    ),

    // Indexing should bind very tightly (tighter than calls/arrow boundaries)
    index_expression: $ => prec.left(10, seq(
      field('array', $.expression),
      '[', field('index', $.expression), ']'
    )),

    // Unary operators bind tighter than multiplicative
    unary_expression: $ => prec(8, seq(choice('+', '-', '!'), $.expression)),

    binary_expression: $ => {
      const table = [
        [5, choice('==', '!=', '<', '<=', '>', '>=' )],
        [6, choice('+', '-')],
        [7, choice('*', '/', '%')],
        [4, choice('and', 'or')],
      ];
      return choice(...table.map(([precLeft, operator]) =>
        prec.left(precLeft, seq($.expression, operator, $.expression))
      ));
    },

    // Literals
    literal: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.none,
      $.array_literal,
      $.typed_array_literal,
      $.map_literal
    ),

    // Primitive-only literals for patterns to avoid ambiguity with array/map patterns
    primitive_literal: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.none
    ),

    string: _ => token(seq('"', repeat(choice(/[^"\\\n]+/, /\\./)), '"')),
    number: _ => token(choice(/\d+\.\d+/, /\d+/)),
    boolean: _ => choice('true', 'false'),
    none: _ => choice('None', 'null'),

    // Split empty vs non-empty to resolve ambiguity with array_pattern '[]'
    array_literal: $ => choice(
      prec(1, seq('[', ']')),
      seq('[', seq($.expression, repeat(seq(',', $.expression))), ']')
    ),

    // typed array: Type[size]{ elements }
    typed_array_literal: $ => seq(
      field('element_type', $.type_identifier),
      '[', field('size', $.number), ']',
      '{', optional(seq($.expression, repeat(seq(',', $.expression)))), '}'
    ),

    map_literal: $ => prec(1, seq(
      '{', optional(seq($.map_pair, repeat(seq(',', $.map_pair)))), '}'
    )),

    map_pair: $ => seq($.expression, ':', $.expression),

    // Types
    typed_array_type: $ => prec(2, seq($.type_identifier, '[', optional($.number), ']')),

    type: $ => choice(
      $.function_type,
      $.typed_array_type,
      $.type_identifier
    ),

    function_type: $ => prec.right(seq(
      'function', '(', optional(seq($.type, repeat(seq(',', $.type)))), ')',
      optional($.type)
    )),

    type_annotation: $ => seq($.type),

    parameter_list: $ => seq('(', optional(seq($.parameter, repeat(seq(',', $.parameter)))), ')'),

    parameter: $ => seq(field('name', $.identifier), optional(seq(':', field('type', $.type)))),

    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,
    type_identifier: _ => /[A-Z][A-Za-z0-9_]*/,
  }
});
