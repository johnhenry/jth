/**
 * AST node constructors for jth.
 * Each returns a plain object with a `type` field.
 */

export interface ProgramNodeType {
  type: "Program";
  body: ASTNode[];
}

export interface NumberLiteralType {
  type: "NumberLiteral";
  value: number;
  line: number;
  column: number;
}

export interface StringLiteralType {
  type: "StringLiteral";
  value: string;
  line: number;
  column: number;
}

export interface BooleanLiteralType {
  type: "BooleanLiteral";
  value: boolean;
  line: number;
  column: number;
}

export interface NullLiteralType {
  type: "NullLiteral";
  value: null;
  line: number;
  column: number;
}

export interface UndefinedLiteralType {
  type: "UndefinedLiteral";
  value: undefined;
  line: number;
  column: number;
}

export interface IdentifierNodeType {
  type: "Identifier";
  name: string;
  line: number;
  column: number;
}

export interface OperatorCallNodeType {
  type: "OperatorCall";
  name: string;
  args: unknown[];
  line: number;
  column: number;
}

export interface ArrayLiteralType {
  type: "ArrayLiteral";
  elements: ASTNode[];
  line: number;
  column: number;
}

export interface BlockLiteralType {
  type: "BlockLiteral";
  body: ASTNode[];
  line: number;
  column: number;
}

export interface JSObjectProperty {
  key: string;
  value: ASTNode;
}

export interface JSObjectLiteralType {
  type: "JSObjectLiteral";
  properties: JSObjectProperty[];
  line: number;
  column: number;
}

export interface InlineJSExpressionType {
  type: "InlineJSExpression";
  code: string;
  line: number;
  column: number;
}

export interface DefinitionNodeType {
  type: "Definition";
  name: string;
  line: number;
  column: number;
}

export interface ValueDefinitionNodeType {
  type: "ValueDefinition";
  name: string;
  line: number;
  column: number;
}

export interface ImportNodeType {
  type: "Import";
  path: string;
  bindings: unknown;
  line: number;
  column: number;
}

export interface ExportNodeType {
  type: "Export";
  names: string[];
  line: number;
  column: number;
}

export interface StatementNodeType {
  type: "Statement";
  expressions: ASTNode[];
}

export interface CommentNodeType {
  type: "Comment";
  text: string;
  line: number;
  column: number;
}

export type ASTNode =
  | ProgramNodeType
  | NumberLiteralType
  | StringLiteralType
  | BooleanLiteralType
  | NullLiteralType
  | UndefinedLiteralType
  | IdentifierNodeType
  | OperatorCallNodeType
  | ArrayLiteralType
  | BlockLiteralType
  | JSObjectLiteralType
  | InlineJSExpressionType
  | DefinitionNodeType
  | ValueDefinitionNodeType
  | ImportNodeType
  | ExportNodeType
  | StatementNodeType
  | CommentNodeType;

export function ProgramNode(body: ASTNode[]): ProgramNodeType {
  return { type: "Program", body };
}

export function NumberLiteral(value: number, line: number, column: number): NumberLiteralType {
  return { type: "NumberLiteral", value, line, column };
}

export function StringLiteral(value: string, line: number, column: number): StringLiteralType {
  return { type: "StringLiteral", value, line, column };
}

export function BooleanLiteral(value: boolean, line: number, column: number): BooleanLiteralType {
  return { type: "BooleanLiteral", value, line, column };
}

export function NullLiteral(line: number, column: number): NullLiteralType {
  return { type: "NullLiteral", value: null, line, column };
}

export function UndefinedLiteral(line: number, column: number): UndefinedLiteralType {
  return { type: "UndefinedLiteral", value: undefined, line, column };
}

export function IdentifierNode(name: string, line: number, column: number): IdentifierNodeType {
  return { type: "Identifier", name, line, column };
}

export function OperatorCallNode(name: string, args: unknown[] | null | undefined, line: number, column: number): OperatorCallNodeType {
  return { type: "OperatorCall", name, args: args || [], line, column };
}

export function ArrayLiteral(elements: ASTNode[], line: number, column: number): ArrayLiteralType {
  return { type: "ArrayLiteral", elements, line, column };
}

export function BlockLiteral(body: ASTNode[], line: number, column: number): BlockLiteralType {
  return { type: "BlockLiteral", body, line, column };
}

export function JSObjectLiteral(properties: JSObjectProperty[], line: number, column: number): JSObjectLiteralType {
  return { type: "JSObjectLiteral", properties, line, column };
}

export function InlineJSExpression(code: string, line: number, column: number): InlineJSExpressionType {
  return { type: "InlineJSExpression", code, line, column };
}

export function DefinitionNode(name: string, line: number, column: number): DefinitionNodeType {
  return { type: "Definition", name, line, column };
}

export function ValueDefinitionNode(name: string, line: number, column: number): ValueDefinitionNodeType {
  return { type: "ValueDefinition", name, line, column };
}

export function ImportNode(path: string, bindings: unknown, line: number, column: number): ImportNodeType {
  return { type: "Import", path, bindings, line, column };
}

export function ExportNode(names: string[], line: number, column: number): ExportNodeType {
  return { type: "Export", names, line, column };
}

export function StatementNode(expressions: ASTNode[]): StatementNodeType {
  return { type: "Statement", expressions };
}

export function CommentNode(text: string, line: number, column: number): CommentNodeType {
  return { type: "Comment", text, line, column };
}
