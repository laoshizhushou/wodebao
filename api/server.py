"""
老师的小能手 - 实时AI生成后端服务
FastAPI + 7大专属智能体 + 硅基流动API + PocketBase存储
支持SSE流式输出，前端逐字显示
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

# ── 配置 ─────────────────────────────────────────────────
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "sk-efxvmojdsogorgyikywkfejgaxwudnqpiaygsdudabhnjzns")
SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL = "Qwen/Qwen2.5-72B-Instruct"

POCKETBASE_URL = os.getenv("POCKETBASE_URL", "http://127.0.0.1:8090")
PB_ADMIN_EMAIL = os.getenv("PB_ADMIN_EMAIL", "admin@laoshizhushou.com")
PB_ADMIN_PASSWORD = os.getenv("PB_ADMIN_PASSWORD", "Sn517020551")

# ── 日志 ─────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("teacher-helper-api")

# ── FastAPI ──────────────────────────────────────────────
app = FastAPI(title="老师的小能手 AI 生成服务", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── PocketBase Token 缓存 ────────────────────────────────
_pb_token: Optional[str] = None
_pb_token_time: float = 0


def _get_pb_headers() -> dict:
    """获取 PocketBase 认证头，自动刷新过期 token。"""
    global _pb_token, _pb_token_time
    now = time.time()
    if _pb_token and (now - _pb_token_time) < 3500:  # token 1小时有效，59分钟刷新
        return {
            "Authorization": _pb_token,
            "Content-Type": "application/json",
        }
    resp = requests.post(
        f"{POCKETBASE_URL}/api/collections/_superusers/auth-with-password",
        json={"identity": PB_ADMIN_EMAIL, "password": PB_ADMIN_PASSWORD},
        timeout=10,
    )
    resp.raise_for_status()
    _pb_token = resp.json()["token"]
    _pb_token_time = now
    logger.info("PocketBase 登录成功")
    return {
        "Authorization": _pb_token,
        "Content-Type": "application/json",
    }


def pb_create_record(collection: str, data: dict) -> dict:
    """在 PocketBase 中创建记录。"""
    headers = _get_pb_headers()
    resp = requests.post(
        f"{POCKETBASE_URL}/api/collections/{collection}/records",
        headers=headers,
        json=data,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def pb_update_record(collection: str, record_id: str, data: dict) -> dict:
    """更新 PocketBase 记录。"""
    headers = _get_pb_headers()
    resp = requests.patch(
        f"{POCKETBASE_URL}/api/collections/{collection}/records/{record_id}",
        headers=headers,
        json=data,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


# ── 7大专属智能体提示词 ─────────────────────────────────
def _build_form_text(form_data: dict) -> str:
    """将表单数据转为可读文本。"""
    lines = []
    for k, v in form_data.items():
        if v is not None and str(v).strip() and k not in ("service",):
            lines.append(f"- {k}：{v}")
    return "\n".join(lines) if lines else "（无详细信息）"


AGENT_PROMPTS = {
    "jiaoan": lambda fd: (
        "你是一位经验丰富的中国教育专家，请根据以下需求生成一份完整、专业的教案。\n\n"
        "【服务类型】教案生成\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【教案生成要求】\n"
        "1. 教学目标：按三维目标（知识与技能、过程与方法、情感态度与价值观）或核心素养目标撰写，目标要具体可测量\n"
        "2. 教学重难点：明确列出教学重点和教学难点，并说明突破难点的策略\n"
        "3. 教学准备：列出教师准备和学生准备的具体材料、教具、多媒体资源等\n"
        "4. 完整教学过程：按以下环节详细设计——\n"
        "   - 导入（3-5分钟）：情境创设、旧知衔接、激发兴趣\n"
        "   - 新授（15-20分钟）：知识讲解、探究活动、师生互动\n"
        "   - 练习（10-15分钟）：分层练习、合作学习、即时反馈\n"
        "   - 小结（3-5分钟）：知识梳理、方法归纳、拓展延伸\n"
        "   - 作业（2分钟）：分层作业设计，必做与选做结合\n"
        "5. 板书设计：给出板书的布局和核心内容\n"
        "6. 根据学段（小学/初中/高中）调整内容深度和教学方法\n"
        "7. 全文使用 Markdown 格式，结构清晰，可直接使用\n"
    ),

    "chujuan": lambda fd: (
        "你是一位资深的中国教育考试命题专家，请根据以下需求生成一份完整的试卷。\n\n"
        "【服务类型】智能出卷\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【出卷要求】\n"
        "1. 必须生成真实、完整的题目内容，严禁使用模板占位符（如\"第X题\"、\"此处插入...\"）\n"
        "2. 题型结构合理：包含选择题（单选+多选）、填空题、判断题、解答题/论述题\n"
        "3. 难度梯度遵循 6:3:1 比例（基础60%、中等30%、拔高10%）\n"
        "4. 每道题必须附带参考答案和详细解析\n"
        "5. 选择题的干扰项要合理，具有迷惑性\n"
        "6. 解答题需给出评分标准和步骤分\n"
        "7. 试卷开头注明总分、考试时长、注意事项\n"
        "8. 内容精准匹配指定年级、教材版本和知识点范围\n"
        "9. 使用 Markdown 格式，排版清晰\n"
    ),

    "zhishidian": lambda fd: (
        "你是一位经验丰富的中国教育专家，请根据以下需求生成一份系统、全面的知识点总结。\n\n"
        "【服务类型】知识点总结\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【知识点总结要求】\n"
        "1. 知识点梳理：按逻辑顺序系统梳理该章节/知识点的所有核心内容\n"
        "2. 重点标注：用加粗或特殊标记突出核心概念、公式、定理\n"
        "3. 知识框架：用层级结构（思维导图式）呈现知识点之间的关联\n"
        "4. 易错点提醒：列出该知识点常见的错误和注意事项\n"
        "5. 典型例题：配合1-2个经典例题帮助理解（含解题思路）\n"
        "6. 记忆技巧：提供便于记忆的口诀、对比表或联想方法\n"
        "7. 根据学段和学科调整内容深度，确保与教材版本匹配\n"
        "8. 全文使用 Markdown 格式，结构清晰，适合打印复习\n"
    ),

    "jianyi": lambda fd: (
        "你是一位资深教育心理学专家和一线教学顾问，请根据以下教学问题生成专业、可落地的教学建议。\n\n"
        "【服务类型】教学建议\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【建议生成要求】\n"
        "1. 问题分析：从教育心理学角度分析问题产生的深层原因（认知发展、学习动机、课堂环境、家庭因素、同伴关系等维度）\n"
        "2. 策略建议：提供至少5条具体、可操作的改善策略，每条策略包含：\n"
        "   - 策略名称\n"
        "   - 具体操作步骤（分步骤说明）\n"
        "   - 适用场景\n"
        "   - 预期效果\n"
        "3. 策略要覆盖多个层面：课堂管理策略、学生个体辅导策略、家校合作策略\n"
        "4. 建议必须符合中国中小学教育实际，考虑大班额教学现实\n"
        "5. 如涉及学生心理健康问题，需提醒寻求专业心理咨询师帮助\n"
        "6. 附上3-5个相关教育理论或研究依据，增强专业性\n"
        "7. 语言通俗易懂，一线教师能直接参考使用\n"
        "8. 使用 Markdown 格式，结构清晰\n"
    ),

    "deyu": lambda fd: (
        "你是一位经验丰富的中国德育教育专家，请根据以下需求生成一份专业、实用的德育内容。\n\n"
        "【服务类型】德育内容\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【德育内容要求】\n"
        "1. 紧扣主题：围绕需求中的德育类型（如班会、主题教育、品德培养等）展开\n"
        "2. 目标明确：列出德育目标，包括认知目标、情感目标和行为目标\n"
        "3. 内容完整：包含背景分析、活动设计、实施步骤、总结反思等完整环节\n"
        "4. 活动设计：设计互动性强、贴近学生生活的德育活动，避免空洞说教\n"
        "5. 案例素材：融入真实感人的案例故事或名人名言，增强感染力\n"
        "6. 评价方式：给出德育效果的评价方法和跟踪措施\n"
        "7. 符合学段特点，语言贴近学生认知水平\n"
        "8. 全文使用 Markdown 格式，结构清晰，可直接使用\n"
    ),

    "jiaowu": lambda fd: (
        "你是一位经验丰富的中国中小学教务管理专家，请根据以下需求生成一份专业、实用的教务管理内容。\n\n"
        "【服务类型】教务助手\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【教务管理内容要求】\n"
        "1. 紧扣事务类型：根据需求中的教务事务类型（如课程安排、考试组织、教学检查、教研活动等）精准生成\n"
        "2. 结构规范：包含目的意义、组织架构、时间安排、实施步骤、责任分工、注意事项等要素\n"
        "3. 可操作性：方案要具体到时间节点、责任人、检查标准，确保可直接执行\n"
        "4. 合规性：符合教育部及地方教育行政部门的相关规定和要求\n"
        "5. 表格工具：适当使用表格呈现时间表、分工表、检查清单等实用工具\n"
        "6. 应急预案：考虑可能的突发情况，给出应对措施\n"
        "7. 语言规范：使用正式的公文或方案文体，措辞准确\n"
        "8. 全文使用 Markdown 格式，结构清晰，可直接打印使用\n"
    ),

    "xiaozhang": lambda fd: (
        "你是一位经验丰富的中国中小学校务管理专家，请根据以下需求生成一份专业、全面的校务管理内容。\n\n"
        "【服务类型】校长小助手\n"
        f"【需求信息】\n{_build_form_text(fd)}\n\n"
        "【校务管理内容要求】\n"
        "1. 站位高远：从学校整体发展和管理层视角出发，体现教育政策和办学理念\n"
        "2. 紧扣事务类型：根据需求中的校务事务类型（如学校规划、制度建设、教师管理、家校合作、安全管理、校园文化等）精准生成\n"
        "3. 结构完整：包含指导思想、工作目标、具体措施、实施步骤、保障机制、考核评价等要素\n"
        "4. 政策合规：符合最新的教育法规、政策和文件精神（如双减、新课标、五项管理等）\n"
        "5. 数据支撑：适当引用教育管理的最佳实践和成功案例\n"
        "6. 可操作性：措施要具体、可量化、可考核，避免空话套话\n"
        "7. 语言风格：使用正式的行政文体，适合校务会议、报告或文件使用\n"
        "8. 全文使用 Markdown 格式，结构清晰，可直接打印或汇报使用\n"
    ),

    "modify": lambda fd: (
        "你是一位资深的中国教育专家，请根据用户的修改意见对以下内容进行修改。\n\n"
        f"【原文内容】\n{fd.get('original_content', '无')}\n\n"
        f"【修改意见】{fd.get('modification', '无')}\n\n"
        "【修改要求】\n"
        "1. 严格按照用户的修改意见进行修改，未提及的部分保持原样不变\n"
        "2. 修改后的内容要完整，不要只给出修改部分\n"
        "3. 保持原文的格式和风格\n"
        "4. 全文使用 Markdown 格式\n"
    ),
}

SERVICE_LABELS = {
    "jiaoan": "教案",
    "chujuan": "试卷",
    "zhishidian": "知识点总结",
    "jianyi": "教学建议",
    "deyu": "德育内容",
    "jiaowu": "教务管理",
    "xiaozhang": "校务管理",
    "modify": "内容修改",
}


# ── 请求模型 ─────────────────────────────────────────────
class GenerateRequest(BaseModel):
    service_type: str
    form_data: dict
    user_id: Optional[str] = None
    record_id: Optional[str] = None  # 如果前端已创建记录


# ── 接口 ─────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "老师的小能手 AI 生成服务", "time": datetime.now().isoformat()}


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    """非流式生成：直接返回完整结果。"""
    service_type = req.service_type
    if service_type not in AGENT_PROMPTS:
        return JSONResponse(status_code=400, content={"error": f"不支持的服务类型: {service_type}"})

    prompt_builder = AGENT_PROMPTS[service_type]
    prompt = prompt_builder(req.form_data)
    label = SERVICE_LABELS.get(service_type, service_type)

    # 1. 如果前端没有预创建记录，在这里创建
    record_id = req.record_id
    if not record_id:
        try:
            record = pb_create_record("generated_results", {
                "user_id": req.user_id or "",
                "service_type": service_type,
                "form_data": json.dumps(req.form_data, ensure_ascii=False),
                "status": "pending",
            })
            record_id = record["id"]
            logger.info(f"创建记录: {record_id[:8]}... type={service_type}")
        except Exception as e:
            logger.warning(f"创建PocketBase记录失败: {e}")
            record_id = None

    # 2. 调用硅基流动 API
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                SILICONFLOW_API_URL,
                headers={
                    "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 4096,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"硅基流动API调用失败: {e}")
        if record_id:
            try:
                pb_update_record("generated_results", record_id, {"status": "failed"})
            except Exception:
                pass
        return JSONResponse(status_code=500, content={"error": f"AI生成失败: {str(e)}"})

    # 3. 更新数据库
    if record_id:
        try:
            pb_update_record("generated_results", record_id, {
                "status": "completed",
                "result_content": content,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"生成完成: {record_id[:8]}... type={service_type} len={len(content)}")
        except Exception as e:
            logger.warning(f"更新PocketBase记录失败: {e}")

    return {
        "success": True,
        "record_id": record_id,
        "service_type": service_type,
        "content": content,
    }


@app.post("/api/generate/stream")
async def generate_stream(req: GenerateRequest):
    """流式生成：SSE 逐 token 返回，前端逐字显示。"""
    service_type = req.service_type
    if service_type not in AGENT_PROMPTS:
        return JSONResponse(status_code=400, content={"error": f"不支持的服务类型: {service_type}"})

    prompt_builder = AGENT_PROMPTS[service_type]
    prompt = prompt_builder(req.form_data)
    label = SERVICE_LABELS.get(service_type, service_type)

    # 创建记录
    record_id = req.record_id
    if not record_id:
        try:
            record = pb_create_record("generated_results", {
                "user_id": req.user_id or "",
                "service_type": service_type,
                "form_data": json.dumps(req.form_data, ensure_ascii=False),
                "status": "pending",
            })
            record_id = record["id"]
        except Exception as e:
            logger.warning(f"创建PocketBase记录失败: {e}")

    async def event_generator():
        full_content = ""
        try:
            # 发送开始事件
            yield f"data: {json.dumps({'type': 'start', 'record_id': record_id})}\n\n"

            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    SILICONFLOW_API_URL,
                    headers={
                        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 4096,
                        "temperature": 0.7,
                        "stream": True,
                    },
                ) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        yield f"data: {json.dumps({'type': 'error', 'message': f'API错误: {resp.status_code}'})}\n\n"
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            token = delta.get("content", "")
                            if token:
                                full_content += token
                                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                        except json.JSONDecodeError:
                            continue

            # 发送完成事件
            yield f"data: {json.dumps({'type': 'done', 'content': full_content, 'record_id': record_id})}\n\n"

            # 更新数据库
            if record_id:
                try:
                    pb_update_record("generated_results", record_id, {
                        "status": "completed",
                        "result_content": full_content,
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                    })
                    logger.info(f"流式生成完成: {record_id[:8]}... type={service_type} len={len(full_content)}")
                except Exception as e:
                    logger.warning(f"更新PocketBase记录失败: {e}")

        except Exception as e:
            logger.error(f"流式生成失败: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            if record_id:
                try:
                    pb_update_record("generated_results", record_id, {"status": "failed"})
                except Exception:
                    pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── 启动 ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8081)
