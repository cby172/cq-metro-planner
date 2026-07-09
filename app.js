(function () {
  const BUILTIN_DATA = window.METRO_DATA;
  const COLORS = [
    "#d71920", "#0072bc", "#00a651", "#f28c28", "#8e44ad",
    "#f9709a", "#8a6fdf", "#00a0a8", "#7fbf3f", "#b58900",
    "#f4c20d", "#1f9d55", "#a6611a", "#00a6d6", "#64748b",
  ];

  const CANVAS = { width: 1500, height: 1040 };
  const MAP_ANCHORS = {
    "朝天门": [1185, 520], "小什字": [1120, 540], "较场口": [1060, 560],
    "七星岗": [1000, 570], "两路口": [930, 585], "鹅岭": [865, 600],
    "大坪": [780, 620], "石桥铺": [690, 650], "沙坪坝": [560, 620],
    "大学城": [250, 600], "璧山": [120, 625],
    "临江门": [1090, 525], "曾家岩": [1010, 470], "牛角沱": [930, 520],
    "李子坝": [875, 555], "谢家湾": [720, 735], "杨家坪": [650, 775],
    "大渡口": [520, 840], "鱼洞": [390, 910],
    "重庆交通大学": [760, 805], "六公里": [785, 775], "重庆工商大学": [810, 750],
    "四公里": [835, 725], "南坪": [870, 700], "工贸": [895, 655],
    "铜元局": [915, 620], "观音桥": [970, 420], "红旗河沟": [960, 350],
    "重庆北站南广场": [1050, 270], "重庆北站北广场": [1080, 245],
    "江北机场T2航站楼": [1295, 130], "江北机场T3航站楼": [1265, 150],
    "茶园": [1210, 840], "上新街": [1120, 685], "大剧院": [1160, 475],
    "江北城": [1130, 445], "五里店": [1080, 430], "红土地": [1025, 385],
    "黄泥塝": [990, 320], "花卉园": [900, 295], "大龙山": [830, 270],
    "冉家坝": [780, 280], "北碚": [420, 120],
    "重庆图书馆": [530, 535], "重庆大学": [585, 675], "南桥寺": [710, 335],
    "体育公园": [750, 305], "动步公园": [835, 280], "洪湖东路": [930, 285],
    "民安大道": [1030, 315], "弹子石": [1160, 650], "海棠溪": [1040, 735],
    "南湖": [855, 785], "奥体中心": [705, 690], "重庆西站": [470, 665],
    "凤鸣山": [500, 590], "上桥": [470, 610],
    "悦来": [1150, 80], "中央公园": [1215, 95], "鲤鱼池": [1000, 430],
    "后堡": [980, 615], "兰花路": [790, 820],
  };

  const LINE_TEMPLATES = {
    "1号线": [[120, 625], [300, 600], [560, 620], [780, 620], [930, 585], [1060, 560], [1185, 520]],
    "2号线": [[1060, 560], [1090, 525], [1010, 470], [930, 520], [780, 620], [720, 735], [650, 775], [520, 840], [390, 910]],
    "3号线": [[390, 910], [620, 850], [760, 805], [870, 700], [930, 585], [970, 420], [960, 350], [1050, 270], [1295, 130]],
    "4号线": [[930, 230], [1080, 245], [1190, 300], [1340, 360]],
    "5号线": [[900, 105], [830, 270], [780, 420], [690, 650], [470, 665], [300, 760]],
    "6号线": [[1210, 840], [1120, 685], [1120, 540], [1080, 430], [960, 350], [780, 280], [600, 185], [420, 120]],
    "9号线": [[430, 560], [560, 620], [780, 620], [900, 500], [1025, 385], [1130, 445], [1260, 520]],
    "10号线": [[980, 615], [1000, 570], [1010, 470], [1025, 385], [1050, 270], [1265, 150], [1150, 80]],
    "18号线": [[720, 760], [780, 620], [690, 650], [520, 840], [390, 910]],
    "空港线": [[1295, 130], [1340, 170], [1360, 240], [1330, 315]],
    "国博线": [[780, 280], [900, 200], [1040, 135], [1150, 80]],
    "环线": [[530, 535], [560, 620], [710, 335], [780, 280], [1050, 270], [1080, 430], [1120, 685], [835, 725], [720, 735], [470, 665], [500, 590], [530, 535]],
    "江跳线": [[390, 910], [310, 940], [230, 965], [150, 980]],
    "璧铜线": [[120, 625], [80, 540], [70, 445], [110, 360]],
    "重庆云巴": [[140, 525], [210, 500], [300, 475], [390, 440], [475, 405]],
  };

  let dataset = normalizeDataset(BUILTIN_DATA, "内置真实重庆轨道交通数据", "builtin");
  let graph = new Map();
  let stationLines = new Map();
  let lineMeta = new Map();
  let stationList = [];
  let activeRoute = null;
  let nextStationTarget = "start";
  let viewBox = { x: 0, y: 0, w: 1500, h: 1040 };
  let pointerState = null;

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindControls();
    rebuildAll();
    runPlan();
  }

  function cacheElements() {
    [
      "topStats", "dropZone", "fileInput", "resetDataButton", "downloadLineButton",
      "dataName", "sourceInfo", "startInput", "endInput", "startSuggest",
      "endSuggest", "strategySelect", "planButton", "swapButton", "demoButton",
      "statusMessage", "stationCount", "transferCount", "distanceValue",
      "fareValue", "timeValue", "legend", "mapViewport", "metroMap",
      "zoomInButton", "zoomOutButton", "resetViewButton", "courseOutput",
      "copyCourseButton", "plainGuide", "routeRows", "stationFilter", "stationList",
      "comparisonRows", "stationDetail", "toast",
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindControls() {
    els.planButton.addEventListener("click", runPlan);
    els.strategySelect.addEventListener("change", runPlan);
    els.swapButton.addEventListener("click", () => {
      [els.startInput.value, els.endInput.value] = [els.endInput.value, els.startInput.value];
      nextStationTarget = "start";
      runPlan();
    });
    els.demoButton.addEventListener("click", () => {
      els.startInput.value = "重庆交通大学";
      els.endInput.value = "朝天门";
      els.strategySelect.value = "minTransfers";
      nextStationTarget = "start";
      runPlan();
    });
    els.resetDataButton.addEventListener("click", () => {
      dataset = normalizeDataset(BUILTIN_DATA, "内置真实重庆轨道交通数据", "builtin");
      activeRoute = null;
      rebuildAll();
      runPlan();
    });
    els.downloadLineButton.addEventListener("click", downloadCurrentLineTxt);
    els.copyCourseButton.addEventListener("click", copyCourseOutput);

    bindSuggest(els.startInput, els.startSuggest, "start");
    bindSuggest(els.endInput, els.endSuggest, "end");
    els.stationFilter.addEventListener("input", renderStationBrowser);

    ["dragenter", "dragover"].forEach((eventName) => {
      els.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropZone.classList.add("dragging");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      els.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        els.dropZone.classList.remove("dragging");
      });
    });
    els.dropZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) readLineFile(file);
    });
    els.fileInput.addEventListener("change", () => {
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) readLineFile(file);
      els.fileInput.value = "";
    });

    els.zoomInButton.addEventListener("click", () => zoomAt(0.82));
    els.zoomOutButton.addEventListener("click", () => zoomAt(1.22));
    els.resetViewButton.addEventListener("click", resetView);
    els.mapViewport.addEventListener("wheel", onWheel, { passive: false });
    els.mapViewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function bindSuggest(input, box, target) {
    input.addEventListener("input", () => renderSuggestions(input, box, target));
    input.addEventListener("focus", () => renderSuggestions(input, box, target));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runPlan();
      }
      if (event.key === "Escape") {
        box.classList.remove("open");
      }
    });
    document.addEventListener("click", (event) => {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove("open");
      }
    });
  }

  function normalizeDataset(raw, label, type) {
    const lines = (raw.lines || []).map((line, index) => ({
      name: String(line.name || `线路${index + 1}`).trim(),
      color: line.color || COLORS[index % COLORS.length],
      avg_minutes: Number(line.avg_minutes || line.avgMinutes || 2.7),
      avg_distance: Number(line.avg_distance || line.avgDistance || 1.25),
      headway: Number(line.headway || 5),
      stations: Array.from(new Set((line.stations || []).map((s) => String(s).trim()).filter(Boolean))),
    })).filter((line) => line.stations.length >= 2);

    const stations = unique(lines.flatMap((line) => line.stations)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
    const transfers = stations.filter((station) => lines.filter((line) => line.stations.includes(station)).length >= 2);
    return {
      project: raw.project || "重庆轨道交通智能出行规划与可视化系统",
      generated_at: raw.generated_at || "2026-07-09",
      label,
      type,
      source: raw.source || {},
      lines,
      stations,
      transfer_stations: transfers,
      stats: {
        line_count: lines.length,
        station_count: stations.length,
        transfer_station_count: transfers.length,
      },
    };
  }

  function rebuildAll() {
    buildGraph();
    updateStats();
    renderSource();
    renderLegend();
    renderStationBrowser();
    renderStationDetail("");
    resetView();
    drawMap();
  }

  function buildGraph() {
    graph = new Map();
    stationLines = new Map();
    lineMeta = new Map();
    dataset.lines.forEach((line) => {
      lineMeta.set(line.name, line);
      line.stations.forEach((station) => {
        if (!graph.has(station)) graph.set(station, []);
        if (!stationLines.has(station)) stationLines.set(station, new Set());
        stationLines.get(station).add(line.name);
      });
      for (let index = 0; index < line.stations.length - 1; index += 1) {
        addEdge(line.stations[index], line.stations[index + 1], line);
        addEdge(line.stations[index + 1], line.stations[index], line);
      }
    });
    stationList = Array.from(graph.keys()).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  }

  function addEdge(from, to, line) {
    graph.get(from).push({
      to,
      line: line.name,
      color: line.color,
      minutes: line.avg_minutes,
      distance: line.avg_distance,
      headway: line.headway,
    });
  }

  function updateStats() {
    els.topStats.innerHTML = `
      <div><span>线路</span><strong>${dataset.stats.line_count}</strong></div>
      <div><span>站点</span><strong>${dataset.stats.station_count}</strong></div>
      <div><span>换乘站</span><strong>${dataset.stats.transfer_station_count}</strong></div>
    `;
  }

  function renderSource() {
    els.dataName.textContent = dataset.label;
    if (dataset.type === "builtin") {
      els.sourceInfo.innerHTML = `
        来源：<a href="${dataset.source.official_network_map || "https://www.cqmetro.cn/yyt/"}" target="_blank">重庆轨道交通官网运营线网图</a>，
        <a href="${dataset.source.station_list || "https://www.metroman.cn/cities/chongqing/stations"}" target="_blank">MetroMan 重庆车站列表</a>。
        采集日期：${dataset.generated_at}。距离、时间、票价为课程设计估算模型。
      `;
    } else {
      els.sourceInfo.textContent = `来源：用户拖入的 line.txt；已解析 ${dataset.stats.line_count} 条线路、${dataset.stats.station_count} 个站点、${dataset.stats.transfer_station_count} 个换乘站。`;
    }
  }

  function renderLegend() {
    els.legend.innerHTML = dataset.lines.map((line) => (
      `<span><i style="background:${escapeAttr(line.color)}"></i>${escapeHtml(line.name)}</span>`
    )).join("");
  }

  function readLineFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseLineText(String(reader.result || ""), file.name);
        dataset = parsed;
        activeRoute = null;
        rebuildAll();
        setStatus(`已导入 ${file.name}，解析出 ${dataset.stats.line_count} 条线路。`, "ok");
      } catch (error) {
        setStatus(error.message || "线路文件解析失败。", "error");
      }
    };
    reader.onerror = () => setStatus("文件读取失败，请重新拖入 line.txt。", "error");
    reader.readAsText(file, "utf-8");
  }

  function parseLineText(text, fileName) {
    const rows = text.split(/\r?\n/).map((row) => row.trim()).filter((row) => row && !row.startsWith("#"));
    if (!rows.length) throw new Error("line.txt 是空文件，至少需要一条线路。");
    const lines = [];
    rows.forEach((row, index) => {
      let name = "";
      let color = COLORS[index % COLORS.length];
      let minutes = 2.7;
      let distance = 1.25;
      let stationText = "";

      if (row.includes("|")) {
        const parts = row.split("|").map((part) => part.trim());
        if (parts.length < 5) {
          throw new Error(`第 ${index + 1} 行格式错误：增强格式应为 线路|颜色|时间|距离|站点列表。`);
        }
        [name, color] = parts;
        minutes = Number(parts[2]) || 2.7;
        distance = Number(parts[3]) || 1.25;
        stationText = parts.slice(4).join("|");
      } else {
        const colonIndex = findColon(row);
        if (colonIndex < 0) {
          throw new Error(`第 ${index + 1} 行格式错误：请使用“线路名：站点1，站点2”格式。`);
        }
        name = row.slice(0, colonIndex).trim();
        stationText = row.slice(colonIndex + 1).trim();
      }

      const stations = unique(stationText.split(/[，,、]/).map((station) => station.trim()).filter(Boolean));
      if (!name) throw new Error(`第 ${index + 1} 行缺少线路名。`);
      if (stations.length < 2) throw new Error(`第 ${index + 1} 行“${name}”至少需要两个站点。`);
      lines.push({ name, color, avg_minutes: minutes, avg_distance: distance, headway: 5, stations });
    });

    return normalizeDataset({
      project: "用户导入线路图",
      generated_at: new Date().toISOString().slice(0, 10),
      source: { note: `用户拖入文件：${fileName}` },
      lines,
    }, `用户拖入：${fileName}`, "uploaded");
  }

  function findColon(row) {
    const zh = row.indexOf("：");
    const en = row.indexOf(":");
    if (zh < 0) return en;
    if (en < 0) return zh;
    return Math.min(zh, en);
  }

  function runPlan() {
    try {
      const start = resolveStation(els.startInput.value);
      const end = resolveStation(els.endInput.value);
      const strategy = els.strategySelect.value;
      activeRoute = planRoute(start, end, strategy);
      renderRoute(activeRoute);
      renderComparison(start, end, strategy);
      drawMap();
      setStatus(`${strategyLabel(strategy)}：${start} → ${end}`, "ok");
    } catch (error) {
      activeRoute = null;
      renderEmptyRoute();
      renderEmptyComparison();
      drawMap();
      setStatus(error.message || "路线规划失败。", "error");
    }
  }

  function resolveStation(raw) {
    const query = String(raw || "").trim();
    if (!query) throw new Error("请输入起点和终点。");
    if (graph.has(query)) return query;
    const contains = stationList.filter((station) => station.includes(query) || query.includes(station));
    if (contains.length === 1) return contains[0];
    const ranked = rankStations(query, 5);
    if (ranked[0] && ranked[0].score >= 0.58) return ranked[0].station;
    const tips = ranked.map((item) => item.station).join("、") || "无";
    throw new Error(`未找到站点“${query}”，相近站点：${tips}`);
  }

  function rankStations(query, limit) {
    const value = String(query || "").trim();
    if (!value) return stationList.slice(0, limit).map((station) => ({ station, score: 1 }));
    return stationList.map((station) => {
      let score = lcsRatio(value, station);
      if (station.includes(value) || value.includes(station)) score += 0.7;
      const lines = Array.from(stationLines.get(station) || []);
      if (lines.some((line) => line.includes(value))) score += 0.25;
      return { station, score };
    }).sort((a, b) => b.score - a.score || a.station.localeCompare(b.station, "zh-Hans-CN")).slice(0, limit);
  }

  function lcsRatio(a, b) {
    const aa = Array.from(a);
    const bb = Array.from(b);
    const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
    for (let i = 1; i <= aa.length; i += 1) {
      for (let j = 1; j <= bb.length; j += 1) {
        dp[i][j] = aa[i - 1] === bb[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[aa.length][bb.length] / Math.max(aa.length, bb.length, 1);
  }

  function planRoute(start, end, strategy) {
    if (start === end) return summarizeRoute(strategy, [start], [], 0);
    if (strategy === "minStations") return bfs(start, end, strategy);
    return dijkstra(start, end, strategy);
  }

  function bfs(start, end, strategy) {
    const queue = [{ station: start, stations: [start], lines: [] }];
    const visited = new Set([start]);
    while (queue.length) {
      const current = queue.shift();
      if (current.station === end) return summarizeRoute(strategy, current.stations, current.lines, current.lines.length);
      for (const edge of graph.get(current.station) || []) {
        if (visited.has(edge.to)) continue;
        visited.add(edge.to);
        queue.push({
          station: edge.to,
          stations: current.stations.concat(edge.to),
          lines: current.lines.concat(edge.line),
        });
      }
    }
    throw new Error(`${start} 与 ${end} 不连通。`);
  }

  function dijkstra(start, end, strategy) {
    const heap = [{ cost: 0, station: start, line: "", stations: [start], lines: [] }];
    const best = new Map([[`${start}|`, 0]]);
    while (heap.length) {
      heap.sort((a, b) => a.cost - b.cost);
      const current = heap.shift();
      const stateKey = `${current.station}|${current.line}`;
      if (current.cost > (best.get(stateKey) ?? Infinity)) continue;
      if (current.station === end) return summarizeRoute(strategy, current.stations, current.lines, current.cost);
      for (const edge of graph.get(current.station) || []) {
        const changed = Boolean(current.line) && current.line !== edge.line;
        const nextCost = current.cost + edgeCost(edge, current.line, changed, strategy);
        const nextKey = `${edge.to}|${edge.line}`;
        if (nextCost < (best.get(nextKey) ?? Infinity)) {
          best.set(nextKey, nextCost);
          heap.push({
            cost: nextCost,
            station: edge.to,
            line: edge.line,
            stations: current.stations.concat(edge.to),
            lines: current.lines.concat(edge.line),
          });
        }
      }
    }
    throw new Error(`${start} 与 ${end} 不连通。`);
  }

  function edgeCost(edge, currentLine, changed, strategy) {
    if (strategy === "minTransfers") return 1 + (changed ? 1000 : 0);
    if (strategy === "cheapest") return edge.distance + (changed ? 0.03 : 0);
    if (strategy === "fastest") {
      const wait = !currentLine || changed ? (edge.headway || 5) / 2 : 0;
      const transferWalk = changed ? 5 : 0;
      return edge.minutes + wait + transferWalk;
    }
    return 1;
  }

  function summarizeRoute(strategy, stations, lines, score) {
    let minutes = 0;
    let distance = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const edge = findEdge(stations[i], stations[i + 1], lines[i]);
      if (!edge) continue;
      minutes += edge.minutes;
      distance += edge.distance;
      if (i === 0 || lines[i] !== lines[i - 1]) minutes += (edge.headway || 5) / 2;
      if (i > 0 && lines[i] !== lines[i - 1]) minutes += 5;
    }
    const transfers = countTransfers(lines);
    return {
      strategy,
      stations,
      lines,
      stationCount: Math.max(0, stations.length - 1),
      transferCount: transfers,
      distance,
      minutes,
      fare: estimateFare(distance),
      score,
      courseText: buildCourseText(stations, lines),
      plainGuide: buildPlainGuide(stations, lines),
    };
  }

  function findEdge(from, to, line) {
    return (graph.get(from) || []).find((edge) => edge.to === to && edge.line === line);
  }

  function countTransfers(lines) {
    let count = 0;
    for (let i = 1; i < lines.length; i += 1) {
      if (lines[i] !== lines[i - 1]) count += 1;
    }
    return count;
  }

  function estimateFare(distance) {
    if (distance <= 0) return 0;
    if (distance <= 6) return 2;
    if (distance <= 11) return 3;
    if (distance <= 17) return 4;
    if (distance <= 24) return 5;
    if (distance <= 32) return 6;
    return 7 + Math.floor((distance - 32) / 10);
  }

  function buildCourseText(stations, lines) {
    if (!lines.length) return `${stations[0]}。`;
    const parts = [lines[0], stations[0]];
    for (let i = 1; i < stations.length; i += 1) {
      const line = lines[i - 1];
      const previousLine = lines[i - 2];
      if (i > 1 && line !== previousLine) parts.push(`转${line}`);
      parts.push(stations[i]);
    }
    return `${parts.join("，")}。`;
  }

  function buildPlainGuide(stations, lines) {
    if (!lines.length) return [`起点和终点均为${stations[0]}，无需乘车。`];
    const guide = [];
    let segmentLine = lines[0];
    let segmentStart = stations[0];
    for (let i = 1; i < lines.length; i += 1) {
      if (lines[i] !== segmentLine) {
        const transferStation = stations[i];
        guide.push(`乘坐${segmentLine}从${segmentStart}到${transferStation}`);
        segmentLine = lines[i];
        segmentStart = transferStation;
      }
    }
    guide.push(`乘坐${segmentLine}从${segmentStart}到${stations[stations.length - 1]}`);
    return guide.map((text, index) => (index === 0 ? text : `换乘${text}`));
  }

  function renderRoute(route) {
    els.stationCount.textContent = route.stationCount;
    els.transferCount.textContent = route.transferCount;
    els.distanceValue.textContent = `${route.distance.toFixed(1)} km`;
    els.fareValue.textContent = `${route.fare} 元`;
    els.timeValue.textContent = `${route.minutes.toFixed(1)} 分钟`;
    els.courseOutput.textContent = route.courseText;
    els.plainGuide.innerHTML = route.plainGuide.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
    els.routeRows.innerHTML = route.stations.map((station, index) => (
      `<tr><td>${index + 1}</td><td>${escapeHtml(station)}</td><td>${escapeHtml(route.lines[index] || "到达")}</td></tr>`
    )).join("");
  }

  function renderComparison(start, end, selectedStrategy) {
    const strategies = ["minStations", "minTransfers", "fastest", "cheapest"];
    const rows = strategies.map((strategy) => {
      try {
        const route = planRoute(start, end, strategy);
        const selected = strategy === selectedStrategy;
        return `<tr class="${selected ? "selected-row" : ""}">
          <td><strong>${escapeHtml(strategyLabel(strategy))}</strong></td>
          <td>${route.stationCount}</td>
          <td>${route.transferCount}</td>
          <td>${route.minutes.toFixed(1)} 分钟</td>
          <td>${route.fare} 元</td>
          <td><button class="mini-btn" type="button" data-strategy="${strategy}">${selected ? "当前" : "应用"}</button></td>
        </tr>`;
      } catch (error) {
        return `<tr>
          <td><strong>${escapeHtml(strategyLabel(strategy))}</strong></td>
          <td colspan="5">暂时无法规划：${escapeHtml(error.message || "路线不可达")}</td>
        </tr>`;
      }
    }).join("");

    els.comparisonRows.innerHTML = rows;
    els.comparisonRows.querySelectorAll("button[data-strategy]").forEach((button) => {
      button.addEventListener("click", () => {
        if (els.strategySelect.value === button.dataset.strategy) return;
        els.strategySelect.value = button.dataset.strategy;
        runPlan();
      });
    });
  }

  function renderEmptyComparison() {
    els.comparisonRows.innerHTML = `<tr><td colspan="6">输入起点和终点后显示多方案对比。</td></tr>`;
  }

  function renderEmptyRoute() {
    els.stationCount.textContent = "-";
    els.transferCount.textContent = "-";
    els.distanceValue.textContent = "-";
    els.fareValue.textContent = "-";
    els.timeValue.textContent = "-";
    els.courseOutput.textContent = "查询后显示类似：3号线，重庆交通大学，六公里，...，转1号线，朝天门。";
    els.plainGuide.innerHTML = "";
    els.routeRows.innerHTML = "";
  }

  function renderSuggestions(input, box, target) {
    const query = input.value.trim();
    const suggestions = rankStations(query, 8);
    box.innerHTML = suggestions.map((item) => {
      const lines = Array.from(stationLines.get(item.station) || []).join(" / ");
      return `<button class="suggestion-item" type="button" data-station="${escapeAttr(item.station)}">
        <span>${escapeHtml(item.station)}</span><small>${escapeHtml(lines)}</small>
      </button>`;
    }).join("");
    box.classList.toggle("open", suggestions.length > 0);
    box.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.station;
        box.classList.remove("open");
        nextStationTarget = target === "start" ? "end" : "start";
        runPlan();
      });
    });
  }

  function renderStationBrowser() {
    const query = els.stationFilter.value.trim();
    const stations = stationList.filter((station) => {
      const lines = Array.from(stationLines.get(station) || []);
      return !query || station.includes(query) || lines.some((line) => line.includes(query));
    }).slice(0, 120);
    els.stationList.innerHTML = stations.map((station) => {
      const lines = Array.from(stationLines.get(station) || []).join(" / ");
      return `<li data-station="${escapeAttr(station)}"><strong>${escapeHtml(station)}</strong><small>${escapeHtml(lines)}</small></li>`;
    }).join("");
    els.stationList.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => chooseStation(item.dataset.station));
    });
    if (query && stations.length) renderStationDetail(stations[0]);
    if (query && !stations.length) renderStationDetail("");
  }

  function renderStationDetail(station) {
    if (!station || !graph.has(station)) {
      els.stationDetail.innerHTML = `
        <p class="muted-text">点击地图站点，或在下方输入站名，即可查看该站所属线路和相邻站。</p>
      `;
      return;
    }
    const lines = Array.from(stationLines.get(station) || []);
    const neighbors = unique((graph.get(station) || []).map((edge) => `${edge.line}：${edge.to}`));
    const transfer = lines.length > 1;
    els.stationDetail.innerHTML = `
      <div class="detail-head">
        <strong>${escapeHtml(station)}</strong>
        <span>${transfer ? "换乘站" : "普通站"}</span>
      </div>
      <div class="detail-row"><b>所属线路</b><span>${escapeHtml(lines.join(" / ") || "-")}</span></div>
      <div class="detail-row"><b>相邻站点</b><span>${escapeHtml(neighbors.join("；") || "-")}</span></div>
      <div class="detail-actions">
        <button class="mini-btn" type="button" data-fill="start">设为起点</button>
        <button class="mini-btn" type="button" data-fill="end">设为终点</button>
      </div>
    `;
    els.stationDetail.querySelectorAll("button[data-fill]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.fill === "start") {
          els.startInput.value = station;
          nextStationTarget = "end";
        } else {
          els.endInput.value = station;
          nextStationTarget = "start";
        }
        runPlan();
      });
    });
  }

  function chooseStation(station) {
    renderStationDetail(station);
    if (nextStationTarget === "start") {
      els.startInput.value = station;
      nextStationTarget = "end";
    } else {
      els.endInput.value = station;
      nextStationTarget = "start";
    }
    runPlan();
  }

  function drawMap() {
    const svg = els.metroMap;
    svg.innerHTML = "";
    addMapBackdrop(svg);
    const activeEdges = new Set();
    const activeStations = new Set(activeRoute ? activeRoute.stations : []);
    if (activeRoute) {
      for (let i = 0; i < activeRoute.lines.length; i += 1) {
        activeEdges.add(`${activeRoute.stations[i]}|${activeRoute.stations[i + 1]}|${activeRoute.lines[i]}`);
        activeEdges.add(`${activeRoute.stations[i + 1]}|${activeRoute.stations[i]}|${activeRoute.lines[i]}`);
      }
    }

    const width = CANVAS.width;
    const height = CANVAS.height;
    if (!viewBox.customized) viewBox = { x: 0, y: 0, w: width, h: height, customized: false };
    svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);

    const pointCache = new Map();
    dataset.lines.forEach((line, lineIndex) => {
      pointCache.set(line.name, getLinePoints(line, lineIndex));
    });

    const labelBoxes = [];
    const labeledStations = new Set();
    dataset.lines.forEach((line) => {
      const points = pointCache.get(line.name);
      const first = points[0];
      const last = points[points.length - 1];
      addSvgText(svg, first.x - 62, first.y - 10, line.name, "line-name", line.color);
      reserveLabelBox(labelBoxes, first.x - 62, first.y - 10, line.name, 14, "start");
      addTerminalLabel(svg, first.x, first.y, line.stations[0], line.color, -1, labelBoxes);
      addTerminalLabel(svg, last.x, last.y, line.stations[line.stations.length - 1], line.color, 1, labelBoxes);
      for (let i = 0; i < line.stations.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];
        const key = `${line.stations[i]}|${line.stations[i + 1]}|${line.name}`;
        const active = activeEdges.has(key);
        addSvgLine(svg, current.x, current.y, next.x, next.y, line.color, active, Boolean(activeRoute));
      }
    });

    dataset.lines.forEach((line) => {
      const points = pointCache.get(line.name);
      line.stations.forEach((station, index) => {
        const { x, y } = points[index];
        const active = activeStations.has(station);
        const transfer = (stationLines.get(station) || new Set()).size > 1;
        addSvgStation(svg, x, y, station, transfer, active, Boolean(activeRoute));
        const endpoint = index === 0 || index === line.stations.length - 1;
        const sparseLabel = !activeRoute && index % 11 === 0;
        const transferLabel = !activeRoute && transfer;
        const shouldLabel = active || transferLabel || endpoint || sparseLabel;
        if (shouldLabel && !labeledStations.has(station)) {
          const placed = addSmartStationLabel(svg, x, y, station, active, Boolean(activeRoute && !active), labelBoxes);
          if (placed) labeledStations.add(station);
        }
      });
    });
  }

  function addSmartStationLabel(svg, x, y, text, active, dim, labelBoxes) {
    const fontSize = active ? 13 : 10;
    const className = `station-label${active ? " active" : ""}${dim ? " dim" : ""}`;
    const candidates = [
      { x: x + 9, y: y - 12, anchor: "start" },
      { x: x + 9, y: y + 23, anchor: "start" },
      { x: x - 9, y: y - 12, anchor: "end" },
      { x: x - 9, y: y + 23, anchor: "end" },
      { x, y: y - 18, anchor: "middle" },
      { x, y: y + 29, anchor: "middle" },
    ];
    const placement = chooseLabelPlacement(candidates, text, fontSize, labelBoxes);
    if (!placement && !active) return false;
    const target = placement || candidates[0];
    const node = addSvgText(svg, target.x, target.y, text, className);
    node.setAttribute("text-anchor", target.anchor);
    reserveLabelBox(labelBoxes, target.x, target.y, text, fontSize, target.anchor);
    return true;
  }

  function addMapBackdrop(svg) {
    const river = document.createElementNS("http://www.w3.org/2000/svg", "path");
    river.setAttribute("d", "M 1120 360 C 1020 420, 1130 510, 1010 590 C 880 680, 1040 760, 900 835 C 790 895, 620 875, 520 930");
    river.setAttribute("fill", "none");
    river.setAttribute("stroke", "#bae6fd");
    river.setAttribute("stroke-width", "42");
    river.setAttribute("stroke-linecap", "round");
    river.setAttribute("opacity", "0.55");
    svg.appendChild(river);

    const riverLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    riverLine.setAttribute("d", river.getAttribute("d"));
    riverLine.setAttribute("fill", "none");
    riverLine.setAttribute("stroke", "#38bdf8");
    riverLine.setAttribute("stroke-width", "2");
    riverLine.setAttribute("stroke-dasharray", "10 10");
    riverLine.setAttribute("opacity", "0.45");
    svg.appendChild(riverLine);

    addSvgText(svg, 1300, 70, "北", "north-label");
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M 1310 88 L 1322 120 L 1310 113 L 1298 120 Z");
    arrow.setAttribute("fill", "#0f172a");
    arrow.setAttribute("opacity", "0.55");
    svg.appendChild(arrow);
  }

  function getLinePoints(line, lineIndex) {
    const template = LINE_TEMPLATES[line.name] || fallbackTemplate(lineIndex);
    const base = line.stations.map((_, index) => samplePolyline(template, index / Math.max(line.stations.length - 1, 1)));
    const anchors = line.stations
      .map((station, index) => ({ station, index, point: MAP_ANCHORS[station] }))
      .filter((item) => item.point)
      .map((item) => ({ ...item, x: item.point[0], y: item.point[1] }));

    if (!anchors.length) return base;
    if (anchors.length === 1) {
      const anchor = anchors[0];
      const dx = anchor.x - base[anchor.index].x;
      const dy = anchor.y - base[anchor.index].y;
      return base.map((point) => ({ x: point.x + dx, y: point.y + dy }));
    }

    const points = base.map((point) => ({ ...point }));
    for (let a = 0; a < anchors.length - 1; a += 1) {
      const left = anchors[a];
      const right = anchors[a + 1];
      const span = Math.max(right.index - left.index, 1);
      for (let index = left.index; index <= right.index; index += 1) {
        const t = (index - left.index) / span;
        const bend = Math.sin(t * Math.PI) * lineBend(line.name, a);
        const vx = right.x - left.x;
        const vy = right.y - left.y;
        const len = Math.max(Math.hypot(vx, vy), 1);
        const nx = -vy / len;
        const ny = vx / len;
        points[index] = {
          x: left.x + vx * t + nx * bend,
          y: left.y + vy * t + ny * bend,
        };
      }
    }

    const first = anchors[0];
    const firstDelta = { x: first.x - base[first.index].x, y: first.y - base[first.index].y };
    for (let index = 0; index < first.index; index += 1) {
      points[index] = { x: base[index].x + firstDelta.x, y: base[index].y + firstDelta.y };
    }

    const last = anchors[anchors.length - 1];
    const lastDelta = { x: last.x - base[last.index].x, y: last.y - base[last.index].y };
    for (let index = last.index + 1; index < base.length; index += 1) {
      points[index] = { x: base[index].x + lastDelta.x, y: base[index].y + lastDelta.y };
    }

    return points.map((point, index) => {
      const station = line.stations[index];
      const anchor = MAP_ANCHORS[station];
      return anchor ? { x: anchor[0], y: anchor[1] } : point;
    });
  }

  function fallbackTemplate(lineIndex) {
    const y = 170 + (lineIndex % 8) * 90;
    const offset = Math.floor(lineIndex / 8) * 120;
    return [[170 + offset, y], [520 + offset, y + 50], [900 + offset, y - 20], [1300, y + 60]];
  }

  function lineBend(lineName, segmentIndex) {
    const base = {
      "1号线": -18, "2号线": 24, "3号线": -22, "4号线": 18, "5号线": -26,
      "6号线": 28, "9号线": -18, "10号线": 20, "18号线": 18, "环线": 34,
    }[lineName] || 14;
    return segmentIndex % 2 === 0 ? base : -base * 0.75;
  }

  function samplePolyline(points, t) {
    const segments = [];
    let total = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[index + 1];
      const length = Math.hypot(x2 - x1, y2 - y1);
      segments.push({ x1, y1, x2, y2, length });
      total += length;
    }
    let target = total * t;
    for (const segment of segments) {
      if (target <= segment.length) {
        const local = segment.length ? target / segment.length : 0;
        return {
          x: segment.x1 + (segment.x2 - segment.x1) * local,
          y: segment.y1 + (segment.y2 - segment.y1) * local,
        };
      }
      target -= segment.length;
    }
    const last = points[points.length - 1];
    return { x: last[0], y: last[1] };
  }

  function addTerminalLabel(svg, x, y, text, color, direction, labelBoxes) {
    const labelText = `${direction < 0 ? "◀ " : "▶ "}${text}`;
    const candidates = [
      { x: x + direction * 12, y: y + (direction < 0 ? -18 : 18), anchor: direction < 0 ? "end" : "start" },
      { x: x + direction * 18, y: y + (direction < 0 ? 22 : -18), anchor: direction < 0 ? "end" : "start" },
      { x, y: y + (direction < 0 ? -28 : 30), anchor: "middle" },
    ];
    const target = chooseLabelPlacement(candidates, labelText, 12, labelBoxes);
    if (!target) return false;
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", target.x);
    label.setAttribute("y", target.y);
    label.setAttribute("text-anchor", target.anchor);
    label.setAttribute("fill", color);
    label.setAttribute("class", "terminal-label");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-weight", "700");
    label.textContent = labelText;
    svg.appendChild(label);
    reserveLabelBox(labelBoxes, target.x, target.y, labelText, 12, target.anchor);
    return true;
  }

  function addSvgLine(svg, x1, y1, x2, y2, color, active, hasRoute) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "line");
    node.setAttribute("x1", x1);
    node.setAttribute("y1", y1);
    node.setAttribute("x2", x2);
    node.setAttribute("y2", y2);
    node.setAttribute("stroke", color);
    node.setAttribute("stroke-width", active ? "10" : "5");
    node.setAttribute("class", `line-segment${active ? " active" : ""}${hasRoute && !active ? " dim" : ""}`);
    svg.appendChild(node);
  }

  function addSvgStation(svg, x, y, station, transfer, active, hasRoute) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("cx", x);
    node.setAttribute("cy", y);
    node.setAttribute("r", active ? "7.5" : transfer ? "5.8" : "4.2");
    node.setAttribute("class", `station-dot${transfer ? " transfer" : ""}${active ? " active" : ""}${hasRoute && !active ? " dim" : ""}`);
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      chooseStation(station);
    });
    svg.appendChild(node);
    if (transfer) {
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", x);
      ring.setAttribute("cy", y);
      ring.setAttribute("r", active ? "11" : "8.5");
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", active ? "#f59e0b" : "#334155");
      ring.setAttribute("stroke-width", active ? "2.2" : "1.5");
      ring.setAttribute("opacity", hasRoute && !active ? "0.32" : "0.95");
      svg.appendChild(ring);
    }
  }

  function addSvgText(svg, x, y, text, className, fill) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
    node.setAttribute("x", x);
    node.setAttribute("y", y);
    node.setAttribute("class", className);
    if (fill) node.setAttribute("fill", fill);
    node.textContent = text;
    svg.appendChild(node);
    return node;
  }

  function chooseLabelPlacement(candidates, text, fontSize, labelBoxes) {
    for (const candidate of candidates) {
      const box = measureLabelBox(candidate.x, candidate.y, text, fontSize, candidate.anchor);
      if (box.left < 8 || box.right > CANVAS.width - 8 || box.top < 8 || box.bottom > CANVAS.height - 8) continue;
      if (!labelBoxes.some((item) => boxesOverlap(box, item))) return candidate;
    }
    return null;
  }

  function reserveLabelBox(labelBoxes, x, y, text, fontSize, anchor) {
    if (!labelBoxes) return;
    labelBoxes.push(measureLabelBox(x, y, text, fontSize, anchor || "start"));
  }

  function measureLabelBox(x, y, text, fontSize, anchor) {
    const width = Array.from(text).length * fontSize * 1.08 + 10;
    const height = fontSize + 8;
    let left = x;
    if (anchor === "end") left = x - width;
    if (anchor === "middle") left = x - width / 2;
    return {
      left: left - 3,
      right: left + width + 3,
      top: y - height + 2,
      bottom: y + 6,
    };
  }

  function boxesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function onWheel(event) {
    event.preventDefault();
    zoomAt(event.deltaY > 0 ? 1.12 : 0.88, event.offsetX, event.offsetY);
  }

  function zoomAt(factor, offsetX, offsetY) {
    const rect = els.mapViewport.getBoundingClientRect();
    const px = offsetX == null ? rect.width / 2 : offsetX;
    const py = offsetY == null ? rect.height / 2 : offsetY;
    const mx = viewBox.x + (px / rect.width) * viewBox.w;
    const my = viewBox.y + (py / rect.height) * viewBox.h;
    const nextW = clamp(viewBox.w * factor, 280, 2600);
    const nextH = clamp(viewBox.h * factor, 200, 1800);
    viewBox.x = mx - (px / rect.width) * nextW;
    viewBox.y = my - (py / rect.height) * nextH;
    viewBox.w = nextW;
    viewBox.h = nextH;
    viewBox.customized = true;
    applyViewBox();
  }

  function resetView() {
    viewBox = { x: 0, y: 0, w: CANVAS.width, h: CANVAS.height, customized: false };
    applyViewBox();
  }

  function applyViewBox() {
    els.metroMap.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }

  function onPointerDown(event) {
    els.mapViewport.setPointerCapture(event.pointerId);
    els.mapViewport.classList.add("dragging");
    pointerState = { id: event.pointerId, x: event.clientX, y: event.clientY, view: { ...viewBox } };
  }

  function onPointerMove(event) {
    if (!pointerState || pointerState.id !== event.pointerId) return;
    const rect = els.mapViewport.getBoundingClientRect();
    const dx = (event.clientX - pointerState.x) / rect.width * pointerState.view.w;
    const dy = (event.clientY - pointerState.y) / rect.height * pointerState.view.h;
    viewBox.x = pointerState.view.x - dx;
    viewBox.y = pointerState.view.y - dy;
    viewBox.customized = true;
    applyViewBox();
  }

  function onPointerUp(event) {
    if (!pointerState || pointerState.id !== event.pointerId) return;
    pointerState = null;
    els.mapViewport.classList.remove("dragging");
  }

  function downloadCurrentLineTxt() {
    const content = dataset.lines.map((line) => (
      `${line.name}|${line.color}|${line.avg_minutes}|${line.avg_distance}|${line.stations.join(",")}`
    )).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "line.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function copyCourseOutput() {
    const text = els.courseOutput.textContent;
    if (!navigator.clipboard?.writeText) {
      showToast("浏览器不允许自动复制，请手动选择文本。", "error");
      setStatus("浏览器不允许复制，请手动选择文本。", "error");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        showToast("复制成功，出行方案已放入剪贴板。", "ok");
        setStatus("已复制路线输出。", "ok");
      },
      () => {
        showToast("复制失败，请手动选择文本。", "error");
        setStatus("浏览器不允许复制，请手动选择文本。", "error");
      },
    );
  }

  function showToast(message, type) {
    els.toast.textContent = message;
    els.toast.className = `toast show ${type === "error" ? "error" : "ok"}`;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("show");
    }, 2200);
  }

  function setStatus(message, type) {
    els.statusMessage.textContent = message;
    els.statusMessage.style.color = type === "ok" ? "#0f766e" : "#b45309";
  }

  function strategyLabel(strategy) {
    return {
      minStations: "站数最少",
      minTransfers: "换乘最少",
      cheapest: "花钱最少（估算）",
      fastest: "时间最短（估算）",
    }[strategy] || strategy;
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
}());
