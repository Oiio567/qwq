// --- 小剧场功能 (js/modules/theater.js) ---

let currentTheaterScenarioId = null;

// 渲染小剧场列表
function renderTheaterScenarios() {
    const scenariosList = document.getElementById('theater-scenarios-list');
    const categoryFilter = document.getElementById('theater-category-filter');
    if (!scenariosList) return;

    scenariosList.innerHTML = '';

    if (!db.theaterScenarios || db.theaterScenarios.length === 0) {
        scenariosList.innerHTML = '<div class="theater-empty-state">还没有生成的剧情，点击右上角"+"创建吧~</div>';
        return;
    }

    // 获取所有分类
    const categories = [...new Set(db.theaterScenarios.map(s => s.category || '未分类'))];
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">全部分类</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    }

    // 过滤场景
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    let filteredScenarios = db.theaterScenarios;
    if (selectedCategory) {
        filteredScenarios = db.theaterScenarios.filter(s => (s.category || '未分类') === selectedCategory);
    }

    if (filteredScenarios.length === 0) {
        scenariosList.innerHTML = '<div class="theater-empty-state">该分类下暂无剧情</div>';
        return;
    }

    // 按收藏状态和创建时间排序（收藏的置顶）
    filteredScenarios.sort((a, b) => {
        const aFav = a.isFavorite ? 1 : 0;
        const bFav = b.isFavorite ? 1 : 0;
        if (aFav !== bFav) {
            return bFav - aFav; // 收藏的在前
        }
        return (b.createdAt || 0) - (a.createdAt || 0); // 同收藏状态下按时间倒序
    });

    filteredScenarios.forEach(scenario => {
        const card = document.createElement('div');
        card.className = 'theater-scenario-card';
        card.dataset.id = scenario.id;
        
        const date = new Date(scenario.createdAt || scenario.timestamp || Date.now());
        const dateStr = date.toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const charName = scenario.charId ? (db.characters.find(c => c.id === scenario.charId)?.name || '未知角色') : '未指定';
        const category = scenario.category || '未分类';

        const favoriteIcon = scenario.isFavorite ? '★' : '☆';
        card.innerHTML = `
            <div class="theater-scenario-header">
                <div class="theater-scenario-title">
                    ${scenario.isFavorite ? '<span class="theater-favorite-icon" style="color: #ffd700; margin-right: 5px;">★</span>' : ''}
                    ${DOMPurify.sanitize(scenario.title || '剧情')}
                </div>
                <div class="theater-scenario-badge">${DOMPurify.sanitize(category)}</div>
            </div>
            <div class="theater-scenario-meta">
                <span>角色：${DOMPurify.sanitize(charName)}</span>
                <span>${dateStr}</span>
            </div>
            <div class="theater-scenario-content">${DOMPurify.sanitize(scenario.content)}</div>
        `;

        card.addEventListener('click', () => {
            showTheaterScenarioDetail(scenario);
        });

        scenariosList.appendChild(card);
    });
}

