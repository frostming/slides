---
theme: default
title: Python 包的插件系统设计
info: |
  ## Python 包的插件系统设计

  PyCon China 2026 · Frost Ming

  从 monkeypatch 的泥潭出发，把「别人怎么扩展我的库」变成一个可以被设计的接口问题。
author: Frost Ming
highlighter: shiki
lineNumbers: false
colorSchema: light
canvasWidth: 1280
aspectRatio: 16/9
fonts:
  sans: AlibabaPuHuiTi, PingFang SC
  mono: JetBrains Mono
  local: AlibabaPuHuiTi
  provider: google
drawings:
  persist: false
mdc: true
layout: cover
accent: yellow
---

<div class="kicker">PyCon China 2026 · Talk</div>

# Python 包的<br>插件系统设计

<p class="sub" style="max-width: 780px">
Frost Ming
</p>

<div class="talk-meta">
  <span>01 · WHY EXTEND</span>
  <span>02 · MONKEYPATCH</span>
  <span>03 · THE INTERFACE</span>
  <span>04 · FOUR WAYS TO LOAD</span>
</div>

---
layout: brick
kicker: 01 · Why Extend
accent: red
---

## 一个小库，是如何被需求撑爆的

<div class="cols-6-4">
<div class="stack">

<Code cap="mdlite/core.py — 100 lines, zero dependencies">

```py
def render(text: str) -> str:
    out = []
    for b in split_blocks(text):
        if b.kind == "fence":
            out.append(render_fence(b.lang, b.code))
        else:
            out.append(render_paragraph(b.text))
    return "\n".join(out)

def render_fence(lang: str, code: str) -> str:
    return f'<pre><code class="{lang}">{escape(code)}</code></pre>'
```

</Code>

<Callout>

**关键观察：** 这些需求的共同点不是「功能」，而是**它们都落在同一个位置**——`render_fence()`，以及输出 HTML 之前。那个位置，就是你的**扩展点**。

</Callout>

</div>
<div class="stack">
<Brick color="red" tag="12 MONTHS LATER" grow>

### 它很好用，于是它开始收到 issue

<ul class="bad small">
<li><b>#41 Mermaid 图</b><span class="dim"> → 需要前端运行时</span></li>
<li><b>#57 数学公式</b><span class="dim"> → 依赖 katex</span></li>
<li><b>#63 代码高亮</b><span class="dim"> → 依赖 pygments</span></li>
<li><b>#71 内部 @提及</b><span class="dim"> → 公司内部，永远不该进上游</span></li>
<li><b>#88 图片走 CDN</b><span class="dim"> → 每家规则都不同</span></li>
<li><b>#94 PlantUML / Graphviz / …</b><span class="dim"> → 永远还有下一个</span></li>
</ul>

</Brick>
</div>
</div>

---
layout: brick
kicker: 01 · Three Roads
center: true
---

## 你只有三条路

<div class="cols3" style="align-content: start">
<Brick color="red" tag="ROAD A">

### 全塞进核心

<ul class="bad small">
<li>依赖爆炸：装个 Markdown 库拖进 katex + pygments</li>
<li>每个功能都是你要维护一辈子的 API</li>
<li>企业内部需求永远进不来</li>
</ul>

</Brick>
<Brick color="yellow" tag="ROAD B">

### 让别人 fork

<ul class="small">
<li>生态碎片化：<code>mdlite-acme</code>、<code>mdlite2</code>…</li>
<li>安全补丁无法传播</li>
<li>两个 fork 的能力无法组合</li>
</ul>

</Brick>
<Brick color="green" tag="ROAD C">

### 设计插件系统

<ul class="good small">
<li>核心依赖为零，能力按需 <code>pip install</code></li>
<li>能力可组合、可独立发版</li>
<li>你维护的是<b>接口</b>，不是所有实现</li>
</ul>

</Brick>
</div>

<div class="cols" style="align-items: start">
<Brick color="purple">

### 插件系统 = 把开闭原则变成一个<span style="color: var(--py-purple)">发布产物</span>

对**扩展**开放：第三方能加能力，不改你一行代码。<br>
对**修改**封闭：加能力不需要动核心，也不需要 fork。

</Brick>
<Brick color="tint">

### 但代价是真实的

你从此有了**公共 API 契约**、**版本兼容义务**和**第三方代码的信任边界**。<br>
<span class="dim">所以不是每个库都需要插件系统——需要的是「变化维度」明显多于「核心逻辑」的库。</span>

