/**
 * AST node constructors for jth.
 * Each returns a plain object with a `type` field.
 */

export function ProgramNode(body) {
  return { type: "Program", body };
}

export function NumberLiteral(value, line, column) {
  return { type: "NumberLiteral", value, line, column };
}

export function StringLiteral(value, line, column) {
  return { type: "StringLiteral", value, line, column };
}

export function BooleanLiteral(value, line, column) {
  return { type: "BooleanLiteral", value, line, column };
}

export function NullLiteral(line, column) {
  return { type: "NullLiteral", value: null, line, column };
}

export function UndefinedLiteral(line, column) {
  return { type: "UndefinedLiteral", value: undefined, line, column };
}

export function IdentifierNode(name, line, column) {
  return { type: "Identifier", name, line, column };
}

export function OperatorCallNode(name, args, line, column) {
  return { type: "OperatorCall", name, args: args || [], line, column };
}

export function ArrayLiteral(elements, line, column) {
  return { type: "ArrayLiteral", elements, line, column };
}

export function BlockLiteral(body, line, column) {
  return { type: "BlockLiteral", body, line, column };
}

export function JSObjectLiteral(properties, line, column) {
  return { type: "JSObjectLiteral", properties, line, column };
}

export function InlineJSExpression(code, line, column) {
  return { type: "InlineJSExpression", code, line, column };
}

export function DefinitionNode(name, line, column) {
  return { type: "Definition", name, line, column };
}

export function ValueDefinitionNode(name, line, column) {
  return { type: "ValueDefinition", name, line, column };
}

export function ImportNode(path, bindings, line, column) {
  return { type: "Import", path, bindings, line, column };
}

export function ExportNode(names, line, column) {
  return { type: "Export", names, line, column };
}

export function StatementNode(expressions) {
  return { type: "Statement", expressions };
}

export function CommentNode(text, line, column) {
  return { type: "Comment", text, line, column };
}