// 显示详情页
function showTheaterScenarioDetail(scenario) {
    currentTheaterScenarioId = scenario.id;
    const detailContent = document.getElementById('theater-detail-content');
    if (!detailContent) return;

    const charName = scenario.charId ? (db.characters.find(c => c.id === scenario.charId)?.name || '未知角色') : '未指定';
    const category = scenario.category || '未分类';
    const date = new Date(scenario.createdAt || scenario.timestamp || Date.now());
    const dateStr = date.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const isEditing = scenario.isEditing || false;
    const contentDisplay = isEditing 
        ? `<textarea id="theater-edit-content" class="theater-edit-textarea">${DOMPurify.sanitize(scenario.content)}</textarea>`
        : `<div class="theater-detail-body">${DOMPurify.sanitize(scenario.content).replace(/\n/g, '<br>')}</div>`;
    
    detailContent.innerHTML = `
        <div class="theater-detail-header">
            <h2 class="theater-detail-title">
                ${scenario.isFavorite ? '<span class="theater-favorite-icon" style="color: #ffd700; margin-right: 5px;">★</span>' : ''}
                ${isEditing 
                    ? `<input type="text" id="theater-edit-title" class="theater-edit-title-input" value="${DOMPurify.sanitize(scenario.title || '剧情')}">`
                    : DOMPurify.sanitize(scenario.title || '剧情')
                }
            </h2>
            <div class="theater-detail-meta">
                <span class="theater-detail-badge">${DOMPurify.sanitize(category)}</span>
                <span>角色：${DOMPurify.sanitize(charName)}</span>
                <span>${dateStr}</span>
            </div>
        </div>
        ${contentDisplay}
    `;
    
    // 更新按钮显示状态
    const favoriteBtn = document.getElementById('theater-favorite-btn');
    const editBtn = document.getElementById('theater-edit-btn');
    const saveEditBtn = document.getElementById('theater-save-edit-btn');
    const shareBtn = document.getElementById('theater-share-btn');
    const editCategoryBtn = document.getElementById('theater-edit-category-btn');
    const deleteBtn = document.getElementById('theater-delete-btn');
    
    if (favoriteBtn) {
        favoriteBtn.textContent = scenario.isFavorite ? '取消收藏' : '收藏';
    }
    if (editBtn) {
        editBtn.style.display = isEditing ? 'none' : 'block';
    }
    if (saveEditBtn) {
        saveEditBtn.style.display = isEditing ? 'block' : 'none';
    }
    if (shareBtn) {
        shareBtn.style.display = isEditing ? 'none' : 'block';
    }
    if (editCategoryBtn) {
        editCategoryBtn.style.display = isEditing ? 'none' : 'block';
    }
    if (deleteBtn) {
        deleteBtn.style.display = isEditing ? 'none' : 'block';
    }
    
    // 保存编辑状态到scenario对象
    scenario.isEditing = isEditing;

    switchScreen('theater-detail-screen');
}

// 更新世界书显示
function updateWorldbookDisplay() {
    const worldbookDisplay = document.getElementById('theater-worldbook-display');
    const worldbookOptions = document.getElementById('theater-worldbook-options');
    if (!worldbookDisplay || !worldbookOptions) return;

    const selectedOptions = worldbookOptions.querySelectorAll('.theater-multiselect-option.selected');
    const placeholder = worldbookDisplay.querySelector('.theater-multiselect-placeholder');
    
    if (selectedOptions.length === 0) {
        placeholder.textContent = '请选择世界书（可选）';
        worldbookDisplay.classList.remove('has-selection');
    } else {
        const names = Array.from(selectedOptions).map(opt => {
            const label = opt.querySelector('.theater-multiselect-label');
            return label ? label.textContent : '';
        }).filter(Boolean);
        const displayText = names.length > 2 
            ? `已选 ${selectedOptions.length} 项：${names.slice(0, 2).join('、')}...`
            : `已选 ${selectedOptions.length} 项：${names.join('、')}`;
        placeholder.textContent = displayText;
        worldbookDisplay.classList.add('has-selection');
    }
}

