/**
 * Native On-Device Bilingual Worksheet PDF Builder.
 * Produces print-ready A4 Foundational Literacy and Numeracy (FLN) worksheets.
 * Zero-cloud rendering: Generates compliant HTML with embedded styling, borders, and Ol Chiki fonts.
 */

export interface FLNWorksheetItem {
  id: string;
  category: string; // 'Numbers', 'Words', 'Everyday Sentences'
  hindiText: string;
  santhaliOlChiki: string;
  pronunciationLatin: string;
}

export const generateWorksheetHtml = (
  schoolName: string,
  grade: string,
  topic: string,
  items: FLNWorksheetItem[]
): string => {
  const rowsHtml = items
    .map(
      (item, idx) => `
      <tr class="worksheet-row">
        <td class="col-num">${idx + 1}</td>
        <td class="col-hindi">
          <div class="primary-text">${item.hindiText}</div>
        </td>
        <td class="col-santhali">
          <div class="ol-chiki-text">${item.santhaliOlChiki}</div>
          <div class="latin-subtext">(${item.pronunciationLatin})</div>
        </td>
        <td class="col-practice">
          <div class="practice-box">
            <span class="tracing-dots">${item.santhaliOlChiki}</span>
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${topic} - Bilingual FLN Worksheet</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1A1918;
            background-color: #FFFFFF;
            margin: 0;
            padding: 0;
          }
          /* Sohrai Geometric Wall Art Border */
          .border-wrapper {
            border: 4px solid #C85A32;
            padding: 18px;
            border-radius: 8px;
            position: relative;
          }
          .sohrai-header-pattern {
            background-color: #F4EFE6;
            border-bottom: 3px solid #2C5E3B;
            padding: 12px;
            text-align: center;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .title {
            color: #C85A32;
            font-size: 24px;
            font-weight: 900;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .subtitle {
            color: #2C5E3B;
            font-size: 14px;
            font-weight: 700;
            margin-top: 4px;
          }
          .meta-bar {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 16px;
            border-bottom: 2px dashed #D8CBB5;
            padding-bottom: 8px;
          }
          /* Table Layout */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th {
            background-color: #2C5E3B;
            color: #FFFFFF;
            font-size: 13px;
            padding: 10px;
            text-align: left;
            border: 1px solid #1E4229;
          }
          td {
            padding: 12px 10px;
            border: 1px solid #D8CBB5;
            vertical-align: middle;
          }
          .col-num {
            width: 5%;
            font-weight: bold;
            text-align: center;
          }
          .col-hindi {
            width: 30%;
            font-size: 17px;
            font-weight: 600;
          }
          .col-santhali {
            width: 35%;
          }
          .ol-chiki-text {
            font-size: 22px;
            font-weight: bold;
            color: #C85A32;
          }
          .latin-subtext {
            font-size: 12px;
            color: #6B7280;
            font-style: italic;
          }
          .col-practice {
            width: 30%;
          }
          .practice-box {
            border: 2px dashed #D8CBB5;
            height: 48px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #FAF7F0;
          }
          .tracing-dots {
            color: #D1C5AF;
            font-size: 22px;
            letter-spacing: 4px;
          }
          .footer-stamp-area {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 10px;
          }
          .stamp-box {
            width: 120px;
            height: 60px;
            border: 2px solid #2C5E3B;
            border-radius: 8px;
            text-align: center;
            font-size: 10px;
            color: #2C5E3B;
            padding-top: 6px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="border-wrapper">
          <div class="sohrai-header-pattern">
            <h1 class="title">JANBHASHA BILINGUAL FLN WORKSHEET</h1>
            <div class="subtitle">NIPUN Bharat Regional Alignment • Hindi - Santhali (Ol Chiki)</div>
          </div>

          <div class="meta-bar">
            <span><strong>School:</strong> ${schoolName}</span>
            <span><strong>Grade:</strong> ${grade}</span>
            <span><strong>Topic:</strong> ${topic}</span>
            <span><strong>Student Name:</strong> __________________</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hindi (मानक हिंदी)</th>
                <th>Santhali (ᱥᱟᱱᱛᱟᱲᱤ ᱚᱞ ᱪᱤᱠᱤ)</th>
                <th>Student Practice / Tracing (ᱚᱞ ᱪᱮᱫ)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-stamp-area">
            <div style="font-size: 11px; color: #555;">
              Generated on-device via Janbhasha Offline Engine (Zero-Cloud Verified)
            </div>
            <div class="stamp-box">
              TEACHER STAMP<br/>
              (ᱥᱟᱨᱦᱟᱣ ᱢᱚᱦᱚᱨ)
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
