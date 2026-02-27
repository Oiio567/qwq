// --- 存钱罐UI渲染模块 (js/modules/piggy_bank_ui.js) ---

// 渲染存钱罐主界面
function renderPiggyBankScreen() {
    const container = document.getElementById('piggy-bank-content');
    if (!container) return;
    
    const balance = getPiggyBankBalance();
    const transactions = getPiggyBankTransactions();
    
    // 计算今日收支
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
    const todayTransactions = transactions.filter(t => t.timestamp >= todayStart && t.timestamp <= todayEnd);
    const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // 计算本月收支
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    const monthTransactions = transactions.filter(t => t.timestamp >= monthStart && t.timestamp <= monthEnd);
    const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    container.innerHTML = `
        <!-- iOS风格余额卡片 -->
        <div class="piggy-bank-balance-card">
            <div class="piggy-bank-balance-label">余额</div>
            <div class="piggy-bank-balance-amount">¥${balance.toFixed(2)}</div>
        </div>
        
        <!-- 统计卡片 -->
        <div class="piggy-bank-stats-grid">
            <div class="piggy-bank-stat-card">
                <div class="piggy-bank-stat-label">今日收入</div>
                <div class="piggy-bank-stat-value income">+¥${todayIncome.toFixed(2)}</div>
            </div>
            <div class="piggy-bank-stat-card">
                <div class="piggy-bank-stat-label">今日支出</div>
                <div class="piggy-bank-stat-value expense">-¥${todayExpense.toFixed(2)}</div>
            </div>
            <div class="piggy-bank-stat-card">
                <div class="piggy-bank-stat-label">本月收入</div>
                <div class="piggy-bank-stat-value income">+¥${monthIncome.toFixed(2)}</div>
            </div>
            <div class="piggy-bank-stat-card">
                <div class="piggy-bank-stat-label">本月支出</div>
                <div class="piggy-bank-stat-value expense">-¥${monthExpense.toFixed(2)}</div>
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="piggy-bank-actions">
            <button class="piggy-bank-action-btn income-btn" onclick="openAddTransactionModal('income')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>记录收入</span>
            </button>
            <button class="piggy-bank-action-btn expense-btn" onclick="openAddTransactionModal('expense')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>记录支出</span>
            </button>
            <button class="piggy-bank-action-btn settings-btn" onclick="openPiggyBankSettings()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                </svg>
                <span>账单设置</span>
            </button>
        </div>
        
        <!-- 交易记录列表 -->
        <div class="piggy-bank-transactions-header">
            <h3>交易记录</h3>
        </div>
        <div class="piggy-bank-transactions-list" id="piggy-bank-transactions-list">
            ${renderTransactionsList(transactions)}
        </div>
    `;
}