// 填充创建表单的选择器
function populateTheaterForm() {
    const personaSelect = document.getElementById('theater-persona-select');
    const charSelect = document.getElementById('theater-char-select');
    const worldbookList = document.getElementById('theater-worldbook-list');
    const promptPresetSelect = document.getElementById('theater-prompt-preset-select');

    if (personaSelect) {
        personaSelect.innerHTML = '<option value="">请选择人设（可选）</option>';
        if (db.myPersonaPresets && db.myPersonaPresets.length > 0) {
            db.myPersonaPresets.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.id || preset.name;
                option.textContent = preset.name;
                personaSelect.appendChild(option);
            });
        }
    }

    if (charSelect) {
        charSelect.innerHTML = '<option value="">请选择角色（可选）</option>';
        if (db.characters && db.characters.length > 0) {
            db.characters.forEach(char => {
                const option = document.createElement('option');
                option.value = char.id;
                option.textContent = char.remarkName || char.name;
                charSelect.appendChild(option);
            });
        }
    }

    // 填充世界书多选下拉 - 按分类显示
    const worldbookOptions = document.getElementById('theater-worldbook-options');
    const worldbookDisplay = document.getElementById('theater-worldbook-display');
    if (worldbookOptions && worldbookDisplay) {
        worldbookOptions.innerHTML = '';
        if (db.worldBooks && db.worldBooks.length > 0) {
            // 按分类分组
            const groupedBooks = db.worldBooks.reduce((acc, book) => {
                const category = book.category || '未分类';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(book);
                return acc;
            }, {});

            // 排序分类（未分类放最后）
            const sortedCategories = Object.keys(groupedBooks).sort((a, b) => {
                if (a === '未分类') return 1;
                if (b === '未分类') return -1;
                return a.localeCompare(b);
            });

            // 为每个分类创建分组
            sortedCategories.forEach(category => {
                const categoryBooks = groupedBooks[category];
                
                // 创建分类标题
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'theater-worldbook-category-header';
                categoryHeader.innerHTML = `
                    <span class="theater-worldbook-category-name">${DOMPurify.sanitize(category)}</span>
                    <span class="theater-worldbook-category-arrow">▼</span>
                `;
                categoryHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const group = categoryHeader.nextElementSibling;
                    if (group) {
                        group.classList.toggle('open');
                        const arrow = categoryHeader.querySelector('.theater-worldbook-category-arrow');
                        if (arrow) {
                            arrow.style.transform = group.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
                        }
                    }
                });
                worldbookOptions.appendChild(categoryHeader);

                // 创建分类下的世界书列表
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'theater-worldbook-category-group';
                categoryBooks.forEach(wb => {
                    const option = document.createElement('div');
                    option.className = 'theater-multiselect-option';
                    option.dataset.value = wb.id;
                    option.innerHTML = `
                        <span class="theater-multiselect-checkbox"></span>
                        <span class="theater-multiselect-label">${DOMPurify.sanitize(wb.name)}</span>
                    `;
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        option.classList.toggle('selected');
                        updateWorldbookDisplay();
                    });
                    categoryGroup.appendChild(option);
                });
                worldbookOptions.appendChild(categoryGroup);
            });
        } else {
            worldbookOptions.innerHTML = '<div class="theater-empty-hint">暂无世界书</div>';
        }
    }

    // 初始化世界书下拉的展开/收起
    if (worldbookDisplay) {
        const dropdown = document.getElementById('theater-worldbook-dropdown');
        if (dropdown) {
            worldbookDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // 点击外部关闭下拉
            const closeHandler = (e) => {
                if (!worldbookDisplay.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            };
            document.addEventListener('click', closeHandler);
        }
    }

    // 延迟更新显示，确保 DOM 已渲染
    setTimeout(() => {
        updateWorldbookDisplay();
    }, 0);

    if (promptPresetSelect) {
        promptPresetSelect.innerHTML = '<option value="">选择预设提示词</option>';
        if (db.theaterPrompts && db.theaterPrompts.length > 0) {
            db.theaterPrompts.forEach((prompt, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = prompt.name || `预设 ${index + 1}`;
                promptPresetSelect.appendChild(option);
            });
        }
    }
}

// 加载预设提示词
function loadPromptPreset(index) {
    const textarea = document.getElementById('theater-custom-prompt');
    if (!textarea || !db.theaterPrompts || !db.theaterPrompts[index]) return;
    
    textarea.value = db.theaterPrompts[index].content || '';
}

