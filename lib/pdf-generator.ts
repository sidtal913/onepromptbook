import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface BookPage {
  pageNumber: number
  content: string
  imageUrl?: string
}

export const generatePDF = async (
  title: string,
  pages: BookPage[],
  coverUrl?: string
): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20

  // Add cover page if provided
  if (coverUrl) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = coverUrl
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const imgData = canvas.toDataURL('image/jpeg', 0.8)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
      pdf.addPage()
    } catch (error) {
      console.error('Error adding cover to PDF:', error)
    }
  }

  // Add title page
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  const titleLines = pdf.splitTextToSize(title, pageWidth - 2 * margin)
  const titleHeight = titleLines.length * 10
  const titleY = (pageHeight - titleHeight) / 2
  pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' })
  pdf.addPage()

  // Add content pages
  for (const page of pages) {
    let yPosition = margin

    // Add page image if available
    if (page.imageUrl) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = page.imageUrl!
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        const imgWidth = pageWidth - 2 * margin
        const imgHeight = (img.height / img.width) * imgWidth
        
        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 10
      } catch (error) {
        console.error('Error adding image to PDF:', error)
      }
    }

    // Add page text
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    const textLines = pdf.splitTextToSize(page.content, pageWidth - 2 * margin)
    pdf.text(textLines, margin, yPosition)

    // Add page number
    pdf.setFontSize(10)
    pdf.text(`${page.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

    if (page.pageNumber < pages.length) {
      pdf.addPage()
    }
  }

  return pdf.output('blob')
}

export const generateEPUB = async (
  title: string,
  author: string,
  pages: BookPage[]
): Promise<Blob> => {
  // For now, return a simple HTML-based EPUB structure
  // In production, you'd use a proper EPUB library
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .page { page-break-after: always; margin-bottom: 40px; }
        .page-image { max-width: 100%; height: auto; margin-bottom: 20px; }
        .page-content { font-size: 16px; line-height: 1.6; }
        .page-number { text-align: center; margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p><em>by ${author}</em></p>
      
      ${pages.map(page => `
        <div class="page">
          ${page.imageUrl ? `<img src="${page.imageUrl}" alt="Page ${page.pageNumber}" class="page-image">` : ''}
          <div class="page-content">${page.content}</div>
          <div class="page-number">Page ${page.pageNumber}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `

  return new Blob([htmlContent], { type: 'text/html' })
}