// 渲染交易记录列表
function renderTransactionsList(transactions) {
    if (transactions.length === 0) {
        return '<div class="piggy-bank-empty-state">暂无交易记录</div>';
    }
    
    return transactions.map(transaction => {
        const date = new Date(transaction.timestamp);
        const dateStr = date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const categoryIcons = {
            'manual': '✏️',
            'transfer': '💸',
            'shop': '🛒',
            'chat_receive': '💬'
        };
        
        const categoryNames = {
            'manual': '手动记录',
            'transfer': '转账',
            'shop': '商城',
            'chat_receive': '聊天收款'
        };
        
        return `
            <div class="piggy-bank-transaction-item" data-id="${transaction.id}">
                <div class="piggy-bank-transaction-icon ${transaction.type}">
                    ${categoryIcons[transaction.category] || '💰'}
                </div>
                <div class="piggy-bank-transaction-content">
                    <div class="piggy-bank-transaction-title">${DOMPurify.sanitize(transaction.description || categoryNames[transaction.category] || '交易')}</div>
                    <div class="piggy-bank-transaction-meta">
                        <span class="piggy-bank-transaction-category">${categoryNames[transaction.category] || '其他'}</span>
                        <span class="piggy-bank-transaction-date">${dateStr}</span>
                    </div>
                </div>
                <div class="piggy-bank-transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}¥${transaction.amount.toFixed(2)}
                </div>
                <button class="piggy-bank-transaction-delete" onclick="deletePiggyBankTransactionUI('${transaction.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// 打开添加交易模态框
function openAddTransactionModal(type) {
    const modal = document.getElementById('piggy-bank-add-transaction-modal');
    if (!modal) return;
    
    modal.dataset.type = type;
    const title = document.getElementById('piggy-bank-add-transaction-title');
    if (title) {
        title.textContent = type === 'income' ? '记录收入' : '记录支出';
    }
    
    // 清空表单
    const amountInput = document.getElementById('piggy-bank-transaction-amount');
    const descInput = document.getElementById('piggy-bank-transaction-description');
    if (amountInput) amountInput.value = '';
    if (descInput) descInput.value = '';
    
    modal.classList.add('visible');
}

// 关闭添加交易模态框
function closeAddTransactionModal() {
    const modal = document.getElementById('piggy-bank-add-transaction-modal');
    if (modal) modal.classList.remove('visible');
}

// 保存交易
async function savePiggyBankTransaction() {
    const modal = document.getElementById('piggy-bank-add-transaction-modal');
    if (!modal) return;
    
    const type = modal.dataset.type;
    const amountInput = document.getElementById('piggy-bank-transaction-amount');
    const descInput = document.getElementById('piggy-bank-transaction-description');
    
    if (!amountInput || !descInput) return;
    
    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        showToast('请输入有效的金额');
        return;
    }
    
    if (!description) {
        showToast('请输入交易描述');
        return;
    }
    
    await addPiggyBankTransaction({
        type: type,
        amount: amount,
        category: 'manual',
        description: description
    });
    
    closeAddTransactionModal();
    renderPiggyBankScreen();
    showToast('记录成功');
}

// 删除交易（UI）
async function deletePiggyBankTransactionUI(transactionId) {
    if (!confirm('确定要删除这条交易记录吗？')) return;
    
    const success = await deletePiggyBankTransaction(transactionId);
    if (success) {
        renderPiggyBankScreen();
        showToast('删除成功');
    } else {
        showToast('删除失败');
    }
}

// 打开账单设置
function openPiggyBankSettings() {
    const modal = document.getElementById('piggy-bank-settings-modal');
    if (!modal) return;
    
    const settings = getPiggyBankBillSettings();
    
    // 渲染收件人列表
    renderBillRecipients('daily', settings.dailyRecipients);
    renderBillRecipients('monthly', settings.monthlyRecipients);
    
    // 设置开关状态
    const dailySwitch = document.getElementById('piggy-bank-daily-bill-switch');
    const monthlySwitch = document.getElementById('piggy-bank-monthly-bill-switch');
    if (dailySwitch) dailySwitch.checked = settings.dailyEnabled;
    if (monthlySwitch) monthlySwitch.checked = settings.monthlyEnabled;
    
    modal.classList.add('visible');
}

// 关闭账单设置
function closePiggyBankSettings() {
    const modal = document.getElementById('piggy-bank-settings-modal');
    if (modal) modal.classList.remove('visible');
}

// 渲染收件人列表
function renderBillRecipients(type, recipients) {
    const container = document.getElementById(`piggy-bank-${type}-recipients-list`);
    if (!container) return;
    
    if (recipients.length === 0) {
        container.innerHTML = '<div class="piggy-bank-empty-recipients">暂无收件人</div>';
        return;
    }
    
    container.innerHTML = recipients.map((recipient, index) => {
        let name = '未知';
        if (recipient.chatType === 'private') {
            const char = db.characters.find(c => c.id === recipient.chatId);
            name = char ? (char.realName || char.remarkName) : '未知';
        } else if (recipient.chatType === 'group') {
            const group = db.groups.find(g => g.id === recipient.chatId);
            name = group ? group.name : '未知';
        }
        
        return `
            <div class="piggy-bank-recipient-item">
                <span>${DOMPurify.sanitize(name)}</span>
                <button onclick="removeBillRecipient('${type}', ${index})">删除</button>
            </div>
        `;
    }).join('');
}

// 移除收件人
async function removeBillRecipient(type, index) {
    const settings = getPiggyBankBillSettings();
    if (type === 'daily') {
        settings.dailyRecipients.splice(index, 1);
    } else {
        settings.monthlyRecipients.splice(index, 1);
    }
    
    await savePiggyBankBillSettings(settings);
    renderBillRecipients(type, settings[type === 'daily' ? 'dailyRecipients' : 'monthlyRecipients']);
}

// 添加收件人
function openAddBillRecipientModal(type) {
    const modal = document.getElementById('piggy-bank-add-recipient-modal');
    if (!modal) return;
    
    modal.dataset.type = type;
    const title = document.getElementById('piggy-bank-add-recipient-title');
    if (title) {
        title.textContent = type === 'daily' ? '选择每日账单收件人' : '选择每月账单收件人';
    }
    
    // 渲染联系人列表
    renderRecipientSelectionList();
    
    modal.classList.add('visible');
}

// 渲染收件人选择列表
function renderRecipientSelectionList() {
    const container = document.getElementById('piggy-bank-recipient-selection-list');
    if (!container) return;
    
    let html = '<div class="piggy-bank-recipient-selection-section"><h4>私聊</h4>';
    
    // 私聊列表
    db.characters.forEach(char => {
        html += `
            <div class="piggy-bank-recipient-selection-item" onclick="selectBillRecipient('private', '${char.id}')">
                <span>${DOMPurify.sanitize(char.realName || char.remarkName || '未知')}</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 群聊列表
    if (db.groups && db.groups.length > 0) {
        html += '<div class="piggy-bank-recipient-selection-section"><h4>群聊</h4>';
        db.groups.forEach(group => {
            html += `
                <div class="piggy-bank-recipient-selection-item" onclick="selectBillRecipient('group', '${group.id}')">
                    <span>${DOMPurify.sanitize(group.name || '未知群聊')}</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// 选择收件人
async function selectBillRecipient(chatType, chatId) {
    const modal = document.getElementById('piggy-bank-add-recipient-modal');
    if (!modal) return;
    
    const type = modal.dataset.type;
    const settings = getPiggyBankBillSettings();
    
    // 检查是否已存在
    const recipients = type === 'daily' ? settings.dailyRecipients : settings.monthlyRecipients;
    const exists = recipients.some(r => r.chatId === chatId && r.chatType === chatType);
    
    if (exists) {
        showToast('该收件人已存在');
        return;
    }
    
    recipients.push({ chatId, chatType });
    await savePiggyBankBillSettings(settings);
    
    closeAddRecipientModal();
    renderBillRecipients(type, recipients);
    showToast('添加成功');
}

// 关闭添加收件人模态框
function closeAddRecipientModal() {
    const modal = document.getElementById('piggy-bank-add-recipient-modal');
    if (modal) modal.classList.remove('visible');
}

// 保存账单设置
async function savePiggyBankBillSettingsUI() {
    const dailySwitch = document.getElementById('piggy-bank-daily-bill-switch');
    const monthlySwitch = document.getElementById('piggy-bank-monthly-bill-switch');
    
    const settings = {
        dailyEnabled: dailySwitch ? dailySwitch.checked : false,
        monthlyEnabled: monthlySwitch ? monthlySwitch.checked : false
    };
    
    await savePiggyBankBillSettings(settings);
    closePiggyBankSettings();
    showToast('设置已保存');
}

// 发送账单
async function sendPiggyBankBill(type) {
    const settings = getPiggyBankBillSettings();
    const recipients = type === 'daily' ? settings.dailyRecipients : settings.monthlyRecipients;
    
    if (recipients.length === 0) {
        showToast('请先添加收件人');
        return;
    }
    
    const now = new Date();
    let transactions, title, period;
    
    if (type === 'daily') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
        transactions = getPiggyBankTransactions().filter(t => t.timestamp >= todayStart && t.timestamp <= todayEnd);
        title = `${now.getMonth() + 1}月${now.getDate()}日账单`;
        period = `${now.getMonth() + 1}月${now.getDate()}日`;
    } else {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        transactions = getPiggyBankTransactions().filter(t => t.timestamp >= monthStart && t.timestamp <= monthEnd);
        title = `${now.getFullYear()}年${now.getMonth() + 1}月账单`;
        period = `${now.getFullYear()}年${now.getMonth() + 1}月`;
    }
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = getPiggyBankBalance();
    
    // 生成账单文本
    let billText = `【${title}】\n`;
    billText += `时间：${period}\n`;
    billText += `收入：+¥${income.toFixed(2)}\n`;
    billText += `支出：-¥${expense.toFixed(2)}\n`;
    billText += `余额：¥${balance.toFixed(2)}\n\n`;
    
    if (transactions.length > 0) {
        billText += `交易明细：\n`;
        transactions.slice(0, 10).forEach(t => {
            const date = new Date(t.timestamp);
            const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            billText += `${timeStr} ${t.type === 'income' ? '+' : '-'}¥${t.amount.toFixed(2)} ${t.description || ''}\n`;
        });
        if (transactions.length > 10) {
            billText += `...还有${transactions.length - 10}条记录\n`;
        }
    } else {
        billText += `暂无交易记录\n`;
    }
    
    // 发送给所有收件人
    for (const recipient of recipients) {
        if (recipient.chatType === 'private') {
            const char = db.characters.find(c => c.id === recipient.chatId);
            if (char) {
                const message = {
                    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    role: 'user',
                    content: billText,
                    parts: [{ type: 'text', text: billText }],
                    timestamp: Date.now()
                };
                char.history.push(message);
                await dexieDB.characters.update(char.id, { history: char.history });
            }
        } else if (recipient.chatType === 'group') {
            const group = db.groups.find(g => g.id === recipient.chatId);
            if (group) {
                const message = {
                    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    role: 'user',
                    content: billText,
                    parts: [{ type: 'text', text: billText }],
                    timestamp: Date.now(),
                    senderId: 'user_me'
                };
                group.history.push(message);
                await dexieDB.groups.update(group.id, { history: group.history });
            }
        }
    }
    
    await saveData();
    showToast(`账单已发送给${recipients.length}个收件人`);
}

// 暴露给全局
window.openAddTransactionModal = openAddTransactionModal;
window.closeAddTransactionModal = closeAddTransactionModal;
window.savePiggyBankTransaction = savePiggyBankTransaction;
window.deletePiggyBankTransactionUI = deletePiggyBankTransactionUI;
window.openPiggyBankSettings = openPiggyBankSettings;
window.closePiggyBankSettings = closePiggyBankSettings;
window.removeBillRecipient = removeBillRecipient;
window.openAddBillRecipientModal = openAddBillRecipientModal;
window.selectBillRecipient = selectBillRecipient;
window.closeAddRecipientModal = closeAddRecipientModal;
window.savePiggyBankBillSettingsUI = savePiggyBankBillSettingsUI;
window.sendPiggyBankBill = sendPiggyBankBill;