// 保存提示词为预设
async function savePromptPreset() {
    const textarea = document.getElementById('theater-custom-prompt');
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content) {
        showToast('提示词内容不能为空');
        return;
    }

    const name = prompt('请输入预设名称：', '预设 ' + (db.theaterPrompts ? db.theaterPrompts.length + 1 : 1));
    if (!name) return;

    if (!db.theaterPrompts) {
        db.theaterPrompts = [];
    }

    db.theaterPrompts.push({
        name: name.trim(),
        content: content
    });

    await saveData();
    populateTheaterForm();
    showToast('预设已保存');
}

// 生成剧情
async function generateTheaterScenario() {
    const personaId = document.getElementById('theater-persona-select').value;
    const charId = document.getElementById('theater-char-select').value;
    const categoryInput = document.getElementById('theater-category-input');
    const category = categoryInput ? (categoryInput.value.trim() || '未分类') : '未分类';
    const customPrompt = document.getElementById('theater-custom-prompt').value.trim();

    // 获取选中的世界书
    const selectedWorldBooks = [];
    const worldbookOptions = document.getElementById('theater-worldbook-options');
    if (worldbookOptions) {
        const selectedOptions = worldbookOptions.querySelectorAll('.theater-multiselect-option.selected');
        selectedOptions.forEach(option => {
            const wbId = option.dataset.value;
            const wb = db.worldBooks.find(w => w.id === wbId);
            if (wb) selectedWorldBooks.push(wb);
        });
    }

    if (!personaId && !charId && selectedWorldBooks.length === 0 && !customPrompt) {
        showToast('请至少选择人设、角色、世界书或输入提示词中的一项');
        return;
    }

    const generateBtn = document.getElementById('theater-generate-btn');
    const originalText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';

    try {
        // 构建 System Prompt
        let systemPrompt = '你是一个专业的剧情创作助手，擅长创作短篇剧情故事。请根据提供的信息生成一个完整的短篇剧情，要求情节完整、有趣，长度适中。\n\n';
        
        if (personaId) {
            const persona = db.myPersonaPresets.find(p => (p.id || p.name) === personaId);
            if (persona) {
                systemPrompt += `人设信息：\n名称：${persona.name}\n${persona.content || ''}\n\n`;
            }
        }

        if (charId) {
            const char = db.characters.find(c => c.id === charId);
            if (char) {
                systemPrompt += `角色信息：\n名称：${char.name}\n${char.description || ''}\n\n`;
            }
        }

        if (selectedWorldBooks.length > 0) {
            systemPrompt += `世界设定：\n${selectedWorldBooks.map(wb => wb.content).join('\n\n')}\n\n`;
        }

        const userPrompt = customPrompt || '请生成一个短篇剧情故事。';

        // 调用 AI API
        let {url, key, model, provider, streamEnabled} = db.apiSettings;
        if (!url || !key || !model) {
            showToast('请先在"api"应用中完成设置！');
            switchScreen('api-settings-screen');
            return;
        }

        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const endpoint = (provider === 'gemini') 
            ? `${url}/v1beta/models/${model}:streamGenerateContent?key=${getRandomValue(key)}` 
            : `${url}/v1/chat/completions`;
        
        const headers = (provider === 'gemini') 
            ? {'Content-Type': 'application/json'} 
            : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            };

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        let requestBody = {
            model: model,
            messages: messages,
            stream: false,
            temperature: db.apiSettings.temperature !== undefined ? db.apiSettings.temperature : 0.8
        };

        // 适配 Gemini
        if (provider === 'gemini') {
            const contents = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{text: m.content}]
            }));
            requestBody.contents = contents;
            requestBody.system_instruction = {parts: [{text: systemPrompt}]};
            delete requestBody.messages;
        }

        // 使用 fetchAiResponse
        const fullResponse = await fetchAiResponse(db.apiSettings, requestBody, headers, endpoint);
        
        if (fullResponse && fullResponse.trim()) {
            // 让AI生成标题
            let title = '剧情';
            try {
                const titlePrompt = `请为以下剧情生成一个简洁的标题（不超过20个字）：\n\n${fullResponse.trim().substring(0, 500)}`;
                const titleMessages = [
                    { role: 'system', content: '你是一个专业的标题生成助手，请根据剧情内容生成简洁、吸引人的标题。只返回标题，不要其他内容。' },
                    { role: 'user', content: titlePrompt }
                ];
                
                let titleRequestBody = {
                    model: model,
                    messages: titleMessages,
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 50
                };

                if (provider === 'gemini') {
                    const contents = titleMessages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{text: m.content}]
                    }));
                    titleRequestBody.contents = contents;
                    titleRequestBody.system_instruction = {parts: [{text: '你是一个专业的标题生成助手，请根据剧情内容生成简洁、吸引人的标题。只返回标题，不要其他内容。'}]};
                    delete titleRequestBody.messages;
                }

                const titleResponse = await fetchAiResponse(db.apiSettings, titleRequestBody, headers, endpoint);
                if (titleResponse && titleResponse.trim()) {
                    title = titleResponse.trim().replace(/^["']|["']$/g, '').substring(0, 30) || '剧情';
                }
            } catch (error) {
                console.warn('生成标题失败，使用默认标题:', error);
                // 如果生成标题失败，使用内容的第一行作为标题
                title = fullResponse.trim().split('\n')[0].substring(0, 30) || '剧情';
            }

            const scenario = {
                id: Date.now().toString(),
                title: title,
                content: fullResponse.trim(),
                category: category,
                charId: charId || null,
                personaId: personaId || null,
                worldBookIds: selectedWorldBooks.map(wb => wb.id),
                customPrompt: customPrompt || null,
                createdAt: Date.now()
            };

            if (!db.theaterScenarios) {
                db.theaterScenarios = [];
            }
            db.theaterScenarios.unshift(scenario);
            await saveData();
            
            showToast('剧情生成成功！');
            switchScreen('theater-screen');
            renderTheaterScenarios();
        } else {
            showToast('生成失败，请重试');
        }
    } catch (error) {
        console.error('生成剧情失败:', error);
        showToast('生成失败：' + (error.message || '未知错误'));
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = originalText;
    }
}

