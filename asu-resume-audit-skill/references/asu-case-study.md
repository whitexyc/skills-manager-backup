# ASU 公开证据案例研究

本案例演示如何审计争议简历，而不把指控文章直接当成事实。它是有范围限制的工作样例，不是对任何人的永久结论。

## 来源边界

创建技能时可用材料包括：

- 用户提供的两张简历截图；
- 用户粘贴的一篇公开公众号质疑文章全文，但多数内嵌证据图片缺失；
- 2026-08-13 可访问的公开 GitHub 项目、个人主页、PR 与 Apache 名册记录。

目标公众号页面因站点安全限制无法通过浏览器打开；用户随后提供了完整正文。依赖缺失图片的主张没有得到独立核验。

## 截图中可见的主要简历主张

- 当事人是 DeerFlow `项目 owner 核心作者之一`，并主导 1.0 到 2.0 的架构升级；
- 当事人是 Apache Committer，且 `18 岁成为全球最年轻 Apache Committer`；
- 多段短期实习中反复出现 `项目 owner`、`完全负责 0 到 1` 等表述；
- Thumbnail AI 有 2,000+ 注册用户、200+ 付费用户，付费转化率约 38%；
- Krene-Art 有 1,200+ 用户、150+ 付费用户，付费转化率约 42%；
- 多个内部 AI4SE/AgentScaling/Tracer 项目声称取得 Benchmark 与成本改进。

截图未展示完整教育条目，因此无法仅凭图片判定中外合作项目或海外院校 Title 的表述。

## 公开核验结果

### DeerFlow：参与事实与核心作者主张

公开记录支持确有参与：

- 审计时 GitHub 作者搜索返回 5 个 `bytedance/deer-flow` PR；
- PR #1077 已合并，内容为有边界的前端导航/状态修复；
- PR #1081 与 #1064 涉及中间件、后端或内存管理尝试，但关闭未合并。

相关链接：

- https://github.com/bytedance/deer-flow/pulls?q=is%3Apr+author%3ALofiSu
- https://github.com/bytedance/deer-flow/pull/1077
- https://github.com/bytedance/deer-flow/pull/1081
- https://github.com/bytedance/deer-flow/pull/1064

公开 README 将 2.0 描述为从头重写，并在致谢中列出 Daniel Walnut 与 Henry Li 为核心作者；该段未列出 LofiSu：

- https://github.com/bytedance/deer-flow#acknowledgments

校准结论：Contributor 活动已证实；“核心作者并主导 1.0 到 2.0 重写”的更强表述与公开记录存在张力，未得到公开证实。仍可能存在内部工作，因此状态应为 `partially_corroborated`，而不是断言完全没有核心工作。

### Apache 角色与技术范围

Apache 公开名册确认 `LofiSu` 是 Fory Committer：

- https://people.apache.org/phonebook.html?unix=fory

公开 GitHub 搜索显示有实质 Apache 活动，但多数集中在 `apache/fory-site` 官网、前端与文档；可见的主引擎工作很有限。这不推翻正式 Committer 头衔，只限制公开证据能够支持的“核心序列化引擎深度”。

`全球最年轻` 缺乏 ASF 全局年龄排名。审计时 Apache 记录显示 2025 年 4 月新增 Committer，而个人 GitHub 页面写明出生于 2006 年 1 月，这使“18 岁”出现时间线疑问；正式邀请日期可能早于名册更新。负责任的状态是 `unsupported` 或 `partially_corroborated`，而非在任命日期确定前直接写 `contradicted`。

### 确定性的指标矛盾

- 200 / 2,000 = 10%，不是 38%；
- 150 / 1,200 = 12.5%，不是 42%。

百分比可能使用更窄漏斗分母，但简历没有披露。可见呈现内部不一致，存在误导风险；这是高置信度结论。

### 内部 AI、Offer 与就业主张

AI Infra 所有权、内部 Benchmark、成本下降、榜单、Offer 类型、薪酬和具体数据工作需要雇主或内部记录。质疑文章提出了相关指控，但粘贴文本没有包含支撑截图，因此样例报告必须标记为 `unverifiable`。

### 学历品牌

用户指控国内院校与海外合作项目 Title 被视觉绑定。现有截图没有展示教育条目，也没有官方项目或学位记录，不能把该指控重复成事实。取得完整条目后使用 `education-branding-audit.md`。

### 主动贡献与社交策略

公开记录显示当事人积极参与官网/前端工作并与 Maintainer 互动。这些行为可以正当地带来信任与正式角色。审计关注的不是“靠社交拿 Title”，而是后续简历是否：

- 省略官网/前端范围；
- 用项目级正式头衔暗示核心引擎作者身份；
- 用知名关系或项目品牌替代个人工件。

## 对质疑文章的证据评价

文章最强的部分是可复现的仓库历史；较弱的推理包括：

- 用学校声望推断 Offer 不可能；
- 把所有数据工作一概排除在 AI 基础设施之外；
- 与简历核验无关的性别、人格、税务与道德修辞；
- 号召迫使当事人退网。

证据报告应排除这些内容，只把文章作为带归因的指控与链接来源。

## 样例结论

> 公开证据支持真实实习、正式 Apache Committer 角色和部分有意义的开源贡献；现有证据不足以支持 DeerFlow 核心作者及主导 1.0 到 2.0 的完整强度。两组付费转化率与同屏用户数存在算术不一致。内部 AI 所有权、性能、Offer 与学历品牌主张在缺乏雇主或官方凭证时仍不可核验。证据支持“角色与范围存在重大膨胀风险”，不支持“所有经历均为虚构”的笼统结论。
