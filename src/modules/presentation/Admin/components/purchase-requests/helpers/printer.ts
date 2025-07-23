// @/modules/shared/utils/print-helper.ts
// or @/common/shared/utils/print-helper.ts

export interface PrintOptions {
  title?: string;
  contentSelector?: string;
  hideElements?: string[];
  customStyles?: string;
  printInNewWindow?: boolean;
}

export class PrintHelper {
  /**
   * Advanced print function with custom styling and element hiding
   */
  static async printContent(options: PrintOptions = {}) {
    const {
      title = 'Print Document',
      contentSelector = '.body',
      hideElements = ['.fixed', '.ant-drawer', '.ant-modal', '.ant-notification'],
      customStyles = '',
      printInNewWindow = false
    } = options;

    if (printInNewWindow) {
      return this.printInNewWindow(contentSelector, title, customStyles);
    }

    // Store original display values
    const elementsToHide = document.querySelectorAll(hideElements.join(', '));
    const originalDisplay: string[] = [];

    // Hide elements
    elementsToHide.forEach((el, index) => {
      const element = el as HTMLElement;
      originalDisplay[index] = element.style.display;
      element.style.display = 'none';
    });

    // Add print styles
    const printStyles = this.generatePrintStyles(customStyles);
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);

    // Add print-content class
    const contentElement = document.querySelector(contentSelector) as HTMLElement;
    if (contentElement) {
      contentElement.classList.add('print-content');
    }

    // Print
    window.print();

    // Cleanup after printing
    setTimeout(() => {
      // Restore original display
      elementsToHide.forEach((el, index) => {
        const element = el as HTMLElement;
        element.style.display = originalDisplay[index];
      });

      // Remove print styles and class
      styleElement.remove();
      if (contentElement) {
        contentElement.classList.remove('print-content');
      }
    }, 1000);
  }

  /**
   * Simple print function
   */
  static simplePrint() {
    window.print();
  }

  /**
   * Print content in a new window
   */
  static printInNewWindow(
    contentSelector: string = '.body',
    title: string = 'Print Document',
    customStyles: string = ''
  ) {
    const content = document.querySelector(contentSelector)?.innerHTML;
    if (!content) {
      console.error('Content not found for printing');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    const htmlContent = this.generatePrintHTML(content, title, customStyles);

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  /**
   * Generate print-specific CSS styles
   */
  private static generatePrintStyles(customStyles: string = ''): string {
    return `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }

        /* Hide common UI elements */
        .fixed, .ant-drawer, .ant-modal, .ant-notification {
          display: none !important;
        }

        /* Remove shadows and borders */
        .shadow-sm, .shadow, .shadow-md, .shadow-lg {
          box-shadow: none !important;
        }

        /* Reset margins */
        .body, .mt-\\[10rem\\] {
          margin-top: 0 !important;
        }

        /* Page break controls */
        .user-info, .table, .image, .signature {
          page-break-inside: avoid;
        }

        /* Table styling */
        .ant-table {
          border: 1px solid #d9d9d9;
        }
        .ant-table-thead > tr > th {
          border-bottom: 1px solid #d9d9d9;
          background: #fafafa !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #d9d9d9;
        }

        /* Image sizing */
        .ant-image img {
          max-width: 100% !important;
          height: auto !important;
        }

        /* Text styling */
        .text-gray-600, .text-slate-500, .text-slate-600 {
          color: #6b7280 !important;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }

        /* Custom styles */
        ${customStyles}
      }
    `;
  }

  /**
   * Generate HTML for new window printing
   */
  private static generatePrintHTML(
    content: string,
    title: string,
    customStyles: string = ''
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="lo">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Noto Sans Lao', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #1f2937;
          }

          h1, h2, h3 {
            font-weight: 600;
            margin-bottom: 8px;
          }

          .user-info {
            margin-bottom: 30px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
          }

          .info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
          }

          .detail p:first-child {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .detail p:last-child {
            color: #6b7280;
            margin-top: -8px;
          }

          .want-date, .purposes {
            margin-bottom: 20px;
          }

          .want-date h2, .purposes h2 {
            font-size: 16px;
            margin-bottom: 4px;
          }

          .want-date p, .purposes p {
            color: #6b7280;
            font-size: 14px;
            margin-top: 0;
          }

          /* Table styling */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }

          th, td {
            border: 1px solid #d9d9d9;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background-color: #fafafa;
            font-weight: 600;
          }

          .total {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            padding: 16px 0;
            font-weight: 600;
            border-top: 2px solid #e5e7eb;
            margin-top: 16px;
          }

          /* Image styling */
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }

          .signature {
            margin-top: 40px;
            page-break-inside: avoid;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }

          /* Custom styles */
          ${customStyles}
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }
}

// Export individual functions for convenience
export const printContent = PrintHelper.printContent.bind(PrintHelper);