// 分享到聊天框
async function shareToChat() {
    if (!currentTheaterScenarioId) return;

    const scenario = db.theaterScenarios.find(s => s.id === currentTheaterScenarioId);
    if (!scenario) {
        showToast('找不到该剧情');
        return;
    }

    if (!scenario.charId) {
        showToast('该剧情未关联角色，无法分享');
        return;
    }

    const char = db.characters.find(c => c.id === scenario.charId);
    if (!char) {
        showToast('找不到关联的角色');
        return;
    }

    // 创建系统消息
    const systemMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `[system-display: 小剧场分享]\n\n${scenario.content}`,
        timestamp: Date.now()
    };

    if (!char.history) {
        char.history = [];
    }
    char.history.push(systemMessage);
    
    await saveData();
    showToast('分享成功');
    switchScreen('chat-list-screen');
    
    // 切换到对应的聊天
    setTimeout(() => {
        currentChatId = char.id;
        currentChatType = 'private';
        switchScreen('chat-room-screen');
        if (typeof renderChatRoom === 'function') {
            renderChatRoom();
        }
    }, 300);
}

// 修改分类
async function editCategory() {
    if (!currentTheaterScenarioId) return;

    const scenario = db.theaterScenarios.find(s => s.id === currentTheaterScenarioId);
    if (!scenario) return;

    const newCategory = prompt('请输入新的分类名称：', scenario.category || '未分类');
    if (newCategory === null) return;

    scenario.category = newCategory.trim() || '未分类';
    await saveData();
    
    showToast('分类已修改');
    renderTheaterScenarios();
    showTheaterScenarioDetail(scenario);
}

