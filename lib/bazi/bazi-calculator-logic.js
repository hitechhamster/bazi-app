/**
 * Bazi Report Generator - v4.3 (Next.js 适配版)
 * 业务逻辑完全保留，仅调整导入/导出和日志开关
 */

// ========== 引入 lunar.js（Node.js 环境） ==========
const { Solar, Lunar } = require('./lunar.js');

// ========== 调试日志开关 ==========
// 设置环境变量 DEBUG_BAZI=1 即可开启详细日志
const DEBUG = process.env.DEBUG_BAZI === '1';
const log = DEBUG ? console.log : () => {};
const warn = DEBUG ? console.warn : () => {};

// ---------------------------------------------------------
// 1. 辅助函数：五行计数（带藏干权重）
// ---------------------------------------------------------
function getFiveElementsCount(eightChar) {
  const wuXingMap = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
  };

  const elementKeys = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 藏干权重：本气1.0，中气0.5，余气0.3
  const cangGanWeights = [1.0, 0.5, 0.3];

  log('');
  log('╔════════════════════════════════════════════════════════════╗');
  log('║              五行计算调试日志 (Bazi Logic v4.3)              ║');
  log('╚════════════════════════════════════════════════════════════╝');
  log('');

  const yearPillar = eightChar.getYear();
  const monthPillar = eightChar.getMonth();
  const dayPillar = eightChar.getDay();
  const hourPillar = eightChar.getTime();

  log('【四柱八字】');
  log(`  年柱: ${yearPillar}`);
  log(`  月柱: ${monthPillar}`);
  log(`  日柱: ${dayPillar}`);
  log(`  时柱: ${hourPillar}`);
  log('');

  // 1. 天干五行（权重1.0）
  const allGans = [
    eightChar.getYearGan(),
    eightChar.getMonthGan(),
    eightChar.getDayGan(),
    eightChar.getTimeGan()
  ];

  log('【第一步：天干五行计算】');
  log(`  天干列表: [${allGans.join(', ')}]`);
  log('  计算过程:');

  allGans.forEach((gan, idx) => {
    const pillarNames = ['年干', '月干', '日干', '时干'];
    const element = wuXingMap[gan];
    if (element && elementKeys[element]) {
      counts[elementKeys[element]] += 1.0;
      log(`    ${pillarNames[idx]}: ${gan} → ${element} (+1.0)`);
    }
  });

  log('');
  log('  天干计算后五行:');
  log(`    木(wood): ${counts.wood}`);
  log(`    火(fire): ${counts.fire}`);
  log(`    土(earth): ${counts.earth}`);
  log(`    金(metal): ${counts.metal}`);
  log(`    水(water): ${counts.water}`);
  log('');

  // 2. 藏干五行（按权重计算）
  const yearHideGan = eightChar.getYearHideGan();
  const monthHideGan = eightChar.getMonthHideGan();
  const dayHideGan = eightChar.getDayHideGan();
  const hourHideGan = eightChar.getTimeHideGan();

  const allHideGans = [yearHideGan, monthHideGan, dayHideGan, hourHideGan];

  log('【第二步：地支藏干五行计算】');
  log('');
  log('  藏干原始数据:');
  log(`    年支(${yearPillar ? yearPillar[1] : '?'})藏干:`, yearHideGan);
  log(`    月支(${monthPillar ? monthPillar[1] : '?'})藏干:`, monthHideGan);
  log(`    日支(${dayPillar ? dayPillar[1] : '?'})藏干:`, dayHideGan);
  log(`    时支(${hourPillar ? hourPillar[1] : '?'})藏干:`, hourHideGan);
  log('');
  log('  计算过程 (权重: 本气1.0, 中气0.5, 余气0.3):');

  const pillarZhiNames = [
    yearPillar ? yearPillar[1] : '年支',
    monthPillar ? monthPillar[1] : '月支',
    dayPillar ? dayPillar[1] : '日支',
    hourPillar ? hourPillar[1] : '时支'
  ];

  allHideGans.forEach((hideGanArray, pillarIndex) => {
    log(`    --- ${pillarZhiNames[pillarIndex]} ---`);

    if (Array.isArray(hideGanArray)) {
      if (hideGanArray.length === 0) {
        log(`      (空数组，无藏干)`);
      }
      hideGanArray.forEach((gan, index) => {
        const element = wuXingMap[gan];
        const weight = cangGanWeights[index] || 0.3;
        const weightName = index === 0 ? '本气' : (index === 1 ? '中气' : '余气');

        if (element && elementKeys[element]) {
          counts[elementKeys[element]] += weight;
          log(`      [${index}] ${gan} → ${element} (${weightName}, +${weight})`);
        } else {
          log(`      [${index}] ${gan} → 未识别元素!`);
        }
      });
    } else if (hideGanArray === null || hideGanArray === undefined) {
      log(`      ⚠️ 返回值为 ${hideGanArray}`);
    } else {
      log(`      ⚠️ 不是数组! 实际值:`, hideGanArray);
    }
  });

  log('');
  log('【最终结果】');
  log('');
  log('  精确值 (含小数):');
  log(`    木(wood):  ${counts.wood.toFixed(2)}`);
  log(`    火(fire):  ${counts.fire.toFixed(2)}`);
  log(`    土(earth): ${counts.earth.toFixed(2)}`);
  log(`    金(metal): ${counts.metal.toFixed(2)}`);
  log(`    水(water): ${counts.water.toFixed(2)}`);
  log('');

  return counts;
}

