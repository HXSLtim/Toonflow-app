// 数字转中文大写工具函数
export default (num: number) => {
  const chineseNumbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const units = ["", "十", "百", "千"];
  const bigUnits = ["", "万", "亿"];

  if (num === 0) return chineseNumbers[0];

  // 按万、亿分段处理
  const sections: { text: string; unit: string; value: number }[] = [];
  let sectionIndex = 0;

  while (num > 0) {
    const section = num % 10000;
    sections.unshift({
      text: section > 0 ? convertSection(section) : "",
      unit: bigUnits[sectionIndex],
      value: section,
    });
    num = Math.floor(num / 10000);
    sectionIndex++;
  }

  let result = "";
  for (let i = 0; i < sections.length; i++) {
    const { text, unit, value } = sections[i];
    if (value === 0) continue;

    // 如果当前段小于 1000 且前面有非零段，需要添加零
    if (i > 0 && value < 1000 && sections[i - 1].value > 0) {
      result += "零";
    }

    result += text + unit;
  }

  // 处理零的情况
  result = result.replace(/零+/g, "零"); // 多个零合并为一个
  result = result.replace(/零([万亿])/g, "$1"); // 零万、零亿 -> 万、亿
  result = result.replace(/零+$/g, ""); // 末尾的零去掉

  // 处理特殊情况：10-19的简化
  if (result.startsWith("一十")) {
    result = result.substring(1);
  }

  return result;

  // 转换 0-9999 的数字
  function convertSection(n: number): string {
    let res = "";
    let needZero = false;

    // 千位
    const qian = Math.floor(n / 1000);
    if (qian > 0) {
      res += chineseNumbers[qian] + units[3];
      needZero = true;
    }

    // 百位
    const bai = Math.floor((n % 1000) / 100);
    if (bai > 0) {
      res += chineseNumbers[bai] + units[2];
      needZero = true;
    } else if (needZero && (n % 100) > 0) {
      res += "零";
      needZero = false;
    }

    // 十位
    const shi = Math.floor((n % 100) / 10);
    if (shi > 0) {
      res += chineseNumbers[shi] + units[1];
      needZero = true;
    } else if (needZero && (n % 10) > 0) {
      res += "零";
      needZero = false;
    }

    // 个位
    const ge = n % 10;
    if (ge > 0) {
      res += chineseNumbers[ge];
    }

    return res;
  }
};
