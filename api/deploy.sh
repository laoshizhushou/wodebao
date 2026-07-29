#!/bin/bash
# 老师的小能手 - AI生成服务一键部署脚本
# 在服务器 Workbench 中执行: sudo bash deploy.sh

set -e

echo "=========================================="
echo "  老师的小能手 - AI生成服务部署"
echo "=========================================="

# 1. 安装 Python 依赖
echo "[1/5] 安装 Python 依赖..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip python3-venv > /dev/null 2>&1

# 2. 创建虚拟环境并安装依赖
echo "[2/5] 配置 Python 虚拟环境..."
VENV_DIR="/opt/wodebao/venv"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"
pip install -q -r /opt/wodebao/api/requirements.txt
echo "  ✓ Python 依赖安装完成"

# 3. 拉取最新代码
echo "[3/5] 更新代码..."
cd /opt/wodebao
git pull origin main 2>/dev/null || echo "  (git pull 跳过，手动部署模式)"
echo "  ✓ 代码更新完成"

# 4. 配置环境变量
echo "[4/5] 配置环境变量..."
ENV_FILE="/opt/wodebao/.env"
cat > "$ENV_FILE" << 'ENVEOF'
SILICONFLOW_API_KEY=sk-efxvmojdsogorgyikywkfejgaxwudnqpiaygsdudabhnjzns
POCKETBASE_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=admin@laoshizhushou.com
PB_ADMIN_PASSWORD=Sn517020551
ENVEOF
echo "  ✓ 环境变量配置完成"

# 5. 创建 systemd 服务
echo "[5/5] 配置系统服务..."
cat > /etc/systemd/system/ai-generate.service << 'SERVICEEOF'
[Unit]
Description=老师的小能手 AI 生成服务
After=network.target pocketbase.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/wodebao
EnvironmentFile=/opt/wodebao/.env
ExecStart=/opt/wodebao/venv/bin/python /opt/wodebao/api/server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable ai-generate
systemctl restart ai-generate
sleep 2

# 检查服务状态
if systemctl is-active --quiet ai-generate; then
    echo "  ✓ AI 生成服务启动成功"
else
    echo "  ✗ 服务启动失败，查看日志:"
    journalctl -u ai-generate --no-pager -n 10
    exit 1
fi

# 6. 配置 Nginx 反向代理
echo "[6/7] 配置 Nginx 反向代理..."
NGINX_CONF="/etc/nginx/sites-available/teacher-helper"

# 检查是否已包含 /api/ 代理
if ! grep -q "location /api/" "$NGINX_CONF" 2>/dev/null; then
    # 在最后的 } 之前插入 /api/ 代理配置
    if [ -f "$NGINX_CONF" ]; then
        # 在 server 块的最后 } 之前插入
        sed -i '/^}$/i \
    # AI生成服务反向代理\
    location /api/ {\
        proxy_pass http://127.0.0.1:8081;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_read_timeout 120s;\
        proxy_buffering off;\
        proxy_cache off;\
    }' "$NGINX_CONF"
        echo "  ✓ Nginx /api/ 代理已添加"
    else
        echo "  ⚠ 未找到 Nginx 配置文件，请手动添加"
    fi
else
    echo "  ✓ Nginx /api/ 代理已存在"
fi

# 7. 测试并重载 Nginx
echo "[7/7] 验证 Nginx 配置..."
nginx -t 2>&1 && nginx -s reload
echo "  ✓ Nginx 重载成功"

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  API 健康检查: curl http://127.0.0.1:8081/api/health"
echo "  公网访问: http://101.37.204.113/api/health"
echo ""
echo "  服务状态: systemctl status ai-generate"
echo "  查看日志: journalctl -u ai-generate -f"
echo ""

# 测试 API
echo "测试 API..."
HEALTH=$(curl -s http://127.0.0.1:8081/api/health)
echo "  健康检查: $HEALTH"
