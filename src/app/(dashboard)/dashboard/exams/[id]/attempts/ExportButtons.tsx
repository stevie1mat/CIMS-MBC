'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx-js-style'
import { Download } from 'lucide-react'

export default function ExportButtons({ quiz, attempts }) {

  const handleDownload = () => {
    // Total max marks (assuming 1 mark per question for display)
    const maxMarks = quiz.questions?.length || 50

    // Build the array of arrays structure required for the spreadsheet layout
    const data = [
      // Row 1: Exam Name
      [quiz.name ? quiz.name.toUpperCase() : 'EXAM MARKSHEET', '', '', ''],
      // Row 2: Empty spacer
      ['', '', '', ''],
      // Row 3: Headers
      ['S.No', 'Full Name', `Marks(out of ${maxMarks})`, 'Remarks']
    ]

    // Rows 4+: Student Data
    attempts.forEach((attempt, index) => {
      const fullName = `${attempt.profiles?.first_name || ''} ${attempt.profiles?.last_name || ''}`.trim() || 'Unknown Student'
      data.push([
        index + 1,
        fullName,
        attempt.score_obtained || 0,
        '' // Remarks (leave blank)
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    
    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 30 }, // Full Name
      { wch: 18 }, // Marks
      { wch: 25 }, // Remarks
    ]
    
    // Apply styles to Row 1 (Title)
    const titleStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
      fill: { fgColor: { rgb: "174ED8" } }, // Blue background
      alignment: { horizontal: "center", vertical: "center" }
    }
    
    ws['A1'].s = titleStyle
    
    // Apply styles to Row 3 (Headers)
    const headerStyle = {
      font: { bold: true, sz: 12 },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      },
      alignment: { vertical: "center" }
    }
    
    const headerBorderedStyle = {
      font: { bold: true, sz: 12 },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thick", color: { rgb: "000000" } }
      },
      alignment: { vertical: "center" }
    }
    
    const sNoStyle = {
      font: { bold: true, sz: 12, color: { rgb: "174ED8" }, underline: true },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thick", color: { rgb: "000000" } },
        left: { style: "thick", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      },
      alignment: { vertical: "center" }
    }

    ws['A3'].s = sNoStyle
    ws['B3'].s = headerStyle
    ws['C3'].s = headerStyle
    ws['D3'].s = headerBorderedStyle

    // Apply borders to data rows
    for (let r = 3; r < data.length; r++) {
      const isLastRow = r === data.length - 1
      const bottomBorder = isLastRow ? { style: "thick", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "E2E8F0" } }
      
      for (let c = 0; c < 4; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: r, c: c })
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' }
        
        ws[cellRef].s = {
          font: { sz: 11 },
          border: {
            left: c === 0 ? { style: "thick", color: { rgb: "000000" } } : undefined,
            right: c === 3 ? { style: "thick", color: { rgb: "000000" } } : { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: bottomBorder
          },
          alignment: c === 2 || c === 0 ? { horizontal: "right" } : undefined
        }
      }
    }

    // Optional: Merging the first row for the title to span across columns A-D
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Marksheet")
    XLSX.writeFile(wb, `${quiz.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_marksheet.xlsx`)
  }



  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <button 
        onClick={handleDownload}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        title="Download CSV"
      >
        <Download size={16} />
        Download CSV
      </button>


    </div>
  )
}
