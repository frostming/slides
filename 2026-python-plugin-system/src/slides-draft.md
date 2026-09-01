---

标题页

---

# 问题：如何扩展 Python 库？

```python mdlite.py
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
---

# Python 足够灵活，你几乎可以在 runtime 修改任何行为：

**Monkeypatch 大法好**

```python main.py
import mdlite

_original_render_fence = mdlite.render_fence   # 1. grab the original

def _patched_render_fence(lang: str, code: str) -> str:
    if lang == "mermaid":                      # 2. inject our logic
        return f'<div class="mermaid">{escape(code)}</div>'
    return _original_render_fence(lang, code)  # 3. delegate the rest

mdlite.render_fence = _patched_render_fence    # 4. Patch and replace the original
```
另一种方式是使用装饰器：

```python main.py
import mdlite

def patch_render_fence(func):
    def wrapper(lang: str, code: str) -> str:
        if lang == "mermaid":
            return f'<div class="mermaid">{escape(code)}</div>'
        return func(lang, code)
    return wrapper

mdlite.render_fence = patch_render_fence(mdlite.render_fence)
```
---

# 存在的问题

非上游认可的扩展方式，可能随时会 break。

```python mdlite 2.0
# mdlite 2.0 -- internal refactor, not in the CHANGELOG
class Renderer:
    def render_fence(self, lang, code): ...
    def render(self, text):
        out.append(self.render_fence(...))
```

顺序有关
```python
# acme_mermaid.py
_orig = mdlite.render_fence
mdlite.render_fence = wrap_a(_orig)

# corp_highlight.py -- imported later
_orig = mdlite.render_fence
mdlite.render_fence = wrap_b(_orig)
```

**Patch 看似成功了，但实际上什么也没做。**

---

Monkeypatching 的问题

- 依赖内部实现，容易随版本变化而失效。没有契约，宿主不知道插件的存在。
- 可能破坏其他依赖相同内部实现的代码。顺序问题。
- 难以调试，问题可能隐藏在 Monkeypatch 的实现中。（现在是谁的代码在执行？）

---

# 改造：provider 与 register

```python mdlite.py
class Renderer:
    def __init__(self):
        self._fence_renderers = {}

    def register_fence_renderer(self, lang: str, func: Callable[[str], str]):
        self._fence_renderers[lang] = func

    def render_fence(self, lang: str, code: str) -> str:
        if lang in self._fence_renderers:
            return self._fence_renderers[lang](code)
        return f'<pre><code class="{lang}">{escape(code)}</code></pre>'
```

```python main.py
import mdlite

def render_mermaid(code: str) -> str:
    return f'<div class="mermaid">{escape(code)}</div>'

renderer = mdlite.Renderer()
renderer.register_fence_renderer("mermaid", render_mermaid)
```

插件接口好不好的标准：

你能不能在不看或少看宿主代码的情况下，写出一个插件？

---

例子：Flask

```python
from flask import Flask

app = Flask(__name__)

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)
```

一些扩展方法：

```
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

Flask: a lightweight WSGI web application ~~framework~~library.

---

# Framework 和 Library

>要区分一个东西是框架还是库，关键在于找到“谁控制着程序的整体结构？” 这个问题的答案。使用框架，控制权牢牢掌握在框架手中，你所编写的程序，是镶嵌在伟岸的框架程序中的一部分。这有点像是去完成一副卡通图，所有元素都已用浅灰色线条勾边，你只负责给不同部位涂上不同颜色。
>
>而使用库，控制权则仍掌握在你手里。你负责调配和使用不同的库，来搭建起整个程序。这像是玩积木，手边有千千万万个积木和模组，你负责把它们组装成想要的样子。
>——Piglei《AI 编程是一种“框架”》

宿主需要感知插件的存在，使插件不用主动注册，只用做自己的事。

---

# Framework 的例子：Django

```python myapp/middleware.py
from django.utils.deprecation import MiddlewareMixin

class MyMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print("Request received:", request.path)
```

在 `settings.py` 中注册

```python
INSTALLED_APPS = [
    ...
    'myapp',
]

MIDDLEWARE = [
    ...
    'myapp.middleware.MyMiddleware',
]
```
---

# 应用

**应用通常由库或框架组成，用户只使用，不接触代码实现。**

CLI:

```bash
uvx foo-cli
```

Web:

```bash
uvicorn myapp.wsgi:application
```

---

# 如何扩展应用

当 mdlite 变成一个应用

```
mdlite document.md
```

```python mdlite/core.py
class Renderer:
    def __init__(self):
        self._fence_renderers = {}

    def register_fence_renderer(self, lang: str, func: Callable[[str], str]):
        self._fence_renderers[lang] = func

    def render_fence(self, lang: str, code: str) -> str:
        if lang in self._fence_renderers:
            return self._fence_renderers[lang](code)
        return f'<pre><code class="{lang}">{escape(code)}</code></pre>'
```

```python mdlite/__main__.py
import importlib
from mdlite.core import Renderer

def create_renderer(plugins: list[str]) -> Renderer:
    renderer = Renderer()
    for plugin_name in plugins:
        plugin_module = importlib.import_module(plugin_name)
        if hasattr(plugin_module, "render"):
            renderer.register_fence_renderer(plugin_name, plugin_module.render)
    return renderer
```

---

# 加载扩展

```python mermaid_plugin.py
def render(code: str) -> str:
    return f'<div class="mermaid">{escape(code)}</div>'
```

```bash
mdlite --plugin mermaid_plugin document.md
```

---

# 使用 Entrypoint 实现自动发现和加载

```toml pyproject.toml
[project]
name = "mdlite-mermaid"

[project.entry-points."mdlite.fence_renderer"]
mermaid = "mdlite_mermaid:render"
```
- `mdlite.fence_renderer` Entrypoint 组名
- `mermaid` Entrypoint 组内唯一标识符
- `mdlite_mermaid:render` 插件模块和函数

```python mdlite/__main__.py
import importlib.metadata
from mdlite.core import Renderer

def create_renderer() -> Renderer:
    renderer = Renderer()
    for entry_point in importlib.metadata.entry_points(group="mdlite.fence_renderer"):
        plugin_func = entry_point.load()
        renderer.register_fence_renderer(entry_point.name, plugin_func)
    return renderer
```

pip install 即生效：

```bash
pip install mdlite-mermaid
```

用户使用：

```bash
mdlite document.md  # 支持 mermaid 语法
```
---
# 多个扩展点

1. 多个 Entrypoint

```toml pyproject.toml
[project]
name = "mdlite-mermaid"

[project.entry-points."mdlite.fence_renderer"]
mermaid = "mdlite_mermaid:render"

[project.entry-points."mdlite.block_renderer"]
mermaid = "mdlite_mermaid:block_render"
```

2. 统一的扩展点

```toml pyproject.toml
[project]
name = "mdlite-mermaid"

[project.entry-points."mdlite.plugin"]
mermaid = "mdlite_mermaid:plugin"
```

```python mdlite_mermaid.py
def plugin(renderer):
    renderer.register_fence_renderer("mermaid", render)
    renderer.register_block_renderer("mermaid", block_render)
```

**PDM 使用的就是这种方式。**

---

# pytest 的插件框架：pluggy

<!-- Please complete this slide -->

---

# 总结

<!-- Please complete this slide -->
