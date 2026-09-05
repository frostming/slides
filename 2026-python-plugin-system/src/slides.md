---
theme: default
title: Python 包的插件系统设计
info: |
  ## Python 包的插件系统设计

  PyCon China 2026 · Frost Ming
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

# Python 包的<br>插件系统设计

<p class="sub">Frost Ming</p>

---
layout: brick
accent: green
---

## Frost Ming

<div class="fill">
<div class="cols-5-4" style="align-items: center">
<div class="stack">

<ul class="intro">
<li>github: <code>@frostming</code></li>
<li>从 2019 年开始在 PyCon China 演讲</li>
<li><code>pdm</code> 作者，<code>bub</code> 维护者</li>
</ul>

</div>
<div class="stack">
<Brick color="tint" class="qr-card">
  <img src="/qr-slides.svg" alt="slides QR code">
  <span class="url">https://slides.fming.dev/python-plugin-system/</span>
</Brick>
</div>
</div>
</div>

---
layout: brick
---

## 问题：如何扩展 Python 库？

<div class="fill">
<div class="cols-4-6" style="align-items: center">
<div class="stack">

<Code cap="example.md">

````md
# Hello, world!

```python
print("Hello from Markdown!")
```
````

</Code>

</div>
<div class="stack">

<Code cap="mdlite.py">

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

</div>
</div>
</div>

---
layout: brick
accent: yellow
---

## Python 足够灵活，你几乎可以在 runtime 修改任何行为：

<div class="fill">
<div class="cols-5-4">
<div class="stack">

<p><strong>Monkeypatch 大法好</strong></p>

<Code cap="main.py">

```py
import mdlite

_original_render_fence = \
    mdlite.render_fence    # 1. grab the original

def _patched_render_fence(lang: str, code: str) -> str:
    if lang == "mermaid":  # 2. inject our logic
        return f'<div class="mermaid">{escape(code)}</div>'
    return _original_render_fence(
        lang, code)        # 3. delegate the rest

mdlite.render_fence = \
    _patched_render_fence  # 4. Patch and replace the original
```

</Code>

</div>
<div class="stack">

<p>另一种方式是使用装饰器：</p>

<Code cap="main.py">

```py
import mdlite

def patch_render_fence(func):
    def wrapper(lang: str, code: str) -> str:
        if lang == "mermaid":
            return f'<div class="mermaid">' \
                   f'{escape(code)}</div>'
        return func(lang, code)
    return wrapper

mdlite.render_fence = \
    patch_render_fence(mdlite.render_fence)
```

</Code>

</div>
</div>
</div>

---
layout: brick
accent: red
---

## 存在的问题

<div class="fill">
<div class="cols">
<div class="stack">

<p>非上游认可的扩展方式，可能随时会 break。</p>

<Code cap="mdlite 2.0">

```py
# mdlite 2.0 -- internal refactor, not in the CHANGELOG
class Renderer:
    def render_fence(self, lang, code): ...
    def render(self, text):
        out.append(self.render_fence(...))
```

</Code>

</div>
<div class="stack">

<p>顺序有关</p>

<Code>

```py
# acme_mermaid.py
_orig = mdlite.render_fence
mdlite.render_fence = wrap_a(_orig)

# corp_highlight.py -- imported later
_orig = mdlite.render_fence
mdlite.render_fence = wrap_b(_orig)
```

</Code>

</div>
</div>

<Callout>

**Patch 看似成功了，但实际上什么也没做。**

</Callout>

</div>

---
layout: brick
accent: red
---

## Monkeypatching 的问题

<div class="fill">
<div class="cols3">
<Brick color="red">

依赖内部实现，容易随版本变化而失效。没有契约，宿主不知道插件的存在。

</Brick>
<Brick color="red">

可能破坏其他依赖相同内部实现的代码。顺序问题。

</Brick>
<Brick color="red">

难以调试，问题可能隐藏在 Monkeypatch 的实现中。（现在是谁的代码在执行？）

</Brick>
</div>
</div>

---
layout: brick
accent: green
---

## 改造：provider 与 register

<div class="fill">
<div class="cols-5-4">
<div class="stack">

<Code cap="mdlite.py">