</Brick>
</div>

---
layout: brick
kicker: 02 · Without a Plugin System
accent: red
---

## Python 太动态了，所以用户总能「进来」

<div class="cols-6-4">
<div class="stack">

<Code cap='acme_mermaid.py — a third-party "plugin", 1998 style'>

```py
import mdlite

_original_render_fence = mdlite.render_fence   # 1. grab the original

def _patched_render_fence(lang: str, code: str) -> str:
    if lang == "mermaid":                      # 2. inject our logic
        return f'<div class="mermaid">{escape(code)}</div>'
    return _original_render_fence(lang, code)  # 3. delegate the rest

mdlite.render_fence = _patched_render_fence    # 4. global, no way back
```

</Code>

</div>
<div class="stack">
<Brick color="tint">

### 为什么用户会这么干

因为这是他们**唯一**的选择。你没给接口，他们就用语言给的能力。

</Brick>
<Brick color="red">

### 你付出的代价

你的**每一个模块级函数名**都变成了事实上的公共 API——哪怕你从没这么承诺过。

</Brick>
<Callout>

它**能工作**。这正是问题所在——能工作，所以会扩散。

</Callout>
</div>
</div>

---
layout: brick
kicker: 02 · Failure Modes
accent: red
---

## 它会以最难 debug 的两种方式崩掉

<div class="cols">
<div class="stack">

<Code cap="#1 — import order becomes business logic" size="sm">

```py
# acme_mermaid.py
_orig = mdlite.render_fence
mdlite.render_fence = wrap_a(_orig)

# corp_highlight.py -- imported later
_orig = mdlite.render_fence
mdlite.render_fence = wrap_b(_orig)
```

</Code>

<Brick color="red" grow>

### 谁在外层，谁就赢

两个插件各自都对，合起来的行为却**取决于 import 顺序**。再遇上条件导入或 `importlib.reload()`，链条会被**静默截断**，某个 patch 直接消失。

**本质：** monkeypatch 没有**组合语义**，它只有「最后一个赢」。

</Brick>
</div>
<div class="stack">

<Code cap="#2 — a refactor upstream, silence downstream" size="sm">

```py
# mdlite 1.x
def render_fence(lang, code): ...

# mdlite 2.0 -- internal refactor, not in the CHANGELOG
class Renderer:
    def render_fence(self, lang, code): ...
    def render(self, text):
        out.append(self.render_fence(...))
```

</Code>

<Brick color="red" grow>

### patch 依然「成功」，然后什么也没做

模块上多了一个没人调用的属性，Mermaid 图悄悄变回灰色代码块。**没有异常，只有错误的输出**。

这不是插件作者的错，也不是你的错——是「**没有契约**」的必然结果：双方对**什么可以变**从未达成一致。

</Brick>
</div>
</div>

---
layout: brick
kicker: 02 → 03 · The Turn
accent: blue
---

## 它缺的不是能力，是<span style="color: var(--py-red)">语义</span>

<div class="cols">
<div class="stack">
<Brick color="red">

### monkeypatch 做不到的六件事

<ul class="bad small" style="margin-top: 12px">
<li><b>组合</b>：多个扩展如何共存　　<b>顺序</b>：谁先谁后，可声明</li>
<li><b>隔离</b>：一个炸了别拖垮全部　<b>发现</b>：现在到底装了什么</li>
<li><b>卸载</b>：测试后恢复干净状态　<b>契约</b>：什么算破坏性变更</li>
</ul>

</Brick>
<Brick color="green" grow>

### 把它当信号读

当你发现**多个用户在 patch 同一个函数**时，那不是他们不守规矩——那是他们在**替你指出扩展点应该在哪**。去看你的 issue 区和 GitHub 代码搜索。

</Brick>
</div>
<div class="stack">
<Brick color="blue" tag="WHERE">

### 扩展点在哪？

宿主在哪些时刻愿意把控制权交出去？**找法：** 看被反复 patch 的地方、看不断增长的类型判断分支。

</Brick>
<Brick color="yellow" tag="WHAT">

### 契约是什么？

插件必须提供什么、能拿到什么、必须返回什么？**要点：** 类型显式、副作用受限、语义单一。

</Brick>
<Brick color="green" tag="HOW">

### 谁来发现和装配？

宿主如何知道有哪些插件、按什么顺序装配？<span class="dim">← 这是本场的第 4 部分</span>

