// --- 存钱罐主模块 (js/modules/piggy_bank.js) ---

// 初始化存钱罐系统
function initPiggyBankSystem() {
    initPiggyBankData();
    
    // 绑定返回按钮
    const backBtn = document.querySelector('#piggy-bank-screen .back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            switchScreen('home-screen');
        };
    }
    
    // 绑定模态框关闭按钮
    const closeBtns = document.querySelectorAll('.piggy-bank-modal-close');
    closeBtns.forEach(btn => {
        btn.onclick = () => {
            const modal = btn.closest('.piggy-bank-modal');
            if (modal) modal.classList.remove('visible');
        };
    });
    
    // 绑定添加交易表单提交
    const addTransactionForm = document.getElementById('piggy-bank-add-transaction-form');
    if (addTransactionForm) {
        addTransactionForm.onsubmit = (e) => {
            e.preventDefault();
            savePiggyBankTransaction();
        };
    }
    
    // 绑定账单设置保存
    const saveSettingsBtn = document.getElementById('piggy-bank-save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = savePiggyBankBillSettingsUI;
    }
    
    // 绑定发送账单按钮
    const sendDailyBillBtn = document.getElementById('piggy-bank-send-daily-btn');
    const sendMonthlyBillBtn = document.getElementById('piggy-bank-send-monthly-btn');
    if (sendDailyBillBtn) {
        sendDailyBillBtn.onclick = () => sendPiggyBankBill('daily');
    }
    if (sendMonthlyBillBtn) {
        sendMonthlyBillBtn.onclick = () => sendPiggyBankBill('monthly');
    }
}

// 打开存钱罐界面
function openPiggyBankScreen() {
    switchScreen('piggy-bank-screen');
    renderPiggyBankScreen();
}

// 自动记录聊天转账（从聊天模块调用）
async function recordChatTransfer(amount, type, chatId, chatType, description) {
    // type: 'sent' 发送转账, 'received' 接收转账
    await addPiggyBankTransaction({
        type: type === 'sent' ? 'expense' : 'income',
        amount: parseFloat(amount),
        category: 'transfer',
        description: description || (type === 'sent' ? '转账' : '收款'),
        relatedChatId: chatId,
        relatedChatType: chatType
    });
}

// 自动记录聊天收款（从聊天模块调用）
async function recordChatReceive(amount, chatId, chatType, fromName) {
    await addPiggyBankTransaction({
        type: 'income',
        amount: parseFloat(amount),
        category: 'chat_receive',
        description: `来自${fromName}的转账`,
        relatedChatId: chatId,
        relatedChatType: chatType
    });
}

// 自动记录商城支出（从商城模块调用）
async function recordShopExpense(amount, description, chatId, chatType) {
    const success = await deductPiggyBankBalance(amount, description, chatId, chatType);
    return success;
}

// 检查商城支付余额（从商城模块调用）
function checkShopPaymentBalance(amount) {
    return checkPiggyBankBalance(amount);
}

// 导出供其他模块使用
window.initPiggyBankSystem = initPiggyBankSystem;
window.openPiggyBankScreen = openPiggyBankScreen;
window.recordChatTransfer = recordChatTransfer;
window.recordChatReceive = recordChatReceive;
window.recordShopExpense = recordShopExpense;
window.checkShopPaymentBalance = checkShopPaymentBalance;
window.deductPiggyBankBalance = deductPiggyBankBalance;

// 自动初始化（当DOM加载完成后）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initPiggyBankSystem, 100);
    });
} else {
    setTimeout(initPiggyBankSystem, 100);
}
