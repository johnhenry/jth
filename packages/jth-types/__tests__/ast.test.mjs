import { describe, it, expect } from "vitest";
import {
  ProgramNode, NumberLiteral, StringLiteral, BooleanLiteral,
  NullLiteral, UndefinedLiteral, IdentifierNode, OperatorCallNode,
  ArrayLiteral, BlockLiteral, JSObjectLiteral, InlineJSExpression,
  DefinitionNode, ValueDefinitionNode, ImportNode, ExportNode,
  StatementNode, CommentNode,
} from "../src/ast.mjs";

describe("AST nodes", () => {
  it("ProgramNode", () => {
    const node = ProgramNode([]);
    expect(node.type).toBe("Program");
    expect(node.body).toEqual([]);
  });

  it("NumberLiteral", () => {
    const node = NumberLiteral(42, 1, 1);
    expect(node).toEqual({ type: "NumberLiteral", value: 42, line: 1, column: 1 });
  });

  it("StringLiteral", () => {
    const node = StringLiteral("hello", 2, 3);
    expect(node).toEqual({ type: "StringLiteral", value: "hello", line: 2, column: 3 });
  });

  it("BooleanLiteral", () => {
    const node = BooleanLiteral(true, 1, 1);
    expect(node).toEqual({ type: "BooleanLiteral", value: true, line: 1, column: 1 });
  });

  it("NullLiteral", () => {
    const node = NullLiteral(1, 1);
    expect(node).toEqual({ type: "NullLiteral", value: null, line: 1, column: 1 });
  });

  it("UndefinedLiteral", () => {
    const node = UndefinedLiteral(1, 1);
    expect(node).toEqual({ type: "UndefinedLiteral", value: undefined, line: 1, column: 1 });
  });

  it("IdentifierNode", () => {
    const node = IdentifierNode("foo", 1, 1);
    expect(node).toEqual({ type: "Identifier", name: "foo", line: 1, column: 1 });
  });

  it("OperatorCallNode", () => {
    const node = OperatorCallNode("sort", [true], 1, 1);
    expect(node.type).toBe("OperatorCall");
    expect(node.name).toBe("sort");
    expect(node.args).toEqual([true]);
  });

  it("OperatorCallNode defaults args to empty array", () => {
    const node = OperatorCallNode("+", null, 1, 1);
    expect(node.args).toEqual([]);
  });

  it("ArrayLiteral", () => {
    const node = ArrayLiteral([NumberLiteral(1, 1, 1)], 1, 1);
    expect(node.type).toBe("ArrayLiteral");
    expect(node.elements).toHaveLength(1);
  });

  it("BlockLiteral", () => {
    const node = BlockLiteral([IdentifierNode("dupe", 1, 3)], 1, 1);
    expect(node.type).toBe("BlockLiteral");
    expect(node.body).toHaveLength(1);
  });

  it("JSObjectLiteral", () => {
    const node = JSObjectLiteral([{ key: "a", value: NumberLiteral(1, 1, 1) }], 1, 1);
    expect(node.type).toBe("JSObjectLiteral");
    expect(node.properties).toHaveLength(1);
  });

  it("InlineJSExpression", () => {
    const node = InlineJSExpression("(x => x + 1)", 1, 1);
    expect(node.type).toBe("InlineJSExpression");
    expect(node.code).toBe("(x => x + 1)");
  });

  it("DefinitionNode", () => {
    const node = DefinitionNode("square", 1, 1);
    expect(node.type).toBe("Definition");
    expect(node.name).toBe("square");
  });

  it("ValueDefinitionNode", () => {
    const node = ValueDefinitionNode("pi", 1, 1);
    expect(node.type).toBe("ValueDefinition");
    expect(node.name).toBe("pi");
  });

  it("ImportNode", () => {
    const node = ImportNode("./math.jth", { default: "math" }, 1, 1);
    expect(node.type).toBe("Import");
    expect(node.path).toBe("./math.jth");
  });

  it("ExportNode", () => {
    const node = ExportNode(["square", "cube"], 1, 1);
    expect(node.type).toBe("Export");
    expect(node.names).toEqual(["square", "cube"]);
  });

  it("StatementNode", () => {
    const node = StatementNode([NumberLiteral(1, 1, 1)]);
    expect(node.type).toBe("Statement");
    expect(node.expressions).toHaveLength(1);
  });

  it("CommentNode", () => {
    const node = CommentNode("this is a comment", 1, 1);
    expect(node.type).toBe("Comment");
    expect(node.text).toBe("this is a comment");
  });
});
