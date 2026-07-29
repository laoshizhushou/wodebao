const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageNumber, Header, Footer, PageBreak } = require('docx');

const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 24 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 36, bold: true, color: "000000", font: "SimHei" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "000000", font: "SimHei" },
        paragraph: { spacing: { before: 240, after: 120 } } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "老师的小能手 - 智能出卷", size: 18, color: "999999", font: "SimSun" })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "第 ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " 页，共 ", size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }), new TextRun({ text: " 页", size: 18 })]
      })] })
    },
    children: [
      // 标题
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: "《一元二次方程》单元测试卷" })] }),
      
      // 基本信息
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
        new TextRun({ text: "学科：数学    年级：九年级    教材版本：人教版", size: 22, font: "SimSun" })
      ] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
        new TextRun({ text: "总分：60分    建议用时：45分钟", size: 22, bold: true, font: "SimSun" })
      ] }),

      // 选择题
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("一、选择题（每题3分，共30分）")] }),

      // Q1
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "1. ", bold: true }), new TextRun("下列方程中，属于一元二次方程的是（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. x² + y = 1        B. x² + 2x = x² - 1")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. 3x² - 5x + 2 = 0    D. x + 1/x = 3")] }),

      // Q2
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "2. ", bold: true }), new TextRun("一元二次方程 2x² - 3x + 1 = 0 的二次项系数、一次项系数和常数项分别是（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. 2, 3, 1        B. 2, -3, 1")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. 2, -3, -1        D. -2, 3, -1")] }),

      // Q3
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "3. ", bold: true }), new TextRun("方程 x² = 4 的解为（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. x = 2        B. x = -2")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. x = ±2        D. x = ±4")] }),

      // Q4
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "4. ", bold: true }), new TextRun("用配方法将方程 x² + 6x - 7 = 0 变形，结果正确的是（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. (x + 3)² = 16        B. (x + 3)² = -16")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. (x + 6)² = 43        D. (x + 3)² = 2")] }),

      // Q5
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "5. ", bold: true }), new TextRun("一元二次方程 x² - 4x + 5 = 0 的根的情况是（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. 有两个不相等的实数根    B. 有两个相等的实数根")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. 没有实数根        D. 无法判断")] }),

      // Q6
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "6. ", bold: true }), new TextRun("若 x = 1 是方程 x² + bx - 2 = 0 的一个根，则 b 的值为（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. -1        B. 1")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. 2        D. -2")] }),

      // Q7
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "7. ", bold: true }), new TextRun("方程 x² - 5x + 6 = 0 的两根分别为 x₁、x₂，则 x₁ + x₂ 的值为（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. 5        B. 6")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. -5        D. -6")] }),

      // Q8
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "8. ", bold: true }), new TextRun("某商品原价200元，经过两次降价后售价为162元，若每次降价的百分率相同，设为x，则所列方程为（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. 200(1 - x)² = 162    B. 200(1 + x)² = 162")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. 200(1 - 2x) = 162    D. 200 - 200x² = 162")] }),

      // Q9
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "9. ", bold: true }), new TextRun("已知关于x的方程 (m - 1)x² + 3x - 2 = 0 是一元二次方程，则（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. m = 0        B. m ≠ 1")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("C. m = 1        D. m 为任意实数")] }),

      // Q10
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [
        new TextRun({ text: "10. ", bold: true }), new TextRun("一块长方形空地长为10m，宽为8m，现要在空地中修建两条等宽的小路（一条横向、一条纵向），使剩余空地面积为54m²，设小路宽为xm，则可列方程为（    ）")
      ] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("A. (10 - x)(8 - x) = 54")] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("B. 10×8 - 10x - 8x = 54")] }),
      new Paragraph({ indent: { left: 480 }, children: [new TextRun("C. (10 - x)(8 - x) + x² = 54")] }),
      new Paragraph({ indent: { left: 480 }, spacing: { after: 200 }, children: [new TextRun("D. 80 - 18x + x² = 54")] }),

      // 填空题
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("二、填空题（每题3分，共30分）")] }),

      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "11. ", bold: true }), new TextRun("一元二次方程 3x² = 6x 化为一般形式后是________，其常数项为________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "12. ", bold: true }), new TextRun("方程 (x - 2)² = 9 的解为________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "13. ", bold: true }), new TextRun("方程 x² - 3x = 0 的解为________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "14. ", bold: true }), new TextRun("若方程 x² + mx + 4 = 0 有两个相等的实数根，则 m = ________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "15. ", bold: true }), new TextRun("已知方程 2x² - 5x + 1 = 0 的两根为 x₁、x₂，则 x₁ · x₂ = ________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "16. ", bold: true }), new TextRun("一个正方形的面积比边长多12，设边长为x，则可列方程为________，解得边长为________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "17. ", bold: true }), new TextRun("方程 x² - 2x - 3 = 0 的两个根为 x₁ = ________，x₂ = ________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "18. ", bold: true }), new TextRun("已知一元二次方程 x² + 3x + k = 0 有实数根，则 k 的取值范围是________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "19. ", bold: true }), new TextRun("某农场2024年粮食产量为100吨，2026年粮食产量达到121吨。若每年增长的百分率相同，设年增长的百分率为x，则所列方程为________，解得 x = ________。")
      ] }),
      new Paragraph({ spacing: { before: 160, after: 120 }, children: [
        new TextRun({ text: "20. ", bold: true }), new TextRun("已知方程 x² - (m + 1)x + m = 0 的一个根为0，则 m = ________，另一个根为________。")
      ] }),

      // 分页 - 参考答案
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("参考答案与解析")] }),

      // 选择题答案
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("一、选择题")] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "1.【答案】C", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("一元二次方程需满足：只含一个未知数、未知数最高次数为2、整式方程。A含两个未知数；B化简后为2x = -1，是一次方程；D不是整式方程。只有C满足所有条件。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "2.【答案】B", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("方程 2x² - 3x + 1 = 0 中，二次项系数为2，一次项系数为-3（注意符号），常数项为1。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "3.【答案】C", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("x² = 4，直接开平方得 x = ±√4 = ±2。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "4.【答案】A", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("x² + 6x - 7 = 0 → x² + 6x = 7 → x² + 6x + 9 = 7 + 9 → (x + 3)² = 16。配方时一次项系数6的一半为3，3² = 9，两边同时加9。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "5.【答案】C", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("判别式 Δ = b² - 4ac = (-4)² - 4×1×5 = 16 - 20 = -4 < 0，所以方程没有实数根。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "6.【答案】B", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("将 x = 1 代入方程：1² + b×1 - 2 = 0 → 1 + b - 2 = 0 → b = 1。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "7.【答案】A", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("由韦达定理，x₁ + x₂ = -(-5)/1 = 5。也可以直接求解：(x-2)(x-3) = 0，x₁ = 2, x₂ = 3，x₁ + x₂ = 5。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "8.【答案】A", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("每次降价百分率为x，第一次降价后为 200(1-x)，第二次降价后为 200(1-x)²。根据题意：200(1-x)² = 162。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "9.【答案】B", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("要使方程为一元二次方程，二次项系数 (m-1) 不能为0，即 m - 1 ≠ 0，所以 m ≠ 1。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "10.【答案】A", bold: true })
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("修建十字形小路后，剩余部分可以拼成一个长为(10-x)m、宽为(8-x)m的长方形。所以 (10-x)(8-x) = 54。")
      ] }),

      // 填空题答案
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("二、填空题")] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "11.【答案】", bold: true }), new TextRun("3x² - 6x = 0；常数项为 0")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("将 3x² = 6x 移项得 3x² - 6x = 0，常数项为0。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "12.【答案】", bold: true }), new TextRun("x₁ = 5，x₂ = -1")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("(x-2)² = 9，开平方得 x-2 = ±3，所以 x = 5 或 x = -1。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "13.【答案】", bold: true }), new TextRun("x₁ = 0，x₂ = 3")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("x² - 3x = 0 → x(x - 3) = 0 → x = 0 或 x = 3。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "14.【答案】", bold: true }), new TextRun("m = ±4")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("有两个相等的实数根，则 Δ = 0。Δ = m² - 16 = 0，m = ±4。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "15.【答案】", bold: true }), new TextRun("x₁ · x₂ = 1/2")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("由韦达定理，x₁ · x₂ = c/a = 1/2。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "16.【答案】", bold: true }), new TextRun("x² = x + 12（或 x² - x - 12 = 0）；边长为 4")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("面积 x²，边长 x，x² = x + 12。解方程：(x-4)(x+3) = 0，x = 4（舍去负值）。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "17.【答案】", bold: true }), new TextRun("x₁ = 3，x₂ = -1")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("x² - 2x - 3 = 0 → (x-3)(x+1) = 0 → x = 3 或 x = -1。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "18.【答案】", bold: true }), new TextRun("k ≤ 9/4")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("有实数根则 Δ ≥ 0。Δ = 9 - 4k ≥ 0，k ≤ 9/4。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "19.【答案】", bold: true }), new TextRun("100(1+x)² = 121；x = 10%")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("从2024年到2026年经过2年，100(1+x)² = 121。(1+x)² = 1.21，1+x = 1.1，x = 0.1 = 10%。")
      ] }),

      new Paragraph({ spacing: { before: 120, after: 60 }, children: [
        new TextRun({ text: "20.【答案】", bold: true }), new TextRun("m = 0；另一个根为 1")
      ] }),
      new Paragraph({ indent: { left: 240 }, spacing: { after: 120 }, children: [
        new TextRun({ text: "【解析】", bold: true }), new TextRun("将 x = 0 代入：m = 0。当 m = 0 时方程为 x² - x = 0 → x(x-1) = 0，另一个根为 1。")
      ] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/app/data/所有对话/主对话/teacher-helper-website/outputs/一元二次方程_单元测试卷_九年级数学.docx", buffer);
  console.log("Word文档生成成功！");
});