</Brick>
<Callout>

**顺序很重要。** 多数插件系统翻车，是因为先选了 pluggy，再想扩展点切在哪。

</Callout>
</div>
</div>

---
layout: brick
kicker: 03 · Where
---

## 在「变化的接缝」上开口，并把它变成数据

<div class="cols">
<div class="stack">

<Code cap="mdlite/pipeline.py — three seams, made explicit" size="sm">

```py
def render(text: str, reg: "Registry") -> str:
    # seam 1: whole-document preprocessing
    text = reg.apply_preprocessors(text)

    out = []
    for b in split_blocks(text):
        if b.kind == "fence":
            # seam 2: dispatch by lang
            out.append(reg.render_block(b.lang, b.code))
        else:
            out.append(render_paragraph(b.text))

    # seam 3: output postprocessing
    return reg.apply_postprocessors("\n".join(out))
```

</Code>

<Callout>

三个接缝，覆盖了前面 6 个 issue 的**全部**。<span class="dim">不需要 20 个钩子。</span>

</Callout>

</div>
<div class="stack">

<Code cap="mdlite/registry.py — the single source of truth" size="sm">

```py
class Registry:
    def register_block(self, r, *, origin: str) -> None:
        if not isinstance(r, BlockRenderer):
            raise TypeError(f"{origin}: not a BlockRenderer")
        if (prev := self._origin.get(r.lang)) is not None:
            raise PluginConflict(               # never overwrite
                f"{r.lang!r}: {prev!r} vs {origin!r}")
        self._blocks[r.lang] = r
        self._origin[r.lang] = origin

    def render_block(self, lang, code, ctx) -> str:
        if (r := self._blocks.get(lang)) is None:
            return default_fence(lang, code)    # degrade
        return r.render(code, ctx)
```

</Code>

<Brick color="green">

### 三个设计决定

<ul class="good small" style="margin-top: 10px">
<li><b>冲突显式报错</b>，带上双方来源，而不是静默覆盖</li>
<li><b>缺失优雅降级</b>，回到默认行为而不是抛异常</li>
<li><b>实例化</b>的注册表，不是模块级全局字典 → 测试可隔离</li>
</ul>

</Brick>
</div>
</div>

---
layout: brick
kicker: 03 · The Contract
---

## 用 <span class="mono">Protocol</span> 写下契约，别把 <span class="mono">self</span> 递出去

<div class="cols-6-4">
<div class="stack">

<Code cap="mdlite/api.py — the public contract, versioned" size="sm">

```py
API_VERSION = 1        # plugins negotiate against this

@dataclass(frozen=True)        # a snapshot, not internal state
class RenderContext:
    source_path: str | None
    options: Mapping[str, object]      # read-only mapping
    emit_asset: Callable[[str], None]  # the only write channel

@runtime_checkable
class BlockRenderer(Protocol):
    """Render one fenced block into an HTML fragment."""

    lang: str        # matched against the fence info string

    def render(self, code: str, ctx: RenderContext) -> str:
        """Return HTML. Must not mutate ctx."""
```

</Code>

</div>
<div class="stack">
<Brick color="blue">

### 为什么是 Protocol 而不是 ABC

<ul class="small" style="margin-top: 10px">
<li>插件<b>不需要 import 你</b>再继承——结构化子类型，零耦合</li>
<li>mypy / pyright 能在插件仓库里静态校验</li>
</ul>

</Brick>
<Brick color="red">

### 三个最常见的坑

<ul class="bad small" style="margin-top: 10px">
<li>把宿主整个递出去 → 每个私有属性都成了 API</li>
<li><code>None</code> 同时表达「没处理 / 空结果 / 出错」</li>
<li>位置参数签名 → 你永远加不了第 4 个参数</li>
</ul>

</Brick>
<Callout>

**一句话检验：** 能不能在**不看核心源码**的情况下写出一个正确的插件？

</Callout>
</div>
</div>

---
layout: brick
kicker: 04 · Four Ways to Load
---

## 四种范式，一条「隐式程度」轴

<div style="display: flex; flex-direction: column; gap: 18px; margin-top: 6px">

