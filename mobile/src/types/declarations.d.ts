declare module 'react-native-html-to-pdf' {
  export interface PDFOptions {
    html: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
    padding?: number;
    bgColor?: string;
  }

  export interface PDFResult {
    filePath?: string;
    base64?: string;
    numberOfPages?: number;
  }

  export default class RNHTMLtoPDF {
    static convert(options: PDFOptions): Promise<PDFResult>;
  }
}

declare module 'react-native-print' {
  export interface PrintOptions {
    html?: string;
    filePath?: string;
    printerURL?: string;
    isLandscape?: boolean;
    jobName?: string;
  }

  export default class RNPrint {
    static print(options: PrintOptions): Promise<void>;
    static selectPrinter(options?: { x?: number; y?: number }): Promise<{ name: string; url: string }>;
  }
}
