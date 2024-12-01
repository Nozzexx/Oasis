export const dynamic = "force-dynamic";

// src/app/api/export-pdf/route.ts
import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function POST(request: Request) {
  try {
    const { table, data, columns } = await request.json();

    if (!table || !data || !columns) {
      return NextResponse.json(
        { error: 'Missing required parameters: table, data, or columns.' },
        { status: 400 }
      );
    }

    // Create new PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add title
    doc.setFontSize(16);
    doc.text(
      `O.A.S.I.S. - ${table.toUpperCase()}`,
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: 'center' }
    );

    // Format data for the table
    const tableRows = data.map((row: any) =>
      columns.map((col) => {
        const value = row[col];
        // Format numbers to fixed decimals if they're numbers
        if (typeof value === 'number' && !Number.isInteger(value)) {
          return value.toFixed(2);
        }
        // Format dates if the value looks like a date
        if (value && !isNaN(Date.parse(value))) {
          return new Date(value).toLocaleDateString();
        }
        return value?.toString() || '';
      })
    );

    // Configure the auto-table
    (doc as any).autoTable({
      head: [columns.map(formatColumnHeader)],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'auto',
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        ...columns.reduce((acc, col, index) => {
          if (col.includes('date')) {
            acc[index] = { cellWidth: 25 };
          } else if (col.includes('name') || col.includes('description')) {
            acc[index] = { cellWidth: 40 };
          } else if (col.includes('id')) {
            acc[index] = { cellWidth: 30 };
          } else {
            acc[index] = { cellWidth: 'auto' };
          }
          return acc;
        }, {}),
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 25, right: 15, bottom: 15, left: 15 },
      didDrawPage: (data: any) => {
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });

    // Convert PDF to blob
    const pdfOutput = doc.output('arraybuffer');

    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${table}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to format column headers
function formatColumnHeader(header: string): string {
  return header
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