<div class="flow">
<Node color="k" style="width: 245px">① Flask 式<br><span class="dim mono" style="font-size: 13px; font-weight: 400">app.use(Ext())</span></Node>
<FlowArrow />
<Node color="b" style="width: 245px">② Django 式<br><span class="dim mono" style="font-size: 13px; font-weight: 400">INSTALLED_APPS = [...]</span></Node>
<FlowArrow />
<Node color="g" style="width: 245px">③ Entry Points<br><span class="dim mono" style="font-size: 13px; font-weight: 400">pip install 即生效</span></Node>
<FlowArrow />
<Node color="p" style="width: 245px">④ pluggy<br><span class="dim mono" style="font-size: 13px; font-weight: 400">hookspec / hookimpl</span></Node>
</div>

<div style="display: flex; justify-content: space-between; font-family: var(--font-pixel); font-size: 10px; color: var(--gray-pixel); padding: 0 20px">
  <span>← EXPLICIT / 代码可见</span><span>IMPLICIT / 自动装配 →</span>
</div>

<div class="cols" style="margin-top: 8px">
<Brick color="yellow">

### 越往左

<ul class="small" style="margin-top: 8px">
<li>行为可从代码读出，顺序完全可控；测试与多实例容易</li>
<li>但用户必须<b>知道</b>插件存在并手写代码</li>
</ul>

</Brick>
<Brick color="purple">

### 越往右

<ul class="small" style="margin-top: 8px">
<li>零配置：装上就有能力；生态可发现、可聚合多实现</li>
<li>但「为什么会这样」变难回答；启动开销与安全面变大</li>
</ul>

</Brick>
</div>

<Callout style="border-left-color: var(--py-green)">

**剧透：** 它们不是互斥的。成熟项目通常是**分层叠加**——右边负责发现，左边负责装配。<span class="dim">见第 16 页。</span>

</Callout>

</div>

---
layout: brick
kicker: Pattern ① · Flask Style
accent: yellow
---

## <span class="badge-n">01</span>显式调用：把装配写进代码

<div class="cols">
<div class="stack">

<Code cap="host + plugin" size="sm">

```py
# mdlite/core.py -- the whole host-side protocol
class MdLite:
    def use(self, ext) -> "MdLite":
        ext.init_md(self)        # order == call order
        return self

# mdlite_mermaid/__init__.py -- the plugin package
class Mermaid:
    def __init__(self, *, theme: str = "default"):
        self.theme = theme

    def init_md(self, md) -> None:
        md.registry.register_block(
            MermaidRenderer(self.theme), origin="mermaid")
```

</Code>

<Brick color="tint">

### 真实世界里的同款

`app.register_blueprint()` · `db.init_app(app)` · `app.include_router()` · `cli.add_command()`

</Brick>
</div>
<div class="stack">

<Code cap="user code — what is installed, in what order, at a glance" size="sm">

```py
md = (MdLite(strict=True)
      .use(Mermaid(theme="forest"))
      .use(KaTeX(inline=True))
      .use(Mentions(domain="acme.corp")))

html = md.render(text)
```

</Code>

<Brick color="green" tag="PROS">

<ul class="good small" style="margin-top: 10px">
<li><b>零魔法</b>：装了什么、什么顺序，代码里读得出来</li>
<li><b>可参数化</b>：构造函数就是插件的配置接口</li>
<li><b>易测试、多实例友好</b>：无全局状态</li>
<li><b>实现成本最低</b>：宿主侧就是一个 <code>use()</code></li>
</ul>

</Brick>
<Brick color="red" tag="CONS">

<ul class="bad small" style="margin-top: 10px">
<li>用户必须<b>知道插件存在</b>，没有「装上就生效」</li>
<li>CLI 工具、配置驱动的场景很别扭</li>
<li>需要一个能拿到 <code>md</code> 对象的装配点</li>
</ul>

</Brick>
</div>
</div>

---
layout: brick
kicker: Pattern ② · Django Style
accent: blue
---

## <span class="badge-n">02</span>中央注册：配置说了算

<div class="cols">
<div class="stack">

<Code cap="settings.py — ops owns the order, not the author" size="sm">

```py
MDLITE_EXTENSIONS = [
    "mdlite_mermaid.Mermaid",
    "acme_internal.Mentions",
]
```

</Code>

<Code cap="mdlite/loader.py — string path to object" size="sm">

```py
def load(md, paths: list[str]) -> None:
    for path in paths:
        mod, _, attr = path.rpartition(".")
        try:
            ext_cls = getattr(import_module(mod), attr)
        except (ImportError, AttributeError) as exc:
            raise ImproperlyConfigured(path) from exc
        md.use(ext_cls())
```

