import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const { content, fileName, type } = await request.json();

    if (!content || !fileName) {
      return NextResponse.json(
        { error: "Content and fileName are required" },
        { status: 400 }
      );
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 5;
    const bulletIndent = 5;

    let yPosition = margin;

    const cleanedContent = cleanContent(content);

    doc.setFont("times", "bold");
    doc.setFontSize(12);

    const title =
      type === "translated" ? `Translated Document: ${fileName}` : fileName;
    const safeTitle = normalizeText(title);

    const titleLines = doc.splitTextToSize(safeTitle, maxWidth);
    titleLines.forEach((titleLine: string) => {
      doc.text(titleLine, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 6;
    });

    yPosition += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    const formattedContent = parseAndFormatContent(cleanedContent);

    for (const element of formattedContent) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }

      if (element.type === "header") {
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        yPosition += 3;

        const headerLines = doc.splitTextToSize(element.text || "", maxWidth);
        headerLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 2;
      } else if (element.type === "paragraph") {
        doc.setFont("times", "normal");
        doc.setFontSize(10);

        const paragraphLines = doc.splitTextToSize(
          element.text || "",
          maxWidth
        );
        paragraphLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 3;
      } else if (element.type === "mixed") {
        doc.setFontSize(10);
        let currentY = yPosition;

        let combinedText = "";
        let hasBoldParts = false;

        for (const part of element.parts || []) {
          if (part.bold) {
            hasBoldParts = true;
            break;
          }
        }

        if (hasBoldParts) {
          let currentX = margin;
          let lineText = "";

          for (const part of element.parts || []) {
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = margin;
              currentX = margin;
              lineText = "";
            }

            if (part.bold) {
              doc.setFont("times", "bold");
            } else {
              doc.setFont("times", "normal");
            }

            const partText = part.text.trim();
            if (partText) {
              const testText = lineText + (lineText ? " " : "") + partText;
              const testWidth = doc.getTextWidth(testText);

              if (testWidth > maxWidth && lineText) {
                currentY += lineHeight;
                currentX = margin;
                lineText = "";

                if (currentY > pageHeight - 30) {
                  doc.addPage();
                  currentY = margin;
                }
              }

              if (currentX > margin) {
                currentX += doc.getTextWidth(" ");
              }

              doc.text(partText, currentX, currentY);
              currentX += doc.getTextWidth(partText);
              lineText += (lineText ? " " : "") + partText;
            }
          }
          yPosition = currentY + lineHeight + 3;
        } else {
          combinedText = (element.parts || []).map((p) => p.text).join(" ");
          doc.setFont("times", "normal");
          const textLines = doc.splitTextToSize(combinedText, maxWidth);

          textLines.forEach((line: string) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          yPosition += 3;
        }
      } else if (element.type === "bullet") {
        doc.setFont("times", "normal");
        doc.setFontSize(10);

        doc.text("•", margin, yPosition);

        const bulletLines = doc.splitTextToSize(
          element.text || "",
          maxWidth - bulletIndent
        );
        bulletLines.forEach((line: string, index: number) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
            if (index > 0) {
              doc.text("•", margin, yPosition);
            }
          }

          const xPosition = margin + bulletIndent;
          doc.text(line, xPosition, yPosition);
          if (index < bulletLines.length - 1) {
            yPosition += lineHeight;
          }
        });

        yPosition += lineHeight + 2;
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      doc.setPage(pageNum);
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" }
      );
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileName
        )}.pdf"`,
        "Cache-Control": "no-cache",
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    // console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}

function cleanContent(content: string): string {
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\{[^}]*\}/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E\n\r\t]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 160 && code <= 255) return char;
      return " ";
    })
    .trim();
}

function parseAndFormatContent(content: string): Array<{
  type: "header" | "paragraph" | "mixed" | "bullet";
  text?: string;
  parts?: Array<{ text: string; bold: boolean }>;
}> {
  const elements: Array<{
    type: "header" | "paragraph" | "mixed" | "bullet";
    text?: string;
    parts?: Array<{ text: string; bold: boolean }>;
  }> = [];

  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    const startsWithBullet = /^[•*]\s+/.test(trimmedParagraph);

    let cleanParagraph = trimmedParagraph.replace(/^[•*]\s+/, "").trim();

    const hasBoldFormatting = /\*\*[^*]+\*\*/.test(cleanParagraph);

    if (startsWithBullet && !hasBoldFormatting) {
      elements.push({
        type: "bullet",
        text: normalizeText(cleanParagraph),
      });
    } else if (hasBoldFormatting) {
      const parts: Array<{ text: string; bold: boolean }> = [];

      const segments = cleanParagraph.split(/(\*\*[^*]*\*\*)/);

      for (const segment of segments) {
        if (!segment.trim()) continue;

        if (segment.startsWith("**") && segment.endsWith("**")) {
          const boldText = segment.slice(2, -2).trim();
          if (boldText) {
            parts.push({ text: normalizeText(boldText), bold: true });
          }
        } else {
          const normalText = segment.trim();
          if (normalText) {
            parts.push({ text: normalizeText(normalText), bold: false });
          }
        }
      }

      if (parts.length > 0) {
        if (startsWithBullet) {
          const combinedText = parts.map((p) => p.text).join(" ");
          elements.push({ type: "bullet", text: combinedText });
        } else {
          elements.push({ type: "mixed", parts });
        }
      }
    } else {
      const isHeader = isHeaderLine(cleanParagraph);
      const normalizedText = normalizeText(cleanParagraph);

      if (startsWithBullet) {
        elements.push({ type: "bullet", text: normalizedText });
      } else if (isHeader) {
        elements.push({ type: "header", text: normalizedText });
      } else {
        elements.push({ type: "paragraph", text: normalizedText });
      }
    }
  }

  return elements;
}

function isHeaderLine(line: string): boolean {
  const trimmedLine = line.trim();

  return (
    trimmedLine.length < 100 &&
    trimmedLine.length > 5 &&
    (/^\d+\.?\s+[A-Z]/.test(trimmedLine) ||
      /^[A-Z\s]{10,}[A-Z]$/.test(trimmedLine) ||
      /^[A-Z][^.]*:$/.test(trimmedLine) ||
      /^(LEGAL NOTICE|NOTICE|WHEREAS|THEREFORE|JURISDICTION|PURPOSE|PARTIES|REMEDY|GOVERNING|DISCLAIMER|WITNESS|SIGNATURE|ANNEXURE|NOTE|FOR THE ISSUER)/i.test(
        trimmedLine
      ) ||
      /^[A-Z][A-Z\s]+[A-Z]:?\s*$/.test(trimmedLine))
  );
}