```py
class Renderer:
    def __init__(self):
        self._fence_renderers = {}

    def register_fence_renderer(self, lang: str,
                                func: Callable[[str], str]):
        self._fence_renderers[lang] = func

    def render_fence(self, lang: str, code: str) -> str:
        if lang in self._fence_renderers:
            return self._fence_renderers[lang](code)
        return f'<pre><code class="{lang}">' \
               f'{escape(code)}</code></pre>'
```

</Code>

</div>
<div class="stack">

<Code cap="main.py">

```py
import mdlite

def render_mermaid(code: str) -> str:
    return f'<div class="mermaid">' \
           f'{escape(code)}</div>'

renderer = mdlite.Renderer()
renderer.register_fence_renderer(
    "mermaid", render_mermaid)
```

</Code>

<Brick color="green">

### 插件接口好不好的标准：

你能不能在不看或少看宿主代码的情况下，写出一个插件？

</Brick>
</div>
</div>

</div>

---
layout: brick
accent: green
---

## 例子：Flask

<div class="fill">
<div class="cols">
<div class="stack">

<Code>

```py
from flask import Flask

app = Flask(__name__)

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)
```

</Code>

<Callout>

Flask: a lightweight WSGI web application ~~framework~~library.

</Callout>

</div>
<div class="stack">

<p>一些扩展方法：</p>

<Code>

```py
Flask.before_request
Flask.after_request
Flask.context_processor
Flask.errorhandler
Flask.route
Flask.register_blueprint
Flask.response_class = CustomResponse

# globals
app, request, g, current_app
```

</Code>

</div>
</div>

</div>

---
layout: brick
accent: indigo
---

## Library、Framework 和 Application

<div class="fill framework-spectrum">

> 要区分一个东西是框架还是库，关键在于找到“谁控制着程序的整体结构？” 这个问题的答案。使用框架，控制权牢牢掌握在框架手中，你所编写的程序，是镶嵌在伟岸的框架程序中的一部分。这有点像是去完成一副卡通图，所有元素都已用浅灰色线条勾边，你只负责给不同部位涂上不同颜色。
>
> 而使用库，控制权则仍掌握在你手里。你负责调配和使用不同的库，来搭建起整个程序。这像是玩积木，手边有千千万万个积木和模组，你负责把它们组装成想要的样子。
>
> ——Piglei《AI 编程是一种“框架”》

<LibraryFrameworkSlider />

<div class="application-summary">
  <span><strong>Application：</strong>通常由库或框架组成，用户只使用，不接触代码实现。</span>
  <code>uvx foo-cli</code>
  <code>uvicorn myapp.wsgi:application</code>
</div>

<Callout>

宿主需要感知插件的存在，使插件不用主动注册，只用做自己的事。

</Callout>

</div>

---
layout: brick
accent: blue
---

## Framework 的例子：Django

<div class="fill">
<div class="cols">
<div class="stack">

<Code cap="myapp/middleware.py">

```py
from django.utils.deprecation import MiddlewareMixin

class MyMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print("Request received:", request.path)
```

</Code>

</div>
<div class="stack">

<p>在 <code>settings.py</code> 中注册</p>

<Code>

```py
INSTALLED_APPS = [
    ...
    'myapp',
]

MIDDLEWARE = [
    ...
    'myapp.middleware.MyMiddleware',
]
```

</Code>

</div>
</div>

</div>

---
layout: brick
accent: purple
---

## 如何扩展应用

<div class="fill">
<div class="cols-5-4">
<div class="stack">

<p>当 mdlite 变成一个应用</p>

<Code>

```bash
mdlite document.md
```

</Code>

<Code cap="mdlite/core.py">

```py
class Renderer:
    def __init__(self):
        self._fence_renderers = {}

    def register_fence_renderer(self, lang: str,
                                func: Callable[[str], str]):
        self._fence_renderers[lang] = func

    def render_fence(self, lang: str, code: str) -> str:
        if lang in self._fence_renderers:
            return self._fence_renderers[lang](code)
        return f'<pre><code class="{lang}">' \
               f'{escape(code)}</code></pre>'
```

</Code>

</div>
<div class="stack">

<Code cap="mdlite/__main__.py">