</Code>

<Code cap="mdlite/autodiscover.py — convention over configuration" size="sm">

```py
for app in installed:                # import <app>.mdlite_ext
    try:                             # so @register runs once
        import_module(f"{app}.mdlite_ext")
    except ModuleNotFoundError as exc:
        if exc.name != f"{app}.mdlite_ext":
            raise    # never swallow the plugin's own ImportError
```

</Code>

</div>
<div class="stack">
<Brick color="yellow">

### 为什么用字符串而不是 import

为了**打破导入循环**，也为了让配置能是纯数据（TOML / 环境变量 / ConfigMap），不执行 Python 就能被运维改。

</Brick>
<Brick color="red">

### 那个 `except` 值得单独讲

幼稚的 `except ImportError: pass` 会把插件**自身**的依赖缺失也吞掉，症状是「插件装了但完全没反应」。**必须比对 `exc.name`。**

</Brick>
<Brick color="green" tag="PROS">

**配置即部署**，多环境友好；顺序显式且集中；能被非 Python 入口驱动；启用/禁用是一行的事。

</Brick>
<Brick color="red" tag="CONS">

字符串路径**无类型检查**，IDE 不跳转；倾向**全局单例**，多实例困难；import 时副作用 → 循环导入温床；测试隔离需要额外机制。

</Brick>
</div>
</div>

---
layout: brick
kicker: Pattern ③ · Packaging Metadata
accent: green
---

## <span class="badge-n">03</span>Entry Points：<span class="mono">pip install</span> 即生效

<div class="cols">
<div class="stack">

<Code cap="the plugin declares itself — pyproject.toml" size="sm">

```toml
[project]
name = "mdlite-mermaid"
dependencies = [ "mdlite>=2,<3" ] # the compat contract

[project.entry-points."mdlite.renderers"]
mermaid = "mdlite_mermaid:MermaidRenderer"
#  ^ name     ^ module      ^ attribute
```

</Code>

<Code cap="the host scans installed dists — no import needed" size="sm">

```py
from importlib.metadata import entry_points   # py3.10+

for ep in entry_points(group="mdlite.renderers"):
    if ep.name in disabled:      # users must be able to opt out
        continue
    try:
        cls = ep.load()          # the import happens here
        reg.register_block(cls(), origin=_org(ep))
    except Exception:            # one bad plugin must not kill us
        log.exception("plugin %r failed", ep.name)
```

</Code>

</div>
<div class="stack">
<Brick color="blue">

### 四个必须处理的工程细节

<ul class="small" style="margin-top: 10px">
<li><b>兼容</b>：<code>group=</code> 需要 3.10+，更低版本用 <code>importlib_metadata</code> 后端口</li>
<li><b>惰性</b>：扫描便宜，<code>ep.load()</code> 贵——用到才 load，CLI 上是几百毫秒的差别</li>
<li><b>顺序</b>：返回顺序<b>不是契约</b>，需要顺序就让插件声明 <code>priority</code></li>
<li><b>安全</b>：<code>ep.load()</code> = 执行任意第三方代码，这是一条供应链攻击面</li>
</ul>

</Brick>
<Brick color="green" tag="PROS">

零配置；宿主与插件**零 import 耦合**；生态可发现（PyPI 按 group 列举）；版本区间由 pip 强制；标准库能力。

</Brick>
<Brick color="red" tag="CONS">

**隐式**，用户代码里看不到痕迹；调试困难；顺序不可控；启动扫描开销；开发时要 `pip install -e .` 才能被发现。

</Brick>
<Callout style="border-left-color: var(--py-green)">

**务必给开关：** `--no-plugins` / `MDLITE_DISABLE=mermaid`

</Callout>
</div>
</div>

---
layout: brick
kicker: Pattern ④ · pluggy
accent: purple
---

## <span class="badge-n">04</span>pluggy：pytest 的插件内核

<div class="cols">
<div class="stack">

<Code cap="mdlite/hookspecs.py — the host declares the contract" size="sm">

```py
hookspec = pluggy.HookspecMarker("mdlite")

class MdLiteSpec:
    @hookspec(firstresult=True)
    def mdlite_render_block(self, lang, code, ctx) -> str | None:
        """Return None to decline; first non-None wins."""

    @hookspec
    def mdlite_postprocess(self, html: str) -> str | None:
        """All implementations run; results are collected."""
```

</Code>

<Code cap="mdlite_mermaid/plugin.py — the implementation" size="sm">