// ---------------------------------------------------------
// 2. 辅助函数：获取天干五行
// ---------------------------------------------------------
function getGanElement(gan) {
  const map = {
    '甲': 'Wood', '乙': 'Wood',
    '丙': 'Fire', '丁': 'Fire',
    '戊': 'Earth', '己': 'Earth',
    '庚': 'Metal', '辛': 'Metal',
    '壬': 'Water', '癸': 'Water'
  };
  return map[gan] || '';
}

// ---------------------------------------------------------
// 3. 辅助函数：获取天干阴阳
// ---------------------------------------------------------
function getGanYinYang(gan) {
  const yang = ['甲', '丙', '戊', '庚', '壬'];
  return yang.includes(gan) ? 'Yang' : 'Yin';
}

// ---------------------------------------------------------
// 4. 安全获取函数
// ---------------------------------------------------------
function safeCall(obj, methodName, defaultValue) {
  try {
    if (obj && typeof obj[methodName] === 'function') {
      return obj[methodName]();
    }
  } catch (e) {
    warn(`Error calling ${methodName}:`, e);
  }
  return defaultValue;
}

// ---------------------------------------------------------
// 5. 主函数：生成八字数据
// ---------------------------------------------------------
function generateBaziReport(tst, gender) {

  log('');
  log('┌──────────────────────────────────────────────────────────────┐');
  log('│                  generateBaziReport 调试                      │');
  log('└──────────────────────────────────────────────────────────────┘');
  log('输入参数:');
  log('  真太阳时:', tst.toISOString());
  log('  UTC时间:', tst.getUTCFullYear(), '-', tst.getUTCMonth() + 1, '-', tst.getUTCDate(), tst.getUTCHours(), ':', tst.getUTCMinutes());
  log('  性别:', gender);
  log('');

  const solar = Solar.fromYmdHms(
    tst.getUTCFullYear(),
    tst.getUTCMonth() + 1,
    tst.getUTCDate(),
    tst.getUTCHours(),
    tst.getUTCMinutes(),
    tst.getUTCSeconds()
  );

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  log('lunar.js 返回的八字:');
  log('  年柱:', eightChar.getYear());
  log('  月柱:', eightChar.getMonth());
  log('  日柱:', eightChar.getDay());
  log('  时柱:', eightChar.getTime());
  log('');

  const genderValue = (gender === 'male') ? 1 : 0;
  const yun = eightChar.getYun(genderValue);
  const daYunCycles = yun.getDaYun(10);

  const currentYear = new Date().getFullYear();

  // 构建大运数据
  let currentDayunIndex = -1;

  const luckCycles = daYunCycles.map((cycle, index) => {
    const startYear = safeCall(cycle, 'getStartYear', 0);
    const endYear = safeCall(cycle, 'getEndYear', 0);

    if (currentYear >= startYear && currentYear <= endYear) {
      currentDayunIndex = index;
    }

    let liuNianData = [];

    try {
      const liuNianCycles = cycle.getLiuNian();
      const xiaoYunCycles = cycle.getXiaoYun();

      liuNianData = liuNianCycles.map((ln, idx) => ({
        year: safeCall(ln, 'getYear', 0),
        age: safeCall(ln, 'getAge', 0),
        ganZhi: safeCall(ln, 'getGanZhi', ''),
        xiaoYunGanZhi: xiaoYunCycles[idx] ? safeCall(xiaoYunCycles[idx], 'getGanZhi', '') : ''
      }));
    } catch (e) {
      warn('Error getting liu nian:', e);
    }

    const ganZhi = safeCall(cycle, 'getGanZhi', '');

    return {
      ganZhi: ganZhi,
      gan: ganZhi[0] || '',
      zhi: ganZhi[1] || '',
      startAge: safeCall(cycle, 'getStartAge', 0),
      endAge: safeCall(cycle, 'getEndAge', 0),
      startYear: startYear,
      endYear: endYear,
      liuNian: liuNianData
    };
  });

  // 获取起运信息
  let yunInfo = {
    startAge: 0,
    startYear: 0,
    startMonth: 1,
    startDay: 1,
    isForward: true,
    description: '顺行 Forward'
  };

  try {
    if (luckCycles.length > 0) {
      yunInfo.startAge = luckCycles[0].startAge;
      yunInfo.startYear = luckCycles[0].startYear;
    }

    if (typeof yun.isForward === 'function') {
      yunInfo.isForward = yun.isForward();
    } else if (typeof yun.isShun === 'function') {
      yunInfo.isForward = yun.isShun();
    }
    yunInfo.description = yunInfo.isForward ? '顺行 Forward' : '逆行 Backward';

  } catch (e) {
    warn('Error getting yun info:', e);
  }

  // 当前大运
  let currentDayun = null;
  if (currentDayunIndex >= 0 && currentDayunIndex < luckCycles.length) {
    currentDayun = {
      ...luckCycles[currentDayunIndex],
      index: currentDayunIndex,
      isCurrent: true
    };
  } else if (luckCycles.length > 0) {
    currentDayun = {
      ...luckCycles[0],
      index: 0,
      isCurrent: false,
      notStarted: true
    };
  }

  // 当前流年
  let currentLiuNian = null;
  if (currentDayun && currentDayun.liuNian) {
    for (let ln of currentDayun.liuNian) {
      if (ln.year === currentYear) {
        currentLiuNian = ln;
        break;
      }
    }
  }

  if (!currentLiuNian) {
    try {
      const currentSolar = Solar.fromYmd(currentYear, 6, 1);
      const currentLunar = currentSolar.getLunar();
      const yearGanZhi = currentLunar.getYearInGanZhi();
      currentLiuNian = {
        year: currentYear,
        ganZhi: yearGanZhi,
        gan: yearGanZhi[0] || '',
        zhi: yearGanZhi[1] || ''
      };
    } catch (e) {
      currentLiuNian = { year: currentYear, ganZhi: '', gan: '', zhi: '' };
    }
  }

  // 日主信息
  const dayMaster = eightChar.getDayGan();
  const dayMasterElement = getGanElement(dayMaster);
  const dayMasterYinYang = getGanYinYang(dayMaster);

  // 四柱详细数据
  const pillars = {
    year: {
      ganZhi: safeCall(eightChar, 'getYear', ''),
      gan: safeCall(eightChar, 'getYearGan', ''),
      zhi: safeCall(eightChar, 'getYearZhi', ''),
      wuXing: safeCall(eightChar, 'getYearWuXing', ''),
      naYin: safeCall(eightChar, 'getYearNaYin', ''),
      shiShenGan: safeCall(eightChar, 'getYearShiShenGan', ''),
      shiShenZhi: safeCall(eightChar, 'getYearShiShenZhi', ''),
      diShi: safeCall(eightChar, 'getYearDiShi', ''),
      xunKong: safeCall(eightChar, 'getYearXunKong', ''),
      hideGan: safeCall(eightChar, 'getYearHideGan', [])
    },
    month: {
      ganZhi: safeCall(eightChar, 'getMonth', ''),
      gan: safeCall(eightChar, 'getMonthGan', ''),
      zhi: safeCall(eightChar, 'getMonthZhi', ''),
      wuXing: safeCall(eightChar, 'getMonthWuXing', ''),
      naYin: safeCall(eightChar, 'getMonthNaYin', ''),
      shiShenGan: safeCall(eightChar, 'getMonthShiShenGan', ''),
      shiShenZhi: safeCall(eightChar, 'getMonthShiShenZhi', ''),
      diShi: safeCall(eightChar, 'getMonthDiShi', ''),
      xunKong: safeCall(eightChar, 'getMonthXunKong', ''),
      hideGan: safeCall(eightChar, 'getMonthHideGan', [])
    },
    day: {
      ganZhi: safeCall(eightChar, 'getDay', ''),
      gan: safeCall(eightChar, 'getDayGan', ''),
      zhi: safeCall(eightChar, 'getDayZhi', ''),
      wuXing: safeCall(eightChar, 'getDayWuXing', ''),
      naYin: safeCall(eightChar, 'getDayNaYin', ''),
      shiShenGan: '日主',
      shiShenZhi: safeCall(eightChar, 'getDayShiShenZhi', ''),
      diShi: safeCall(eightChar, 'getDayDiShi', ''),
      xunKong: safeCall(eightChar, 'getDayXunKong', ''),
      hideGan: safeCall(eightChar, 'getDayHideGan', [])
    },
    hour: {
      ganZhi: safeCall(eightChar, 'getTime', ''),
      gan: safeCall(eightChar, 'getTimeGan', ''),
      zhi: safeCall(eightChar, 'getTimeZhi', ''),
      wuXing: safeCall(eightChar, 'getTimeWuXing', ''),
      naYin: safeCall(eightChar, 'getTimeNaYin', ''),
      shiShenGan: safeCall(eightChar, 'getTimeShiShenGan', ''),
      shiShenZhi: safeCall(eightChar, 'getTimeShiShenZhi', ''),
      diShi: safeCall(eightChar, 'getTimeDiShi', ''),
      xunKong: safeCall(eightChar, 'getTimeXunKong', ''),
      hideGan: safeCall(eightChar, 'getTimeHideGan', [])
    }
  };

  // 特殊宫位
  const specialPalaces = {
    taiYuan: safeCall(eightChar, 'getTaiYuan', ''),
    mingGong: safeCall(eightChar, 'getMingGong', ''),
    shenGong: safeCall(eightChar, 'getShenGong', '')
  };

  // 黄历信息
  const almanac = {
    yi: safeCall(lunar, 'getDayYi', []).join(', '),
    ji: safeCall(lunar, 'getDayJi', []).join(', '),
    chong: safeCall(lunar, 'getDayChongShengXiao', ''),
    sha: safeCall(lunar, 'getDaySha', ''),
    jiShen: safeCall(lunar, 'getDayJiShen', []).join(' '),
    xiongSha: safeCall(lunar, 'getDayXiongSha', []).join(' ')
  };

  // 生肖
  const zodiac = {
    year: safeCall(lunar, 'getYearShengXiao', ''),
    month: safeCall(lunar, 'getMonthShengXiao', ''),
    day: safeCall(lunar, 'getDayShengXiao', ''),
    hour: safeCall(lunar, 'getTimeShengXiao', '')
  };

  // 计算五行
  const fiveElements = getFiveElementsCount(eightChar);

  return {
    dayMaster: dayMaster,
    dayMasterElement: dayMasterElement,
    dayMasterYinYang: dayMasterYinYang,
    dayMasterFull: `${dayMaster} (${dayMasterYinYang} ${dayMasterElement})`,

    pillars: pillars,

    yunInfo: yunInfo,
    currentDayun: currentDayun,
    currentLiuNian: currentLiuNian,
    luckCycles: luckCycles,

    specialPalaces: specialPalaces,
    fiveElements: fiveElements,
    almanac: almanac,
    zodiac: zodiac,

    solarDate: solar.toYmdHms(),
    lunarDate: lunar.toString(),

    meta: {
      generatedAt: new Date().toISOString(),
      version: '4.3-nextjs',
      gender: gender
    }
  };
}

// ========== 导出（Next.js 服务端可 import） ==========
module.exports = {
  generateBaziReport,
  getFiveElementsCount,
  getGanElement,
  getGanYinYang
};