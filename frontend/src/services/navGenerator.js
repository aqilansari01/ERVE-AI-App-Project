import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'

const parseMarkdownToParagraphs = (content) => {
  const lines = content.split('\n')
  const paragraphs = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      paragraphs.push(
        new Paragraph({
          text: '',
          spacing: { after: 200 },
        })
      )
      continue
    }

    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      )
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      )
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      )
    } else if (line.startsWith('**') && line.endsWith('**')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(2, line.length - 2),
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    } else {
      const textRuns = []
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g)

      parts.forEach((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          textRuns.push(
            new TextRun({
              text: part.substring(2, part.length - 2),
              bold: true,
            })
          )
        } else if (part.startsWith('*') && part.endsWith('*')) {
          textRuns.push(
            new TextRun({
              text: part.substring(1, part.length - 1),
              italics: true,
            })
          )
        } else if (part) {
          textRuns.push(new TextRun(part))
        }
      })

      if (textRuns.length > 0) {
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 100 },
          })
        )
      }
    }
  }

  return paragraphs
}

export const generateWordDocument = async (synthesizedContent, templateContent) => {
  try {
    const paragraphs = parseMarkdownToParagraphs(synthesizedContent)

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            new Paragraph({
              text: 'NAV 1-PAGER',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...paragraphs,
          ],
        },
      ],
    })

    const buffer = await Packer.toBlob(doc)
    return buffer
  } catch (error) {
    console.error('Error generating Word document:', error)
    throw new Error('Failed to generate Word document')
  }
}
