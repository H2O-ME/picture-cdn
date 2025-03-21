document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const resultContainer = document.getElementById('resultContainer');

    // 文件拖放处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            showError('请先选择要上传的文件');
            return;
        }

        const validation = validateFile(file);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        try {
            // 更新按钮状态和显示加载状态
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
            resultContainer.innerHTML = '<div class="loading-container"><i class="fas fa-spinner fa-spin loading-spinner"></i><p>正在上传图片，请稍候...</p></div>';
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://api.xinyew.cn/api/jdtc', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.errno === 0) {
                showSuccess(result);
            } else {
                showError(result.message || '上传失败');
            }
        } catch (error) {
            showError('网络请求失败，请检查接口状态');
        } finally {
            // 恢复按钮状态
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 开始上传';
        }
    });

    // 文件验证函数
    function validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, message: '不支持的文件格式' };
        }

        if (file.size > maxSize) {
            return { valid: false, message: '文件大小超过5MB限制' };
        }

        return { valid: true };
    }

    // 显示成功结果
    function showSuccess(data) {
        resultContainer.innerHTML = `
            <div class="success-box">
                <h3>上传成功</h3>
                <div class="thumbnail">
                    <img src="${data.data.url}" alt="上传预览">
                </div>
                <div class="url-box">
                    <label>文件名称：</label>
                    <span>${data.data.fileName}</span>
                    <label>访问地址：</label>
                    <div class="url-input-group">
                        <input type="text" value="${data.data.url}" readonly>
                        <button onclick="copyUrl(this)">复制</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加成功动画效果
        setTimeout(() => {
            const successBox = document.querySelector('.success-box');
            if (successBox) {
                successBox.style.animation = 'none';
                successBox.offsetHeight; // 触发重绘
                successBox.style.animation = 'fadeIn 0.5s ease-out';
            }
        }, 10);
    }

    // 显示错误信息
    function showError(message) {
        resultContainer.innerHTML = `
            <div class="error-box">
                <h3>上传失败</h3>
                <p>${message}</p>
            </div>
        `;
        
        // 添加错误动画效果
        setTimeout(() => {
            const errorBox = document.querySelector('.error-box');
            if (errorBox) {
                errorBox.style.animation = 'none';
                errorBox.offsetHeight; // 触发重绘
                errorBox.style.animation = 'fadeIn 0.5s ease-out';
            }
        }, 10);
    }

    // 处理文件选择
    function handleFile(file) {
        const validation = validateFile(file);
        if (validation.valid) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // 更新显示文件名
            const fileNameDisplay = dropZone.querySelector('.upload-info span');
            const originalText = '点击选择或拖拽文件至此';
            fileNameDisplay.innerHTML = `<i class="fas fa-file-image"></i> ${file.name}`;
            
            // 添加已选择的样式
            dropZone.classList.add('file-selected');
        } else {
            showError(validation.message);
        }
    }
});

// 复制URL功能
function copyUrl(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    
    // 修改按钮状态提供反馈
    const originalText = button.textContent;
    button.innerHTML = '<i class="fas fa-check"></i> 已复制';
    button.style.background = '#34a853';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}