```py
hookimpl = pluggy.HookimplMarker("mdlite")

class MermaidPlugin:
    @hookimpl
    def mdlite_render_block(self, lang, code, ctx):
        if lang != "mermaid":
            return None          # decline, let the next one try
        return f'<div class="mermaid">{escape(code)}</div>'
```

</Code>

</div>
<div class="stack">
<Brick color="purple">

### 核心心智模型

宿主声明 **hookspec**（签名 = 契约），插件提供 **hookimpl**（同名函数）。调用 `pm.hook.xxx()` 时，pluggy 把**所有**实现按规则组织起来跑一遍。

</Brick>
<Brick color="yellow">

### 被低估的杀手锏：按名注入

hookimpl **只声明自己需要的参数**——不关心 `ctx` 就不写。于是宿主**新增 hookspec 参数不会破坏任何老插件**。<br>
<span class="dim">这是 API 演进上的巨大自由度，也是自己手写钩子最容易漏掉的一点。</span>

</Brick>
<Brick color="blue">

### 调用语义是可声明的

<ul class="small" style="margin-top: 10px">
<li>默认：<b>所有</b>实现都跑，结果收集成 list</li>
<li><code>firstresult=True</code>：第一个非 <code>None</code> 胜出</li>
<li><code>tryfirst</code> / <code>trylast</code>：插件声明自己的相对位置</li>
</ul>

</Brick>
</div>
</div>

---
layout: brick
kicker: Pattern ④ · Wiring & Trade-offs
accent: purple
---

## 装配，以及自己实现会漏掉的东西

<div class="cols">
<div class="stack">

<Code cap="mdlite/manager.py — discovery and explicit registration, unified" size="sm">

```py
def build_manager(*, extra=()) -> pluggy.PluginManager:
    pm = pluggy.PluginManager("mdlite")
    pm.add_hookspecs(MdLiteSpec)              # 1. the contract
    pm.load_setuptools_entrypoints("mdlite")  # 2. auto-discover
    for plugin in extra:
        pm.register(plugin)                   # 3. explicit extras
    pm.check_pending()                        # 4. impl w/o spec?
    return pm
```

</Code>

<Code cap="hookwrapper — cross-cutting concerns become plugins too" size="sm">

```py
@hookimpl(hookwrapper=True)
def mdlite_render_block(lang):
    t0 = time.perf_counter()
    outcome = yield              # every other impl runs here
    metrics.observe(lang, time.perf_counter() - t0)
    # can even rewrite it: outcome.force_result(...)
```

</Code>

<Callout style="border-left-color: var(--py-purple)">

**注意第 2 行和第 3 行同时存在**——pluggy 把「自动发现」和「显式注册」统一在同一个模型下。

</Callout>

</div>
<div class="stack">
<Brick color="yellow">

### 拼写保护与可观测性

`check_pending()` 会在启动时抓出 `mdlite_render_blcok` 这类拼错——否则它就是**永远不被调用、也永远不报错**的那类 bug。<br>
`pm.enable_tracing()` / `pm.list_name_plugin()`：`pytest --trace-config` 就是这么来的。

</Brick>
<Brick color="green" tag="PROS">

多实现聚合是一等公民；顺序可声明；按名注入让 API 可演进；签名校验；发现方式可插拔。<br>
<span class="dim">pytest / tox / devpi / datasette 久经考验。</span>

</Brick>
<Brick color="red" tag="CONS">

概念负担（spec / impl / wrapper / firstresult）；**控制流隐式**，跳不到实现；类型不友好；hook 必须带项目名前缀；小库上是**明显的过度设计**。

</Brick>
<Callout style="border-left-color: var(--py-purple)">

只有一个扩展维度？**一个 dict 就够了，别上 pluggy。**

</Callout>
</div>
</div>

---
layout: brick
kicker: Side by Side
---

## 四种范式对比

<div class="cmp">

