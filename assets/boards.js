/* ============================================================
   boards.js — 八个板块的差异化呈现
   设计原则：每个板块有自己的「标准信息卡」字段 → 呈现自然不同
   ============================================================ */
(function () {
  'use strict';

  var D = window.DATA || {};
  var esc = window.esc, svg = window.svg, dstr = window.dstr, dd = window.dd,
      byId = window.byId, uniq = window.uniq, flatTags = window.flatTags,
      searchable = window.searchable, toast = window.toast, S = window.S;

  var FR = {};
  function F(b) {
    if (!FR[b]) FR[b] = { tag: '', tag2: '', status: '', kw: '', src: '', year: '', el: '', topic: '' };
    return FR[b];
  }
  function resetPage() { S.page = 1; }

  /* 通用：筛选条 */
  function chips(list, board, field, cur) {
    if (!list.length) return '';
    var h = '<span class="chip' + (!cur ? ' on' : '') + '" data-chip="' + board + '|' + field + '|">全部</span>';
    list.forEach(function (x) {
      h += '<span class="chip' + (cur === x.k ? ' on' : '') + '" data-chip="' + board + '|' + field + '|' +
        esc(x.k) + '">' + esc(x.k) + '<span style="opacity:.62;margin-left:4px">' + x.n + '</span></span>';
    });
    return h;
  }
  function kwBar(board, ph) {
    var f = F(board);
    return '<div class="search-box" style="max-width:100%;flex:0 0 290px">' + svg('search') +
      '<input data-kw="' + board + '" value="' + esc(f.kw) + '" placeholder="' + esc(ph) + '"></div>';
  }
  function matches(it, kw) {
    return !kw || searchable(it).indexOf(kw.toLowerCase()) >= 0;
  }
  function tagMatch(it, tg, field) {
    if (!tg) return true;
    var arr = (it[field || 'tags'] || []).concat(it.element || []);
    return arr.indexOf(tg) >= 0;
  }

  /* 标签点击委托 + 关键词输入委托 */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-chip]');
    if (!t) return;
    var p = t.getAttribute('data-chip').split('|');
    var f = F(p[0]);
    f[p[1]] = (f[p[1]] === p[2] ? '' : p[2]);
    S.page = 1;
    window.rerenderContent();
  });
  var kwTimer = null;
  document.addEventListener('input', function (e) {
    var t = e.target.closest('[data-kw]');
    if (!t) return;
    var board = t.getAttribute('data-kw');
    var val = t.value;
    clearTimeout(kwTimer);
    kwTimer = setTimeout(function () {
      F(board).kw = val.trim();
      S.page = 1;
      window.rerenderContent();
      var again = document.querySelector('[data-kw="' + board + '"]');
      if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
    }, 320);
  });

  function pageHead(title, desc, extra) {
    return '<div class="page-head"><h2>' + title + '</h2>' +
      '<div class="pdesc">' + desc + '</div>' + (extra || '') + '</div>';
  }

  function slicePage(arr) {
    var per = 12, p = S.page || 1, total = arr.length;
    var start = (p - 1) * per;
    return { items: arr.slice(start, start + per), total: total, per: per, page: p };
  }

  /* ============================================================
     1. 科技前沿 —— 卡片流（每条 = 一篇文献/报告）
     ============================================================ */
  window.registerBoard('frontier', function () {
    var f = F('frontier');
    var all = D.frontier || [];
    var tags = flatTags(all, 'tags');
    var tiers = uniq(all.map(function (x) { return x.tier; }).filter(Boolean));
    var list = all.filter(function (x) {
      return matches(x, f.kw) && tagMatch(x, f.tag) && (!f.tag2 || x.tier === f.tag2);
    });
    var pg = slicePage(list);

    var h = pageHead('科技前沿',
      '每条 = 一篇文献或权威报告：中文译名 + 核心结论 + 研究机构 + 可检索标签',
      '<div class="pact">' + kwBar('frontier', '检索标题、机构、结论关键词') + '</div>');

    h += '<div class="card"><div class="card-b" style="padding:13px 16px">' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:9px">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">研究方向</span>' +
      '<div class="chips">' + chips(tags, 'frontier', 'tag', f.tag) + '</div></div>' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">期刊层级</span>' +
      '<div class="chips">' +
      '<span class="chip' + (!f.tag2 ? ' on' : '') + '" data-chip="frontier|tag2|">全部</span>' +
      tiers.map(function (t) {
        return '<span class="chip' + (f.tag2 === t ? ' on' : '') + '" data-chip="frontier|tag2|' + esc(t) + '">' + esc(t) + '</span>';
      }).join('') + '</div></div>' +
      '<div style="margin-top:11px;padding-top:11px;border-top:1px dashed #eef2f9;font-size:12.5px;color:#8a97ab">' +
      '说明：本板块每条信息必须填写「中文译名 · 期刊 · 核心结论 · 研究机构」四项，与政策类板块的字段结构完全不同——' +
      '这是「各板块呈现有区别」的落点。当前命中 <b style="color:#2f7bff">' + list.length + '</b> 条。' +
      '</div></div>';

    h += '<div class="card" style="margin-top:14px">' + window.permNote(true);
    if (!pg.items.length) {
      h += window.emptyBox();
    } else {
      h += '<div class="fx-list">' + pg.items.map(function (x) {
        return '<div class="fx-card">' +
          '<div class="fx-top">' +
          '<span class="fx-journal' + (x.tier === '顶刊' ? ' top' : '') + '">' + esc(x.journal) + '</span>' +
          (x.tier ? '<span class="tag' + (x.tier === '顶刊' ? ' a' : x.tier === '院内' ? ' gray' : '') + '">' + esc(x.tier) + '</span>' : '') +
          (x.org ? '<span style="font-size:12px;color:#8a97ab">' + esc(x.org) + '</span>' : '') +
          (x.date ? '<span class="mono" style="margin-left:auto">' + esc(dstr(x.date)) + '</span>' : '') +
          '</div>' +
          '<div class="fx-title" data-open="frontier:' + esc(x.id || x.title_cn.slice(0, 12)) + '">' + esc(x.title_cn) + '</div>' +
          (x.conclusion && x.conclusion !== x.title_cn
            ? '<div class="fx-conc"><b>核心结论｜</b>' + esc(x.conclusion) + '</div>' : '') +
          (x.summary ? '<div class="fx-usebox"><b>解读摘要｜</b>' + esc(x.summary) + '</div>' : '') +
          '<div class="fx-foot">' +
          (x.tags || []).map(function (t) {
            return '<span class="tag clickable" data-chip="frontier|tag|' + esc(t) + '">' + esc(t) + '</span>';
          }).join('') +
          '<span class="src">' + esc(x.source || '') + (x.doi ? ' · ' + esc(x.doi) : '') + '</span>' +
          '</div></div>';
      }).join('') + '</div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  window.openDetail = function (board, id) {
    var fn = {
      reg: detailReg, news: detailNews, frontier: detailFrontier, tech: detailTech,
      case: detailCase, expert: detailExpert, achv: detailAchv, data: detailData
    }[board];
    if (!fn) return;
    var arr = D[board] || [];
    var it = arr.filter(function (x) { return x.id === id; })[0];
    if (!it) it = arr.filter(function (x) { return (x.title_cn || '').slice(0, 12) === id; })[0];
    if (it) fn(it);
  };

  function detailFrontier(x) {
    var h = window.kvGrid([
      ['期刊', x.journal], ['层级', x.tier], ['研究机构', x.org],
      ['日期', dstr(x.date)], ['来源', x.source], ['原文', x.doi || '', false]
    ]);
    h += '<h4>核心结论</h4><div class="dr-text"><p>' + esc(x.conclusion || '—') + '</p></div>';
    if (x.summary) h += '<h4>解读摘要</h4><div class="dr-text"><p>' + esc(x.summary) + '</p></div>';
    h += '<h4>可检索标签</h4><div class="chips">' +
      (x.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    h += '<div class="notice blue" style="margin-top:16px">' + svg('info') +
      '<div>本板块的字段设计：<b>中文译名 · 期刊 · 研究机构 · 核心结论 · 解读摘要 · 研究方向标签</b>。' +
      '与政策法规板块（文号／施行日期／现行状态）形成明显区别，检索维度也完全不同。</div></div>';
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">阅读原文 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已加入订阅推送\')">订阅该方向推送</button></div>';
    window.openDrawer(window.drawerShell('<span class="fx-journal' + (x.tier === '顶刊' ? ' top' : '') + '">' +
      esc(x.journal) + '</span> ' + esc(x.title_cn),
      (x.org ? esc(x.org) + ' · ' : '') + esc(x.source || ''), h, acts));
  }

  /* ============================================================
     2. 技术进展 —— 目录表 + 要素矩阵
     ============================================================ */
  window.registerBoard('tech', function () {
    var f = F('tech');
    var all = D.tech || [];
    var tags = flatTags(all, 'tags');
    var list = all.filter(function (x) { return matches(x, f.kw) && (tagMatch(x, f.tag) || (f.tag === '有方案' && x.practice)); });
    if (f.tag === '有方案') list = all.filter(function (x) { return x.practice && matches(x, f.kw); });
    var pg = slicePage(list);

    // 要素矩阵
    var byEl = {};
    all.forEach(function (x) { (x.tags || []).forEach(function (t) { byEl[t] = (byEl[t] || 0) + 1; }); });
    var elKeys = Object.keys(byEl).sort(function (a, b) { return byEl[b] - byEl[a]; });

    var h = pageHead('技术进展',
      '每条 = 一项可推广的技术：技术类型 + 解决的难点问题 + 整体解决方案 + 持有单位',
      '<div class="pact">' + kwBar('tech', '检索技术名称、类型、难点') + '</div>');

    h += '<div class="card"><div class="card-h"><h3>按技术领域分布</h3>' +
      '<span class="more" style="cursor:default;color:#8a97ab">共 ' + all.length + ' 项技术成果</span></div>' +
      '<div class="card-b"><div class="matrix-row">' + elKeys.map(function (k, i) {
        return '<div class="mx-cell' + (i === 0 ? ' hi' : '') + '" data-chip="tech|tag|' + esc(k) + '">' +
          '<b>' + byEl[k] + '</b><span>' + esc(k) + '</span></div>';
      }).join('') + '</div>' +
      '<div style="margin-top:12px;font-size:12.5px;color:#8a97ab">点击领域框按环境要素筛选。本板块与「科技前沿」的区别：' +
      '前沿看的是<b>别人发表了什么</b>，技术进展看的是<b>这项技术能解决什么问题、谁能用</b>。</div>' +
      '</div></div>';

    h += '<div class="card" style="margin-top:14px">' +
      '<div class="card-h"><h3>技术目录</h3>' +
      '<div class="chips" style="margin-left:auto">' + chips(tags, 'tech', 'tag', f.tag) + '</div></div>';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="tb-wrap"><table class="tb"><thead><tr>' +
        '<th style="min-width:230px">技术名称</th><th style="min-width:150px">技术类型</th>' +
        '<th style="min-width:280px">成果简介</th><th>环境要素</th><th>来源</th><th></th></tr></thead><tbody>' +
        pg.items.map(function (x) {
          var brief = x.desc || x.practice || x.issue || '';
          return '<tr>' +
            '<td><div class="t-name" data-open="tech:' + esc(x.id) + '">' + esc(x.name) + '</div>' +
            (x.date ? '<div style="font-size:11.5px;color:#8a97ab;margin-top:3px">入库 ' + esc(dstr(x.date)) + '</div>' : '') + '</td>' +
            '<td>' + (x.type ? '<span class="tag c">' + esc(x.type.slice(0, 16)) + '</span>' : '<span style="color:#b3bdcd">—</span>') + '</td>' +
            '<td style="font-size:12.5px;color:#43536b;line-height:1.6">' +
            (brief ? esc(brief.slice(0, 108)) + (brief.length > 108 ? '…' : '') : '<span style="color:#b3bdcd">详见平台原文</span>') + '</td>' +
            '<td><div style="display:flex;gap:5px;flex-wrap:wrap">' +
            (x.tags || []).slice(0, 2).map(function (t) {
              return '<span class="tag clickable" data-chip="tech|tag|' + esc(t) + '">' + esc(t) + '</span>';
            }).join('') + '</div></td>' +
            '<td style="font-size:11.5px;color:#8a97ab">' + esc(x.source.replace('国家生态环境科技成果转化综合服务平台', '国家科技成果转化平台').slice(0, 20)) + '</td>' +
            '<td><button class="btn sm" onclick="openDetail(\'tech\',\'' + esc(x.id) + '\')">详情</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailTech(x) {
    var h = window.kvGrid([
      ['技术名称', x.name], ['技术类型', x.type], ['技术领域', x.field],
      ['适用场景', x.scene], ['技术持有单位', x.owner], ['入库日期', dstr(x.date)],
      ['应用情况', x.stage]
    ]);
    if (x.issue) h += '<h4>解决的难点问题</h4><div class="dr-text"><p>' + esc(x.issue) + '</p></div>';
    if (x.practice) h += '<h4>整体解决方案</h4><div class="dr-text"><p>' + esc(x.practice) + '</p></div>';
    if (x.effect) h += '<h4>技术指标 / 效果</h4><div class="dr-text"><p>' + esc(x.effect) + '</p></div>';
    if (x.desc && x.desc !== x.practice) h += '<h4>成果简介</h4><div class="dr-text"><p>' + esc(x.desc) + '</p></div>';
    h += '<h4>环境要素标签</h4><div class="chips">' +
      (x.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    if (!x.issue && !x.practice) {
      h += '<div class="notice" style="margin-top:16px">' + svg('info') +
        '<div>该条来自平台技术库的列表信息，详细技术参数需进入原文查看。演示数据均取自公开平台，未作加工。</div></div>';
    }
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">查看技术详情 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已提交技术对接需求\')">发起技术对接</button></div>';
    window.openDrawer(window.drawerShell(esc(x.name),
      esc(x.source || '') + (x.date ? ' · ' + esc(dstr(x.date)) : ''), h, acts));
  }

  /* ============================================================
     3. 政策法规 —— 分类树 + 结果表（库与流分离的核心板块）
     ============================================================ */
  window.registerBoard('reg', function () {
    var f = F('reg');
    var all = D.reg || [];
    var LEVELS = ['法律', '行政法规', '规章', '规范性文件', '规划纲要', '标准规范'];
    var REGIONS = ['国家', '上海', '长三角'];
    var STATUSES = ['现行有效', '已修订', '已废止'];
    var list = all.filter(function (x) {
      if (f.level && x.level !== f.level) return false;
      if (f.status && x.status !== f.status) return false;
      if (f.tag2 && x.region !== f.tag2) return false;
      return matches(x, f.kw);
    }).sort(function (a, b) { return (b.pubdate || '').localeCompare(a.pubdate || ''); });
    var pg = slicePage(list);
    pg.per = 14;
    pg.items = list.slice((pg.page - 1) * pg.per, pg.page * pg.per);

    var h = pageHead('政策法规',
      '法律 · 行政法规 · 规章 · 规范性文件 · 规划纲要 · 标准规范——按「效力层级 + 地区 + 现行状态」检索',
      '<div class="pact">' + kwBar('reg', '检索法规名称、文号、颁布信息') + '</div>');

    h += '<div class="notice blue" style="margin-bottom:14px">' + svg('info') +
      '<div><b>为什么把「政策动态」拆成「政策法规」和「政策资讯」两个板块：</b>' +
      '法规是<b>长期现行有效的工具书</b>（查得到、引得了、有文号和施行日期），资讯是<b>过期即归档的信息流</b>。' +
      '两类东西的生命周期和检索需求完全不同，混在一个板块里，结果是想查法规翻不到、看新闻也没人看。' +
      '本板块每条必须填写「效力层级 · 发文机关 · 文号 · 发布日期 · 施行日期 · 现行状态」——这是其他板块没有的字段结构。</div></div>';

    h += '<div class="reg-layout">';

    /* 左侧分类树 */
    h += '<aside class="reg-side">';
    h += '<div class="st">效力层级</div>';
    h += '<div class="tree"><div class="tnode' + (!f.level ? ' on' : '') + '" data-chip="reg|level|">' +
      '<span class="ic">' + svg('layers') + '</span>全部<span class="cnt">' + all.length + '</span></div>';
    LEVELS.forEach(function (L) {
      var n = all.filter(function (x) { return x.level === L; }).length;
      if (!n) return;
      h += '<div class="tnode' + (f.level === L ? ' on' : '') + '" data-chip="reg|level|' + esc(L) + '">' +
        '<span class="ic">' + svg('doc') + '</span>' + L + '<span class="cnt">' + n + '</span></div>';
    });
    h += '</div>';

    h += '<div class="st">发文地区</div>';
    h += '<div class="tree"><div class="tnode' + (!f.tag2 ? ' on' : '') + '" data-chip="reg|tag2|">' +
      '<span class="ic">' + svg('home') + '</span>全部地区<span class="cnt">' + all.length + '</span></div>';
    REGIONS.forEach(function (R) {
      var n = all.filter(function (x) { return x.region === R; }).length;
      if (!n) return;
      h += '<div class="tnode' + (f.tag2 === R ? ' on' : '') + '" data-chip="reg|tag2|' + esc(R) + '">' +
        '<span class="ic">' + svg('home') + '</span>' + R + '<span class="cnt">' + n + '</span></div>';
    });
    h += '</div>';

    h += '<div class="st">现行状态</div>';
    h += '<div class="tree">';
    STATUSES.forEach(function (St) {
      var n = all.filter(function (x) { return x.status === St; }).length;
      h += '<div class="tnode' + (f.status === St ? ' on' : '') + '" data-chip="reg|status|' + esc(St) + '">' +
        '<span class="ic">' + svg('check') + '</span>' + St + '<span class="cnt">' + n + '</span></div>';
    });
    h += '</div></aside>';

    /* 右侧结果表 */
    h += '<div>';
    h += '<div class="reg-bar">' +
      '<div class="kw">' + svg('search') + '<input data-kw="reg" value="' + esc(f.kw) + '" placeholder="按名称／文号／颁布信息检索，例如：排污许可、GB、第32号"></div>' +
      '<select id="regSort" disabled style="opacity:.75"><option>按发布日期倒序</option></select>' +
      '<button class="btn sm" onclick="(function(){var f=window.S&&0;})()" style="display:none"></button>' +
      '<span style="font-size:12.5px;color:#8a97ab">命中 <b style="color:#2f7bff">' + list.length + '</b> 条</span>' +
      '</div>';

    h += '<div class="card">';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="tb-wrap"><table class="tb"><thead><tr>' +
        '<th style="min-width:280px">法规／标准名称</th><th>效力层级</th><th>发文机关</th>' +
        '<th>文号</th><th>发布日期</th><th>施行日期</th><th>状态</th><th></th></tr></thead><tbody>' +
        pg.items.map(function (x) {
          return '<tr>' +
            '<td><div class="reg-name" data-open="reg:' + esc(x.id) + '">' +
            (x.stdno ? '<span class="std">' + esc(x.stdno) + '</span>' : '') + esc(x.name) + '</div>' +
            (x.summary ? '<div class="reg-sum">' + esc(x.summary) + '</div>' : '') +
            (x.promulgation ? '<div class="reg-prom">颁布信息：' + esc(x.promulgation.slice(0, 96)) + '</div>' : '') +
            '</td>' +
            '<td><span class="tag">' + esc(x.level) + '</span></td>' +
            '<td style="font-size:12.5px">' + esc(x.issuer || '—') + '</td>' +
            '<td class="mono">' + esc(x.docno || '—') + '</td>' +
            '<td class="mono">' + esc(x.pubdate || '—') + '</td>' +
            '<td class="mono">' + (x.effect ? '<b style="color:#1f5fd0">' + esc(x.effect) + '</b>' : '—') + '</td>' +
            '<td><span class="status ' + (x.status === '现行有效' ? 'valid' : x.status === '已修订' ? 'rev' : 'dead') + '">' +
            esc(x.status) + '</span></td>' +
            '<td><button class="btn sm" onclick="openDetail(\'reg\',\'' + esc(x.id) + '\')">查看</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div></div></div>';
    return h;
  });

  function detailReg(x) {
    var h = window.kvGrid([
      ['效力层级', x.level], ['发文地区', x.region], ['发文机关', x.issuer],
      ['发文字号', x.docno], ['发布日期', x.pubdate], ['施行日期', x.effect || '以原文为准'],
      ['现行状态', '<span class="status ' + (x.status === '现行有效' ? 'valid' : x.status === '已修订' ? 'rev' : 'dead') +
        '">' + esc(x.status) + '</span>', true],
      ['标准编号', x.stdno], ['被替代标准', x.replaced]
    ]);
    if (x.promulgation) h += '<h4>颁布信息（原文摘录）</h4><div class="dr-text"><p>' + esc(x.promulgation) + '</p></div>';
    if (x.summary) h += '<h4>正文首段 / 摘要</h4><div class="dr-text"><p>' + esc(x.summary) + '</p></div>';
    h += '<h4>关联信息</h4><div class="chips">' +
      '<span class="tag clickable" data-chip="reg|level|' + esc(x.level) + '">同层级其他文件</span>' +
      '<span class="tag clickable" data-chip="reg|tag2|' + esc(x.region) + '">' + esc(x.region) + '其他文件</span>' +
      (x.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    h += '<div class="notice" style="margin-top:16px">' + svg('info') +
      '<div><b>法规库的运维要点</b>：每条须标注「现行有效／已修订／已废止」并附修订沿革。' +
      '《中华人民共和国生态环境法典》已于 2026 年 3 月 12 日通过、2026 年 8 月 15 日施行，' +
      '一批单行法被其吸收替代——没有状态字段和定期核对机制，库里的答案很快就会是错的。</div></div>';
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">查看通知原文 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已加入《决策参阅》引用清单\')">加入引用清单</button>' +
      '<button class="btn" onclick="toast(\'已提交状态核对\')">反馈状态问题</button></div>';
    window.openDrawer(window.drawerShell(esc(x.name),
      '<span class="tag">' + esc(x.level) + '</span><span class="tag c">' + esc(x.region) + '</span>' +
      (x.docno ? '<span>' + esc(x.docno) + '</span>' : '') +
      (x.effect ? '<span>施行 ' + esc(x.effect) + '</span>' : ''), h, acts));
  }

  /* ============================================================
     4. 政策资讯 —— 时间线信息流
     ============================================================ */
  window.registerBoard('news', function () {
    var f = F('news');
    var all = (D.news || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var srcs = flatTags(all.map(function (x) { return { tags: [x.source] }; }), 'tags');
    var regs = flatTags(all.map(function (x) { return { tags: [x.region] }; }), 'tags');
    var list = all.filter(function (x) {
      return matches(x, f.kw) && (!f.src || x.source === f.src) && (!f.tag2 || x.region === f.tag2);
    });
    var pg = slicePage(list);
    pg.per = 16;
    pg.items = list.slice((pg.page - 1) * pg.per, pg.page * pg.per);

    var h = pageHead('政策资讯',
      '时政新闻 · 权威解读 · 发布会动态——按时间流组织，过期归入历史',
      '<div class="pact">' + kwBar('news', '检索标题、摘要') + '</div>');

    h += '<div class="notice blue" style="margin-bottom:14px">' + svg('info') +
      '<div>本板块与「政策法规」的分工：这里是<b>信息流</b>，回答"最近发生了什么、上面怎么解读"；' +
      '要看"现行有效的条文是哪一版、文号多少"，请去<b>政策法规</b>板块。' +
      '每条字段为：标题 · 来源 · 地区 · 时间 · 摘要 · 重要度——不设文号与施行日期。</div></div>';

    h += '<div class="card"><div class="card-b" style="padding:13px 16px">' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:9px">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">来源</span>' +
      '<div class="chips">' + chips(srcs.map(function (x) {
        return { k: x.k, n: x.n };
      }), 'news', 'src', f.src) + '</div></div>' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">地区</span>' +
      '<div class="chips">' + chips(regs, 'news', 'tag2', f.tag2) + '</div></div></div></div>';

    h += '<div class="card" style="margin-top:14px">';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="tl">' + pg.items.map(function (x) {
        var d = dd(x.date);
        return '<div class="tl-item' + (x.importance === '高' ? ' imp' : '') + '">' +
          '<div class="tl-date"><b>' + esc(d.md) + '</b>' + esc(d.y) + '</div>' +
          '<div class="tl-line"><i></i></div>' +
          '<div class="tl-body">' +
          '<div class="tlb-t" data-open="news:' + esc(x.id) + '">' + esc(x.title) + '</div>' +
          (x.summary ? '<div class="tlb-s">' + esc(x.summary) + '</div>' : '') +
          '<div class="tlb-m">' +
          '<span class="tag c">' + esc(x.region || '—') + '</span>' +
          '<span>' + esc(x.source) + '</span>' +
          (x.importance === '高' ? '<span class="hot">重要</span>' : '') +
          '</div></div></div>';
      }).join('') + '</div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailNews(x) {
    var h = window.kvGrid([
      ['标题', x.title], ['来源', x.source], ['地区', x.region],
      ['日期', dstr(x.date)], ['重要度', x.importance]
    ]);
    if (x.summary) h += '<h4>正文摘要</h4><div class="dr-text"><p>' + esc(x.summary) + '</p></div>';
    h += '<div class="notice blue" style="margin-top:16px">' + svg('info') +
      '<div>资讯类条目的字段刻意与法规类不同：<b>不设文号与施行日期</b>，只回答"什么时候、谁说的、说了什么"。' +
      '两者混在一个板块里，是很多知识库"查不到东西"的根因。</div></div>';
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">阅读全文 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已推送到素材池\')">推送到宣传素材池</button></div>';
    window.openDrawer(window.drawerShell(esc(x.title),
      '<span class="tag c">' + esc(x.region || '') + '</span><span>' + esc(x.source) + '</span><span>' + esc(dstr(x.date)) + '</span>',
      h, acts));
  }

  /* ============================================================
     5. 实用案例 —— 案例卡（问题／做法／成效三段式）
     ============================================================ */
  window.registerBoard('case', function () {
    var f = F('case');
    var all = D.case || [];
    var els = flatTags(all, 'tags');
    var list = all.filter(function (x) { return matches(x, f.kw) && (tagMatch(x, f.tag) || x.element === f.tag); });
    var pg = slicePage(list);
    pg.per = 9;
    pg.items = list.slice((pg.page - 1) * pg.per, pg.page * pg.per);

    var h = pageHead('实用案例',
      '每条 = 一个案例：地点 + 环境要素 + 问题 + 做法 + 成效数据 + 可复制性',
      '<div class="pact">' + kwBar('case', '检索案例名、做法、地区') + '</div>');

    h += '<div class="card"><div class="card-b" style="padding:13px 16px">' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">环境要素</span>' +
      '<div class="chips">' + chips(els, 'case', 'tag', f.tag) + '</div></div>' +
      '<div style="margin-top:11px;padding-top:11px;border-top:1px dashed #eef2f9;font-size:12.5px;color:#8a97ab">' +
      '案例板块的字段结构与其他板块差别最大：必填「地点 · 环境要素 · 问题 · 做法 · 成效」。' +
      '没有成效和做法的"案例"，只能算一条新闻。当前命中 <b style="color:#2f7bff">' + list.length + '</b> 个案例。' +
      '</div></div></div>';

    h += '<div class="card" style="margin-top:14px">' + window.permNote(true);
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="case-grid">' + pg.items.map(function (x) {
        return '<div class="case-card">' +
          '<div class="case-cap"><span class="el">' + esc(x.element || '综合') + '</span></div>' +
          '<div class="case-b">' +
          '<h4 data-open="case:' + esc(x.id) + '">' + esc(x.name) + '</h4>' +
          (x.region ? '<div class="case-kv"><b>地点</b><span>' + esc(x.region) + '</span></div>' : '') +
          (x.issue ? '<div class="case-kv"><b>问题</b><span>' + esc(x.issue.slice(0, 76)) + '</span></div>' : '') +
          (x.practice ? '<div class="case-kv"><b>做法</b><span>' + esc(x.practice.slice(0, 96)) + '</span></div>' : '') +
          (x.effect ? '<div class="case-eff"><b>成效｜</b>' + esc(x.effect.slice(0, 90)) + '</div>' : '') +
          '<div style="display:flex;gap:7px;flex-wrap:wrap;padding-top:9px;border-top:1px dashed #eef2f9;margin-top:auto">' +
          (x.tags || []).map(function (t) {
            return '<span class="tag clickable" data-chip="case|tag|' + esc(t) + '">' + esc(t) + '</span>';
          }).join('') +
          '<span style="margin-left:auto;font-size:11.5px;color:#8a97ab">' + esc(x.source.slice(0, 22)) + '</span>' +
          '</div></div></div>';
      }).join('') + '</div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailCase(x) {
    var h = window.kvGrid([
      ['案例名称', x.name], ['地点', x.region || '—'], ['环境要素', x.element],
      ['来源', x.source], ['入库日期', dstr(x.date)]
    ]);
    if (x.issue) h += '<h4>解决什么问题</h4><div class="dr-text"><p>' + esc(x.issue) + '</p></div>';
    if (x.practice) h += '<h4>主要做法</h4><div class="dr-text"><p>' + esc(x.practice) + '</p></div>';
    if (x.effect) h += '<h4>成效</h4><div class="dr-text"><p>' + esc(x.effect) + '</p></div>';
    if (x.replicable) h += '<h4>可复制性 / 适用条件</h4><div class="dr-text"><p>' + esc(x.replicable) + '</p></div>';
    h += '<h4>环境要素标签</h4><div class="chips">' +
      (x.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">查看案例原文 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已收藏为参考案例\')">收藏为参考案例</button></div>';
    window.openDrawer(window.drawerShell(esc(x.name),
      '<span class="tag">' + esc(x.element || '') + '</span>' + (x.region ? '<span>' + esc(x.region) + '</span>' : '') +
      '<span>' + esc(x.source.slice(0, 30)) + '</span>', h, acts));
  }

  /* ============================================================
     6. 专家观点 —— 摘编卡（人 + 主张 + 原话）
     ============================================================ */
  window.registerBoard('expert', function () {
    var f = F('expert');
    var all = D.expert || [];
    var orgs = flatTags(all.map(function (x) { return { tags: [x.org] }; }), 'tags').slice(0, 12);
    var list = all.filter(function (x) { return matches(x, f.kw) && (!f.tag || x.org === f.tag); });
    var pg = slicePage(list);
    pg.per = 8;
    pg.items = list.slice((pg.page - 1) * pg.per, pg.page * pg.per);

    var h = pageHead('专家观点',
      '每条 = 一条观点：专家 + 单位职务 + 场合 + 核心主张 + 原话摘录 + 授权状态',
      '<div class="pact">' + kwBar('expert', '检索专家姓名、单位、观点') + '</div>');

    h += '<div class="notice blue" style="margin-bottom:14px">' + svg('info') +
      '<div>本板块按<b>「人 + 一句核心主张 + 原话摘录」</b>组织，可直接汇编进《生态文明建设决策参阅》。' +
      '每条须经本人许可后方可院内共享，故设有授权状态标记。当前收录 <b>' + all.length + '</b> 条。</div></div>';

    if (orgs.length) {
      h += '<div class="card" style="margin-bottom:14px"><div class="card-b" style="padding:13px 16px">' +
        '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">' +
        '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">所属单位</span>' +
        '<div class="chips">' + chips(orgs, 'expert', 'tag', f.tag) + '</div></div></div></div>';
    }

    h += '<div class="card">';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="ex-list">' + pg.items.map(function (x) {
        return '<div class="ex-card">' +
          '<div class="ex-head">' +
          '<div class="ex-av">' + esc((x.expert || '专')[0]) + '</div>' +
          '<div class="ex-info"><b>' + esc(x.expert) + (x.title ? ' <span style="font-weight:400;color:#8a97ab;font-size:12px">' + esc(x.title) + '</span>' : '') + '</b>' +
          '<span>' + esc(x.org || '—') + '</span></div>' +
          '<span class="tag gray ex-topic">' + esc((x.occasion || '').slice(0, 18)) + '</span>' +
          '</div>' +
          '<div class="ex-claim">' + esc(x.claim) + '</div>' +
          (x.quote ? '<div class="ex-quote">' + esc(x.quote) + '</div>' : '') +
          '<div class="ex-foot">' +
          '<span>出处：' + esc(x.source) + '</span>' +
          (x.date ? '<span>' + esc(dstr(x.date)) + '</span>' : '') +
          '<span class="lock">' + svg('lock') + '待本人许可授权</span>' +
          '</div></div>';
      }).join('') + '</div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailExpert(x) {
    var h = window.kvGrid([
      ['专家', x.expert], ['职务', x.title], ['单位', x.org],
      ['场合', x.occasion], ['日期', dstr(x.date)], ['出处', x.source]
    ]);
    h += '<h4>核心主张</h4><div class="dr-text"><p>' + esc(x.claim) + '</p></div>';
    if (x.quote) h += '<h4>原话摘录</h4><div class="dr-text"><p>' + esc(x.quote) + '</p></div>';
    h += '<div class="notice" style="margin-top:16px">' + svg('lock') +
      '<div>本条摘自公开报道，<b>院内共享前需经专家本人许可</b>。' +
      '《建设方案》已明确：专家观点板块征集到的观点与发言资料，经本人许可后在院内共享交流。</div></div>';
    var acts = '<div class="dr-act">';
    if (x.url) acts += '<a class="btn pri" href="' + x.url + '" target="_blank" rel="noopener">查看报道原文 ' + svg('ext') + '</a>';
    acts += '<button class="btn" onclick="toast(\'已加入参阅素材池\')">加入参阅素材池</button></div>';
    window.openDrawer(window.drawerShell(esc(x.expert) + ' · 观点摘编',
      esc(x.org || '') + (x.title ? ' · ' + esc(x.title) : ''), h, acts));
  }

  /* ============================================================
     7. 科研成果 —— 机构成果目录（授权下载）
     ============================================================ */
  window.registerBoard('achv', function () {
    var f = F('achv');
    var all = D.achv || [];
    var types = flatTags(all.map(function (x) { return { tags: [x.type] }; }), 'tags');
    var list = all.filter(function (x) { return matches(x, f.kw) && (!f.tag || x.type === f.tag); });
    var pg = slicePage(list);

    var h = pageHead('科研成果',
      '院内近 5～10 年项目、论文、著作、标准专利与获奖成果（内部成果交流 · 授权下载）',
      '<div class="pact">' + kwBar('achv', '检索成果名称') + '</div>');

    h += window.permNote(false);
    h += '<div class="grid g4" style="margin:14px 0">';
    [['成果总数', all.length, 'medal', 'blue'],
     ['获奖成果', all.filter(function (x) { return x.type === '获奖成果'; }).length, 'medal', 'amber'],
     ['科研项目', all.filter(function (x) { return x.type === '科研项目'; }).length, 'db', 'cyan'],
     ['平台建设', all.filter(function (x) { return x.type === '平台建设'; }).length, 'layers', 'green']
    ].forEach(function (x) { h += window.statCard(x[0], x[1], [], x[2], x[3]); });
    h += '</div>';

    h += '<div class="card"><div class="card-h"><h3>成果目录</h3>' +
      '<div class="chips" style="margin-left:auto">' + chips(types, 'achv', 'tag', f.tag) + '</div></div>';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="tb-wrap"><table class="tb"><thead><tr>' +
        '<th style="min-width:320px">成果名称</th><th>成果类型</th><th>所属栏目</th><th>年度</th>' +
        '<th>完成单位</th><th>获取方式</th><th></th></tr></thead><tbody>' +
        pg.items.map(function (x) {
          return '<tr>' +
            '<td><div class="t-name" data-open="achv:' + esc(x.id) + '">' + esc(x.name) + '</div>' +
            (x.summary ? '<div class="reg-sum">' + esc(x.summary.slice(0, 96)) + '</div>' : '') + '</td>' +
            '<td><span class="tag p">' + esc(x.type) + '</span></td>' +
            '<td style="font-size:12.5px">' + esc(x.section) + '</td>' +
            '<td class="mono">' + esc(x.year || '—') + '</td>' +
            '<td style="font-size:12.5px">' + esc(x.org) + '</td>' +
            '<td><span class="tag a">' + svg('lock') + '授权下载</span></td>' +
            '<td><button class="btn sm" onclick="openDetail(\'achv\',\'' + esc(x.id) + '\')">详情</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailAchv(x) {
    var h = window.kvGrid([
      ['成果名称', x.name], ['成果类型', x.type], ['所属栏目', x.section],
      ['年度', x.year], ['完成单位', x.org], ['发布日期', dstr(x.date)]
    ]);
    if (x.summary) h += '<h4>成果简介</h4><div class="dr-text"><p>' + esc(x.summary) + '</p></div>';
    h += '<h4>获取方式</h4><div class="notice">' + svg('lock') +
      '<div><b>授权下载</b>：本板块开放基本信息浏览（标题、摘要、关键词等），下载附件需经资料上传部门授权。' +
      '请通过「下载申请」填写事由、用途说明、使用期限与保密承诺，提交至资料上传部门负责人或信息联络员，' +
      '审批通过后系统自动开放下载权限。</div></div>';
    var acts = '<div class="dr-act">';
    acts += '<button class="btn pri" onclick="toast(\'下载申请已提交，等待资料上传部门审批\')">申请下载附件</button>';
    if (x.url) acts += '<a class="btn" href="' + x.url + '" target="_blank" rel="noopener">查看相关报道 ' + svg('ext') + '</a>';
    acts += '</div>';
    window.openDrawer(window.drawerShell(esc(x.name),
      '<span class="tag p">' + esc(x.type) + '</span><span>' + esc(x.org) + '</span><span>' + esc(x.year || '') + '</span>', h, acts));
  }

  /* ============================================================
     8. 数据资源 —— 元数据卡（数据集目录）
     ============================================================ */
  window.registerBoard('data', function () {
    var f = F('data');
    var all = D.data || [];
    var kinds = flatTags(all.map(function (x) { return { tags: [x.kind] }; }), 'tags');
    var list = all.filter(function (x) { return matches(x, f.kw) && (!f.tag || x.kind === f.tag); });
    var pg = slicePage(list);
    pg.per = 9;
    pg.items = list.slice((pg.page - 1) * pg.per, pg.page * pg.per);

    var h = pageHead('数据资源',
      '每条 = 一个数据集：时间范围 + 空间范围 + 来源 + 格式 + 更新频率 + 获取方式',
      '<div class="pact">' + kwBar('data', '检索数据集名称、地区、年份') + '</div>');

    h += '<div class="notice blue" style="margin-bottom:14px">' + svg('info') +
      '<div>本板块登记的是<b>数据目录（元数据）</b>，不搬运原始数据文件，只回答"有没有、覆盖哪一年哪一地、怎么拿"。' +
      '这样既避免重复存储与版本混乱，又能让科研人员先查到再申请。</div></div>';

    h += '<div class="card" style="margin-bottom:14px"><div class="card-b" style="padding:13px 16px">' +
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:12px;color:#8a97ab;flex:0 0 66px">数据类别</span>' +
      '<div class="chips">' + chips(kinds, 'data', 'tag', f.tag) + '</div></div></div></div>';

    h += '<div class="card">';
    if (!pg.items.length) h += window.emptyBox();
    else {
      h += '<div class="ds-grid">' + pg.items.map(function (x) {
        return '<div class="ds-card">' +
          '<div class="ds-head"><div class="ds-ico">' + svg('db') + '</div>' +
          '<div style="min-width:0"><h4 data-open="data:' + esc(x.id) + '">' + esc(x.name) + '</h4>' +
          '<div class="ds-sub">' + esc(x.kind) + ' · ' + esc(x.fmt) + ' · ' + esc(x.size) + '</div></div></div>' +
          '<div class="ds-meta">' +
          '<div><div class="k">时间范围</div><div class="v">' + esc(x.scope_time) + '</div></div>' +
          '<div><div class="k">空间范围</div><div class="v">' + esc(x.scope_space) + '</div></div>' +
          '<div><div class="k">更新频率</div><div class="v">' + esc(x.freq) + '</div></div>' +
          '<div><div class="k">数据来源</div><div class="v">' + esc(x.source.slice(0, 14)) + '</div></div>' +
          '</div>' +
          '<div class="ds-foot">' +
          '<span class="tag ' + (x.access === '开放获取' ? 'g' : 'a') + '">' + esc(x.access) + '</span>' +
          '<span class="lock">' + svg('lock') + (x.access === '开放获取' ? '无需审批' : '需授权') + '</span>' +
          '</div></div>';
      }).join('') + '</div>';
      h += window.pager(pg.total, pg.per, pg.page);
    }
    h += '</div>';
    return h;
  });

  function detailData(x) {
    var h = window.kvGrid([
      ['数据集名称', x.name], ['数据类别', x.kind], ['时间范围', x.scope_time],
      ['空间范围', x.scope_space], ['数据来源', x.source], ['文件格式', x.fmt],
      ['文件大小', x.size], ['更新频率', x.freq], ['获取方式', x.access],
      ['存放位置', x.path]
    ]);
    h += '<h4>检索标签</h4><div class="chips">' +
      (x.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    h += '<div class="notice blue" style="margin-top:16px">' + svg('info') +
      '<div>本板块是《建设方案》中"数据资料"板块的落地形态：把院级层面购买的数据资料与历年环境年鉴、' +
      '生态环境状况公报做成<b>可检索的数据目录</b>，附件下载走授权流程。</div></div>';
    var acts = '<div class="dr-act">';
    acts += '<button class="btn pri" onclick="toast(\'' + (x.access === '开放获取' ? '已开始下载' : '下载申请已提交，等待部门授权') + '\')">' +
      (x.access === '开放获取' ? '直接下载' : '申请下载') + '</button>';
    acts += '<button class="btn" onclick="toast(\'已登记数据需求\')">登记数据需求</button></div>';
    window.openDrawer(window.drawerShell(esc(x.name),
      '<span class="tag c">' + esc(x.kind) + '</span><span>' + esc(x.scope_space) + '</span><span>' + esc(x.scope_time) + '</span>', h, acts));
  }

  /* ============================================================
     9. 专题聚合 —— 一条主题线横穿 8 个板块
     ============================================================ */
  var TOPICS = [
    { id: 'carbon', name: '碳达峰碳中和', desc: '碳市场、配额分配、温室气体核算、减污降碳协同——把散落在政策、标准、案例、前沿里的碳相关内容串成一条线。', kw: /碳|双碳|温室气体|甲烷|气候|CCER|配额|减排|低碳|新能源|氢/ },
    { id: 'newpoll', name: '新污染物治理', desc: '新污染物清单、微塑料、环境健康风险、监测与治理技术：这是跨政策、技术、前沿、数据的典型复合主题。', kw: /新污染物|微塑料|塑料|POPs|抗生素|药物|环境健康|风险管控|化学物质|纳米/ },
    { id: 'beautiful', name: '美丽上海建设', desc: '美丽上海"十五五"规划、美丽中国先行区、生态文明建设示范——本市战略主线。', kw: /美丽上海|美丽中国先行区|美丽河湖|美丽海湾|十五五|生态文明建设示范|生态之城|人与自然和谐共生的现代化/ },
    { id: 'soil', name: '土壤与地下水', desc: '隐患排查整治技术指南、建设用地修复、背景值调查、地块风险管控。', kw: /土壤|地下水|建设用地|地块|背景值|隐患排查|修复/ },
    { id: 'yangtze', name: '长江保护与长三角一体化', desc: '长江保护修复、太湖流域治理、示范区生态环境专项规划、流域协同机制。', kw: /长江|长三角|太湖|流域|一体化|协同/ },
    { id: 'code', name: '生态环境法典实施', desc: '《中华人民共和国生态环境法典》2026 年 8 月 15 日施行，配套法规清理与执法适用问题。', kw: /法典|法治|条例|立法|行政处罚|行政复议|法规/ }
  ];

  window.registerBoard('topic', function () {
    var sel = (window.S.params.arg || '').trim();
    var tp = TOPICS.filter(function (t) { return t.id === sel; })[0];
    if (!tp) {
      var h = pageHead('专题聚合',
        '一条主题线横穿八个板块——这是知识库与"八个资料柜"的分水岭',
        '');
      h += '<div class="notice blue" style="margin-bottom:14px">' + svg('layers') +
        '<div>做法：给所有板块的资源统一打「环境要素 × 业务主题」标签，围绕主题自动汇聚政策法规、标准规范、' +
        '技术、案例、专家观点、前沿解读。同一份内容只入库一次，在不同专题里被再次看见。' +
        '下面每个专题的条目数，都是从真实数据里跑出来的聚合结果。</div></div>';
      h += '<div class="grid g2">';
      TOPICS.forEach(function (t) {
        var agg = aggregate(t);
        h += '<div class="card" style="cursor:pointer" data-go="topic" onclick="location.hash=\'#/topic/' + t.id + '\'">' +
          '<div class="card-h"><h3>' + esc(t.name) + '</h3>' +
          '<span class="more">进入专题 ' + svg('fwd') + '</span></div>' +
          '<div class="card-b"><div style="font-size:13px;color:#43536b;line-height:1.72;margin-bottom:12px">' +
          esc(t.desc) + '</div>' +
          '<div style="display:flex;gap:7px;flex-wrap:wrap">' +
          agg.boards.map(function (b) {
            return '<span class="tag">' + esc(b.name) + ' ' + b.items.length + '</span>';
          }).join('') +
          '<span class="tag g">合计 ' + agg.total + ' 条</span>' +
          '</div></div></div>';
      });
      h += '</div>';
      return h;
    }
    var agg = aggregate(tp);
    var h = '<div class="topic-hero"><div class="th-in">' +
      '<h2>' + esc(tp.name) + '</h2><p>' + esc(tp.desc) + '</p>' +
      '<div class="th-stats"><div><b>' + agg.total + '</b><span>聚合条目</span></div>' +
      '<div><b>' + agg.boards.length + '</b><span>覆盖板块</span></div>' +
      '<div><b>' + agg.sources + '</b><span>信息来源</span></div></div>' +
      '</div></div>';
    h += '<div class="crumb" style="margin-bottom:12px"><span data-go="topic" style="cursor:pointer">专题聚合</span> ' +
      svg('fwd') + ' <b>' + esc(tp.name) + '</b></div>';
    agg.boards.forEach(function (b) {
      h += '<div class="card" style="margin-bottom:14px"><div class="card-h"><h3>' + esc(b.name) +
        ' <span class="tag gray">' + b.items.length + ' 条</span></h3>' +
        '<span class="more" data-go="' + b.key + '">进入板块 ' + svg('fwd') + '</span></div><div class="card-b">' +
        '<ul class="list">' + b.items.slice(0, 6).map(function (x) {
          return '<li><i class="li-dot"></i><div class="li-b">' +
            '<div class="li-t" data-open="' + b.key + ':' + esc(x.id) + '">' + esc(window.titleOf(b.key, x).slice(0, 96)) + '</div>' +
            '<div class="li-m"><span>' + esc(window.metaLineOf(b.key, x).slice(0, 62)) + '</span></div></div>' +
            '<span class="li-time">' + esc(dstr(x.date || x.pubdate || '').slice(5)) + '</span></li>';
        }).join('') + '</ul>' +
        (b.items.length > 6 ? '<div style="padding-top:10px;font-size:12.5px;color:#8a97ab">…另有 ' +
          (b.items.length - 6) + ' 条，进入板块查看</div>' : '') + '</div></div>';
    });
    return h;
  });

  function aggregate(tp) {
    var boards = [
      ['reg', '政策法规'], ['news', '政策资讯'], ['frontier', '科技前沿'], ['tech', '技术进展'],
      ['case', '实用案例'], ['expert', '专家观点'], ['achv', '科研成果'], ['data', '数据资源']
    ];
    var out = [], total = 0, srcSet = {};
    boards.forEach(function (b) {
      var arr = (D[b[0]] || []).filter(function (x) { return tp.kw.test(searchable(x)); });
      if (arr.length) {
        out.push({ key: b[0], name: b[1], items: arr });
        total += arr.length;
        arr.forEach(function (x) { if (x.source) srcSet[x.source] = 1; });
      }
    });
    return { boards: out, total: total, sources: Object.keys(srcSet).length };
  }

  /* ============================================================
     管理端：资源发布 / 待办任务 / 系统设置
     ============================================================ */
  window.registerBoard('publish', function () {
    var h = pageHead('资源信息发布', '填报资源信息、打标签、上传附件、设置密级', '');
    h += '<div class="notice blue" style="margin-bottom:14px">' + svg('info') +
      '<div>发布表单按《建设方案》"明确资源录入标准，制定统一格式规范，开发标准化录入界面及批量导入功能"设计。' +
      '关键改进：<b>标签体系分为「环境要素 × 业务主题」两个维度</b>，所有板块共用同一套标签，' +
      '同一份资源才能被不同专题检索到——这是专题聚合页能跑起来的前提。</div></div>';

    h += '<div class="grid g2">';
    h += '<div class="card"><div class="card-h"><h3>1 基础信息</h3></div><div class="card-b">' +
      field('创建人', '<input class="ipt" value="王 芬（科技管理办公室）" readonly>') +
      field('创建部门', '<select class="ipt"><option>科技管理办公室</option><option>环境政策与低碳发展研究所</option>' +
        '<option>环境规划与标准研究所</option><option>大气环境研究所</option><option>水环境研究所</option>' +
        '<option>生态研究所</option><option>环境物理研究所</option><option>环境健康研究所</option>' +
        '<option>固体废物与土壤环境研究所</option><option>环境工程技术研究所</option>' +
        '<option>环境管理与技术评估研究所</option><option>环境分析与检测技术研究所</option></select>') +
      field('信息类别', '<select class="ipt"><option>科技前沿</option><option>技术进展</option><option>政策法规</option>' +
        '<option>政策资讯</option><option>实用案例</option><option>专家观点</option><option>科研成果</option><option>数据资源</option></select>') +
      field('资源形态', '<select class="ipt"><option>正式文本（法规／标准／规划）</option><option>成果条目（技术／案例）</option>' +
        '<option>资讯文章</option><option>观点摘编</option><option>数据集</option></select>') +
      '</div></div>';

    h += '<div class="card"><div class="card-h"><h3>2 结构化字段（随信息类别变化）</h3></div><div class="card-b">' +
      '<div class="notice" style="margin-bottom:12px">' + svg('info') +
      '<div>选「政策法规」时出现：效力层级、发文机关、文号、施行日期、现行状态；<br>' +
      '选「实用案例」时出现：地点、环境要素、问题、做法、成效。<br>' +
      '<b>字段跟着板块走</b>，这是"各板块呈现有区别"在录入端的第一步。</div></div>' +
      field('效力层级', '<select class="ipt"><option>不适用</option><option>法律</option><option>行政法规</option>' +
        '<option>规章</option><option>规范性文件</option><option>规划纲要</option><option>标准规范</option></select>') +
      field('发文机关', '<input class="ipt" placeholder="如：生态环境部">') +
      field('发文字号', '<input class="ipt" placeholder="如：生态环境部令第32号 / 沪环规〔2026〕1号">') +
      field('施行日期', '<input class="ipt" type="date">') +
      field('现行状态', '<select class="ipt"><option>现行有效</option><option>已修订</option><option>已废止</option></select>') +
      '</div></div>';
    h += '</div>';

    h += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>3 关键字标签（环境要素 × 业务主题，可跨领域多选）</h3></div>' +
      '<div class="card-b"><div class="chips">' +
      ['水环境', '大气环境', '土壤与地下水', '固体废物', '生态保护', '气候变化与双碳', '环境健康', '环境监测与信息化',
        '碳达峰碳中和', '新污染物治理', '美丽上海建设', '长江保护与长三角一体化', '生态环境法典实施', '无废城市', '绿色低碳转型', '环评与排污许可'
      ].map(function (t) { return '<span class="chip">' + t + '</span>'; }).join('') +
      '</div></div></div>';

    h += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>4 附件上传与识别</h3></div><div class="card-b">' +
      '<div style="border:1.5px dashed #c9d6ea;border-radius:11px;padding:30px;text-align:center;background:#fafcff">' +
      '<div style="font-size:14px;color:#43536b;margin-bottom:8px">点击或拖拽文件到此处上传附件</div>' +
      '<div style="font-size:12.5px;color:#8a97ab">支持 PDF / Word / Excel / PPT / 图片，单个不超过 50MB；' +
      '上传后系统自动识别文件类型、页数、大小等信息</div></div></div></div>';

    h += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>5 保密属性</h3></div><div class="card-b">' +
      '<div class="wrap"><span style="font-size:13px;color:#43536b">是否涉及保密文件：</span>' +
      '<span class="chip">否</span><span class="chip on">是</span>' +
      '<span style="font-size:13px;color:#43536b;margin-left:14px">保密级别：</span>' +
      '<span class="chip">内部</span><span class="chip">秘密</span><span class="chip">机密</span></div>' +
      '<div style="margin-top:14px;display:flex;gap:10px">' +
      '<button class="btn pri" onclick="toast(\'已提交发布，等待部门审核与科管办复核\')">提交发布</button>' +
      '<button class="btn">重置</button>' +
      '<button class="btn">批量导入（Excel）</button></div></div></div>';
    return h;
  });

  function field(label, input) {
    return '<div style="margin-bottom:13px"><div style="font-size:12.5px;color:#43536b;margin-bottom:6px">' +
      esc(label) + ' <span style="color:#e05a6d">*</span></div>' + input + '</div>';
  }

  window.registerBoard('todo', function () {
    var h = pageHead('待办任务', '审核、发布、下载申请等待办事项', '');
    h += '<div class="grid g4" style="margin-bottom:14px">';
    h += window.statCard('待办任务总数', 20, [['今日到期', 6], ['超期未处理', 3]], 'check', 'amber');
    h += window.statCard('待审核资源', 22, [['已审核', 16], ['本周新增', 5]], 'medal', 'blue');
    h += window.statCard('本月已办结', 128, [['上月', 119]], 'check', 'green');
    h += window.statCard('下载申请', 9, [['待审批', 4], ['已通过', 5]], 'db', 'cyan');
    h += '</div>';
    h += '<div class="card"><div class="card-h"><h3>各栏目待办任务列表</h3>' +
      '<span class="more" onclick="toast(\'已全部标记已读\')">全部标记已读</span></div><div class="card-b">' +
      '<ul class="list">' + [
        ['《上海市生态环境监督执法正面清单管理办法》文件待审核', '环境管理与技术评估研究所', '09-16', '待审核'],
        ['《关于进一步优化能源、交通、水利等重大建设项目用地组卷报批工作的通知》文件待审核', '环境规划与标准研究所', '09-16', '待审核'],
        ['《自然资源行政处罚办法》文件待审核', '环境政策与低碳发展研究所', '09-16', '待审核'],
        ['《市政基础设施资产管理办法(试行)》申请公开', '大气环境研究所', '09-16', '公开申请'],
        ['《上海市声环境功能区划（2025年修订版）》文件待审核', '环境物理研究所', '09-15', '待审核'],
        ['2025年江苏省生态环境状况公报 申请下载', '环境规划与标准研究所', '09-15', '下载申请'],
        ['《上海市生态环境损害赔偿工作实施细则》修订稿待复核', '环境政策与低碳发展研究所', '09-14', '待复核'],
        ['2026年第三季度资源发布情况通报 待发布', '科技管理办公室', '09-12', '待发布']
      ].map(function (r) {
        return '<li><i class="li-dot"></i><div class="li-b"><div class="li-t">' + esc(r[0]) + '</div>' +
          '<div class="li-m"><span>' + esc(r[1]) + '</span><span class="tag a">' + esc(r[3]) + '</span></div></div>' +
          '<span class="li-time">' + esc(r[2]) + '</span>' +
          '<button class="btn sm" style="margin-left:10px" onclick="toast(\'已办结\')">处理</button></li>';
      }).join('') + '</ul>' +
      '<div style="padding-top:12px;font-size:12px;color:#8a97ab;border-top:1px dashed #eef2f9;margin-top:6px">' +
      '说明：本页为工作流演示，条目为示例数据；实际运行时由各部门信息联络员报送后自动生成。</div>' +
      '</div></div>';
    return h;
  });

  window.registerBoard('settings', function () {
    var h = pageHead('系统设置', '分类体系、字段规范、权限矩阵与运营效能', '');
    var D2 = D;
    h += '<div class="grid g2">';
    h += '<div class="card"><div class="card-h"><h3>分类体系（全站统一，八个板块共用）</h3></div><div class="card-b">' +
      '<div class="tree"><div class="st" style="font-size:11px;color:#8a97ab;letter-spacing:1px;padding:4px 10px">维度一 · 环境要素</div>' +
      ['水环境', '大气环境', '土壤与地下水', '固体废物', '生态保护', '气候变化与双碳', '环境健康', '环境监测与信息化']
        .map(function (x) { return '<div class="tnode"><span class="ic">' + svg('layers') + '</span>' + x + '</div>'; }).join('') +
      '<div class="st" style="font-size:11px;color:#8a97ab;letter-spacing:1px;padding:10px 10px 4px;margin-top:8px;border-top:1px solid #e8eef8">维度二 · 业务主题</div>' +
      ['碳达峰碳中和', '新污染物治理', '美丽上海建设', '长江保护与长三角一体化', '生态环境法典实施', '无废城市', '绿色低碳转型', '环评与排污许可']
        .map(function (x) { return '<div class="tnode"><span class="ic">' + svg('layers') + '</span>' + x + '</div>'; }).join('') +
      '<div class="st" style="font-size:11px;color:#8a97ab;letter-spacing:1px;padding:10px 10px 4px;margin-top:8px;border-top:1px solid #e8eef8">维度三 · 效力层级（法规库专用）</div>' +
      ['法律', '行政法规', '规章', '规范性文件', '规划纲要', '标准规范']
        .map(function (x) { return '<div class="tnode"><span class="ic">' + svg('doc') + '</span>' + x + '</div>'; }).join('') +
      '</div></div></div>';

    h += '<div class="card"><div class="card-h"><h3>各板块字段规范（差异化的依据）</h3></div><div class="card-b" style="padding:0">' +
      '<div class="tb-wrap"><table class="tb"><thead><tr><th>板块</th><th>每条的必填字段</th><th>条目数</th></tr></thead><tbody>' +
      [['科技前沿', '中文译名 · 期刊 · 研究机构 · 核心结论 · 研究方向标签', (D2.frontier || []).length],
       ['技术进展', '技术名称 · 技术类型 · 适用场景 · 解决的难点问题 · 持有单位', (D2.tech || []).length],
       ['政策法规', '效力层级 · 发文机关 · 文号 · 施行日期 · 现行状态', (D2.reg || []).length],
       ['政策资讯', '标题 · 来源 · 地区 · 时间 · 摘要 · 重要度', (D2.news || []).length],
       ['实用案例', '地点 · 环境要素 · 问题 · 做法 · 成效 · 可复制性', (D2.case || []).length],
       ['专家观点', '专家 · 单位职务 · 场合 · 核心主张 · 原话摘录 · 授权状态', (D2.expert || []).length],
       ['科研成果', '成果类型 · 完成人 · 年度 · 完成单位 · 授权方式', (D2.achv || []).length],
       ['数据资源', '时间范围 · 空间范围 · 来源 · 格式 · 更新频率 · 获取方式', (D2.data || []).length]
      ].map(function (r) {
        return '<tr><td style="font-weight:500">' + esc(r[0]) + '</td>' +
          '<td style="font-size:12.5px;color:#43536b">' + esc(r[1]) + '</td>' +
          '<td class="mono">' + r[2] + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
    h += '</div>';

    h += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>权限矩阵</h3></div><div class="card-b" style="padding:0">' +
      '<div class="tb-wrap"><table class="tb"><thead><tr><th>板块</th><th>普通用户</th><th>授权用户</th><th>管理员</th><th>获取方式</th></tr></thead><tbody>' +
      [['科技前沿', '浏览／下载', '浏览／下载', '发布／审核', '开放获取'],
       ['技术进展', '浏览／下载', '浏览／下载', '发布／审核', '开放获取'],
       ['政策法规', '浏览／下载', '浏览／下载', '发布／审核／状态维护', '开放获取'],
       ['政策资讯', '浏览', '浏览', '发布／审核', '开放获取'],
       ['实用案例', '浏览／下载', '浏览／下载', '发布／审核', '开放获取'],
       ['专家观点', '浏览', '浏览', '发布／审核／授权管理', '开放获取（经本人许可）'],
       ['科研成果', '无权限', '浏览＋申请下载', '发布／审核／授权', '授权下载'],
       ['数据资源', '无权限', '浏览＋申请下载', '发布／审核／授权', '授权下载']
      ].map(function (r) {
        return '<tr><td style="font-weight:500">' + esc(r[0]) + '</td>' +
          [r[1], r[2], r[3]].map(function (c) {
            var off = c === '无权限';
            return '<td><span class="tag ' + (off ? 'r' : 'g') + '">' + esc(c) + '</span></td>';
          }).join('') +
          '<td style="font-size:12.5px">' + esc(r[4]) + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';

    h += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>内容运营效能（示例指标）</h3></div><div class="card-b">' +
      '<div class="grid g3">' + [
        ['信息报送完成率', '90%', '应报 52 · 实报 47'],
        ['平均审核时长', '1.4 天', '目标 ≤2 天'],
        ['资源检索命中率', '78%', '有检索行为且产生下载'],
        ['专题聚合覆盖率', '63%', '被至少一个专题收录'],
        ['失效法规核对', '按季', '现行有效性例行核对'],
        ['附件下载合规率', '100%', '授权下载留痕']
      ].map(function (x) {
        return '<div class="stat"><div class="s-top"><span>' + esc(x[0]) + '</span></div>' +
          '<div class="s-main"><b>' + esc(x[1]) + '</b></div>' +
          '<div style="font-size:11.5px;color:#8a97ab">' + esc(x[2]) + '</div></div>';
      }).join('') + '</div>' +
      '<div style="margin-top:12px;font-size:12px;color:#8a97ab">指标口径对应《建设方案》"动态优化"要求：' +
      '用户活跃度、信息检索率、功能适配度。</div></div></div>';
    return h;
  });
})();
