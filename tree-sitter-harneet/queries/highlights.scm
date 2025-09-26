;; Tree-sitter highlight queries for Harneet
;; See: https://docs.helix-editor.com/themes.html#highlight-queries

; Comments
(line_comment) @comment
(block_comment) @comment

; Literals
(string) @string
(number) @number
(boolean) @constant.builtin
(none) @constant.builtin

; Declarations & keywords
(var_declaration
  "var" @keyword
  (identifier) @variable)

(function_declaration
  "function" @keyword
  name: (identifier) @function)

;; Anonymous function and arrow function
(function_expression "function" @keyword)
(function_expression body: (block) @function)
(arrow_function (identifier) @parameter)?
(arrow_function (parameter (identifier) @parameter))*
(arrow_function "=>" @operator)
(arrow_function body: (block) @function)

(type_struct_declaration
  "type" @keyword
  (type_identifier) @type
  "struct" @keyword)

(import_statement
  "import" @keyword
  (identifier) @namespace)

(if_statement "if" @keyword)
(if_statement "else" @keyword)
(for_in "for" @keyword)
(for_in "in" @keyword)
(return_statement "return" @keyword)
(match_statement "match" @keyword)

;; Patterns
(array_pattern "[" @punctuation.bracket "]" @punctuation.bracket)
(map_pattern "{" @punctuation.bracket "}" @punctuation.bracket)
(map_pattern_pair ":" @punctuation.delimiter)

; Calls
(call_expression
  function: (member_expression
    object: (identifier) @namespace
    property: (identifier) @function.call))

(call_expression
  function: (identifier) @function.call)

; Members and punctuation
(member_expression "." @punctuation.delimiter)

(index_expression "[" @punctuation.bracket "]" @punctuation.bracket)
(block "{" @punctuation.bracket "}" @punctuation.bracket)
(parenthesized_expression "(" @punctuation.bracket ")" @punctuation.bracket)
(argument_list "(" @punctuation.bracket ")" @punctuation.bracket)
(map_literal "{" @punctuation.bracket "}" @punctuation.bracket)
(array_literal "[" @punctuation.bracket "]" @punctuation.bracket)
(typed_array_literal "[" @punctuation.bracket "]" @punctuation.bracket
                     "{" @punctuation.bracket "}" @punctuation.bracket)

; Operators
(binary_expression operator: _ @operator)
(unary_expression  @operator)
(assignment_expression operator: _ @operator)

; Types
(type_identifier) @type
(function_type "function" @keyword)

; Variables (generic)
(identifier) @variable