| 维度       | ① Flask 显式调用                            | ② Django 中央注册                            | ③ Entry Points                              | ④ pluggy                                          |
| ---------- | ------------------------------------------- | -------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| 装配位置   | 用户代码                                    | 配置文件                                     | 包元数据                                    | 元数据 + 代码                                     |
| 可见性     | <span class="pill pill-g">读代码即知</span> | <span class="pill pill-g">读配置即知</span>  | <span class="pill pill-r">需专门查询</span> | <span class="pill pill-y">需 trace / list</span>  |
| 顺序控制   | <span class="pill pill-g">调用顺序</span>   | <span class="pill pill-g">清单顺序</span>    | <span class="pill pill-r">不保证</span>     | <span class="pill pill-g">tryfirst/trylast</span> |
| 多实现聚合 | <span class="pill pill-y">自己实现</span>   | <span class="pill pill-y">自己实现</span>    | <span class="pill pill-y">自己实现</span>   | <span class="pill pill-g">内建</span>             |
| 插件参数化 | <span class="pill pill-g">构造函数</span>   | <span class="pill pill-y">配置字典</span>    | <span class="pill pill-r">需额外机制</span> | <span class="pill pill-y">configure hook</span>   |
| 零配置生效 | <span class="pill pill-r">否</span>         | <span class="pill pill-r">否</span>          | <span class="pill pill-g">是</span>         | <span class="pill pill-g">是</span>               |
| 测试隔离   | <span class="pill pill-g">天然</span>       | <span class="pill pill-r">需 override</span> | <span class="pill pill-y">需禁用开关</span> | <span class="pill pill-g">独立 pm</span>          |
| 静态类型   | <span class="pill pill-g">完整</span>       | <span class="pill pill-r">字符串路径</span>  | <span class="pill pill-r">字符串路径</span> | <span class="pill pill-r">弱</span>               |
| 实现成本   | <span class="pill pill-g">最低</span>       | <span class="pill pill-y">中</span>          | <span class="pill pill-y">中</span>         | <span class="pill pill-r">高（概念）</span>       |
| 典型代表   | Flask, FastAPI, Click                       | Django, Scrapy, Celery                       | flake8, mkdocs, pelican                     | pytest, tox, datasette                            |

</div>

---
layout: brick
kicker: Composition
accent: indigo
---

## 它们不是四选一，而是四层

<div class="cols-4-6">
<div class="stack">
<div class="lane">
<Node color="p" style="text-align: center">③ Entry Points<br><span class="dim" style="font-weight: 400">发现：装了哪些插件</span></Node>
<FlowArrow down />
<Node color="b" style="text-align: center">② 中央配置<br><span class="dim" style="font-weight: 400">筛选与排序：启用哪些、什么顺序</span></Node>
<FlowArrow down />
<Node color="k" style="text-align: center">① 显式 <code>use()</code><br><span class="dim" style="font-weight: 400">装配：构造实例，注入参数</span></Node>
<FlowArrow down />
<Node color="g" style="text-align: center">④ pluggy / Registry<br><span class="dim" style="font-weight: 400">调用：聚合多实现，跑 hook</span></Node>
</div>
</div>
<div class="stack">

<Code cap="mdlite/bootstrap.py — all four, cooperating" size="sm">

```py
def build(config: Config) -> MdLite:
    md = MdLite(**config.options)

    # (3) discover: names only, no import yet
    available = {ep.name: ep for ep in entry_points(group=GROUP)}

    # (2) configuration decides which ones, and in what order
    for name in config.enabled or available:
        if name in config.disabled:
            continue
        ep = available.get(name) or _fail(name)

        # (1) explicit wiring, each plugin gets its own options
        md.use(ep.load()(**config.plugin_options.get(name, {})))

    return md
```

</Code>

<Callout style="border-left-color: var(--py-indigo)">

**这就是 pytest / mkdocs 的实际形态：** 自动发现给体验，显式配置给控制，**两者都要，缺一不可**。

</Callout>

</div>
</div>

---
layout: brick
kicker: Production
accent: orange
---

## 第三方代码 = 会出错的代码

<div class="cols">
<div class="stack">

<Code cap="mdlite/safe.py — failure isolation with an escape hatch" size="sm">

```py
def call_renderer(r, lang, code, ctx, *, strict: bool) -> str:
    try:
        html = r.render(code, ctx)
    except PluginError as exc:          # declared, recoverable
        ctx.logger.warning("%s declined %r", r, lang)
        return default_fence(lang, code)
    except Exception:                   # a bug inside the plugin
        if strict:
            raise                       # dev / CI: fail loudly
        ctx.logger.exception("plugin %s crashed", r)
        return default_fence(lang, code)   # prod: degrade

    if not isinstance(html, str):       # never trust the return
        raise TypeError(f"{r}.render must return str")
    return html
```

</Code>

<Brick color="red">

### 报错信息里必须有「谁」