```py
import importlib
from mdlite.core import Renderer

def create_renderer(
        plugins: list[str]) -> Renderer:
    renderer = Renderer()
    for plugin_name in plugins:
        plugin_module = \
            importlib.import_module(plugin_name)
        if hasattr(plugin_module, "render"):
            renderer.register_fence_renderer(
                plugin_name,
                plugin_module.render)
    return renderer
```

</Code>

</div>
</div>

</div>

---
layout: brick
accent: orange
---

## 加载扩展

<div class="fill">
<div class="solo">

<Code cap="mermaid_plugin.py">

```py
def render(code: str) -> str:
    return f'<div class="mermaid">{escape(code)}</div>'
```

</Code>

<Code>

```bash
mdlite --plugin mermaid_plugin document.md
```

</Code>

</div>
</div>

---
layout: brick
accent: green
---

## 使用 Entrypoint 实现自动发现和加载

<div class="fill">
<div class="cols-4-5">
<div class="stack">

<Code cap="pyproject.toml">

```toml
[project]
name = "mdlite-mermaid"

[project.entry-points."mdlite.fence_renderer"]
mermaid = "mdlite_mermaid:render"
```

</Code>

<ul class="plain small tight">
<li><code>mdlite.fence_renderer</code> Entrypoint 组名</li>
<li><code>mermaid</code> Entrypoint 组内唯一标识符</li>
<li><code>mdlite_mermaid:render</code> 插件模块和函数</li>
</ul>

</div>
<div class="stack">

<Code cap="mdlite/__main__.py">

```py
import importlib.metadata
from mdlite.core import Renderer

def create_renderer() -> Renderer:
    renderer = Renderer()
    for entry_point in importlib.metadata.entry_points(
            group="mdlite.fence_renderer"):
        plugin_func = entry_point.load()
        renderer.register_fence_renderer(
            entry_point.name, plugin_func)
    return renderer
```

</Code>

<p>pip install 即生效：</p>

<Code>

```bash
pip install mdlite-mermaid
```

</Code>

<p>用户使用：</p>

<Code>

```bash
mdlite document.md  # 支持 mermaid 语法
```

</Code>

</div>
</div>

</div>

---
layout: brick
accent: orange
---

## 独占型扩展：默认代码高亮器

<div class="fill">

<p class="lead"><code>mermaid</code> 等按语言注册；普通代码块共用一个默认高亮器。</p>

<div class="cols-6-4">
<div class="stack">

<Code cap="mdlite/core.py">

```py
class Renderer:
    def __init__(self):
        self._fence_renderers = {}
        self.default_fence_renderer = render_plain_fence

    def render_fence(self, lang: str, code: str) -> str:
        if lang in self._fence_renderers:
            return self._fence_renderers[lang](code)
        return self.default_fence_renderer(lang, code)
```

</Code>

<Code cap="mdlite/__main__.py">

```py
for entry_point in importlib.metadata.entry_points(
        group="mdlite.default_fence_renderer"):
    renderer.default_fence_renderer = entry_point.load()
```

</Code>

</div>
<div class="stack">

<div class="lane">
  <Node color="b"><strong>默认实现</strong><br><code>render_plain_fence</code></Node>
  <FlowArrow down />
  <Node color="p"><strong>先加载</strong><br><code>mdlite_pygments:render</code></Node>
  <FlowArrow down />
  <Node color="r"><strong>后加载 · 最终生效</strong><br><code>mdlite_shiki:render</code></Node>
</div>

</div>
</div>

<Callout>

**后到先得。** 同时安装 Pygments 和 Shiki 扩展时，后加载的默认高亮器生效；如果结果必须可预测，就要显式定义加载顺序或优先级。

</Callout>

</div>

---
layout: brick
accent: green
---

## 多个扩展点

<div class="fill">
<div class="cols">
<div class="stack">

<Brick color="tint">

### 1. 多个 Entrypoint

</Brick>

<Code cap="pyproject.toml">

```toml
[project]
name = "mdlite-rich"

[project.entry-points."mdlite.fence_renderer"]
mermaid = "mdlite_rich:render_mermaid"

[project.entry-points."mdlite.block_renderer"]
mermaid = "mdlite_rich:render_mermaid_block"

[project.entry-points."mdlite.default_fence_renderer"]
pygments = "mdlite_rich:render_code"
```

</Code>

