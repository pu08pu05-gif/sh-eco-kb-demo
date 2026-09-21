/* ============================================================
   朗臣生态环境资源管理系统 · 改进版原型
   app.js — 状态 / 图标 / 路由 / 外壳 / 检索 / 详情抽屉
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 全局状态 ---------------- */
  var S = {
    role: 'normal',            // normal | auth | admin
    board: 'home',
    params: {},
    page: 1,
    ready: false
  };
  window.S = S;

  var ROLE_META = {
    normal: { name: '普通用户', short: '普', desc: '开放获取板块' },
    auth:   { name: '授权用户', short: '授', desc: '开放获取 + 授权下载' },
    admin:  { name: '管理员',   short: '管', desc: '全部权限 + 内容运营' }
  };
  window.ROLE_META = ROLE_META;

  /* ---------------- 导航结构：4 组 × 板块 ---------------- */
  var NAV = [
    {
      group: '前沿与技术',
      items: [
        { key: 'frontier', name: '科技前沿', icon: 'spark',  open: true,
          desc: '全球顶级期刊与权威机构最新研究成果，含中文译介与结论摘编' },
        { key: 'tech', name: '技术进展', icon: 'gear', open: true,
          desc: '院内及国内先进污染防治技术、新方法、新材料、新工艺' }
      ]
    },
    {
      group: '政策与标准',
      items: [
        { key: 'reg', name: '政策法规', icon: 'scale', open: true,
          desc: '法律、行政法规、规章、规范性文件、规划纲要、标准规范——可按现行有效性检索' },
        { key: 'news', name: '政策资讯', icon: 'news', open: true,
          desc: '时政新闻、权威解读、发布会动态——过期归入历史' }
      ]
    },
    {
      group: '案例与观点',
      items: [
        { key: 'case', name: '实用案例', icon: 'case', open: true,
          desc: '国内外环境管理、规划、污染治理、生态修复典型实践与优秀案例' },
        { key: 'expert', name: '专家观点', icon: 'quote', open: true,
          desc: '院内外专家学者围绕热点问题的专业见解与发言摘编' }
      ]
    },
    {
      group: '成果与数据',
      items: [
        { key: 'achv', name: '科研成果', icon: 'medal', open: false,
          desc: '院内近5～10年项目、论文、著作、标准专利等（授权下载）' },
        { key: 'data', name: '数据资源', icon: 'db', open: false,
          desc: '基础数据底图、模型软件、历年环境年鉴等（授权下载）' }
      ]
    }
  ];
  var ADMIN_NAV = {
    group: '内容运营',
    items: [
      { key: 'publish', name: '资源发布', icon: 'upload', admin: true, desc: '填报资源信息、上传附件、设置标签与密级' },
      { key: 'todo', name: '待办任务', icon: 'check', admin: true, desc: '审核、发布、下载申请等待办事项' },
      { key: 'settings', name: '系统设置', icon: 'cog', admin: true, desc: '分类体系、字段规范、权限与运营效能' }
    ]
  };
  var SPECIAL = [{ key: 'home', name: '首页', icon: 'home' },
                 { key: 'topic', name: '专题聚合', icon: 'layers' }];

  window.NAV = NAV; window.ADMIN_NAV = ADMIN_NAV; window.SPECIAL = SPECIAL;

  /* ---------------- 图标 ---------------- */
  var ICON = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
    spark: 'M12 3v3M12 18v3M4.2 7.5l2.1 2.1M17.7 14.4l2.1 2.1M3 12h3M18 12h3M4.2 16.5l2.1-2.1M17.7 9.6l2.1-2.1M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 0 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 0 1 0-4 1.7 1.7 0 0 0 1.4-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4a2 2 0 0 1 4 0 1.7 1.7 0 0 0 2.9 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 0 1 0 4z',
    scale: 'M12 4v16M7 20h10M6 8h12M6 8 3 14h6zM18 8l-3 6h6zM12 4a1.5 1.5 0 1 0 0-.01',
    news: 'M4 5h13v14H4zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 12.5h7M7 16h4',
    case: 'M4 7h16v12H4zM9 7V5h6v2M4 12h16M12 12v2',
    quote: 'M9 6c-2.8 0-5 2.2-5 5s2.2 5 5 5c0 2-1.5 3-3 3M20 6c-2.8 0-5 2.2-5 5s2.2 5 5 5c0 2-1.5 3-3 3',
    medal: 'M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8.5 13 7 21l5-2.6L17 21l-1.5-8',
    db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
    upload: 'M12 16V4M7.5 8.5 12 4l4.5 4.5M4 16v3.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V16',
    check: 'M9 11.5 11.5 14 16 9M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z',
    cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3 6.3 17.7',
    search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM21 21l-5-5',
    bell: 'M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a2 2 0 0 1-3.4 0',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'M6 6l12 12M18 6 6 18',
    lock: 'M6 10.5V8a6 6 0 1 1 12 0v2.5M5 10.5h14a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1z',
    doc: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 12h6M9 16h4',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 12h1v5h1',
    fwd: 'M9 5l7 7-7 7',
    ext: 'M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    filter: 'M4 5h16l-6.5 7.5V20l-3-2v-5.5z'
  };
  window.ICON = ICON;

  function svg(name, cls) {
    var d = ICON[name] || ICON.doc;
    return '<svg viewBox="0 0 24 24"' + (cls ? ' class="' + cls + '"' : '') +
      '><path d="' + d + '"/></svg>';
  }
  window.svg = svg;

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.esc = esc;

  function byId(id) { return document.getElementById(id); }
  window.byId = byId;

  function dstr(d) { return d ? String(d).replace(/-/g, '.') : '—'; }
  window.dstr = dstr;

  function dd(dateStr) {
    if (!dateStr) return { md: '—', y: '' };
    var m = String(dateStr).match(/(\d{4})[-/.]?(\d{1,2})[-/.]?(\d{1,2})?/);
    if (!m) return { md: dateStr, y: '' };
    return { y: m[1], md: m[2] + '-' + (m[3] || '01').padStart(2, '0') };
  }
  window.dd = dd;

  function uniq(a) {
    var s = {}, r = [];
    a.forEach(function (x) { if (x && !s[x]) { s[x] = 1; r.push(x); } });
    return r;
  }
  window.uniq = uniq;

  function flatTags(items, key) {
    var out = {};
    items.forEach(function (it) {
      (it[key] || []).forEach(function (t) { out[t] = (out[t] || 0) + 1; });
    });
    return Object.keys(out).map(function (k) { return { k: k, n: out[k] }; })
      .sort(function (a, b) { return b.n - a.n; });
  }
  window.flatTags = flatTags;

  function searchable(it) {
    return [it.name, it.title, it.title_cn, it.title_orig, it.summary, it.claim, it.quote,
      it.issue, it.practice, it.effect, it.expert, it.org, it.issuer, it.docno, it.stdno,
      it.promulgation, it.scene, it.note, it.desc
    ].concat(it.tags || [], it.element || [], it.scene_arr || []).filter(Boolean).join(' ').toLowerCase();
  }
  window.searchable = searchable;

  function toast(msg, type) {
    var el = byId('toast');
    if (!el) return;
    el.className = 'toast show ' + (type || '');
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'toast'; }, 2600);
  }
  window.toast = toast;

  window.need = function () { return S.role; };
  window.isAdmin = function () { return S.role === 'admin'; };
  window.canDownload = function () { return S.role !== 'normal'; };

  /* ---------------- 顶栏标题 / 描述 ---------------- */
  function findNav(key) {
    var all = [];
    NAV.forEach(function (g) { g.items.forEach(function (i) { all.push(i); }); });
    ADMIN_NAV.items.forEach(function (i) { all.push(i); });
    SPECIAL.forEach(function (i) { all.push(i); });
    for (var i = 0; i < all.length; i++) if (all[i].key === key) return all[i];
    return null;
  }
  window.findNav = findNav;

  /* ---------------- 侧栏渲染 ---------------- */
  function renderSide() {
    var h = '';
    h += '<div class="side-brand"><div class="logo-mark">LC</div>' +
      '<div class="logo-txt"><strong>朗臣生态</strong><span>环境资源管理系统</span></div></div>';
    h += '<nav class="side-nav">';
    h += '<div class="nav-group">';
    SPECIAL.forEach(function (it) {
      h += '<div class="nav-item' + (S.board === it.key ? ' on' : '') + '" data-go="' + it.key + '">' +
        svg(it.icon) + '<span>' + it.name + '</span></div>';
    });
    h += '</div>';
    NAV.forEach(function (g) {
      var vis = g.items.filter(function (i) { return i.open || S.role !== 'normal'; });
      if (!vis.length) return;
      h += '<div class="nav-group"><div class="gtitle"><i></i>' + g.group + '</div>';
      vis.forEach(function (it) {
        var locked = !it.open && S.role === 'normal';
        h += '<div class="nav-item' + (S.board === it.key ? ' on' : '') + '" data-go="' + it.key + '">' +
          svg(it.icon) + '<span>' + it.name + '</span>' +
          (!it.open && S.role !== 'admin' ? '<span class="badge" style="background:rgba(217,148,37,.9)">锁</span>' : '') +
          '</div>';
      });
      h += '</div>';
    });
    if (S.role === 'admin') {
      h += '<div class="nav-group"><div class="gtitle"><i></i>' + ADMIN_NAV.group + '</div>';
      ADMIN_NAV.items.forEach(function (it) {
        h += '<div class="nav-item' + (S.board === it.key ? ' on' : '') + '" data-go="' + it.key + '">' +
          svg(it.icon) + '<span>' + it.name + '</span>' +
          (it.key === 'todo' ? '<span class="badge">5</span>' : '') + '</div>';
      });
      h += '</div>';
    }
    h += '</nav>';
    h += '<div class="side-foot">当前身份：<b style="color:#fff">' + ROLE_META[S.role].name + '</b><br>' +
      '<a href="login.htm">切换账号</a> · <a href="#" data-go="topic">专题聚合</a></div>';
    return h;
  }

  /* ---------------- 窄屏横向板块导航 ---------------- */
  function renderTabbar() {
    var groups = NAV.filter(function (g) {
      return g.items.some(function (i) { return i.open || S.role !== 'normal'; });
    });
    var flat = [];
    groups.forEach(function (g) {
      g.items.forEach(function (i) {
        if (i.open || S.role !== 'normal') flat.push(i);
      });
    });
    var h = '<div class="tabbar">';
    h += '<span class="chip' + (S.board === 'home' ? ' on' : '') + '" data-go="home">首页</span>';
    h += '<span class="chip' + (S.board === 'topic' ? ' on' : '') + '" data-go="topic">专题</span>';
    flat.forEach(function (i) {
      h += '<span class="chip' + (S.board === i.key ? ' on' : '') + '" data-go="' + i.key + '">' + i.name + '</span>';
    });
    if (S.role === 'admin') {
      ADMIN_NAV.items.forEach(function (i) {
        h += '<span class="chip' + (S.board === i.key ? ' on' : '') + '" data-go="' + i.key + '">' + i.name + '</span>';
      });
    }
    h += '</div>';
    return h;
  }

  /* ---------------- 顶栏 ---------------- */
  function renderTop() {
    var nav = findNav(S.board) || SPECIAL[0];
    var h = '<header class="top">';
    h += '<button class="menu-btn" id="menuBtn">' + svg('menu') + '</button>';
    h += '<h1>' + esc(nav.name === '首页' ? '朗臣生态环境资源管理系统' : nav.name) + '</h1>';
    h += '<div class="search-box">' + svg('search') +
      '<input id="globalSearch" placeholder="全站检索：法规名称、文号、关键词、专家…" autocomplete="off">' +
      '</div>';
    h += '<div class="top-right">';
    h += '<button class="icon-btn" title="通知">' + svg('bell') + '<span class="dot"></span></button>';
    h += '<div class="user-chip" id="userChip"><div class="avatar">' + ROLE_META[S.role].short + '</div>' +
      '<div class="u-txt"><b>' + ROLE_META[S.role].name + '</b><span>' + ROLE_META[S.role].desc + '</span></div></div>';
    h += '</div></header>';
    return h;
  }

  /* ---------------- 路由 ---------------- */
  var BOARD_RENDER = {};

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    var board = parts[0] || 'home';
    var params = {};
    if (parts[1]) params.arg = decodeURIComponent(parts[1]);
    location.search.replace(/^\?/, '').split('&').filter(Boolean).forEach(function (kv) {
      var p = kv.split('=');
      params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return { board: board, params: params };
  }
  window.parseHash = parseHash;

  function go(board, arg) {
    var q = '';
    if (S.params && S.params.q) q = '?q=' + encodeURIComponent(S.params.q);
    location.hash = '#/' + board + (arg ? '/' + encodeURIComponent(arg) : '');
    if (q && board === S.board) return;
  }
  window.go = go;

  function route() {
    var r = parseHash();
    S.board = r.board;
    S.params = r.params;
    S.page = 1;
    var nav = findNav(S.board);
    if (!nav) { S.board = 'home'; }
    if (nav && nav.admin && S.role !== 'admin') { S.board = 'home'; toast('该功能仅管理员可用'); }
    if (nav && !nav.open && nav.key !== 'publish' && S.role === 'normal' && !nav.admin) {
      S.board = 'home'; toast('授权下载板块需授权用户身份访问');
    }
    S.ready = true;
    render();
  }
  window.route = route;

  function render() {
    var app = byId('app');
    var nav = findNav(S.board) || SPECIAL[0];
    var body = BOARD_RENDER[S.board];
    var inner = body ? body() : renderHome();
    var crumb = S.board === 'home' ? '' :
      '<div class="crumb">首页 ' + svg('fwd') + ' <b>' + esc(nav.name) + '</b></div>';
    app.innerHTML =
      '<aside class="side" id="side">' + renderSide() + '</aside>' +
      '<div class="main">' + renderTop() + renderTabbar() +
      '<div class="content" id="content">' + crumb + inner + '</div></div>';
    bind();
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }
  window.render = render;

  function rerenderContent() {
    var c = byId('content');
    var nav = findNav(S.board) || SPECIAL[0];
    var body = BOARD_RENDER[S.board];
    var crumb = S.board === 'home' ? '' :
      '<div class="crumb">首页 ' + svg('fwd') + ' <b>' + esc(nav.name) + '</b></div>';
    c.innerHTML = crumb + (body ? body() : renderHome());
    bind();
  }
  window.rerenderContent = rerenderContent;

  window.registerBoard = function (key, fn) { BOARD_RENDER[key] = fn; };

  /* ---------------- 事件绑定 ---------------- */
  function bind() {
    var side = byId('side');
    document.querySelectorAll('[data-go]').forEach(function (el) {
      el.onclick = function (e) {
        e.preventDefault();
        var k = el.getAttribute('data-go');
        S.page = 1;
        if (k === S.board) { rerenderContent(); }
        location.hash = '#/' + k;
        if (side) side.classList.remove('on');
        var mask = byId('mask');
        if (mask) mask.classList.remove('on');
      };
    });
    var mb = byId('menuBtn');
    if (mb) mb.onclick = function () {
      if (side) side.classList.toggle('on');
      var mask = byId('mask');
      if (mask) mask.classList.toggle('on', side.classList.contains('on'));
      mask && (mask.onclick = function () { side.classList.remove('on'); mask.classList.remove('on'); });
    };
    var gs = byId('globalSearch');
    if (gs) {
      gs.value = S.params.q || '';
      gs.onkeydown = function (e) {
        if (e.key === 'Enter') {
          S.params.q = gs.value.trim();
          S.page = 1;
          if (S.board === 'home' || S.board === 'topic') location.hash = '#/search'; else rerenderContent();
        }
      };
    }
    var uc = byId('userChip');
    if (uc) uc.onclick = function () {
      toast('当前身份：' + ROLE_META[S.role].name + '；切换身份请回到登录页');
    };
    var dc = byId('drClose');
    if (dc) dc.onclick = closeDrawer;
    var mk = byId('mask');
    if (mk) mk.onclick = closeDrawer;
    // 分页
    document.querySelectorAll('[data-page]').forEach(function (el) {
      el.onclick = function () {
        var p = parseInt(el.getAttribute('data-page'), 10);
        if (!isNaN(p)) { S.page = p; rerenderContent(); }
      };
    });
  }
  window.bind = bind;

  /* ---------------- 详情抽屉 ---------------- */
  function openDrawer(html) {
    var mask = byId('mask'), dr = byId('drawer');
    dr.innerHTML = html;
    mask.classList.add('on');
    dr.classList.add('on');
    document.body.style.overflow = 'hidden';
    var bc = byId('drClose');
    if (bc) bc.onclick = closeDrawer;
  }
  window.openDrawer = openDrawer;

  function closeDrawer() {
    byId('mask').classList.remove('on');
    byId('drawer').classList.remove('on');
    document.body.style.overflow = '';
  }
  window.closeDrawer = closeDrawer;

  window.drawerShell = function (title, sub, bodyHtml, actsHtml) {
    return '<div class="dr-head"><div class="dr-t"><h3>' + title + '</h3>' +
      (sub ? '<div class="dr-sub">' + sub + '</div>' : '') + '</div>' +
      '<button class="dr-close" id="drClose">' + svg('close') + '</button></div>' +
      '<div class="dr-body">' + bodyHtml + (actsHtml || '') + '</div>';
  };

  window.kvGrid = function (rows) {
    return '<div class="kv-grid">' + rows.filter(function (r) { return r && r[1]; }).map(function (r) {
      return '<div class="kv"><div class="k">' + esc(r[0]) + '</div><div class="v">' + (r[2] ? r[1] : esc(r[1])) + '</div></div>';
    }).join('') + '</div>';
  };

  window.permNote = function (open) {
    return '<div class="notice' + (open ? ' blue' : '') + '">' + svg(open ? 'info' : 'lock') +
      '<div>' + (open
        ? '<b>开放获取</b>：本板块内容面向全院开放，可直接浏览并下载附件，无需申请审批。下载信息仅限工作用途，须遵守知识产权相关规定。'
        : '<b>授权下载</b>：本板块开放基本信息浏览（标题、摘要、关键词等），下载附件需经资料上传部门授权。请通过“下载申请”填写事由与用途说明。') +
      '</div></div>';
  };

  /* ---------------- 分页控件 ---------------- */
  window.pager = function (total, per, cur) {
    var pages = Math.max(1, Math.ceil(total / per));
    if (cur > pages) cur = pages;
    var h = '<div class="pager"><span class="pinfo">共 ' + total + ' 条 · 第 ' + cur + '/' + pages + ' 页</span>';
    h += '<button data-page="' + Math.max(1, cur - 1) + '"' + (cur <= 1 ? ' disabled' : '') + '>上一页</button>';
    var start = Math.max(1, cur - 2), end = Math.min(pages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (var i = start; i <= end; i++) {
      h += '<button data-page="' + i + '"' + (i === cur ? ' class="on"' : '') + '>' + i + '</button>';
    }
    h += '<button data-page="' + Math.min(pages, cur + 1) + '"' + (cur >= pages ? ' disabled' : '') + '>下一页</button></div>';
    return h;
  };

  window.emptyBox = function (msg) {
    return '<div class="empty">' + svg('doc') + '<div>' + esc(msg || '未找到匹配的内容，请调整关键词或筛选条件') + '</div></div>';
  };

  /* ---------------- 全局检索（跨板块） ---------------- */
  window.doGlobalSearch = function (q) {
    if (!q) return emptyBox('请输入检索词');
    var hits = [];
    var boards = [
      ['reg', '政策法规'], ['news', '政策资讯'], ['frontier', '科技前沿'],
      ['tech', '技术进展'], ['case', '实用案例'], ['expert', '专家观点'],
      ['achv', '科研成果'], ['data', '数据资源']
    ];
    boards.forEach(function (b) {
      var arr = (window.DATA && window.DATA[b[0]]) || [];
      arr.forEach(function (it) {
        if (searchable(it).indexOf(q.toLowerCase()) >= 0) hits.push({ board: b[0], bname: b[1], it: it });
      });
    });
    if (!hits.length) return emptyBox('未检索到“' + q + '”相关内容');
    var byB = {};
    hits.forEach(function (h) { (byB[h.bname] = byB[h.bname] || []).push(h); });
    var out = '<div class="page-head"><h2>全站检索</h2>' +
      '<div class="pdesc">关键词「' + esc(q) + '」共命中 ' + hits.length + ' 条，覆盖 ' +
      Object.keys(byB).length + ' 个板块</div></div>';
    out += '<div class="notice blue">' + svg('info') + '<div>检索同时命中标题、关键词、摘要、文号、颁布信息、专家姓名等字段——' +
      '这是把八个板块放在同一套分类体系下打标的直接效果。</div></div>';
    Object.keys(byB).forEach(function (bn) {
      out += '<div class="card" style="margin-top:14px"><div class="card-h"><h3>' + bn +
        ' <span class="tag gray">' + byB[bn].length + ' 条</span></h3>' +
        '<span class="more" data-go="' + byB[bn][0].board + '">进入板块 ' + svg('fwd') + '</span></div>' +
        '<div class="card-b"><ul class="list">' + byB[bn].slice(0, 5).map(function (x) {
          var it = x.it, t = window.titleOf(x.board, it);
          return '<li><i class="li-dot"></i><div class="li-b"><div class="li-t">' + esc(t.slice(0, 92)) + '</div>' +
            '<div class="li-m"><span>' + esc(metaLineOf(x.board, it)) + '</span></div></div></li>';
        }).join('') + '</ul>' + (byB[bn].length > 5 ? '<div style="padding:10px 0 2px;font-size:12.5px;color:#8a97ab">…另有 ' +
          (byB[bn].length - 5) + ' 条，进入板块查看</div>' : '') + '</div></div>';
    });
    return out;
  };

  window.titleOf = function (board, it) {
    if (board === 'reg') return (it.stdno ? it.stdno + ' ' : '') + it.name;
    return it.name || it.title_cn || it.title || '';
  };
  window.metaLineOf = function (board, it) {
    if (board === 'reg') return [it.level, it.issuer, it.docno, it.pubdate].filter(Boolean).join(' · ');
    return [it.source, it.date, it.journal, it.org, it.type].filter(Boolean).join(' · ');
  };

  /* ---------------- 首页（按角色） ---------------- */
  function renderHome() {
    var D = window.DATA || {};
    var reg = D.reg || [], news = D.news || [], frontier = D.frontier || [],
      tech = D.tech || [], cs = D.case || [], ex = D.expert || [],
      achv = D.achv || [], dat = D.data || [];
    var h = '';
    // 欢迎条
    h += '<div class="topic-hero" style="margin-bottom:16px"><div class="th-in">' +
      '<h2>' + (S.role === 'admin' ? '管理员工作台' : S.role === 'auth' ? '授权用户工作台' : '欢迎回来') + '</h2>' +
      '<p>' + (S.role === 'admin'
        ? '内容运营视图：待审核资源、各部门报送情况、栏目效能指标。'
        : '本栏目按「以用促建、按需取用」原则组织：外部信息共享 6 个板块开放获取，内部成果交流 2 个板块授权下载。') +
      '</p>' +
      '<div class="th-stats">' +
      '<div><b>' + (reg.length + news.length + frontier.length + tech.length + cs.length + ex.length) + '</b><span>开放获取条目</span></div>' +
      '<div><b>' + reg.filter(function (x) { return x.status === '现行有效'; }).length + '</b><span>现行有效法规标准</span></div>' +
      '<div><b>' + tech.length + '</b><span>技术成果</span></div>' +
      '<div><b>' + (achv.length + dat.length) + '</b><span>授权下载条目</span></div>' +
      '</div></div></div>';

    if (S.role === 'admin') {
      var pend = 22, due = 6, total = 20;
      h += '<div class="grid g4">';
      h += statCard('待审核资源', pend, [['待审核', 22], ['已审核', 16]], 'medal', 'amber');
      h += statCard('今日到期任务', due, [['超期未处理', 3], ['本月已办结', 128]], 'check', 'blue');
      h += statCard('本月报送', 47, [['应报', 52], ['完成率 90%', 0]], 'upload', 'green');
      h += statCard('栏目访问量', 37, [['内网 30', 0], ['外网 22', 0]], 'db', 'cyan');
      h += '</div>';
      h += '<div class="grid g2" style="margin-top:16px">' +
        listCard('待办事项', '全部处理', [
          ['《关于进一步优化能源、交通、水利等重大建设项目用地组卷报批工作的通知》文件待审核', 'XX处室', '09-16'],
          ['《自然资源行政处罚办法》文件待审核', 'XX处室', '09-16'],
          ['《市政基础设施资产管理办法(试行)》申请公开', 'XX处室', '09-16'],
          ['《城市污水处理设施建设和运营管理办法》申请下载', 'XX处室', '09-16'],
          ['《上海市生态环境监督执法正面清单管理办法》文件待审核', '环境管理与技术评估研究所', '09-15']
        ], 'todo') +
        '<div class="card"><div class="card-h"><h3>各板块内容储备</h3>' +
        '<span class="more" data-go="settings">内容运营 ' + svg('fwd') + '</span></div><div class="card-b">' +
        boardStock([['科技前沿', frontier.length], ['技术进展', tech.length], ['政策法规', reg.length],
          ['政策资讯', news.length], ['实用案例', cs.length], ['专家观点', ex.length],
          ['科研成果', achv.length], ['数据资源', dat.length]]) +
        '</div></div></div>';
      return h;
    }

    h += '<div class="grid g4">';
    h += statCard('现行有效法规', reg.filter(function (x) { return x.status === '现行有效'; }).length,
      [['已修订', reg.filter(function (x) { return x.status === '已修订'; }).length],
       ['已废止', reg.filter(function (x) { return x.status === '已废止'; }).length]], 'scale', 'blue');
    h += statCard('标准规范', reg.filter(function (x) { return x.level === '标准规范'; }).length,
      [['国标/行标', reg.filter(function (x) { return x.level === '标准规范' && x.region === '国家'; }).length],
       ['上海地方', reg.filter(function (x) { return x.level === '标准规范' && x.region === '上海'; }).length]], 'doc', 'cyan');
    h += statCard('前沿解读', frontier.length, [['本周新增', 5], ['已译介', frontier.length]], 'spark', 'amber');
    h += statCard('可用数据资源', dat.length, [['统计数据类', dat.filter(function (x) { return /统计|年鉴/.test((x.name || '') + (x.fmt || '')); }).length],
      ['环境状况类', dat.filter(function (x) { return /公报|状况/.test(x.name || ''); }).length]], 'db', 'green');
    h += '</div>';

    // 政策法规（最常用，放第一排）
    var regNew = reg.slice(0, 6);
    h += '<div class="grid g2" style="margin-top:16px">';
    h += '<div class="card"><div class="card-h"><h3>最新入库法规标准</h3>' +
      '<span class="more" data-go="reg">政策法规库 ' + svg('fwd') + '</span></div><div class="card-b">' +
      '<ul class="list">' + regNew.map(function (r) {
        return '<li><i class="li-dot"></i><div class="li-b"><div class="li-t" data-open="reg:' + esc(r.id) + '">' +
          esc((r.stdno ? r.stdno + ' ' : '') + r.name).slice(0, 78) + '</div>' +
          '<div class="li-m"><span class="tag">' + esc(r.level) + '</span>' +
          (r.docno ? '<span>' + esc(r.docno) + '</span>' : '') +
          (r.effect ? '<span>施行 ' + esc(r.effect) + '</span>' : '<span>' + esc(r.pubdate || '') + '</span>') +
          '</div></div><span class="li-time"><span class="status ' +
          (r.status === '现行有效' ? 'valid' : r.status === '已修订' ? 'rev' : 'dead') + '">' + esc(r.status) + '</span></span></li>';
      }).join('') + '</ul></div></div>';

    h += '<div class="card"><div class="card-h"><h3>政策资讯</h3>' +
      '<span class="more" data-go="news">政策资讯 ' + svg('fwd') + '</span></div><div class="card-b">' +
      '<ul class="list">' + news.slice(0, 6).map(function (n) {
        return '<li><i class="li-dot"></i><div class="li-b"><div class="li-t" data-open="news:' + esc(n.id) + '">' +
          esc(n.title).slice(0, 78) + '</div><div class="li-m"><span>' + esc(n.source) + '</span>' +
          (n.region ? '<span>' + esc(n.region) + '</span>' : '') + '</div></div>' +
          '<span class="li-time">' + esc(dstr(n.date).slice(5)) + '</span></li>';
      }).join('') + '</ul></div></div>';
    h += '</div>';

    h += '<div class="grid g3" style="margin-top:16px">';
    h += listCard('科技前沿', '进入板块', frontier.slice(0, 5).map(function (f) {
      return [f.title_cn, f.journal, f.date];
    }), 'frontier');
    h += listCard('实用案例', '进入板块', cs.slice(0, 5).map(function (c) {
      return [c.name, c.region + ' · ' + c.element, c.date || ''];
    }), 'case');
    h += listCard('专家观点', '进入板块', ex.slice(0, 5).map(function (e) {
      return [e.claim, e.expert + ' · ' + (e.org || ''), e.date];
    }), 'expert');
    h += '</div>';

    h += '<div class="card" style="margin-top:16px"><div class="card-h"><h3>快捷入口</h3></div>' +
      '<div class="card-b wrap">' +
      [['习近平重要讲话数据库', 'http://jhsjk.people.cn/result?type=105'],
       ['党内法规库', 'https://www.12371.cn/special/dnfg/'],
       ['上海市政府会议公开', 'https://www.shanghai.gov.cn/nw11433/index.html'],
       ['生态环境部政策法规库', 'https://www.mee.gov.cn/ywgz/fgbz/'],
       ['上海市生态环境局', 'https://sthj.sh.gov.cn/']
      ].map(function (x) {
        return '<a class="btn" href="' + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + ' ' + svg('ext') + '</a>';
      }).join('') + '</div></div>';
    return h;
  }
  window.renderHome = renderHome;
  window.registerBoard('home', renderHome);

  window.registerBoard('search', function () {
    return doGlobalSearch((S.params.q || '').trim());
  });

  function statCard(label, main, subs, icon, color) {
    var colors = {
      blue: ['#eaf1ff', '#2f7bff'], cyan: ['#e5f6f8', '#26a8b8'],
      green: ['#e6f7f0', '#12a06a'], amber: ['#fdf3e2', '#d99425']
    };
    var c = colors[color] || colors.blue;
    return '<div class="stat"><div class="s-top"><span>' + label + '</span>' +
      '<div class="s-ico" style="background:' + c[0] + '">' + svg(icon) + '</div></div>' +
      '<div class="s-main"><b>' + main + '</b>' +
      (subs || []).slice(0, 2).map(function (s) {
        return '<div class="sx"><i>' + s[1] + '</i><em>' + esc(s[0]) + '</em></div>';
      }).join('') + '</div></div>';
  }
  window.statCard = statCard;

  function listCard(title, moreTxt, rows, goKey) {
    return '<div class="card"><div class="card-h"><h3>' + esc(title) + '</h3>' +
      (goKey ? '<span class="more" data-go="' + goKey + '">' + esc(moreTxt) + ' ' + svg('fwd') + '</span>' : '') +
      '</div><div class="card-b"><ul class="list">' + rows.map(function (r) {
        return '<li><i class="li-dot"></i><div class="li-b"><div class="li-t">' + esc(r[0] || '') + '</div>' +
          '<div class="li-m"><span>' + esc(r[1] || '') + '</span></div></div>' +
          '<span class="li-time">' + esc(dstr(r[2]).slice(5)) + '</span></li>';
      }).join('') + '</ul></div></div>';
  }
  window.listCard = listCard;

  function boardStock(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return rows.map(function (r) {
      return '<div style="display:flex;align-items:center;gap:11px;padding:6px 0">' +
        '<span style="flex:0 0 68px;font-size:12.5px;color:#43536b">' + esc(r[0]) + '</span>' +
        '<span class="bar" style="flex:1"><i style="width:' + Math.round(r[1] / max * 100) + '%"></i></span>' +
        '<b style="flex:0 0 34px;text-align:right;font-size:13px;font-variant-numeric:tabular-nums">' + r[1] + '</b></div>';
    }).join('');
  }
  window.boardStock = boardStock;

  /* ---------------- 详情点击委托 ---------------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (!t) return;
    var v = t.getAttribute('data-open').split(':');
    var board = v[0], id = v.slice(1).join(':');
    if (window.openDetail) window.openDetail(board, id);
  });

  /* ---------------- 启动 ---------------- */
  window.bootApp = function () {
    S.role = localStorage.getItem('lc_role') || 'normal';
    if (!['normal', 'auth', 'admin'].includes(S.role)) S.role = 'normal';
    if (!location.hash) location.hash = '#/home';
    window.addEventListener('hashchange', route);
    route();
  };
})();
