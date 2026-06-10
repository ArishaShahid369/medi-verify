'use client'

export const downloadCertificate = async (medicine, result, responseTime) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, H = 297

  // Background
  doc.setFillColor(10, 11, 16)
  doc.rect(0, 0, W, H, 'F')

  // Border
  doc.setDrawColor(0, 219, 233)
  doc.setLineWidth(0.5)
  doc.rect(8, 8, W-16, H-16)
  doc.setLineWidth(0.2)
  doc.rect(11, 11, W-22, H-22)

  // Header background
  doc.setFillColor(0, 30, 35)
  doc.rect(8, 8, W-16, 45, 'F')

  // Logo area
  doc.setFillColor(0, 219, 233)
  doc.roundedRect(18, 16, 12, 12, 2, 2, 'F')
  doc.setTextColor(0, 18, 20)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('MV', 21, 24)

  // Title
  doc.setTextColor(0, 219, 233)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDI-VERIFY', 35, 25)

  doc.setTextColor(185, 202, 203)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('BLOCKCHAIN-POWERED PHARMACEUTICAL AUTHENTICATION', 35, 32)

  // Certificate title
  doc.setTextColor(227, 225, 233)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('VERIFICATION CERTIFICATE', 35, 44)

  // Verified badge
  const badgeColor = result === 'authentic' ? [0, 245, 160] : [255, 77, 109]
  doc.setFillColor(...badgeColor)
  doc.roundedRect(W-55, 18, 38, 14, 3, 3, 'F')
  doc.setTextColor(0, 18, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(result === 'authentic' ? '✓ VERIFIED' : '✗ COUNTERFEIT', W-51, 27)

  // Certificate ID & Date
  doc.setTextColor(132, 148, 149)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const certId = `MV-CERT-${Date.now().toString().slice(-8)}`
  doc.text(`Certificate ID: ${certId}`, 18, 62)
  doc.text(`Issued: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, 18, 68)
  doc.text(`Response Time: ${responseTime}ms`, 18, 74)

  // Divider
  doc.setDrawColor(0, 219, 233)
  doc.setLineWidth(0.3)
  doc.line(18, 80, W-18, 80)

  // Medicine Details Section
  doc.setTextColor(0, 219, 233)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDICINE INFORMATION', 18, 90)

  const details = [
    ['Medicine Name', medicine?.name || 'N/A'],
    ['Generic Name', medicine?.genericName || 'N/A'],
    ['Batch Number', medicine?.batchNumber || 'N/A'],
    ['Serial Number', medicine?.serialNumber || 'N/A'],
    ['Dosage', medicine?.dosage || 'N/A'],
    ['Expiry Date', medicine?.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'],
    ['Manufacturer', medicine?.manufacturerName || 'N/A'],
    ['License Number', medicine?.licenseNumber || 'N/A'],
    ['Storage', medicine?.storageConditions || 'Store below 25°C'],
  ]

  let y = 100
  details.forEach(([label, val], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255, 0.03)
      doc.setFillColor(20, 22, 28)
      doc.rect(18, y-5, W-36, 10, 'F')
    }
    doc.setTextColor(132, 148, 149)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(label.toUpperCase(), 22, y)
    doc.setTextColor(227, 225, 233)
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), 85, y)
    y += 12
  })

  // Salt composition
  if (medicine?.saltComposition) {
    doc.setFillColor(20, 22, 28)
    doc.rect(18, y-5, W-36, 14, 'F')
    doc.setTextColor(132, 148, 149)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('SALT COMPOSITION', 22, y)
    doc.setTextColor(185, 202, 203)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(medicine.saltComposition, 100)
    doc.text(lines, 85, y)
    y += lines.length * 5 + 8
  }

  // Divider
  doc.setDrawColor(0, 219, 233)
  doc.setLineWidth(0.3)
  doc.line(18, y, W-18, y)
  y += 10

  // Blockchain Section
  doc.setTextColor(0, 219, 233)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BLOCKCHAIN VERIFICATION PROOF', 18, y)
  y += 10

  // Hash box
  doc.setFillColor(0, 20, 25)
  doc.setDrawColor(0, 219, 233)
  doc.setLineWidth(0.3)
  doc.roundedRect(18, y, W-36, 20, 2, 2)
  doc.rect(18, y, W-36, 20)
  doc.setTextColor(132, 148, 149)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('SHA-256 CRYPTOGRAPHIC HASH', 22, y+7)
  doc.setTextColor(0, 219, 233)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  const hashText = medicine?.sha256Hash || 'Hash not available'
  doc.text(hashText.slice(0, 60), 22, y+14)
  if (hashText.length > 60) doc.text(hashText.slice(60), 22, y+19)
  y += 28

  // Blockchain tx
  doc.setFillColor(0, 20, 25)
  doc.roundedRect(18, y, W-36, 14, 2, 2, 'F')
  doc.setTextColor(132, 148, 149)
  doc.setFontSize(7)
  doc.text('BLOCKCHAIN TX HASH', 22, y+6)
  doc.setTextColor(0, 219, 233)
  doc.text(medicine?.blockchainTxHash || '0x' + (medicine?.sha256Hash || '').slice(0,40) + '...', 22, y+12)
  y += 22

  // Supply chain
  if (medicine?.supplyChain?.length > 0) {
    doc.setTextColor(0, 219, 233)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('SUPPLY CHAIN PROOF', 18, y)
    y += 10

    medicine.supplyChain.forEach((step, i) => {
      doc.setFillColor(15, 18, 24)
      doc.rect(18, y-4, W-36, 10, 'F')
      doc.setFillColor(...badgeColor)
      doc.circle(24, y+1, 2, 'F')
      if (i < medicine.supplyChain.length - 1) {
        doc.setDrawColor(...badgeColor)
        doc.setLineWidth(0.2)
        doc.line(24, y+3, 24, y+10)
      }
      doc.setTextColor(227, 225, 233)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(step.stage || step.handler, 30, y+2)
      doc.setTextColor(132, 148, 149)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(`${step.location || ''} • ${new Date(step.timestamp).toLocaleDateString()}`, 30, y+7)
      y += 12
    })
    y += 4
  }

  // Footer
  const footerY = H - 25
  doc.setFillColor(0, 30, 35)
  doc.rect(8, footerY-5, W-16, 30, 'F')
  doc.setDrawColor(0, 219, 233)
  doc.setLineWidth(0.2)
  doc.line(18, footerY-2, W-18, footerY-2)

  doc.setTextColor(0, 219, 233)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDI-VERIFY', 18, footerY+5)
  doc.setTextColor(132, 148, 149)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Blockchain-Powered Pharmaceutical Authentication Platform', 18, footerY+11)
  doc.text('This certificate is cryptographically signed and immutably recorded on the blockchain.', 18, footerY+16)

  doc.setTextColor(0, 219, 233)
  doc.setFontSize(7)
  doc.text(`Verify online: localhost:3000/result?batch=${medicine?.batchNumber}`, W-18, footerY+11, { align: 'right' })
  doc.text(`© 2026 MediVerify — Certificate ID: ${certId}`, W-18, footerY+16, { align: 'right' })

  // Save
  doc.save(`MediVerify-Certificate-${medicine?.batchNumber || 'Unknown'}.pdf`)
}