</div>
<div class="stack">

<Brick color="tint">

### 2. 统一的扩展点

</Brick>

<Code cap="pyproject.toml">

```toml
[project]
name = "mdlite-rich"

[project.entry-points."mdlite.plugin"]
rich = "mdlite_rich:plugin"
```

</Code>

<Code cap="mdlite_rich.py">

```py
def plugin(renderer):
    renderer.register_fence_renderer(
        "mermaid", render_mermaid)
    renderer.register_block_renderer(
        "mermaid", render_mermaid_block)
    renderer.default_fence_renderer = render_code
```

</Code>

</div>
</div>

<Callout style="margin-top: 18px">

**PDM 使用的就是这种方式。**

</Callout>

</div>

---
layout: brick
accent: purple
---

## pytest 的插件框架：pluggy

<div class="fill">
<div class="cols">
<div class="stack">

<Code cap="mdlite/hookspecs.py — 宿主声明契约">

```py
import pluggy
hookspec = pluggy.HookspecMarker("mdlite")

class MdLiteSpec:
    @hookspec(firstresult=True)
    def render_fence(self, lang, code) -> str | None:
        """返回 None 表示不处理，交给下一个插件。"""
```

</Code>

<Code cap="mdlite_mermaid.py — 插件实现同名钩子">

```py
import pluggy
hookimpl = pluggy.HookimplMarker("mdlite")

@hookimpl
def render_fence(lang: str, code: str) -> str | None:
    if lang != "mermaid":
        return None
    return f'<div class="mermaid">{escape(code)}</div>'
```

</Code>

</div>
<div class="stack">

<Code cap="mdlite/__main__.py — 装配">

```py
pm = pluggy.PluginManager("mdlite")
pm.add_hookspecs(MdLiteSpec)
pm.load_setuptools_entrypoints("mdlite")

html = pm.hook.render_fence(lang=lang, code=code)
```

</Code>

<Brick color="purple" class="compact" style="padding-top: 7px; padding-bottom: 7px">

### 它多做了什么

<ul class="small tight" style="margin-top: 2px">
<li><b>多实现聚合</b>：一个钩子可以有多个插件响应，结果收集成列表</li>
<li><b>调用语义可声明</b>：<code>firstresult</code> / <code>tryfirst</code> / <code>trylast</code></li>
<li><b>按参数名注入</b>：宿主新增参数不会破坏老插件</li>
</ul>

</Brick>

<Brick color="red" class="compact" style="padding-top: 7px; padding-bottom: 7px">

### 代价：类型提示帮不上忙

<ul class="bad small tight" style="margin-top: 2px">
<li><code>pm.hook.xxx()</code> 是动态属性，返回 <code>Any</code></li>
<li>hookspec 与 hookimpl 无静态关联，签名错了等运行时</li>
<li>IDE 跳不到实现，改签名只能靠全文搜索</li>
</ul>

</Brick>
</div>
</div>

</div>

---
layout: brick
accent: yellow
---

## 总结

<div class="cols" style="align-items: start; height: auto">
<div class="stack">
<Takeaway n="1">

<b style="font-size: 20px">Monkeypatch 能工作，但插件系统需要契约。</b>

把可替换的位置显式设计成 provider、register 或赋值接口。

</Takeaway>
<Takeaway n="2">

<b style="font-size: 20px">先区分扩展点的基数。</b>

注册型允许多个实现共存；独占型赋值覆盖，加载顺序就是冲突策略。

</Takeaway>
</div>
<div class="stack">
<Takeaway n="3">

<b style="font-size: 20px">从 Library 到 Application，控制权逐步交给宿主。</b>

宿主负责发现、加载和装配；插件只需要实现约定。

</Takeaway>
<Takeaway n="4">

<b style="font-size: 20px">插件发现和插件调用是两个层次。</b>

Entry Point 负责发现，统一入口负责装配；需要聚合与排序时再使用 pluggy。

</Takeaway>
</div>
</div>

<div class="brick thanks">
  <div class="px">THANKS &amp; Q&amp;A</div>
  <p>Python 包的插件系统设计 · PyCon China 2026 · Frost Ming</p>
  <p class="disclaimer">本次分享的观点仅代表个人立场，与现在或过往雇主无关。</p>
</div>