`plugin mdlite-mermaid==0.3.1 crashed`，而不是一个指向你自己源码的裸 traceback。<span class="dim">否则所有 issue 都会提到你的仓库。</span>

</Brick>
</div>
<div class="stack">
<Brick color="blue">

### 发布插件 API 之前的六项检查

<ul class="small" style="margin-top: 12px">
<li><b>版本</b>：暴露 <code>API_VERSION</code>，写清什么算 breaking，走 deprecation 周期</li>
<li><b>可观测</b>：一条命令列出插件名、版本、来源包、挂了哪些扩展点</li>
<li><b>可禁用</b>：「关掉插件还复现吗」必须是一个能被回答的问题</li>
<li><b>测试工具</b>：给插件作者 pytest fixture 和契约一致性套件</li>
<li><b>官方样板</b>：文档里那个例子就是所有人抄的模板，把它写好</li>
<li><b>惰性</b>：发现不 import，import 不初始化，初始化不做 IO</li>
</ul>

</Brick>
<Callout style="border-left-color: var(--py-orange)">

**元规则：** 你自己的一部分功能也应该**用插件 API 实现**。pytest 的 `capture`、`fixtures` 都是内建插件——这保证了 API 真的够用。

</Callout>
</div>
</div>

---
layout: brick
kicker: Decision
---

## 我该选哪个？

<div class="stack" style="gap: 14px">
<QItem color="tint" badge="Q0" badge-color="var(--py-red)">

**扩展维度只有一个，且候选实现有限？**<span class="dim"> → 不要插件系统。一个 `dict[str, Callable]` + 文档说明如何注册，就够了。</span>

</QItem>
<QItem color="yellow" badge="Q1" badge-color="var(--py-yellow)" badge-ink>

**用户是开发者，且有明确的「应用装配阶段」？**<span class="dim"> → ① <b>Flask 式显式调用</b>。最简单、最可控，且随时能往上加发现机制。</span>

</QItem>
<QItem color="blue" badge="Q2" badge-color="var(--py-blue)">

**同一份代码要跑多套配置，或用户是运维/非程序员？**<span class="dim"> → ② <b>中央注册</b>。配置清单驱动，顺序显式，可回滚。</span>

</QItem>
<QItem color="green" badge="Q3" badge-color="var(--py-green)">

**你在做 CLI 工具，或希望「装上即生效」形成生态？**<span class="dim"> → ③ <b>Entry Points</b>。配一个 <code>plugins</code> 子命令和禁用开关。</span>

</QItem>
<QItem color="purple" badge="Q4" badge-color="var(--py-purple)">

**多个插件需要对同一事件<u>都</u>发言，且 hook 会持续增长？**<span class="dim"> → ④ <b>pluggy</b>。别自己重写一遍聚合、排序和 wrapper。</span>

</QItem>
<Callout>

**而且——先从 ① 开始，几乎总是对的。** 它是唯一一个能在事后无痛升级到 ②③④ 的起点：后三者最终都会调用某个 `use()` / `register()`。

</Callout>
</div>

---
layout: brick
kicker: Takeaways
accent: yellow
class: takeaways
---

## 带走四句话

<div class="cols" style="align-items: start; height: auto">
<div class="stack">
<Takeaway n="1">

<b style="font-size: 20px">用户在 monkeypatch 什么，那里就该是扩展点。</b>

去读你的 issue 区和 GitHub 代码搜索——需求已经写在那里了。

</Takeaway>
<Takeaway n="2">

<b style="font-size: 20px">先设计接口，再选加载机制。</b>

Protocol + 冻结的 Context + 显式 Registry。接口错了，pluggy 也救不回来。

</Takeaway>
</div>
<div class="stack">
<Takeaway n="3">

<b style="font-size: 20px">四种范式是「显式 ↔ 隐式」的取舍，而且可以叠成四层。</b>

发现 → 筛选 → 装配 → 调用。

</Takeaway>
<Takeaway n="4">

<b style="font-size: 20px">成本在 API 契约上，不在实现上。</b>

`use()` 十行就能写完；十年的兼容性义务写不完。<br>
把隐式变回可见：列表、日志、开关、错误里的插件名。

</Takeaway>
</div>
</div>

<div class="brick thanks">
  <div class="px">THANKS &amp; Q&amp;A</div>
  <p>Python 包的插件系统设计 · PyCon China 2026 · slides / code / @YOUR_HANDLE</p>
</div>