// 删除剧情
async function deleteScenario() {
    if (!currentTheaterScenarioId) return;

    if (!confirm('确定要删除这个剧情吗？')) return;

    const index = db.theaterScenarios.findIndex(s => s.id === currentTheaterScenarioId);
    if (index === -1) return;

    db.theaterScenarios.splice(index, 1);
    await saveData();
    
    showToast('剧情已删除');
    switchScreen('theater-screen');
    renderTheaterScenarios();
    currentTheaterScenarioId = null;
}

// 切换收藏状态
async function toggleFavorite() {
    if (!currentTheaterScenarioId) return;

    const scenario = db.theaterScenarios.find(s => s.id === currentTheaterScenarioId);
    if (!scenario) return;

    scenario.isFavorite = !scenario.isFavorite;
    await saveData();
    
    showToast(scenario.isFavorite ? '已收藏' : '已取消收藏');
    renderTheaterScenarios();
    showTheaterScenarioDetail(scenario);
}

// 切换编辑模式
function toggleEditScenario() {
    if (!currentTheaterScenarioId) return;

    const scenario = db.theaterScenarios.find(s => s.id === currentTheaterScenarioId);
    if (!scenario) return;

    scenario.isEditing = !scenario.isEditing;
    showTheaterScenarioDetail(scenario);
}

// 保存编辑
async function saveEditScenario() {
    if (!currentTheaterScenarioId) return;

    const scenario = db.theaterScenarios.find(s => s.id === currentTheaterScenarioId);
    if (!scenario) return;

    const titleInput = document.getElementById('theater-edit-title');
    const contentTextarea = document.getElementById('theater-edit-content');

    if (titleInput) {
        scenario.title = titleInput.value.trim() || '剧情';
    }
    if (contentTextarea) {
        scenario.content = contentTextarea.value.trim();
    }

    scenario.isEditing = false;
    await saveData();
    
    showToast('已保存');
    showTheaterScenarioDetail(scenario);
    renderTheaterScenarios();
}

// 初始化小剧场系统
function setupTheaterSystem() {
    // 主页：创建按钮
    const createBtn = document.getElementById('theater-create-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            populateTheaterForm();
            switchScreen('theater-create-screen');
        });
    }

    // 主页：分类过滤
    const categoryFilter = document.getElementById('theater-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            renderTheaterScenarios();
        });
    }

    // 创建页：生成按钮
    const generateBtn = document.getElementById('theater-generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateTheaterScenario);
    }

    // 创建页：加载预设提示词
    const promptPresetSelect = document.getElementById('theater-prompt-preset-select');
    if (promptPresetSelect) {
        promptPresetSelect.addEventListener('change', (e) => {
            if (e.target.value !== '') {
                loadPromptPreset(parseInt(e.target.value));
            }
        });
    }

    // 创建页：保存预设
    const savePromptBtn = document.getElementById('theater-save-prompt-btn');
    if (savePromptBtn) {
        savePromptBtn.addEventListener('click', savePromptPreset);
    }

    // 详情页：分享按钮
    const shareBtn = document.getElementById('theater-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareToChat);
    }

    // 详情页：修改分类按钮
    const editCategoryBtn = document.getElementById('theater-edit-category-btn');
    if (editCategoryBtn) {
        editCategoryBtn.addEventListener('click', editCategory);
    }

    // 详情页：删除按钮
    const deleteBtn = document.getElementById('theater-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteScenario);
    }

    // 详情页：收藏按钮
    const favoriteBtn = document.getElementById('theater-favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }

    // 详情页：编辑按钮
    const editBtn = document.getElementById('theater-edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditScenario);
    }

    // 详情页：保存编辑按钮
    const saveEditBtn = document.getElementById('theater-save-edit-btn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditScenario);
    }

    // 初始化渲染
    renderTheaterScenarios();

    // 监听屏幕切换，更新列表
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-target="theater-screen"]')) {
            setTimeout(() => {
                renderTheaterScenarios();
            }, 100);
        }
    });
}
