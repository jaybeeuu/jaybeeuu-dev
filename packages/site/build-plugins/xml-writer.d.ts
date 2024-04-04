// Type definitions for xml-writer 1.7.0
// Project: https://github.com/Inist-CNRS/node-xml-writer
// Definitions by: Josh Bickley-Wallace <jaybeeuu.dev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "xml-writer" {
  declare class XMLWriter {
    constructor(
      indent: boolean | string = false,
      writer: (content: string, encoding: string) => void = undefined
    );

    /** Write text */
    text(content: string): XMLWriter;

    /** Write a raw XML text */
    writeRaw(): XMLWriter;

    /** Create document tag */
    startDocument(
      version = "1.0",
      encoding: string = null,
      standalone = false
    ): XMLWriter;

    /** End current document */
    endDocument(): XMLDocument;

    /**  Write full element tag */
    writeElement(name: string, content: string);

    /** Write full namespaced element tag */
    writeElementNS(): XMLWriter;

    /** Create start namespaced element tag */
    startElementNS(): XMLWriter;

    /** Create start element tag */
    startElement(name: string): XMLWriter;

    /** End current element */
    endElement(): XMLWriter;

    /** Write full attribute */
    writeAttribute(name: string, value: string): XMLWriter;

    /** Write full namespaced attribute */
    writeAttributeNS(): XMLWriter;

    /** Create start namespaced attribute */
    startAttributeNS(): XMLWriter;

    /** Start attribute */
    startAttribute(name: string): XMLWriter;

    /** End attribute */
    endAttribute(): XMLWriter;

    /** Writes a Processing Instruction */
    writePI(name: string, content: string): XMLWriter;

    /** Create start Processing Instruction tag */
    startPI(name: string): XMLWriter;

    /** End current Processing Instruction */
    endPI(): XMLWriter;

    /** Write a DocType */
    writeDocType(name: string, pubid?: string, sysid?: string, subset?: string);

    /** Create start DocType tag */
    startDocType(
      name: string,
      pubid?: string,
      sysid?: string,
      subset?: string
    ): XMLWriter;

    /** End current DocType */
    endDocType(): XMLWriter;

    /** Write full CDATA tag */
    writeCData(content: string): XMLWriter;

    /** Create start CDATA tag */
    startCData(): XMLWriter;

    /** End current CDATA */
    endCData(): XMLWriter;

    /** Write full comment tag */
    writeComment(content: string): XMLWriter;

    /** Create start comment */
    startComment(): XMLWriter;

    /** Create end comment */
    endComment(): XMLWriter;

    /** Retrieve the XML document as a string */
    toString(): string;
  }

  export default XMLWriter;
}
